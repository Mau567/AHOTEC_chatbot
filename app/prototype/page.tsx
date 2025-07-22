'use client'

import DualChatWidget from '@/components/DualChatWidget'

export default function PrototypePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <h1 className="text-xl font-bold">Chatbot Prototype</h1>
        </div>
      </header>
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl font-semibold">Demo page</h2>
          <p>This page showcases the chatbot popup with two modes: a guided search and a free chat.</p>
          <p>Use the button on the bottom right to open the chatbot.</p>
        </div>
      </main>
      <DualChatWidget />
    </div>
  )
}
