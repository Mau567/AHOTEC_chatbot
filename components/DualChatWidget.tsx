'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Building } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

interface DualChatWidgetProps {
  apiUrl?: string
  theme?: 'light' | 'dark'
  position?: 'bottom-right' | 'bottom-left'
}

export default function DualChatWidget({
  apiUrl = '/api/chat',
  theme = 'light',
  position = 'bottom-right'
}: DualChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'guided' | 'free'>('guided')
  const [language, setLanguage] = useState<'es' | 'en'>('es')

  // Free chat states
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Guided chat states
  const [chatStep, setChatStep] = useState<'location' | 'type' | 'result'>('location')
  const [userLocation, setUserLocation] = useState('')
  const [userHotelType, setUserHotelType] = useState('')
  const [guidedMessage, setGuidedMessage] = useState('')
  const [guidedHotels, setGuidedHotels] = useState<any[]>([])
  const [guidedLoading, setGuidedLoading] = useState(false)
  const [guidedNoResults, setGuidedNoResults] = useState(false)

  const hotelTypeOptions = [
    'Hotel 4 o 5 estrellas',
    'Hotel 3 o menos estrellas',
    'Hostal / Bed and Breakfast',
    'Hostería de campo',
    'Hacienda',
    'Resort'
  ]

  const t = {
    assistantTitle: language === 'es' ? 'Asistente AHOTEC' : 'AHOTEC Assistant',
    openChat: language === 'es' ? 'Abrir chat' : 'Open chat',
    closeChat: language === 'es' ? 'Cerrar chat' : 'Close chat',
    guidedTab: language === 'es' ? 'Guiado' : 'Guided',
    freeTab: language === 'es' ? 'Libre' : 'Free',
    locationQuestion: language === 'es' ? '¿Dónde te gustaría buscar un hotel?' : 'Where would you like to search for a hotel?',
    typeQuestion: language === 'es' ? '¿Qué tipo de hotel buscas?' : 'What type of hotel are you looking for?',
    nextButton: language === 'es' ? 'Siguiente' : 'Next',
    resetButton: language === 'es' ? 'Reiniciar' : 'Reset',
    loadingMessage: language === 'es' ? 'Buscando hoteles compatibles...' : 'Searching for compatible hotels...',
    noResultsMessage: language === 'es' ? 'Lo siento, no encontramos un hotel que coincida con tu búsqueda.' : "Sorry, we couldn't find a hotel that matches your search.",
    placeholder: language === 'es' ? 'Escribe tu mensaje...' : 'Type your message...',
    sendButton: language === 'es' ? 'Enviar' : 'Send',
    technicalError: language === 'es' ? 'Lo siento, hay un problema técnico. Por favor intenta de nuevo.' : 'Sorry, there is a technical problem. Please try again.',
    english: 'English',
    spanish: 'Español'
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendFreeMessage = async () => {
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
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: t.technicalError,
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
      handleSendFreeMessage()
    }
  }

  const handleSendGuided = async () => {
    setGuidedLoading(true)
    setGuidedMessage('')
    setGuidedHotels([])
    setGuidedNoResults(false)
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Ubicación: ${userLocation}\nTipo de hotel: ${userHotelType}`,
          sessionId
        })
      })
      const data = await response.json()
      setGuidedMessage(data.message)
      if (Array.isArray(data.hotels) && data.hotels.length > 0) {
        setGuidedHotels(data.hotels)
      } else {
        setGuidedNoResults(true)
      }
    } catch (error) {
      setGuidedMessage(t.technicalError)
      setGuidedNoResults(true)
    } finally {
      setGuidedLoading(false)
    }
  }

  const resetGuided = () => {
    setChatStep('location')
    setUserLocation('')
    setUserHotelType('')
    setGuidedMessage('')
    setGuidedHotels([])
    setGuidedNoResults(false)
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
        <div className="flex flex-col items-end space-y-2">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className={`${currentTheme.button} px-3 py-1 rounded-md text-xs shadow-lg transition-all duration-200 hover:scale-105`}
          >
            {language === 'es' ? t.english : t.spanish}
          </button>
          {/* Chat Button */}
          <button
            onClick={() => setIsOpen(true)}
            className={`${currentTheme.button} w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110`}
            aria-label={t.openChat}
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className={`w-80 h-96 rounded-lg shadow-xl border ${currentTheme.widget} flex flex-col`}>
          {/* Header */}
          <div className={`${currentTheme.header} px-4 py-3 rounded-t-lg flex items-center justify-between`}>
            <div className="flex items-center">
              <Building className="w-5 h-5 mr-2" />
              <span className="font-semibold">{t.assistantTitle}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label={t.closeChat}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setMode('guided')}
              className={`flex-1 py-2 text-sm font-medium ${mode === 'guided' ? 'border-b-2 border-blue-600' : ''}`}
            >
              {t.guidedTab}
            </button>
            <button
              onClick={() => setMode('free')}
              className={`flex-1 py-2 text-sm font-medium ${mode === 'free' ? 'border-b-2 border-blue-600' : ''}`}
            >
              {t.freeTab}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {mode === 'free' && (
              <>
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">{t.locationQuestion}</p>
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
                    <div className={`px-3 py-2 rounded-lg text-sm ${currentTheme.message.bot}`}>...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}

            {mode === 'guided' && (
              <>
                {chatStep === 'location' && (
                  <div className="text-center text-gray-700 mt-8">
                    <p className="mb-4">{t.locationQuestion}</p>
                    <input
                      type="text"
                      value={userLocation}
                      onChange={e => setUserLocation(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && userLocation.trim()) setChatStep('type') }}
                      placeholder="Ciudad, región o dirección"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      disabled={!userLocation.trim()}
                      onClick={() => setChatStep('type')}
                    >
                      {t.nextButton}
                    </button>
                  </div>
                )}
                {chatStep === 'type' && (
                  <div className="text-center text-gray-700 mt-8">
                    <p className="mb-4">{t.typeQuestion}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {hotelTypeOptions.map(option => (
                        <button
                          key={option}
                          className={`px-4 py-2 rounded-md border ${userHotelType === option ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 hover:bg-blue-100'}`}
                          onClick={() => {
                            setUserHotelType(option)
                            setChatStep('result')
                            handleSendGuided()
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatStep === 'result' && (
                  <div className="text-center text-gray-700 mt-4">
                    {guidedLoading && <p>{t.loadingMessage}</p>}
                    {!guidedLoading && guidedNoResults && (
                      <div className="text-red-600 font-semibold mt-4">{t.noResultsMessage}</div>
                    )}
                    {!guidedLoading && guidedMessage && (
                      <div className="mb-2 text-left">
                        <ReactMarkdown>{guidedMessage}</ReactMarkdown>
                      </div>
                    )}
                    {guidedHotels.length > 0 && (
                      <ul className="list-disc text-left ml-5 space-y-1">
                        {guidedHotels.map(h => (
                          <li key={h.id}>{h.name}</li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-4">
                      <button
                        onClick={resetGuided}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                      >
                        {t.resetButton}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Free chat input */}
          {mode === 'free' && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t.placeholder}
                  disabled={isLoading}
                  className={`flex-1 px-3 py-2 rounded-md text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentTheme.input}`}
                />
                <button
                  onClick={handleSendFreeMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${currentTheme.button}`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
