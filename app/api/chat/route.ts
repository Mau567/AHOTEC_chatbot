import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { freeFormChatbot } from '@/lib/mistral'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId, lang = 'es' } = body

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

    return NextResponse.json({
      message: chatbotResponse,
      hotels: [],
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
