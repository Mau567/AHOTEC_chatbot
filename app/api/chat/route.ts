import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHotelRecommendations, getHotelsBySemanticLocation } from '@/lib/mistral'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId, lang = 'es', location: bodyLocation, hotelTypes = [] } = body

    let location = bodyLocation || ''
    let types: string[] = hotelTypes

    if (!location || types.length === 0) {
      // Fallback to regex parsing if explicit fields were not provided
      const locationMatch = message?.match(/Ubicación:\s*(.*)/i)
      const typeMatch = message?.match(/Tipo[s]? de hotel:\s*(.*)/i)
      if (!location && locationMatch) location = locationMatch[1].trim()
      if (types.length === 0 && typeMatch) {
        types = typeMatch[1].split(',').map((t: string) => t.trim())
      }
    }

    const filteredByType = await prisma.hotel.findMany({
      where: {
        status: 'APPROVED',
        isPaid: true,
        ...(types.length > 0
          ? { OR: types.map(t => ({ hotelType: { equals: t, mode: 'insensitive' } })) }
          : {})
      }
    })

    let chatbotMessage = ''
    let finalHotels = filteredByType

    if (location && types.length > 0) {
      if (filteredByType.length === 0) {
        chatbotMessage = lang === 'en'
          ? 'Sorry, no hotels found for that type.'
          : 'Lo siento, no se encontraron hoteles de ese tipo.'
        finalHotels = []
      } else {
        const aiHotelIds = await getHotelsBySemanticLocation(location, filteredByType, lang)
        finalHotels = filteredByType.filter(hotel => aiHotelIds.includes(hotel.id))
        chatbotMessage = lang === 'en'
          ? (finalHotels.length > 0 ? 'Here are the hotels that match your search.' : 'Sorry, no hotels matched your search.')
          : (finalHotels.length > 0 ? 'Estos son los hoteles que coinciden con tu búsqueda.' : 'Lo siento, no se encontraron hoteles compatibles.')
      }
    } else if (types.length > 0) {
      chatbotMessage = lang === 'en'
        ? (filteredByType.length > 0 ? 'Here are the hotels of the selected type(s).' : 'Sorry, no hotels found for that type.')
        : (filteredByType.length > 0 ? 'Estos son los hoteles de ese tipo.' : 'Lo siento, no se encontraron hoteles de ese tipo.')
      finalHotels = filteredByType
    } else {
      const allHotels = await prisma.hotel.findMany({
        where: { status: 'APPROVED', isPaid: true }
      })
      chatbotMessage = lang === 'en'
        ? (allHotels.length > 0 ? 'Here are all available hotels.' : 'Sorry, no hotels found.')
        : (allHotels.length > 0 ? 'Estos son todos los hoteles disponibles.' : 'Lo siento, no se encontraron hoteles.')
      finalHotels = allHotels
    }

    const translateText = async (text: string) => {
      if (lang !== 'en' || !text) return text
      try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=es|en`)
        const data = await res.json()
        return data?.responseData?.translatedText || text
      } catch {
        return text
      }
    }

    let translatedHotels = finalHotels
    if (lang === 'en') {
      translatedHotels = await Promise.all(finalHotels.map(async hotel => ({
        ...hotel,
        description: await translateText(hotel.description),
        address: await translateText(hotel.address),
        locationPhrase: await translateText(hotel.locationPhrase),
        recreationAreas: await translateText(hotel.recreationAreas),
        surroundings: await Promise.all((hotel.surroundings || []).map(s => translateText(s)))
      })))
    }

    // Guardar la sesión como antes
    const existingSession = await prisma.chatSession.findUnique({
      where: { sessionId }
    })

    const newMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }

    const botMessage = {
      role: 'assistant',
      content: chatbotMessage,
      timestamp: new Date().toISOString()
    }

    if (existingSession) {
      await prisma.chatSession.update({
        where: { sessionId },
        data: {
          messages: [...existingSession.messages as any[], newMessage, botMessage]
        }
      })
    } else {
      await prisma.chatSession.create({
        data: {
          sessionId,
          messages: [newMessage, botMessage]
        }
      })
    }

    // Devolver el mensaje del chatbot y los hoteles compatibles (array)
    return NextResponse.json({ 
      message: chatbotMessage,
      hotels: translatedHotels,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
} 