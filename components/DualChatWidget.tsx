'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'

interface ChatMessage {
  id: string
  text: string
  isUser: boolean
}

interface DualChatWidgetProps {
  apiUrl?: string
}

export default function DualChatWidget({ apiUrl = '/api/chat' }: DualChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tab, setTab] = useState<'guided' | 'free'>('guided')

  // Guided chat state
  const [location, setLocation] = useState('')
  const [hotelType, setHotelType] = useState('')
  const [guidedResults, setGuidedResults] = useState<any[]>([])
  const [guidedLoading, setGuidedLoading] = useState(false)

  // Free chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [freeInput, setFreeInput] = useState('')
  const [freeLoading, setFreeLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [sessionId] = useState(() => `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  const hotelTypeOptions = [
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

  const handleGuidedSearch = async () => {
    if (!location.trim() || !hotelType) return
    setGuidedLoading(true)
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Ubicación: ${location}\nTipo de hotel: ${hotelType}`,
          sessionId
        })
      })
      const data = await res.json()
      setGuidedResults(Array.isArray(data.hotels) ? data.hotels : [])
    } catch (e) {
      setGuidedResults([])
    } finally {
      setGuidedLoading(false)
    }
  }

  const handleSendFree = async () => {
    if (!freeInput.trim() || freeLoading) return
    const userMessage: ChatMessage = { id: Date.now().toString(), text: freeInput, isUser: true }
    setMessages(prev => [...prev, userMessage])
    setFreeInput('')
    setFreeLoading(true)
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: freeInput, sessionId: `free_${sessionId}` })
      })
      const data = await res.json()
      const botMessage: ChatMessage = { id: (Date.now() + 1).toString(), text: data.message, isUser: false }
      setMessages(prev => [...prev, botMessage])
    } catch (e) {
      const errorMsg: ChatMessage = { id: (Date.now() + 1).toString(), text: 'Error', isUser: false }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setFreeLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
      {isOpen && (
        <div className="w-80 h-96 bg-white border rounded-lg shadow-xl flex flex-col">
          <div className="bg-blue-600 text-white px-3 py-2 rounded-t-lg flex justify-between items-center">
            <div className="space-x-2">
              <button onClick={() => setTab('guided')} className={`px-2 py-1 rounded ${tab === 'guided' ? 'bg-blue-700' : ''}`}>Guiado</button>
              <button onClick={() => setTab('free')} className={`px-2 py-1 rounded ${tab === 'free' ? 'bg-blue-700' : ''}`}>Libre</button>
            </div>
            <button onClick={() => setIsOpen(false)} aria-label="Close chat">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 text-sm">
            {tab === 'guided' && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Ubicación"
                  className="w-full px-2 py-1 border rounded"
                />
                <select
                  value={hotelType}
                  onChange={e => setHotelType(e.target.value)}
                  className="w-full px-2 py-1 border rounded"
                >
                  <option value="">Tipo de hotel</option>
                  {hotelTypeOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <button
                  onClick={handleGuidedSearch}
                  disabled={guidedLoading || !location || !hotelType}
                  className="w-full bg-blue-600 text-white py-1 rounded hover:bg-blue-700 disabled:bg-gray-300"
                >
                  Buscar
                </button>
                {guidedLoading && <p>Cargando...</p>}
                {guidedResults.length > 0 && (
                  <ul className="list-disc pl-4">
                    {guidedResults.map(h => (
                      <li key={h.id || h.name}>{h.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {tab === 'free' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto mb-2">
                  {messages.map(m => (
                    <div key={m.id} className={`flex my-1 ${m.isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`px-2 py-1 rounded ${m.isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>{m.text}</div>
                    </div>
                  ))}
                  {freeLoading && <div className="text-gray-500">...</div>}
                  <div ref={messagesEndRef} />
                </div>
                <div className="flex space-x-1">
                  <input
                    type="text"
                    value={freeInput}
                    onChange={e => setFreeInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSendFree() }}
                    className="flex-1 px-2 py-1 border rounded"
                    placeholder="Escribe tu mensaje"
                  />
                  <button
                    onClick={handleSendFree}
                    disabled={!freeInput.trim() || freeLoading}
                    className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    Enviar
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
