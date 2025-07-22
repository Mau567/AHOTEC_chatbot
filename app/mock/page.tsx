'use client'

import DualChatWidget from '@/components/DualChatWidget'

export default function MockPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="p-4 bg-white shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">Chatbot Prototype</h1>
        <a href="/" className="text-blue-600 hover:underline">Home</a>
      </header>
      <main className="flex-grow p-8 space-y-4">
        <p className="text-gray-700 text-lg">This page showcases the chatbot widget with two modes.</p>
        <p className="text-gray-700">Use the floating button in the bottom right corner to open the chat.</p>
      </main>
      <DualChatWidget apiUrl="/api/chat" />
    </div>
  )
}
