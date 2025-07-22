'use client'

import DualChatWidget from '@/components/DualChatWidget'

export default function PrototypePage() {
  return (
    <div className="min-h-screen p-8 bg-white">
      <h1 className="text-3xl font-bold mb-4">Chatbot Prototype</h1>
      <p className="mb-8 text-gray-600">Esta página muestra el chatbot flotante con modo guiado y libre.</p>
      <DualChatWidget />
    </div>
  )
}
