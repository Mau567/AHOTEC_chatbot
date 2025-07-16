'use client'

import { useState } from 'react'
import { MessageCircle, Building, Users } from 'lucide-react'
import HotelDetailModal from '@/components/HotelDetailModal'

interface HotelFormData {
  hotelName: string
  region: string
  city: string
  description: string
  bookingLink: string // Renombrar a linkHotel
  image?: File | null
  aboutMessage: string // Mensaje para el viajero
  recreationAreas: string[] // Áreas recreativas ahora es array
  locationPhrase: string // Localización en una frase
  address: string // Dirección
  surroundings: string[] // 10 puntos importantes alrededor
  hotelType: string // Tipo de hotel
}

interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export default function Home() {
  const [formData, setFormData] = useState<HotelFormData>({
    hotelName: '',
    region: '',
    city: '',
    description: '',
    bookingLink: '',
    image: null,
    aboutMessage: '',
    recreationAreas: [], // Cambiado a array
    locationPhrase: '',
    address: '',
    surroundings: Array(10).fill(''),
    hotelType: '',
  })

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  // 1. Estado para el flujo guiado del chatbot
  const [chatStep, setChatStep] = useState<'ubicacion' | 'tipo' | 'resultados'>('ubicacion')
  const [userLocation, setUserLocation] = useState('')
  const [userHotelType, setUserHotelType] = useState('')

  // Estado para los resultados de hoteles
  const [hotelResults, setHotelResults] = useState<any[]>([])
  const [noResults, setNoResults] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState<any | null>(null)

  const hotelTypeOptions = [
    'Hotel 4 o 5 estrellas',
    'Hotel 3 o menos estrellas',
    'Hostal / Bed and Breakfast',
    'Hostería de campo',
    'Hacienda',
    'Resort'
  ]

  // Opciones de áreas recreativas
  const recreationOptions = [
    'Restaurante',
    'Bar',
    'Instalaciones para conferencias',
    'Generador eléctrico',
    'WiFi gratuito',
    'Parqueadero propio',
    'Gimnasio',
    'Sala de juegos',
    'Juegos infantiles',
    'SPA',
    'Mascotas permitidas',
    'Estación de carga para coches eléctricos',
    'Traslado al aeropuerto',
    'Acceso a la playa: Cerca de la playa',
    'Acceso a la playa: Directamente en la playa',
    'Jardines privados',
    'Piscina al aire libre',
    'Piscina cubierta',
    'Cancha de Tenis',
    'Cancha de fútbol',
    'Cancha de Volleyball',
  ]
  const [otherRecreation, setOtherRecreation] = useState('')

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null
    setFormData(prev => ({
      ...prev,
      image: file
    }))
  }

  const handleSurroundingChange = (idx: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      surroundings: prev.surroundings.map((item, i) => i === idx ? value : item)
    }))
  }

  const handleRecreationChange = (option: string, checked: boolean) => {
    setFormData(prev => {
      let newAreas = prev.recreationAreas
      if (checked) {
        newAreas = [...newAreas, option]
      } else {
        newAreas = newAreas.filter(a => a !== option)
      }
      return { ...prev, recreationAreas: newAreas }
    })
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validar que los 10 puntos estén llenos
    if (formData.surroundings.some(s => !s.trim())) {
      alert('Por favor ingresa los 10 puntos importantes alrededor del hotel.')
      return
    }
    // Unir recreationAreas en string para backend
    let recreationAreasString = formData.recreationAreas.join(', ')
    try {
      const form = new FormData()
      form.append('name', formData.hotelName)
      form.append('region', formData.region)
      form.append('city', formData.city)
      form.append('description', formData.description)
      form.append('bookingLink', formData.bookingLink)
      if (formData.image) {
        form.append('image', formData.image)
      }
      form.append('surroundings', formData.surroundings.join(','))
      form.append('aboutMessage', formData.aboutMessage)
      form.append('recreationAreas', recreationAreasString)
      form.append('locationPhrase', formData.locationPhrase)
      form.append('address', formData.address)
      form.append('hotelType', formData.hotelType)

      const response = await fetch('/api/hotels', {
        method: 'POST',
        body: form
      })

      const result = await response.json()
      
      if (result.success) {
        setFormSubmitted(true)
        setFormData({
          hotelName: '',
          region: '',
          city: '',
          description: '',
          bookingLink: '',
          image: null,
          aboutMessage: '',
          recreationAreas: [],
          locationPhrase: '',
          address: '',
          surroundings: Array(10).fill(''),
          hotelType: '',
        })
        setOtherRecreation('')
      } else {
        alert('Error al enviar el formulario. Por favor intenta de nuevo.')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Error al enviar el formulario. Por favor intenta de nuevo.')
    }
  }

  const handleSendMessage = async () => {
    if (!userInput.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: userInput,
      isUser: true,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setUserInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userInput,
          sessionId
        })
      })

      const data = await response.json()

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        isUser: false,
        timestamp: new Date()
      }

      setChatMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hay un problema técnico. Por favor intenta de nuevo.',
        isUser: false,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // 3. Preparar el envío de la consulta al backend cuando se tengan ambos datos
  const handleSendGuidedQuery = async (location: string, hotelType: string) => {
    setIsLoading(true)
    setNoResults(false)
    setHotelResults([])
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Ubicación: ${location}\nTipo de hotel: ${hotelType}`,
          sessionId
        })
      })
      const data = await response.json()
      // Esperamos que el backend devuelva un array de hoteles en data.hotels
      if (Array.isArray(data.hotels) && data.hotels.length > 0) {
        setHotelResults(data.hotels)
      } else {
        setNoResults(true)
      }
      setIsLoading(false)
    } catch (error) {
      setNoResults(true)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">AHOTEC</span>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/admin" 
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Users className="w-4 h-4 mr-1" />
                Admin
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AHOTEC - Asociación de Hoteles del Ecuador</h1>
            <p className="text-gray-600">Descubre los mejores hoteles de Ecuador con nuestro asistente inteligente</p>
          </div>

          {/* Success Message */}
          {formSubmitted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">
                    ¡Hotel enviado exitosamente! Nuestro equipo lo revisará y te contactaremos pronto.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Hotel Submission Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Registra tu Hotel</h2>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Mensaje para el viajero */}
              <div>
                <label htmlFor="aboutMessage" className="block text-sm font-medium text-gray-700 mb-2">
                  Cuando el usuario hace clic en "Sobre el hotel", ¿qué mensaje te gustaría darle al viajero?
                </label>
                <textarea
                  id="aboutMessage"
                  name="aboutMessage"
                  value={formData.aboutMessage}
                  onChange={handleFormChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ejemplo: ¡Bienvenido a nuestro hotel, tu casa en Ecuador!"
                />
              </div>

              {/* Áreas recreativas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Qué áreas recreativas ofrece el hotel?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {recreationOptions.map(option => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.recreationAreas.includes(option)}
                        onChange={e => handleRecreationChange(option, e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Localización en una frase */}
              <div>
                <label htmlFor="locationPhrase" className="block text-sm font-medium text-gray-700 mb-2">
                  Escribe en una frase la localización del hotel:
                </label>
                <input
                  type="text"
                  id="locationPhrase"
                  name="locationPhrase"
                  value={formData.locationPhrase}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="En el corazón de Quito, cerca del parque La Carolina."
                />
              </div>

              {/* Dirección */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Av. Amazonas N34-120 y Av. Naciones Unidas, Quito"
                />
              </div>

              {/* Puntos importantes alrededor */}
              <div>
                <label htmlFor="surroundings" className="block text-sm font-medium text-gray-700 mb-2">
                  Puntos importantes al rededor del hotel. <span className="text-gray-500">Ejemplo: estadio de futbol, centro comercial, parque natural, barrio, montaña, cascada, etc.</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {formData.surroundings.map((point, idx) => (
                    <input
                      key={idx}
                      type="text"
                      id={`surrounding-${idx}`}
                      name={`surrounding-${idx}`}
                      value={point}
                      onChange={e => handleSurroundingChange(idx, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Punto ${idx + 1}`}
                      required
                    />
                  ))}
                </div>
              </div>

              {/* Tipo de hotel */}
              <div>
                <label htmlFor="hotelType" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de hotel
                </label>
                <select
                  id="hotelType"
                  name="hotelType"
                  value={formData.hotelType}
                  onChange={handleSelectChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Hotel 4 o 5 estrellas">Hotel 4 o 5 estrellas</option>
                  <option value="Hotel 3 o menos estrellas">Hotel 3 o menos estrellas</option>
                  <option value="Hostal / Bed and Breakfast">Hostal / Bed and Breakfast</option>
                  <option value="Hostería de campo">Hostería de campo</option>
                  <option value="Hacienda">Hacienda</option>
                  <option value="Resort">Resort</option>
                </select>
              </div>

              {/* El resto de campos existentes, renombrando Link de Reserva a Link a hotel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="hotelName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Hotel *
                  </label>
                  <input
                    type="text"
                    id="hotelName"
                    name="hotelName"
                    value={formData.hotelName}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nombre del hotel"
                  />
                </div>

                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                    Región *
                  </label>
                  <input
                    type="text"
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ej. Costa, Sierra, Amazonía"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ej. Quito, Guayaquil, Cuenca"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe las características únicas de tu hotel"
                />
              </div>

              {/* Link a hotel */}
              <div>
                <label htmlFor="bookingLink" className="block text-sm font-medium text-gray-700 mb-2">
                  Link a hotel
                </label>
                <input
                  type="url"
                  id="bookingLink"
                  name="bookingLink"
                  value={formData.bookingLink}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://tu-sitio-web.com/reservas"
                />
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                  Foto del hotel <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Vista previa de la imagen"
                      className="h-32 rounded-md object-cover border"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </div>

          {/* Chatbot Interface */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <MessageCircle className="w-6 h-6 mr-2 text-blue-600" />
              Asistente de Hoteles
            </h2>
            
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
              {chatStep === 'ubicacion' && (
                <div className="text-center text-gray-700 mt-8">
                  <p className="mb-4">¿Dónde te gustaría buscar un hotel?</p>
                  <input
                    type="text"
                    value={userLocation}
                    onChange={e => setUserLocation(e.target.value)}
                    placeholder="Ciudad, región o dirección"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && userLocation.trim()) {
                        setChatStep('tipo')
                      }
                    }}
                  />
                  <button
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    disabled={!userLocation.trim()}
                    onClick={() => setChatStep('tipo')}
                  >
                    Siguiente
                  </button>
                </div>
              )}
              {chatStep === 'tipo' && (
                <div className="text-center text-gray-700 mt-8">
                  <p className="mb-4">¿Qué tipo de hotel buscas?</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {hotelTypeOptions.map(option => (
                      <button
                        key={option}
                        className={`px-4 py-2 rounded-md border ${userHotelType === option ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 hover:bg-blue-100'}`}
                        onClick={() => {
                          setUserHotelType(option)
                          setChatStep('resultados')
                          handleSendGuidedQuery(userLocation, option)
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Aquí se mostrarán los resultados en el siguiente paso */}
              {chatStep === 'resultados' && (
                <div className="text-center text-gray-700 mt-8">
                  {isLoading && <p>Buscando hoteles compatibles...</p>}
                  {!isLoading && noResults && (
                    <div className="text-red-600 font-semibold mt-4">Lo siento, no encontramos un hotel que coincida con tu búsqueda.</div>
                  )}
                  {!isLoading && hotelResults.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      {hotelResults.map((hotel, idx) => (
                        <div
                          key={hotel.id || idx}
                          onClick={() => setSelectedHotel(hotel)}
                          className="bg-white border rounded-lg shadow p-4 flex flex-col items-start text-left cursor-pointer hover:shadow-lg transition"
                        >
                          {hotel.imageUrl && (
                            <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-40 object-cover rounded mb-3" />
                          )}
                          <h3 className="text-xl font-bold mb-1">{hotel.name}</h3>
                          <div className="text-sm text-gray-600 mb-2">{hotel.hotelType}</div>
                          <div className="text-gray-800 mb-2 line-clamp-3">{hotel.description}</div>
                          {hotel.address && <div className="text-gray-500 text-sm mb-1"><b>Dirección:</b> {hotel.address}</div>}
                          {hotel.locationPhrase && <div className="text-gray-500 text-sm mb-1"><b>Ubicación:</b> {hotel.locationPhrase}</div>}
                          {hotel.recreationAreas && <div className="text-gray-500 text-sm mb-1"><b>Áreas recreativas:</b> {hotel.recreationAreas}</div>}
                          {hotel.surroundings && hotel.surroundings.length > 0 && (
                            <div className="text-gray-500 text-sm mb-1">
                              <b>Alrededores:</b> {hotel.surroundings.join(', ')}
                            </div>
                          )}
                          {hotel.bookingLink && (
                            <a href={hotel.bookingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-2">Ver sitio web</a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedHotel && (
              <HotelDetailModal hotel={selectedHotel} onClose={() => setSelectedHotel(null)} />
            )}

            {/* Chat Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Pregunta sobre hoteles en Ecuador..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
              <button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 