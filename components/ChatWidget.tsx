'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Building, Headphones } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

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
  /** True on `/embed/chat` only — avoids SSR/hydration using non-embed layout for one frame (iframe jump). */
  embedded?: boolean
}

export default function ChatWidget({
  apiUrl = '/api/chat',
  theme = 'light',
  position = 'bottom-right',
  embedded = false
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showProactiveBubble, setShowProactiveBubble] = useState(false)
  /** Once dismissed or user opens chat, don't show the bubble again this session */
  const [proactiveBubbleDone, setProactiveBubbleDone] = useState(false)
  const [language, setLanguage] = useState<'es' | 'en'>('es')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isEmbedded = embedded

  const t = {
    assistantTitle: language === 'es' ? 'Lucía' : 'Lucía',
    openChat: language === 'es' ? 'Abrir chat' : 'Open chat',
    closeChat: language === 'es' ? 'Cerrar chat' : 'Close chat',
    welcomeMessage: language === 'es' ? 'Hola, soy Lucía, tu asistente virtual. ¿En qué puedo ayudarte?' : 'Hello, I am Lucía, your virtual assistant. How can I help you?',
    placeholder: language === 'es' ? 'Escribe tu mensaje...' : 'Type your message...',
    sendButton: language === 'es' ? 'Enviar' : 'Send',
    technicalError: language === 'es' ? 'Lo siento, hay un problema técnico. Por favor intenta de nuevo.' : 'Sorry, there is a technical problem. Please try again.',
    resetChat: language === 'es' ? 'Reiniciar' : 'Reset',
    proactiveBubble:
      language === 'es'
        ? '¡Hola! ¿Te puedo ayudar en algo?'
        : 'Hi! Can I help you with anything?'
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Show proactive bubble after a short delay (only when chat is closed and not already done)
  useEffect(() => {
    if (isOpen || proactiveBubbleDone) return
    const t = window.setTimeout(() => setShowProactiveBubble(true), 1500)
    return () => window.clearTimeout(t)
  }, [isOpen, proactiveBubbleDone])

  // When embedded in an iframe, measure container so the frame matches bubble + button (closed) or panel (open).
  // Important: if the iframe is narrower than the greeting card (~248px), layout squeezes and each word wraps to its own line.
  // We enforce minimum closed dimensions until the user dismisses the bubble / goes compact (launcher only).
  useEffect(() => {
    if (typeof window === 'undefined' || window.self === window.top) return
    const el = containerRef.current
    if (!el) return

    const CLOSED_MIN_W_GREETING = 288 // card 248px + FAB nudge + padding
    const CLOSED_MIN_H_GREETING = 312
    const CLOSED_MIN_COMPACT = 88

    const reportSize = () => {
      try {
        const rect = el.getBoundingClientRect()
        let w = Math.ceil(rect.width)
        let h = Math.ceil(rect.height)
        if (w <= 0 || h <= 0) return

        if (!isOpen) {
          const compactClosed =
            proactiveBubbleDone && !showProactiveBubble
          if (compactClosed) {
            w = Math.max(w, CLOSED_MIN_COMPACT)
            h = Math.max(h, CLOSED_MIN_COMPACT)
          } else {
            w = Math.max(w, CLOSED_MIN_W_GREETING)
            h = Math.max(
              h,
              showProactiveBubble ? CLOSED_MIN_H_GREETING : 104
            )
          }
        }

        // Same as open panel (w-80 = 320px): host iframe is right-aligned; widening the frame moves its left edge.
        w = Math.max(w, 320)

        // Same pad open/closed so iframe width does not change by a few px when toggling (visible “slide”).
        // Room for shadow-xl (iframe overflow:hidden when open).
        const pad = 14
        window.parent.postMessage(
          {
            type: 'ahotec-chat-resize',
            open: isOpen,
            width: w + pad,
            height: h + pad
          },
          '*'
        )
      } catch (_) {}
    }

    reportSize()
    const raf1 = requestAnimationFrame(() => {
      reportSize()
      requestAnimationFrame(reportSize)
    })

    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => reportSize())
        : null
    if (ro) ro.observe(el)

    return () => {
      cancelAnimationFrame(raf1)
      ro?.disconnect()
    }
  }, [isOpen, showProactiveBubble, proactiveBubbleDone])

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
          sessionId,
          lang: language
        })
      })

      const data = await response.json()

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.message ?? t.technicalError,
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
      handleSendMessage()
    }
  }

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  }
  /** Flush to iframe edges: iframe size matches content; avoids clip/asymmetry vs bottom-4/right-4 + tight iframe. */
  const embedPositionClasses = {
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0'
  } as const

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
    <div
      ref={containerRef}
      className={`fixed z-50 ${
        isEmbedded ? embedPositionClasses[position] : positionClasses[position]
      }`}
    >
      {!isOpen && (
        <div
          className={`flex shrink-0 flex-col gap-3 ${
            position === 'bottom-right' ? 'items-end' : 'items-start'
          } min-w-[288px]`}
        >
          {showProactiveBubble && (
            <div className="relative w-[248px] shrink-0 pt-5 transition-opacity duration-300">
              <div className="absolute left-1/2 top-0 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white bg-sky-100 shadow-md">
                <Headphones className="h-5 w-5 text-blue-600" strokeWidth={2} aria-hidden />
              </div>
              <div className="relative rounded-2xl border border-gray-100/80 bg-white px-4 pb-3.5 pt-7 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                <button
                  type="button"
                  onClick={() => {
                    setShowProactiveBubble(false)
                    setProactiveBubbleDone(true)
                  }}
                  className="absolute right-2.5 top-2.5 rounded-md p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  aria-label={t.closeChat}
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
                <p className="pr-7 text-left text-[15px] font-normal leading-[1.45] tracking-tight text-gray-800">
                  {t.proactiveBubble}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowProactiveBubble(false)
                    setProactiveBubbleDone(true)
                    setIsOpen(true)
                  }}
                  className="mt-3.5 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                  {language === 'es' ? 'Chatear' : 'Chat'}
                </button>
              </div>
            </div>
          )}
          <button
            onClick={() => {
              setShowProactiveBubble(false)
              setProactiveBubbleDone(true)
              setIsOpen(true)
            }}
            className={`${currentTheme.button} flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
              isEmbedded
                ? ''
                : position === 'bottom-right'
                  ? 'translate-x-1.5'
                  : '-translate-x-1.5'
            }`}
            aria-label={t.openChat}
          >
            <MessageCircle className="h-6 w-6" strokeWidth={2} />
          </button>
        </div>
      )}

      {isOpen && (
        <div
          className={`rounded-lg shadow-xl border ${currentTheme.widget} flex flex-col shrink-0 ${
            isEmbedded
              ? 'w-80 h-[30rem]'
              : 'w-80 h-[min(30rem,calc(100vh-5rem))] max-w-[calc(100vw-2rem)]'
          }`}
        >
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

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500">
                <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">{t.welcomeMessage}</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                      message.isUser
                        ? currentTheme.message.user
                        : currentTheme.message.bot
                    }`}
                  >
                    {message.isUser ? (
                      message.text
                    ) : (
                      <ReactMarkdown
                        components={{
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">
                              {children}
                            </a>
                          )
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className={`px-3 py-2 rounded-lg text-sm ${currentTheme.message.bot}`}>...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
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
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${currentTheme.button}`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {messages.length > 0 && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setMessages([])
                      setInputValue('')
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    {t.resetChat}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
