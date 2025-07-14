import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHotelRecommendations } from '@/lib/mistral'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId } = body

    // Get approved hotels from database
    const hotels = await prisma.hotel.findMany({
      where: {
        status: 'APPROVED',
        isPaid: true
      }
    })

    // Get AI response using Mistral
    const aiResponse = await getHotelRecommendations(message, hotels)

    // Save or update chat session
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
      content: aiResponse,
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

    return NextResponse.json({ 
      message: aiResponse,
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