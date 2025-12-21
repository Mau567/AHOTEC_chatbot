import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { 
  isGenericQuery, 
  buildHotelKeywords, 
  findMatchingHotelsByKeywords,
  freeFormChatbot
} from '@/lib/mistral'

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

    // Detect guided search vs free-form chat
    const locationMatch = message.match(/Ubicación:\s*(.*)/i)
    const typeMatch = message.match(/Tipo de hotel:\s*(.*)/i)
    const isGuidedSearch = !!(locationMatch || typeMatch)
    
    // If it's NOT a guided search, use free-form chatbot
    if (!isGuidedSearch) {
      console.log('💬 FREE-FORM CHAT - Processing:', message)
      
      // Get all approved and paid hotels for context
      const allHotels = await prisma.hotel.findMany({
        where: {
          status: 'APPROVED',
          isPaid: true
        }
      })
      
      // Get conversation history from session
      const existingSession = await prisma.chatSession.findUnique({
        where: { sessionId }
      })
      
      // Extract conversation history for AI (only role and content needed)
      const conversationHistory = existingSession 
        ? (existingSession.messages as any[]).map((msg: any) => ({
            role: msg.role,
            content: msg.content
          }))
        : []
      
      // Get response from free-form chatbot
      const chatbotResponse = await freeFormChatbot(message, allHotels, conversationHistory, lang)
      
      // Save conversation to session
      const newMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      }
      
      const botMessage = {
        role: 'assistant',
        content: chatbotResponse,
        timestamp: new Date().toISOString()
      }
      
      if (existingSession) {
        // Preserve existing messages with their timestamps, only append new messages
        const existingMessages = (existingSession.messages as any[]) || []
        await prisma.chatSession.update({
          where: { sessionId },
          data: {
            messages: [...existingMessages, newMessage, botMessage]
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
      
      // Return empty hotels array - links are included in the chatbot response itself
      return NextResponse.json({
        message: chatbotResponse,
        hotels: [], // No separate hotel list - links are in the chatbot response
        timestamp: new Date().toISOString()
      })
    }

    // Continue with guided search logic below
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

    // 2. Si hay ubicación y tipo, usar el nuevo sistema de keywords
    if (location && hotelTypes.length > 0) {
      if (filteredByType.length === 0) {
        chatbotMessage = lang === 'en'
          ? 'Sorry, no hotels found for that type.'
          : 'Lo siento, no se encontraron hoteles de ese tipo.'
        finalHotels = []
      } else {
        // Validación: detectar búsquedas genéricas/vagas
        if (isGenericQuery(location)) {
          chatbotMessage = lang === 'en'
            ? 'Please be more specific. Try searching for a specific location like "Mariscal Sucre Airport" or "Quito Airport" instead of just "airport".'
            : 'Por favor, sé más específico. Intenta buscar una ubicación específica como "Aeropuerto Mariscal Sucre" o "Aeropuerto de Quito" en lugar de solo "aeropuerto".'
          finalHotels = []
        } else {
          console.log('🔍 DEBUG - Building keywords for', filteredByType.length, 'hotels')
          
          // Build keywords for each hotel
          const hotelsWithKeywords = await Promise.all(
            filteredByType.map(async (hotel) => {
              const keywords = await buildHotelKeywords(hotel, lang)
              return {
                id: hotel.id,
                keywords,
                name: hotel.name,
                city: hotel.city
              }
            })
          )
          
          console.log('🔍 DEBUG - Hotels with keywords:', hotelsWithKeywords.map(h => ({ 
            id: h.id, 
            name: h.name, 
            keywordCount: h.keywords.length,
            sampleKeywords: h.keywords.slice(0, 5)
          })))
          
          // Find matching hotels using AI keyword matching
          const matchingHotelIds = await findMatchingHotelsByKeywords(location, hotelsWithKeywords, lang)
          console.log('🔍 DEBUG - Matching hotel IDs:', matchingHotelIds)
          
          // Filter hotels to only those that matched
          finalHotels = filteredByType.filter(hotel => matchingHotelIds.includes(hotel.id))
          console.log('🔍 DEBUG - Final matching hotels:', finalHotels.length, finalHotels.map(h => h.name))
          
          chatbotMessage = lang === 'en'
            ? (finalHotels.length > 0 ? 'Here are the hotels that match your search.' : 'Sorry, no hotels matched your search.')
            : (finalHotels.length > 0 ? 'Estos son los hoteles que coinciden con tu búsqueda.' : 'Lo siento, no se encontraron hoteles compatibles.')
        }
      }
    } else if (location && hotelTypes.length === 0) {
      // Location provided but no hotel types - search all approved/paid hotels
      const allHotels = await prisma.hotel.findMany({
        where: {
          status: 'APPROVED',
          isPaid: true
        }
      })
      
      if (allHotels.length === 0) {
        chatbotMessage = lang === 'en'
          ? 'Sorry, no hotels found.'
          : 'Lo siento, no se encontraron hoteles.'
        finalHotels = []
      } else if (isGenericQuery(location)) {
        chatbotMessage = lang === 'en'
          ? 'Please be more specific. Try searching for a specific location like "Mariscal Sucre Airport" or "Quito Airport" instead of just "airport".'
          : 'Por favor, sé más específico. Intenta buscar una ubicación específica como "Aeropuerto Mariscal Sucre" o "Aeropuerto de Quito" en lugar de solo "aeropuerto".'
        finalHotels = []
      } else {
        console.log('🔍 DEBUG - Building keywords for', allHotels.length, 'hotels (no type filter)')
        
        // Build keywords for each hotel
        const hotelsWithKeywords = await Promise.all(
          allHotels.map(async (hotel) => {
            const keywords = await buildHotelKeywords(hotel, lang)
            return {
              id: hotel.id,
              keywords,
              name: hotel.name,
              city: hotel.city
            }
          })
        )
        
        // Find matching hotels using AI keyword matching
        const matchingHotelIds = await findMatchingHotelsByKeywords(location, hotelsWithKeywords, lang)
        console.log('🔍 DEBUG - Matching hotel IDs (no type filter):', matchingHotelIds)
        
        finalHotels = allHotels.filter(hotel => matchingHotelIds.includes(hotel.id))
        
        chatbotMessage = lang === 'en'
          ? (finalHotels.length > 0 ? 'Here are the hotels that match your search.' : 'Sorry, no hotels matched your search.')
          : (finalHotels.length > 0 ? 'Estos son los hoteles que coinciden con tu búsqueda.' : 'Lo siento, no se encontraron hoteles compatibles.')
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