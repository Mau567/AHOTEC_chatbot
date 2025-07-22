'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Building } from 'lucide-react'

interface ChatMessage {
  id: string
  text: string
  isUser: boolean
}

interface Hotel {
  id: string
  name: string
  city?: string
  region?: string
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
  const [tab, setTab] = useState<'guided' | 'free'>('guided')

  // Free chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [freeLoading, setFreeLoading] = useState(false)
  const [sessionId] = useState(() => `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Guided chat state
  const [guidedStep, setGuidedStep] = useState<'location' | 'type' | 'results'>('location')
  const [location, setLocation] = useState('')
  const [hotelType, setHotelType] = useState('')
  const [guidedLoading, setGuidedLoading] = useState(false)
  const [guidedMessage, setGuidedMessage] = useState('')
  const [guidedHotels, setGuidedHotels] = useState<Hotel[]>([])

  const hotelTypes = [
    'Hotel 4 o 5 estrellas',
    'Hotel 3 o menos estrellas',
    'Hostal / Bed and Breakfast',
    'Hostería de campo',
    'Hacienda',
    'Resort'
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendFreeMessage = async () => {
    if (!inputValue.trim() || freeLoading) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true
    }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setFreeLoading(true)

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputValue, sessionId })
      })
      const data = await response.json()
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        isUser: false
      }
      setMessages(prev => [...prev, botMsg])
    } catch (e) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: 'Error', isUser: false }])
    } finally {
      setFreeLoading(false)
    }
  }

  const handleGuided = async (selectedType?: string) => {
    if (guidedStep === 'location') {
      if (location.trim()) setGuidedStep('type')
      return
    }
    if (guidedStep === 'type') {
      const type = selectedType || hotelType
      if (!type) return
      setHotelType(type)
      setGuidedLoading(true)
      try {
        const message = `Ubicación: ${location}\nTipo de hotel: ${type}`
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, sessionId })
        })
        const data = await response.json()
        setGuidedMessage(data.message)
        setGuidedHotels(data.hotels || [])
        setGuidedStep('results')
      } catch (e) {
        setGuidedMessage('Error')
        setGuidedHotels([])
        setGuidedStep('results')
      } finally {
        setGuidedLoading(false)
      }
      return
    }
  }

  const resetGuided = () => {
    setGuidedStep('location')
    setLocation('')
    setHotelType('')
    setGuidedMessage('')
    setGuidedHotels([])
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
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`${currentTheme.button} w-14 h-14 rounded-full shadow-lg flex items-center justify-center`}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className={`w-80 h-96 rounded-lg shadow-xl border ${currentTheme.widget} flex flex-col`}>
          <div className={`${currentTheme.header} px-4 py-3 rounded-t-lg flex items-center justify-between`}>
            <div className="flex items-center">
              <Building className="w-5 h-5 mr-2" />
              <span className="font-semibold">AHOTEC Bot</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="border-b flex text-sm">
            <button
              onClick={() => setTab('guided')}
              className={`flex-1 py-2 ${tab === 'guided' ? 'font-semibold text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            >
              Guiado
            </button>
            <button
              onClick={() => setTab('free')}
              className={`flex-1 py-2 ${tab === 'free' ? 'font-semibold text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            >
              Libre
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 text-sm">
            {tab === 'guided' ? (
              <div className="space-y-3">
                {guidedStep === 'location' && (
                  <div className="space-y-2">
                    <p>¿Dónde buscas un hotel?</p>
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                    />
                    <button
                      onClick={() => handleGuided()}
                      disabled={!location.trim()}
                      className={`${currentTheme.button} w-full py-1 rounded text-sm mt-1`}
                    >
                      Siguiente
                    </button>
                  </div>
                )}
                {guidedStep === 'type' && (
                  <div className="space-y-2">
                    <p>¿Qué tipo de hotel buscas?</p>
                    <div className="grid grid-cols-1 gap-2">
                      {hotelTypes.map(opt => (
                        <button
                          key={opt}
                          onClick={() => { handleGuided(opt) }}
                          className="px-2 py-1 border rounded text-left hover:bg-gray-100"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {guidedStep === 'results' && (
                  <div className="space-y-2">
                    {guidedLoading ? (
                      <p>Buscando...</p>
                    ) : (
                      <>
                        <p>{guidedMessage}</p>
                        {guidedHotels.length > 0 && (
                          <ul className="list-disc pl-4 text-xs">
                            {guidedHotels.map(h => (
                              <li key={h.id}>{h.name}{h.city ? ` - ${h.city}` : ''}</li>
                            ))}
                          </ul>
                        )}
                        <button onClick={resetGuided} className={`${currentTheme.button} w-full py-1 rounded text-sm`}>
                          Nueva búsqueda
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto space-y-2">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                      <p>¡Hola! ¿En qué área de Ecuador buscas hoteles?</p>
                    </div>
                  )}
                  {messages.map(m => (
                    <div key={m.id} className={`flex ${m.isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`px-3 py-2 rounded-lg text-sm ${m.isUser ? currentTheme.message.user : currentTheme.message.bot}`}>{m.text}</div>
                    </div>
                  ))}
                  {freeLoading && (
                    <div className="flex justify-start">
                      <div className={`px-3 py-2 rounded-lg text-sm ${currentTheme.message.bot}`}>...</div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="pt-2 flex space-x-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') sendFreeMessage() }}
                    className={`flex-1 px-2 py-1 border rounded ${currentTheme.input}`}
                  />
                  <button
                    onClick={sendFreeMessage}
                    disabled={!inputValue.trim() || freeLoading}
                    className={`${currentTheme.button} px-3 py-1 rounded`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
