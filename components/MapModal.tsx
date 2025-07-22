'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import Script from 'next/script'

interface Hotel {
  id: string
  name: string
  address?: string
}

interface MapModalProps {
  highlightedIds: string[]
  onClose: () => void
}

export default function MapModal({ highlightedIds, onClose }: MapModalProps) {
  const [hotels, setHotels] = useState<Hotel[]>([])

  useEffect(() => {
    const fetchHotels = async () => {
      const res = await fetch('/api/hotels')
      const data = await res.json()
      setHotels(data.hotels || [])
    }
    fetchHotels()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).L) return
    const L = (window as any).L
    const map = L.map('ahotec-map').setView([-1.8312, -78.1834], 6)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    hotels.forEach(async h => {
      if (!h.address) return
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(h.address)}`, { headers: { 'User-Agent': 'ahotec-chatbot' } })
        const geos = await res.json()
        if (Array.isArray(geos) && geos.length > 0) {
          const { lat, lon } = geos[0]
          const marker = L.marker([parseFloat(lat), parseFloat(lon)], { icon: highlightedIds.includes(h.id) ? L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x-red.png', iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [1,-34], shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png', shadowSize: [41,41] }) : undefined })
          marker.addTo(map).bindPopup(h.name)
        }
      } catch (e) {
        console.error('Geocode failed', e)
      }
    })

    return () => {
      map.remove()
    }
  }, [hotels, highlightedIds])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" strategy="beforeInteractive" />
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div className="bg-white w-full h-full md:w-3/4 md:h-3/4 rounded-lg shadow-lg relative">
        <button onClick={onClose} className="absolute top-2 right-2 z-10 p-1 bg-white rounded-full shadow">
          <X className="w-5 h-5" />
        </button>
        <div id="ahotec-map" className="w-full h-full rounded-lg" />
      </div>
    </div>
  )
}
