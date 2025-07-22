'use client'
import { useState, useEffect } from 'react'

interface Hotel {
  id: string
  name: string
  region: string
  city: string
  address?: string
}

export default function MapModal({
  highlightedHotels = [],
  onClose
}: {
  highlightedHotels: Hotel[]
  onClose: () => void
}) {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  // load leaflet from CDN
  useEffect(() => {
    if (typeof window === 'undefined') return
    const existing = document.querySelector('#leaflet-script') as HTMLScriptElement
    if (!existing) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.id = 'leaflet-css'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.id = 'leaflet-script'
      script.async = true
      script.onload = () => setLeafletLoaded(true)
      document.body.appendChild(script)
      return () => {
        document.head.removeChild(link)
        document.body.removeChild(script)
      }
    } else {
      setLeafletLoaded(true)
    }
  }, [])

  useEffect(() => {
    const fetchHotels = async () => {
      const res = await fetch('/api/hotels')
      const data = await res.json()
      setHotels(data.hotels || [])
    }
    fetchHotels()
  }, [])

  useEffect(() => {
    if (!leafletLoaded || !hotels.length || !(window as any).L) return

    const L = (window as any).L
    const map = L.map('hotel-map').setView([-1.831239, -78.183406], 6)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    const highlightIds = new Set(highlightedHotels.map(h => h.id))

    hotels.forEach(async h => {
      const query = encodeURIComponent(h.address || `${h.city}, ${h.region}, Ecuador`)
      try {
        const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`)
        const results = await resp.json()
        if (results && results[0]) {
          const lat = parseFloat(results[0].lat)
          const lon = parseFloat(results[0].lon)
          const marker = highlightIds.has(h.id)
            ? L.circleMarker([lat, lon], { radius: 8, color: 'red' }).addTo(map)
            : L.circleMarker([lat, lon], { radius: 5, color: 'blue' }).addTo(map)
          marker.bindPopup(`<b>${h.name}</b><br/>${h.city}`)
        }
      } catch (e) {
        // ignore geocoding errors
      }
    })
  }, [leafletLoaded, hotels, highlightedHotels])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full h-full max-w-3xl max-h-[90vh] relative flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center"
        >
          &times;
        </button>
        <div id="hotel-map" className="flex-1 rounded-b-lg" />
      </div>
    </div>
  )
}

