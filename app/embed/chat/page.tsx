'use client'

import ChatWidget from '@/components/ChatWidget'

/**
 * Embeddable chat page. Designed to be loaded in an iframe on any website.
 * Use the script snippet or iframe tag to add the chat to external pages.
 */
export default function EmbedChatPage() {
  // When in iframe, origin is this app's domain, so relative URL hits this app's API
  const apiUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/chat`
    : '/api/chat'

  return (
    <div className="w-full bg-transparent min-h-0">
      <ChatWidget
        apiUrl={apiUrl}
        theme="light"
        position="bottom-right"
      />
    </div>
  )
}
