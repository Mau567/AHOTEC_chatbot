'use client'

import { X, MapPin, MessageCircle, Waves, Navigation, Home, Map, ExternalLink } from 'lucide-react'

interface Hotel {
  id: string
  name: string
  region: string
  city: string
  description: string
  bookingLink?: string
  websiteLink?: string
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
  language?: 'es' | 'en'
}
 
export default function HotelDetailModal({ hotel, onClose, language = 'es' }: HotelDetailModalProps) {
  const t = {
    cityRegion: language === 'es' ? 'Ciudad / Región' : 'City / Region',
    services: language === 'es' ? 'Servicios / áreas recreativas' : 'Services / recreational areas',
    location: language === 'es' ? 'Ubicación' : 'Location',
    address: language === 'es' ? 'Dirección' : 'Address',
    surroundings: language === 'es' ? 'Alrededores' : 'Surroundings',
    description: language === 'es' ? 'Descripción' : 'Description',
    bookNow: language === 'es' ? 'Reservar ahora' : 'Book now',
    website: language === 'es' ? 'Sitio web' : 'Website'
  }

  const formatRecreationAreas = (areas: string) => {
    const items = areas.split(',').map(a => a.trim())
    const genIndex = items.findIndex(a => a.toLowerCase() === 'generador eléctrico')
    if (genIndex !== -1) {
      const [gen] = items.splice(genIndex, 1)
      items.push(gen)
    }
    return items.join(', ')
  }
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b">
          <h3 className="text-2xl font-bold text-gray-900">{hotel.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Hero Section with Image */}
        {hotel.imageUrl && (
          <div className="relative">
            <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-64 object-contain bg-gray-100" />
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Location Section */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">{t.cityRegion}</p>
                <p className="font-medium text-gray-900">{hotel.city}, {hotel.region}</p>
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          {hotel.aboutMessage && (
            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-gray-900 italic text-lg">"{hotel.aboutMessage}"</p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">{t.description}</h4>
            <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hotel.recreationAreas && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Waves className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">{t.services}</p>
                  <p className="font-medium text-gray-900">{formatRecreationAreas(hotel.recreationAreas)}</p>
                </div>
              </div>
            )}
            {hotel.locationPhrase && (
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                <Navigation className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-600">{t.location}</p>
                  <p className="font-medium text-gray-900">{hotel.locationPhrase}</p>
                </div>
              </div>
            )}
            {hotel.address && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <Home className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">{t.address}</p>
                  <p className="font-medium text-gray-900">{hotel.address}</p>
                </div>
              </div>
            )}
          </div>

          {/* Surroundings */}
          {hotel.surroundings && hotel.surroundings.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Map className="w-5 h-5 text-gray-600" />
                <h4 className="text-lg font-semibold text-gray-900">{t.surroundings}</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {hotel.surroundings.map((surrounding, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {surrounding}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(hotel.websiteLink || hotel.bookingLink) && (
            <div className="pt-4 border-t flex space-x-2">
              {hotel.websiteLink && (
                <a
                  href={hotel.websiteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t.website}
                </a>
              )}
              {hotel.bookingLink && (
                <a
                  href={hotel.bookingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t.bookNow}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
