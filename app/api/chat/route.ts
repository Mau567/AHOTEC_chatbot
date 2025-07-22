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

    // Buscar todos los hoteles aprobados y pagados (filtrar por tipo si aplica)
    const allHotels = await prisma.hotel.findMany({
      where: {
        status: 'APPROVED',
        isPaid: true,
        hotelType: hotelType ? { contains: hotelType, mode: 'insensitive' } : undefined,
      }
    })

    // List of known cities and regions (add more as needed)
    const knownCities = ['quito', 'guayaquil', 'cuenca', 'manta', 'esmeraldas', 'puembo']
    const knownRegions = ['costa', 'sierra', 'amazonía', 'galápagos']

    let chatbotMessage = ''
    let finalHotels = allHotels
    let filteredHotels = allHotels
    let useCityRegionFilter = false
    if (location) {
      const locLower = location.toLowerCase().trim()
      if (knownCities.includes(locLower) || knownRegions.includes(locLower)) {
        filteredHotels = allHotels.filter(hotel =>
          (hotel.city && hotel.city.toLowerCase().includes(locLower)) ||
          (hotel.region && hotel.region.toLowerCase().includes(locLower))
        )
        useCityRegionFilter = true
      }
    }

    if (location && hotelType) {
      // Guided search: use semantic location filter
      if (useCityRegionFilter && filteredHotels.length === 0) {
        chatbotMessage = lang === 'en'
          ? 'Sorry, no hotels found in that city or region.'
          : 'Lo siento, no se encontraron hoteles en esa ciudad o región.'
        finalHotels = []
      } else {
        const hotelsToSearch = useCityRegionFilter ? filteredHotels : allHotels
        const aiHotelIds = await getHotelsBySemanticLocation(location, hotelsToSearch, lang)
        finalHotels = hotelsToSearch.filter(hotel => aiHotelIds.includes(hotel.id))
        chatbotMessage = lang === 'en'
          ? (finalHotels.length > 0 ? 'Here are the hotels that match your search.' : 'Sorry, no hotels matched your search.')
          : (finalHotels.length > 0 ? 'Estos son los hoteles que coinciden con tu búsqueda.' : 'Lo siento, no se encontraron hoteles compatibles.')
      }
    } else if (location) {
      // Free-form: filter by city/region only if exact match
      if (useCityRegionFilter && filteredHotels.length === 0) {
        chatbotMessage = lang === 'en'
          ? 'Sorry, no hotels found in that city or region.'
          : 'Lo siento, no se encontraron hoteles en esa ciudad o región.'
        finalHotels = []
      } else {
        const hotelsToSearch = useCityRegionFilter ? filteredHotels : allHotels
        chatbotMessage = await getHotelRecommendations(message, hotelsToSearch, lang)
        const aiHotelIds = await getHotelsBySemanticLocation(message, hotelsToSearch, lang)
        finalHotels = hotelsToSearch.filter(hotel => aiHotelIds.includes(hotel.id))
      }
    } else {
      // No location: use all hotels
      chatbotMessage = await getHotelRecommendations(message, allHotels, lang)
      const aiHotelIds = await getHotelsBySemanticLocation(message, allHotels, lang)
      finalHotels = allHotels.filter(hotel => aiHotelIds.includes(hotel.id))
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