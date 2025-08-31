import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHotelsBySemanticLocation } from '@/lib/mistral'
import { translateHotels } from '@/lib/translate'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId, lang = 'es', hotelTypes = [] } = body

    const locationMatch = message.match(/Ubicación:\s*(.*)/i)
    let location = ''
    if (locationMatch) location = locationMatch[1].trim()

    const hotelTypesArray = Array.isArray(hotelTypes) ? hotelTypes : []

    const filteredByType = await prisma.hotel.findMany({
      where: {
        status: 'APPROVED',
        isPaid: true,
        hotelType: hotelTypesArray.length > 0 ? { in: hotelTypesArray, mode: 'insensitive' } : undefined,
      }
    })

    let chatbotMessage = ''
    let finalHotels = filteredByType

    if (location && hotelTypesArray.length > 0) {
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
    } else if (hotelTypesArray.length > 0) {
      chatbotMessage = lang === 'en'
        ? (filteredByType.length > 0 ? 'Here are the hotels of the selected type.' : 'Sorry, no hotels found for that type.')
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

    const existingSession = await prisma.chatSession.findUnique({ where: { sessionId } })

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
        data: { sessionId, messages: [newMessage, botMessage] }
      })
    }

    finalHotels = finalHotels.sort(() => Math.random() - 0.5)
    const translatedHotels = await translateHotels(finalHotels, lang)

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
