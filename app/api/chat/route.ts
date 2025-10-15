import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHotelRecommendations, getHotelsBySemanticLocation } from '@/lib/mistral'

// Utility function to randomize array order
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId, lang = 'es' } = body

    // Detect guided search
    const locationMatch = message.match(/Ubicación:\s*(.*)/i)
    const typeMatch = message.match(/Tipo de hotel:\s*(.*)/i)
    let location = ''
    let hotelTypesString = ''
    if (locationMatch) location = locationMatch[1].trim()
    if (typeMatch) hotelTypesString = typeMatch[1].trim()

    // Parse multiple hotel types (separated by |||)
    const hotelTypes = hotelTypesString ? hotelTypesString.split('|||').map(t => t.trim()).filter(Boolean) : []

    console.log('🔍 DEBUG - Location:', location)
    console.log('🔍 DEBUG - Hotel Types:', hotelTypes)
    console.log('🔍 DEBUG - Number of types:', hotelTypes.length)

    // 1. Filtrar primero por tipo de hotel (exacto, insensible a mayúsculas)
    // Support multiple types with OR condition (case-insensitive)
    const whereClause = {
      status: 'APPROVED' as const,
      isPaid: true,
      ...(hotelTypes.length > 0 && {
        OR: hotelTypes.map(type => ({
          hotelType: { equals: type, mode: 'insensitive' as const }
        }))
      })
    }
    
    console.log('🔍 DEBUG - Prisma where clause:', JSON.stringify(whereClause, null, 2))
    
    const filteredByType = await prisma.hotel.findMany({
      where: whereClause
    })

    console.log('🔍 DEBUG - Hotels after type filter:', filteredByType.length, filteredByType.map(h => ({ name: h.name, type: h.hotelType, city: h.city })))

    let chatbotMessage = ''
    let finalHotels = filteredByType

    // 2. Si hay ubicación y tipo, usar AI SOLO con los hoteles filtrados por tipo
    if (location && hotelTypes.length > 0) {
      if (filteredByType.length === 0) {
        chatbotMessage = lang === 'en'
          ? 'Sorry, no hotels found for that type.'
          : 'Lo siento, no se encontraron hoteles de ese tipo.'
        finalHotels = []
      } else {
        // Validación: detectar búsquedas vagas
        const vagueSearches = ['aeropuerto', 'airport', 'iglesia', 'church', 'parque', 'park', 'centro', 'center', 'hotel', 'restaurante', 'restaurant', 'mall', 'downtown', 'ciudad', 'city', 'lugar', 'place', 'zona', 'zone', 'area']
        const isVagueSearch = vagueSearches.some(vague => 
          location.toLowerCase().trim() === vague.toLowerCase().trim()
        )
        
        if (isVagueSearch) {
          chatbotMessage = lang === 'en'
            ? 'Please be more specific. Try searching for a specific location like "Mariscal Sucre Airport" or "Quito Airport" instead of just "airport".'
            : 'Por favor, sé más específico. Intenta buscar una ubicación específica como "Aeropuerto Mariscal Sucre" o "Aeropuerto de Quito" en lugar de solo "aeropuerto".'
          finalHotels = []
        } else {
          // First: Get AI recommendations
          const aiHotelIds = await getHotelsBySemanticLocation(location, filteredByType, lang)
          console.log('🔍 DEBUG - AI returned hotel IDs:', aiHotelIds)
          
          // Second: Add deterministic exact city matches to ensure consistency
          // This prevents AI inconsistency for obvious matches
          const exactCityMatches = filteredByType.filter(hotel => 
            hotel.city && hotel.city.toLowerCase().includes(location.toLowerCase())
          ).map(h => h.id)
          
          console.log('🔍 DEBUG - Exact city match IDs:', exactCityMatches)
          
          // Combine AI results with exact matches (remove duplicates)
          const combinedIds = Array.from(new Set([...aiHotelIds, ...exactCityMatches]))
          console.log('🔍 DEBUG - Combined IDs (AI + exact):', combinedIds)
          
          finalHotels = filteredByType.filter(hotel => combinedIds.includes(hotel.id))
          console.log('🔍 DEBUG - Hotels after AI + exact location filter:', finalHotels.length, finalHotels.map(h => ({ name: h.name, city: h.city, region: h.region })))
          
          // Validación adicional: asegurar que los hoteles estén en la región correcta
          const locationLower = location.toLowerCase()
          
          // Filter by region if user searches for a region name
          if (locationLower.includes('costa')) {
            const beforeFilter = finalHotels.length
            finalHotels = finalHotels.filter(hotel => 
              hotel.region.toLowerCase().includes('costa')
            )
            console.log('🔍 DEBUG - Costa region filter: before', beforeFilter, 'after', finalHotels.length)
          } else if (locationLower.includes('sierra')) {
            const beforeFilter = finalHotels.length
            finalHotels = finalHotels.filter(hotel => 
              hotel.region.toLowerCase().includes('sierra')
            )
            console.log('🔍 DEBUG - Sierra region filter: before', beforeFilter, 'after', finalHotels.length)
          } else if (locationLower.includes('amazonia') || locationLower.includes('amazonía')) {
            const beforeFilter = finalHotels.length
            finalHotels = finalHotels.filter(hotel => 
              hotel.region.toLowerCase().includes('amazon')
            )
            console.log('🔍 DEBUG - Amazonia region filter: before', beforeFilter, 'after', finalHotels.length)
          } else if (locationLower.includes('galapagos') || locationLower.includes('galápagos')) {
            const beforeFilter = finalHotels.length
            finalHotels = finalHotels.filter(hotel => 
              hotel.region.toLowerCase().includes('galapagos') || hotel.region.toLowerCase().includes('galápagos')
            )
            console.log('🔍 DEBUG - Galapagos region filter: before', beforeFilter, 'after', finalHotels.length)
          } else if (locationLower.includes('quito') || locationLower.includes('mariscal sucre')) {
            const beforeFilter = finalHotels.length
            finalHotels = finalHotels.filter(hotel => 
              hotel.region.toLowerCase().includes('sierra') || 
              hotel.city.toLowerCase().includes('quito')
            )
            console.log('🔍 DEBUG - Quito city filter: before', beforeFilter, 'after', finalHotels.length)
          } else if (locationLower.includes('guayaquil') || locationLower.includes('olmedo')) {
            const beforeFilter = finalHotels.length
            finalHotels = finalHotels.filter(hotel => 
              hotel.region.toLowerCase().includes('costa') || 
              hotel.city.toLowerCase().includes('guayaquil')
            )
            console.log('🔍 DEBUG - Guayaquil city filter: before', beforeFilter, 'after', finalHotels.length)
          }
          
          console.log('🔍 DEBUG - Final hotels:', finalHotels.length, finalHotels.map(h => h.name))
          
          chatbotMessage = lang === 'en'
            ? (finalHotels.length > 0 ? 'Here are the hotels that match your search.' : 'Sorry, no hotels matched your search.')
            : (finalHotels.length > 0 ? 'Estos son los hoteles que coinciden con tu búsqueda.' : 'Lo siento, no se encontraron hoteles compatibles.')
        }
      }
    } else if (hotelTypes.length > 0) {
      // Si solo hay tipo, mostrar todos los hoteles de ese tipo
      chatbotMessage = lang === 'en'
        ? (filteredByType.length > 0 ? 'Here are the hotels of the selected type(s).' : 'Sorry, no hotels found for that type.')
        : (filteredByType.length > 0 ? 'Estos son los hoteles del tipo seleccionado.' : 'Lo siento, no se encontraron hoteles de ese tipo.')
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
    // Randomize hotel order to avoid showing priority
    return NextResponse.json({ 
      message: chatbotMessage,
      hotels: shuffleArray(finalHotels),
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