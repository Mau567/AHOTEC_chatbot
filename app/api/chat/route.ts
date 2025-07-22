import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHotelRecommendations, getHotelsBySemanticLocation } from '@/lib/mistral'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId, lang = 'es' } = body

    // Detect guided search
    const locationMatch = message.match(/Ubicación:\s*(.*)/i)
    const typeMatch = message.match(/Tipo de hotel:\s*(.*)/i)
    let location = ''
    let hotelType = ''
    if (locationMatch) location = locationMatch[1].trim()
    if (typeMatch) hotelType = typeMatch[1].trim()

    // 1. Filtrar primero por tipo de hotel (exacto, insensible a mayúsculas)
    const filteredByType = await prisma.hotel.findMany({
      where: {
        status: 'APPROVED',
        isPaid: true,
        hotelType: hotelType ? { equals: hotelType, mode: 'insensitive' } : undefined,
      }
    })

    let chatbotMessage = ''
    let finalHotels = filteredByType

    // 2. Si hay ubicación y tipo, usar AI SOLO con los hoteles filtrados por tipo
    if (location && hotelType) {
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
    } else if (hotelType) {
      // Si solo hay tipo, mostrar todos los hoteles de ese tipo
      chatbotMessage = lang === 'en'
        ? (filteredByType.length > 0 ? 'Here are the hotels of the selected type.' : 'Sorry, no hotels found for that type.')
        : (filteredByType.length > 0 ? 'Estos son los hoteles de ese tipo.' : 'Lo siento, no se encontraron hoteles de ese tipo.')
      finalHotels = filteredByType
    } else {
      // Si no hay tipo, usar todos los hoteles aprobados y pagados
      const allHotels = await prisma.hotel.findMany({
        where: {
          status: 'APPROVED',
          isPaid: true
        }
      })
      chatbotMessage = lang === 'en'
        ? (allHotels.length > 0 ? 'Here are all available hotels.' : 'Sorry, no hotels found.')
        : (allHotels.length > 0 ? 'Estos son todos los hoteles disponibles.' : 'Lo siento, no se encontraron hoteles.')
      finalHotels = allHotels
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
      hotels: finalHotels,
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