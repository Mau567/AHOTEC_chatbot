import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export default function DualChatWidget({ apiUrl = '/api/chat' }: { apiUrl?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [tab, setTab] = useState<'guided' | 'free'>('guided')

  // Guided chatbot state
  const [location, setLocation] = useState('')
  const [hotelType, setHotelType] = useState('')
  const [guidedResponse, setGuidedResponse] = useState('')
  const [isGuidedLoading, setIsGuidedLoading] = useState(false)

  // Free chatbot state (reuse logic from ChatWidget)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `dual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputValue, sessionId }),
      })
      const data = await response.json()
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error('Error sending message:', error)
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

  const handleGuidedSearch = async () => {
    if (!location.trim() || !hotelType.trim()) return
    setIsGuidedLoading(true)
    try {
      const message = `Ubicación: ${location}\nTipo de hotel: ${hotelType}`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId }),
      })
      const data = await response.json()
      setGuidedResponse(data.message)
    } catch (err) {
      console.error(err)
      setGuidedResponse('Error fetching response.')
    } finally {
      setIsGuidedLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="w-80 h-96 bg-white rounded-lg shadow-xl border flex flex-col">
          <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
            <span className="font-semibold">Chatbot Demo</span>
            <button onClick={() => setIsOpen(false)} aria-label="close">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex border-b">
            <button
              className={`flex-1 px-2 py-1 text-sm ${tab === 'guided' ? 'bg-blue-100' : ''}`}
              onClick={() => setTab('guided')}
            >
              Guided
            </button>
            <button
              className={`flex-1 px-2 py-1 text-sm ${tab === 'free' ? 'bg-blue-100' : ''}`}
              onClick={() => setTab('free')}
            >
              Free
            </button>
          </div>
          {tab === 'guided' && (
            <div className="p-3 flex-1 overflow-y-auto">
              <div className="space-y-2">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ubicación"
                  className="w-full px-2 py-1 border rounded"
                />
                <input
                  type="text"
                  value={hotelType}
                  onChange={(e) => setHotelType(e.target.value)}
                  placeholder="Tipo de hotel"
                  className="w-full px-2 py-1 border rounded"
                />
                <button
                  onClick={handleGuidedSearch}
                  disabled={isGuidedLoading}
                  className="bg-blue-600 text-white px-3 py-1 rounded w-full disabled:opacity-50"
                >
                  Buscar
                </button>
                {isGuidedLoading && <p className="text-sm text-gray-500">Cargando...</p>}
                {guidedResponse && (
                  <div className="mt-2 p-2 bg-blue-50 border rounded text-sm overflow-y-auto max-h-40">
                    {guidedResponse}
                  </div>
                )}
              </div>
            </div>
          )}
          {tab === 'free' && (
            <div className="flex-1 flex flex-col p-3">
              <div className="flex-1 overflow-y-auto space-y-2 mb-2">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`px-2 py-1 rounded text-sm ${m.isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="text-gray-500 text-sm">...</div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex space-x-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Mensaje"
                  className="flex-1 px-2 py-1 border rounded"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendFreeMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
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
