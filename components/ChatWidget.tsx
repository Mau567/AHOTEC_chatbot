'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Building } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'

interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

interface ChatWidgetProps {
  apiUrl?: string
  theme?: 'light' | 'dark'
  position?: 'bottom-right' | 'bottom-left'
}

export default function ChatWidget({ 
  apiUrl = '/api/chat', 
  theme = 'light',
  position = 'bottom-right'
}: ChatWidgetProps) {
  const { language } = useLanguage()
  const t = translations[language]
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: inputValue,
          sessionId
        })
      })

      const data = await response.json()

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        isUser: false,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hay un problema técnico. Por favor intenta de nuevo.',
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  }

  const themeClasses = {
    light: {
      widget: 'bg-white border-gray-200',
      header: 'bg-blue-600 text-white',
      input: 'bg-gray-50 border-gray-300 text-gray-900',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      message: {
        user: 'bg-blue-600 text-white',
        bot: 'bg-gray-100 text-gray-900'
      }
    },
    dark: {
      widget: 'bg-gray-800 border-gray-600',
      header: 'bg-gray-700 text-white',
      input: 'bg-gray-700 border-gray-600 text-white',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      message: {
        user: 'bg-blue-600 text-white',
        bot: 'bg-gray-700 text-white'
      }
    }
  }

  const currentTheme = themeClasses[theme]

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`${currentTheme.button} w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110`}
          aria-label="Abrir chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className={`w-80 h-96 rounded-lg shadow-xl border ${currentTheme.widget} flex flex-col`}>
          {/* Header */}
          <div className={`${currentTheme.header} px-4 py-3 rounded-t-lg flex items-center justify-between`}>
            <div className="flex items-center">
              <Building className="w-5 h-5 mr-2" />
              <span className="font-semibold">AHOTEC Asistente</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Cerrar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500">
                <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">¡Hola! ¿En qué área de Ecuador buscas hoteles?</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.isUser 
                        ? currentTheme.message.user 
                        : currentTheme.message.bot
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className={`px-3 py-2 rounded-lg text-sm ${currentTheme.message.bot}`}>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={language === 'es' ? 'Escribe tu mensaje...' : 'Type your message...'}
                disabled={isLoading}
                className={`flex-1 px-3 py-2 rounded-md text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentTheme.input}`}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${currentTheme.button}`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 