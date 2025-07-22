'use client'

import DualChatWidget from '@/components/DualChatWidget'

export default function MockPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold">Mock Page</h1>
      <DualChatWidget />
    </div>
  )
}
