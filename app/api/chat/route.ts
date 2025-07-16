import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHotelRecommendations } from '@/lib/mistral'

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

    // Buscar todos los hoteles aprobados y pagados
    const allHotels = await prisma.hotel.findMany({
      where: {
        status: 'APPROVED',
        isPaid: true,
        hotelType: hotelType ? { contains: hotelType, mode: 'insensitive' } : undefined,
      }
    })

    const locationLower = location.toLowerCase()
    // Considerar coincidencia si el término aparece en cualquier campo relevante o en los alrededores
    const finalHotels = allHotels.filter(hotel => {
      const fields = [
        hotel.name,
        hotel.city,
        hotel.region,
        hotel.address,
        hotel.locationPhrase
      ]
      // Coincidencia en campos principales
      if (fields.some(f => typeof f === 'string' && f.toLowerCase().includes(locationLower))) {
        return true
      }
      // Coincidencia en alrededores
      if (hotel.surroundings && Array.isArray(hotel.surroundings)) {
        return hotel.surroundings.some(s => s.toLowerCase().includes(locationLower))
      }
      return false
    })

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