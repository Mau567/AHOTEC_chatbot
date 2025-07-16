'use client'

import { X } from 'lucide-react'

interface Hotel {
  id: string
  name: string
  region: string
  city: string
  description: string
  bookingLink?: string
  imageUrl?: string
  aboutMessage?: string
  recreationAreas?: string
  locationPhrase?: string
  address?: string
  surroundings?: string[]
  hotelType?: string
}

interface HotelDetailModalProps {
  hotel: Hotel
  onClose: () => void
}

export default function HotelDetailModal({ hotel, onClose }: HotelDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 p-5 overflow-y-auto max-h-[80vh]">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium text-gray-900">{hotel.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        {hotel.imageUrl && (
          <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-48 object-cover rounded mb-4" />
        )}
        <div className="space-y-2 text-sm text-gray-700">
          <p><b>Ubicación:</b> {hotel.city}, {hotel.region}</p>
          <p><b>Descripción:</b> {hotel.description}</p>
          {hotel.aboutMessage && <p><b>Mensaje:</b> {hotel.aboutMessage}</p>}
          {hotel.recreationAreas && <p><b>Áreas recreativas:</b> {hotel.recreationAreas}</p>}
          {hotel.locationPhrase && <p><b>Frase de ubicación:</b> {hotel.locationPhrase}</p>}
          {hotel.address && <p><b>Dirección:</b> {hotel.address}</p>}
          {hotel.surroundings && hotel.surroundings.length > 0 && (
            <p><b>Alrededores:</b> {hotel.surroundings.join(', ')}</p>
          )}
          {hotel.hotelType && <p><b>Tipo de hotel:</b> {hotel.hotelType}</p>}
          {hotel.bookingLink && (
            <p>
              <b>Link de Reserva:</b>{' '}
              <a href={hotel.bookingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {hotel.bookingLink}
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
