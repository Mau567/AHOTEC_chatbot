'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { cityCoordinates } from '@/lib/cityCoordinates'
import { X } from 'lucide-react'

interface Hotel {
  id: string
  name: string
  city: string
}

export default function MapModal({ hotelsToHighlight, onClose }: { hotelsToHighlight: string[]; onClose: () => void }) {
  const [hotels, setHotels] = useState<Hotel[]>([])

  useEffect(() => {
    fetch('/api/hotels?status=APPROVED')
      .then(res => res.json())
      .then(data => setHotels(data.hotels || []))
      .catch(err => console.error('Error fetching hotels for map:', err))
  }, [])

  const center: [number, number] = [-1.831239, -78.183406]

  const getCoords = (city: string): [number, number] | null => {
    const key = city.toLowerCase()
    return (cityCoordinates as any)[key] || null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full h-full md:w-3/4 md:h-3/4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-[1000] bg-white rounded-full p-1 shadow"
        >
          <X className="w-5 h-5" />
        </button>
        <MapContainer center={center} zoom={6} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {hotels.map(hotel => {
            const coords = getCoords(hotel.city)
            if (!coords) return null
            const highlight = hotelsToHighlight.includes(hotel.id)
            return (
              <CircleMarker
                center={coords}
                pathOptions={{ color: highlight ? 'red' : 'blue' }}
                radius={highlight ? 10 : 6}
                key={hotel.id}
              >
                <Popup>{hotel.name}</Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}
