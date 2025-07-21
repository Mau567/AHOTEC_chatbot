import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHotelsBySemanticLocation } from '@/lib/mistral'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId } = body

    // Extraer ubicación y tipo de hotel del mensaje
    // Esperamos el formato: "Ubicación: ...\nTipo de hotel: ..."
    let location = ''
    let hotelType = ''
    const locationMatch = message.match(/Ubicación:\s*(.*)/i)
    const typeMatch = message.match(/Tipo de hotel:\s*(.*)/i)
    if (locationMatch) location = locationMatch[1].trim()
    if (typeMatch) hotelType = typeMatch[1].trim()

    // Buscar todos los hoteles aprobados y pagados que coincidan con el tipo
    const allHotels = await prisma.hotel.findMany({
      where: {
        status: 'APPROVED',
        isPaid: true,
        hotelType: hotelType ? { contains: hotelType, mode: 'insensitive' } : undefined,
      }
    })

    // Usar IA para filtrar por ubicación semántica
    let finalHotels = allHotels
    if (location && allHotels.length > 0) {
      const aiHotelIds = await getHotelsBySemanticLocation(location, allHotels)
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
      content: finalHotels.length > 0 ? 'Hoteles encontrados' : 'No se encontraron hoteles compatibles',
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

    // Devolver los hoteles compatibles (array)
    return NextResponse.json({ 
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