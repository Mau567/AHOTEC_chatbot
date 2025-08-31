'use client'

import { useState } from 'react'
import { MessageCircle, X, Building } from 'lucide-react'
import HotelDetailModal from '@/components/HotelDetailModal'
// import MapModal from '@/components/MapModal' // TEMPORARILY HIDDEN FOR PRESENTATION

const hotelTypeOptions = [
  'Hotel / Resort / 5* o 4*',
  'Hotel / 2* o 3*',
  'Hostal / Bed and Breakfast / 3*, 2* o 1*',
  'Hostería / Hacienda / Lodge / 5*, 4* o 3*'
]

export default function ChatWidget({ 
  apiUrl = '/api/chat', 
  theme = 'light',
  position = 'bottom-right'
}: {
  apiUrl?: string,
  theme?: 'light' | 'dark',
  position?: 'bottom-right' | 'bottom-left'
}) {
  const [language, setLanguage] = useState<'es' | 'en'>('es')
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<'ubicacion' | 'tipo' | 'resultados'>('ubicacion')
  const [userLocation, setUserLocation] = useState('')
  const [userHotelTypes, setUserHotelTypes] = useState<string[]>([])
  const [hotelResults, setHotelResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [noResults, setNoResults] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState<any | null>(null)
  // const [showMap, setShowMap] = useState(false) // TEMPORARILY HIDDEN FOR PRESENTATION
  const [sessionId] = useState(() => `widget_${Date.now()}_${Math.random().toString(36).substr(2,9)}`)

  const t = {
    assistantTitle: language === 'es' ? 'Lucia' : 'Lucia',
    openChat: language === 'es' ? 'Abrir chat' : 'Open chat',
    closeChat: language === 'es' ? 'Cerrar chat' : 'Close chat',
    locationQuestion: language === 'es' ? 'Hola, soy tu asistente virtual. ¿Dónde te gustaría buscar un hotel?' : 'Hello, I am your virtual assistant. Where would you like to search for a hotel?',
    typeQuestion: language === 'es' ? '¿Qué tipo de hotel buscas?' : 'What type of hotel are you looking for?',
    nextButton: language === 'es' ? 'Siguiente' : 'Next',
    searchButton: language === 'es' ? 'Buscar hoteles' : 'Search hotels',
    allTypesButton: language === 'es' ? 'Todos los tipos' : 'All types',
    loadingMessage: language === 'es' ? 'Buscando hoteles compatibles...' : 'Searching for compatible hotels...',
    noResultsMessage: language === 'es' ? 'Lo siento, no encontramos un hotel que coincida con tu búsqueda.' : 'Sorry, we couldn\'t find a hotel that matches your search.',
    resetButton: language === 'es' ? 'Reiniciar búsqueda' : 'Reset search',
    chatPlaceholder: language === 'es' ? 'Ciudad, región o dirección' : 'City, region or address',
    sendButton: language === 'es' ? 'Enviar' : 'Send',
    bookingLinkLabel: language === 'es' ? 'Link de reserva' : 'Booking link',
    websiteLinkLabel: language === 'es' ? 'Sitio web' : 'Website',
    mapButton: language === 'es' ? 'Ver mapa' : 'Show map',
    english: 'English',
    spanish: 'Español'
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

  const shuffleArray = (arr: any[]) => arr.sort(() => Math.random() - 0.5)

  const handleSendGuidedQuery = async (location: string, hotelTypes: string[]) => {
    setIsLoading(true)
    setNoResults(false)
    setHotelResults([])
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Ubicación: ${location}\nTipos de hotel: ${hotelTypes.join(', ')}`,
          location,
          hotelTypes,
          sessionId,
          lang: language
        })
      })
      const data = await response.json()
      if (Array.isArray(data.hotels) && data.hotels.length > 0) {
        setHotelResults(shuffleArray(data.hotels))
      } else {
        setNoResults(true)
      }
      setIsLoading(false)
    } catch (error) {
      setNoResults(true)
      setIsLoading(false)
    }
  }

  const handleChatReset = () => {
    setStep('ubicacion')
    setUserLocation('')
    setUserHotelTypes([])
    setHotelResults([])
    setNoResults(false)
    setSelectedHotel(null)
  }

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <div className="flex flex-col items-end space-y-2">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className={`bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs shadow-lg transition-all duration-200 hover:scale-105`}
          >
            {language === 'es' ? t.spanish : t.english}
          </button>
          {/* Chat Button */}
          <button
            onClick={() => setIsOpen(true)}
            className={`bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110`}
            aria-label={t.openChat}
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>
      )}
      {/* Chat Widget */}
      {isOpen && (
        <div className="w-96 h-[520px] rounded-lg shadow-xl border bg-white flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center">
              <Building className="w-5 h-5 mr-2" />
              <span className="font-semibold">{t.assistantTitle}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label={t.closeChat}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Guided Chat Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {step === 'ubicacion' && (
              <div className="text-center text-gray-700 mt-4">
                <p className="mb-4 font-medium">{t.locationQuestion}</p>
                <input
                  type="text"
                  value={userLocation}
                  onChange={e => setUserLocation(e.target.value)}
                  placeholder={t.chatPlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && userLocation.trim()) {
                      setStep('tipo')
                    }
                  }}
                />
                <button
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  disabled={!userLocation.trim()}
                  onClick={() => setStep('tipo')}
                >
                  {t.nextButton}
                </button>
              </div>
            )}
            {step === 'tipo' && (
              <div className="text-center text-gray-700 mt-4">
                <p className="mb-4 font-medium">{t.typeQuestion}</p>
                <div className="grid grid-cols-1 gap-2 mb-4">
                  {hotelTypeOptions.map(option => (
                    <button
                      key={option}
                      className={`px-4 py-2 rounded-md border ${userHotelTypes.includes(option) ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 hover:bg-blue-100'}`}
                      onClick={() => {
                        setUserHotelTypes(prev =>
                          prev.includes(option)
                            ? prev.filter(t => t !== option)
                            : [...prev, option]
                        )
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    className="px-4 py-2 rounded-md border bg-white text-gray-900 hover:bg-blue-100"
                    onClick={() => {
                      setUserHotelTypes([])
                      setStep('resultados')
                      handleSendGuidedQuery(userLocation, [])
                    }}
                  >
                    {t.allTypesButton}
                  </button>
                  <button
                    className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
                    disabled={userHotelTypes.length === 0}
                    onClick={() => {
                      setStep('resultados')
                      handleSendGuidedQuery(userLocation, userHotelTypes)
                    }}
                  >
                    {t.searchButton}
                  </button>
                </div>
              </div>
            )}
            {step === 'resultados' && (
              <div className="text-center text-gray-700 flex-1 flex flex-col">
                {isLoading && <p>{t.loadingMessage}</p>}
                {!isLoading && noResults && (
                  <div className="text-red-600 font-semibold mt-4">{t.noResultsMessage}</div>
                )}
                {!isLoading && hotelResults.length > 0 && (
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {hotelResults.map((hotel, idx) => (
                      <div
                        key={hotel.id || idx}
                        onClick={() => setSelectedHotel(hotel)}
                        className="bg-white border rounded-lg shadow p-3 flex flex-col items-start text-left cursor-pointer hover:shadow-lg transition"
                      >
                        {hotel.imageUrl && (
                          <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-28 object-cover rounded mb-2" />
                        )}
                        <h3 className="text-base font-bold mb-1">{hotel.name}</h3>
                        <div className="text-xs mb-1 line-clamp-2">{hotel.description}</div>
                        {hotel.address && <div className="text-gray-500 text-xs mb-1"><b>Dirección:</b> {hotel.address}</div>}
                        {hotel.locationPhrase && <div className="text-gray-500 text-xs mb-1"><b>Ubicación:</b> {hotel.locationPhrase}</div>}
                        {hotel.recreationAreas && <div className="text-gray-500 text-xs mb-1"><b>Servicios / áreas recreativas:</b> {formatRecreationAreas(hotel.recreationAreas)}</div>}
                        {hotel.surroundings && hotel.surroundings.length > 0 && (
                          <div className="text-gray-500 text-xs mb-1">
                            <b>Alrededores:</b> {hotel.surroundings.join(', ')}
                          </div>
                        )}
                        {hotel.bookingLink && (
                          <a href={hotel.bookingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-1 text-xs mr-2">{t.bookingLinkLabel}</a>
                        )}
                        {hotel.websiteLink && (
                          <a href={hotel.websiteLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-1 text-xs">{t.websiteLinkLabel}</a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {/* Botón del mapa - TEMPORARILY HIDDEN FOR PRESENTATION */}
                {/*
                {!isLoading && hotelResults.length > 0 && (
                  <button
                    className="mt-3 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-xs self-center"
                    onClick={() => setShowMap(true)}
                  >
                    {t.mapButton}
                  </button>
                )}
                */}
              </div>
            )}
          </div>
          {/* Reset Button */}
          <div className="p-2 border-t border-gray-200 flex justify-end">
            <button
              onClick={handleChatReset}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300 transition-colors text-xs"
            >
              {t.resetButton}
            </button>
          </div>
          {/* Hotel Detail Modal (optional, not implemented here for compactness) */}
        </div>
      )}
      {selectedHotel && (
        <HotelDetailModal hotel={selectedHotel} language={language} onClose={() => setSelectedHotel(null)} />
      )}
      {/* Modal del mapa - TEMPORARILY HIDDEN FOR PRESENTATION */}
      {/*
      {showMap && (
        <MapModal
          highlightIds={hotelResults.map(h => h.id)}
          onClose={() => setShowMap(false)}
        />
      )}
      */}
    </div>
  )
}