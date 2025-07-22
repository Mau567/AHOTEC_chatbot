'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface Hotel {
  id: string
  name: string
  city: string
}

interface MapModalProps {
  highlightIds: string[]
  onClose: () => void
}

const cityCoords: Record<string, [number, number]> = {
  Quito: [-0.1807, -78.4678],
  Guayaquil: [-2.1709, -79.9224],
  Cuenca: [-2.9006, -79.0045],
  Ambato: [-1.2491, -78.6167],
  Manta: [-0.9671, -80.7128],
  Esmeraldas: [0.9682, -79.6517],
  Loja: [-3.9931, -79.2042],
  Riobamba: [-1.6636, -78.6549],
  Machala: [-3.2581, -79.9605],
  Salinas: [-2.208, -80.9642],
  Tena: [-0.9937, -77.8127],
  "Santa Cruz": [-0.7391, -90.348]
}

export default function MapModal({ highlightIds, onClose }: MapModalProps) {
  const [hotels, setHotels] = useState<Hotel[]>([])

  useEffect(() => {
    fetch('/api/hotels')
      .then(res => res.json())
      .then(data => setHotels(data.hotels || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!hotels.length) return

    if (!(window as any).L) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = initMap
      document.body.appendChild(script)
    } else {
      initMap()
    }

    function initMap() {
      const L = (window as any).L
      const map = L.map('ahotec-map').setView([-1.83, -78.18], 6)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map)

      const defaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
      })

      const highlightIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-red.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
      })

      hotels.forEach(hotel => {
        const coords = cityCoords[hotel.city] || [-1.83, -78.18]
        L.marker(coords, { icon: highlightIds.includes(hotel.id) ? highlightIcon : defaultIcon })
          .addTo(map)
          .bindPopup(hotel.name)
      })
    }
  }, [hotels, highlightIds])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-11/12 h-5/6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 p-1 text-gray-600 hover:text-gray-800">
          <X className="w-5 h-5" />
        </button>
        <div id="ahotec-map" className="w-full h-full rounded-b-lg" />
      </div>
    </div>
  )
}
