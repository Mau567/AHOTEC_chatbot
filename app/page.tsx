'use client'

import { useState, useRef } from 'react'
import { MessageCircle, Building, Users } from 'lucide-react'
import HotelDetailModal from '@/components/HotelDetailModal'
import ReactMarkdown from 'react-markdown'
import ChatWidget from '@/components/ChatWidget'

interface HotelFormData {
  hotelName: string
  region: string
  city: string
  description: string
  bookingLink: string // Renombrar a linkHotel
  image?: File | null
  recreationAreas: string[] // Servicios / áreas recreativas ahora es array
  locationPhrase: string // Localización en una frase
  address: string // Dirección
  surroundings: string[] // 6 puntos importantes alrededor
  hotelType: string // Tipo de hotel
}

interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export default function Home() {
  // Language state
  const [language, setLanguage] = useState<'es' | 'en'>('es')

  // Translation object
  const t = {
    // Header
    title: language === 'es' ? 'AHOTEC - Federación Hotelera del Ecuador' : 'AHOTEC - Ecuador Hotels Federation',
    subtitle: language === 'es' ? 'Descubre los mejores hoteles de Ecuador con nuestro asistente inteligente' : 'Discover the best hotels in Ecuador with our intelligent assistant',
    
    // Form labels
    hotelNameLabel: language === 'es' ? 'Nombre del Hotel *' : 'Hotel Name *',
    regionLabel: language === 'es' ? 'Región *' : 'Region *',
    cityLabel: language === 'es' ? 'Ciudad *' : 'City *',
    addressLabel: language === 'es' ? 'Dirección *' : 'Address *',
    locationPhraseLabel: language === 'es' ? 'Escribe en una frase la localización del hotel: *' : 'Write the hotel location in one phrase: *',
    hotelTypeLabel: language === 'es' ? 'Tipo / Categoría de hotel *' : 'Hotel type / Category *',
    descriptionLabel: language === 'es' ? 'Descripción *' : 'Description *',
    recreationAreasLabel: language === 'es' ? '¿Qué servicios / áreas recreativas ofrece el hotel? *' : 'What services / recreational areas does the hotel offer? *',
    surroundingsLabel: language === 'es' ? 'Puntos importantes alrededor del hotel. *' : 'Important points around the hotel. *',
    bookingLinkLabel: language === 'es' ? 'Link a hotel' : 'Hotel link',
    imageLabel: language === 'es' ? 'Fotografía del hotel' : 'Hotel photo',
    
    // Placeholders
    hotelNamePlaceholder: language === 'es' ? 'Ej.: Hotel NN, Hostal NN, Hostería NN, Lodge NN, Resort NN' : 'e.g.: Hotel NN, Hostel NN, Hostería NN, Lodge NN, Resort NN',
    regionPlaceholder: language === 'es' ? 'ej. Costa, Sierra, Amazonía' : 'e.g. Coast, Highlands, Amazon',
    cityPlaceholder: language === 'es' ? 'ej. Quito, Guayaquil, Cuenca' : 'e.g. Quito, Guayaquil, Cuenca',
    addressPlaceholder: language === 'es' ? 'Av. Amazonas N34-120 y Av. Naciones Unidas, Quito' : 'Av. Amazonas N34-120 and Av. Naciones Unidas, Quito',
    locationPhrasePlaceholder: language === 'es' ? 'En el corazón de Quito, cerca del parque La Carolina.' : 'In the heart of Quito, near La Carolina park.',
    descriptionPlaceholder: language === 'es' ? 'Describe las características únicas de tu hotel' : 'Describe the unique features of your hotel',
    bookingLinkPlaceholder: language === 'es' ? 'https://tu-sitio-web.com/reservas' : 'https://your-website.com/book',
    pointPlaceholder: language === 'es' ? 'Punto' : 'Point',
    
    // Select options
    selectOption: language === 'es' ? 'Selecciona una opción' : 'Select an option',
    selectRegion: language === 'es' ? 'Selecciona una región' : 'Select a region',
    option1: language === 'es' ? 'Hotel / Resort / 5* o 4*' : 'Hotel / Resort / 5* or 4*',
    option2: language === 'es' ? 'Hotel / 2* o 3*' : 'Hotel / 2* or 3*',
    option3: language === 'es' ? 'Hostal / Bed and Breakfast / 3*, 2* o 1*' : 'Hostel / Bed and Breakfast / 3*, 2* or 1*',
    option4: language === 'es' ? 'Hostería / Hacienda / Lodge / 5*, 4* o 3*' : 'Hostería / Hacienda / Lodge / 5*, 4* or 3*',
    
    // Region options
    costa: 'Costa',
    sierra: 'Sierra', 
    amazonia: 'Amazonía',
    galapagos: 'Galápagos',
    
    // Messages
    submitButton: language === 'es' ? 'Enviar Solicitud' : 'Submit Request',
    successMessage: language === 'es' ? '¡Hotel enviado exitosamente! Nuestro equipo lo revisará y te contactaremos pronto.' : 'Hotel submitted successfully! Our team will review it and contact you soon.',
    validationMessage: language === 'es' ? 'Por favor ingresa los 6 puntos importantes alrededor del hotel.' : 'Please enter the 6 important points around the hotel.',
    imageError: language === 'es' ? 'Solo se permiten imágenes JPG, JPEG, PNG, WEBP o GIF.' : 'Only JPG, JPEG, PNG, WEBP or GIF images are allowed.',
    sizeError: language === 'es' ? 'El tamaño máximo permitido es 4MB.' : 'Maximum size allowed is 4MB.',
    imageFormats: language === 'es' ? 'Formatos permitidos: JPG, JPEG, PNG, WEBP, GIF. Tamaño máximo: 4MB.' : 'Allowed formats: JPG, JPEG, PNG, WEBP, GIF. Maximum size: 4MB.',
    recreationError: language === 'es' ? 'Selecciona al menos un servicio o área recreativa.' : 'Select at least one service or recreational area.',
    
    // Chat
    chatTitle: language === 'es' ? 'Sofia - Asistente de Hoteles' : 'Sofia - Hotel Assistant',
    locationQuestion: language === 'es' ? 'Hola, soy tu asistente virtual. ¿Dónde te gustaría buscar un hotel?' : 'Hello, I am your virtual assistant. Where would you like to search for a hotel?',
    typeQuestion: language === 'es' ? '¿Qué tipo de hotel buscas?' : 'What type of hotel are you looking for?',
    nextButton: language === 'es' ? 'Siguiente' : 'Next',
    loadingMessage: language === 'es' ? 'Buscando hoteles compatibles...' : 'Searching for compatible hotels...',
    noResultsMessage: language === 'es' ? 'Lo siento, no encontramos un hotel que coincida con tu búsqueda.' : 'Sorry, we couldn\'t find a hotel that matches your search.',
    resetButton: language === 'es' ? 'Reiniciar búsqueda' : 'Reset search',
    chatPlaceholder: language === 'es' ? 'Pregunta sobre hoteles en Ecuador...' : 'Ask about hotels in Ecuador...',
    sendButton: language === 'es' ? 'Enviar' : 'Send',
    
    // Surroundings example
    surroundingsExample: language === 'es' ? 'Ejemplo: estadio de futbol, centro comercial, parque natural, barrio, montaña, cascada, etc.' : 'Example: football stadium, shopping center, natural park, neighborhood, mountain, waterfall, etc.'
  }

  const [formData, setFormData] = useState<HotelFormData>({
    hotelName: '',
    region: '',
    city: '',
    description: '',
    bookingLink: '',
    image: null,
    recreationAreas: [], // Cambiado a array
    locationPhrase: '',
    address: '',
    surroundings: Array(6).fill(''),
    hotelType: '',
  })

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const successMsgRef = useRef<HTMLDivElement | null>(null)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  // 1. Estado para el flujo guiado del chatbot
  const [chatStep, setChatStep] = useState<'ubicacion' | 'tipo' | 'resultados'>('ubicacion')
  const [userLocation, setUserLocation] = useState('')
  const [userHotelType, setUserHotelType] = useState('')

  // Estado para los resultados de hoteles
  const [hotelResults, setHotelResults] = useState<any[]>([])
  const [noResults, setNoResults] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState<any | null>(null)

  // Add state for free-form chatbot
  const [freeInput, setFreeInput] = useState('')
  const [freeIsLoading, setFreeIsLoading] = useState(false)
  // Set initial freeBotMessage state to a friendly welcome message
  const [freeBotMessage, setFreeBotMessage] = useState(language === 'es'
    ? '¡Hola! 😊 Soy Sofia, tu asistente virtual. ¿Dónde te gustaría buscar un hotel? 🏨✨'
    : "Hello! 😊 I'm Sofia, your virtual assistant. Where would you like to search for a hotel? 🏨✨"
  )
  const [freeHotelResults, setFreeHotelResults] = useState<any[]>([])
  const [freeNoResults, setFreeNoResults] = useState(false)
  const [freeSelectedHotel, setFreeSelectedHotel] = useState<any | null>(null)

  const hotelTypeOptions = [
    'Hotel / Resort / 5* o 4*',
    'Hotel / 2* o 3*',
    'Hostal / Bed and Breakfast / 3*, 2* o 1*',
    'Hostería / Hacienda / Lodge / 5*, 4* o 3*'
  ]

  // Opciones de servicios / áreas recreativas
  const recreationOptions = [
    'Restaurante',
    'Bar',
    'Instalaciones para conferencias',
    'Centro de Negocios / Coworking',
    'Facilidades para discapacitados',
    'SPA / Sauna / turco / hidromasaje',
    'WiFi gratuito',
    'Parqueadero propio',
    'Gimnasio',
    'Sala de juegos',
    'Juegos infantiles',
    'Mascotas permitidas',
    'Estación de carga para coches eléctricos',
    'Traslado al aeropuerto',
    'Acceso a la playa: Cerca de la playa',
    'Acceso a la playa: Directamente en la playa',
    'Jardines privados',
    'Piscina al aire libre',
    'Piscina cubierta',
    'Áreas deportivas (canchas: tenis / volley / fútbol)',
    'Generador eléctrico'
  ]
  const [otherRecreation, setOtherRecreation] = useState('')

  const formatRecreationAreas = (areas: string) => {
    const items = areas.split(',').map(a => a.trim())
    const genIndex = items.findIndex(a => a.toLowerCase() === 'generador eléctrico')
    if (genIndex !== -1) {
      const [gen] = items.splice(genIndex, 1)
      items.push(gen)
    }
    return items.join(', ')
  }

  // Allowed image types and max size
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const maxImageSizeMB = 4
  const maxImageSizeBytes = maxImageSizeMB * 1024 * 1024
  const [imageError, setImageError] = useState('')

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
    if (file) {
      if (!allowedImageTypes.includes(file.type)) {
        setImageError(t.imageError)
        setFormData(prev => ({ ...prev, image: null }))
        return
      }
      if (file.size > maxImageSizeBytes) {
        setImageError(t.sizeError)
        setFormData(prev => ({ ...prev, image: null }))
        return
      }
      setImageError('')
      setFormData(prev => ({ ...prev, image: file }))
    } else {
      setImageError('')
      setFormData(prev => ({ ...prev, image: null }))
    }
  }

  const handleSurroundingChange = (idx: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      surroundings: prev.surroundings.map((item, i) => i === idx ? value : item)
    }))
  }

  const handleRecreationChange = (option: string, checked: boolean) => {
    setFormData(prev => {
      let newAreas = checked
        ? [...prev.recreationAreas, option]
        : prev.recreationAreas.filter(a => a !== option)
      newAreas = recreationOptions.filter(opt => newAreas.includes(opt))
      return { ...prev, recreationAreas: newAreas }
    })
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validar que los 6 puntos estén llenos
    if (formData.surroundings.some(s => !s.trim())) {
      alert(t.validationMessage)
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
          recreationAreas: [],
          locationPhrase: '',
          address: '',
          surroundings: Array(6).fill(''),
          hotelType: '',
        })
        // Hacer scroll al mensaje de éxito
        setTimeout(() => {
          if (successMsgRef.current) {
            successMsgRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)
      } else {
        alert('Error al enviar el formulario. Por favor intenta de nuevo.')
      }
    } catch (error) {
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

  // Add a reset handler for the chatbot
  const handleChatReset = () => {
    setChatStep('ubicacion')
    setUserLocation('')
    setUserHotelType('')
    setHotelResults([])
    setNoResults(false)
    setSelectedHotel(null)
    setUserInput('')
  }

  const handleSendFreeMessage = async () => {
    if (!freeInput.trim()) return
    setFreeIsLoading(true)
    setFreeBotMessage('')
    setFreeHotelResults([])
    setFreeNoResults(false)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: freeInput,
          sessionId: `free_${sessionId}`,
          lang: language
        })
      })
      const data = await response.json()
      setFreeBotMessage(data.message)
      if (Array.isArray(data.hotels) && data.hotels.length > 0) {
        setFreeHotelResults(data.hotels)
      } else {
        setFreeNoResults(true)
      }
      setFreeIsLoading(false)
    } catch (error) {
      setFreeBotMessage(language === 'en' ? 'Sorry, there was a technical problem.' : 'Lo siento, hay un problema técnico.')
      setFreeNoResults(true)
      setFreeIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
                      <div className="flex items-center">
            {/* Logo AHOTEC 2022 - Navegación (más visible) */}
            <img 
              src="/images/logoAHOTEC2022.png" 
              alt="AHOTEC Logo" 
              className="w-24 h-24 object-contain"
              style={{ minWidth: '64px', minHeight: '64px' }}
              onError={(e) => {
                // Fallback si no hay logo, mostrar el ícono Building
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <Building className="w-8 h-8 text-blue-600 hidden" />
            <span className="ml-3 text-xl font-bold text-gray-900">AHOTEC</span>
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
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {language === 'es' ? 'English' : 'Español'}
              </button>
            </div>
            
            {/* Logo principal - Header (más grande y prominente) */}
            <div className="flex justify-center mb-6">
              <img 
                src="/images/logoAHOTEC2022.png" 
                alt="AHOTEC Logo" 
                className="max-w-2xl max-h-56 object-contain"
                style={{ 
                  minWidth: '200px', 
                  minHeight: '200px',
                  maxWidth: '100%'
                }}
                onError={(e) => {
                  // Fallback si no hay logo
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>

          {/* Success Message */}
          {formSubmitted && (
            <div ref={successMsgRef} className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">
                    {t.successMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Hotel Submission Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Registra tu Hotel</h2>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Nombre del hotel */}
              <div>
                <label htmlFor="hotelName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.hotelNameLabel}
                </label>
                <input
                  type="text"
                  id="hotelName"
                  name="hotelName"
                  value={formData.hotelName}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t.hotelNamePlaceholder}
                />
              </div>

              {/* Región */}
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.regionLabel}
                </label>
                <select
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleSelectChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t.selectRegion}</option>
                  <option value="Costa">{t.costa}</option>
                  <option value="Sierra">{t.sierra}</option>
                  <option value="Amazonía">{t.amazonia}</option>
                  <option value="Galápagos">{t.galapagos}</option>
                </select>
              </div>

              {/* Ciudad */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.cityLabel}
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t.cityPlaceholder}
                />
              </div>

              {/* Dirección */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.addressLabel}
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t.addressPlaceholder}
                />
              </div>

              {/* Frase de localización */}
              <div>
                <label htmlFor="locationPhrase" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.locationPhraseLabel}
                </label>
                <input
                  type="text"
                  id="locationPhrase"
                  name="locationPhrase"
                  value={formData.locationPhrase}
                  onChange={handleFormChange}
                  required
                  maxLength={150}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t.locationPhrasePlaceholder}
                />
                <div className="text-xs text-gray-500 text-right">{formData.locationPhrase.length}/150</div>
              </div>

              {/* Tipo de hotel */}
              <div>
                <label htmlFor="hotelType" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.hotelTypeLabel}
                </label>
                <select
                  id="hotelType"
                  name="hotelType"
                  value={formData.hotelType}
                  onChange={handleSelectChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">{t.selectOption}</option>
                  <option value="Hotel / Resort / 5* o 4*">{t.option1}</option>
                  <option value="Hotel / 2* o 3*">{t.option2}</option>
                  <option value="Hostal / Bed and Breakfast / 3*, 2* o 1*">{t.option3}</option>
                  <option value="Hostería / Hacienda / Lodge / 5*, 4* o 3*">{t.option4}</option>
                </select>
              </div>

              {/* Descripción */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.descriptionLabel}
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  required
                  maxLength={200}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t.descriptionPlaceholder}
                />
                <div className="text-xs text-gray-500 text-right">{formData.description.length}/200</div>
              </div>

              {/* Servicios / áreas recreativas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.recreationAreasLabel}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {recreationOptions.map(option => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.recreationAreas.includes(option)}
                        onChange={e => handleRecreationChange(option, e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        required={formData.recreationAreas.length === 0}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                {formData.recreationAreas.length === 0 && (
                  <div className="text-xs text-red-500 mt-1">{t.recreationError}</div>
                )}
              </div>

              {/* Puntos importantes alrededor */}
              <div>
                <label htmlFor="surroundings" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.surroundingsLabel} <span className="text-gray-500">{t.surroundingsExample}</span>
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
                      placeholder={`${t.pointPlaceholder} ${idx + 1}`}
                      required
                      maxLength={100}
                    />
                  ))}
                </div>
              </div>

              {/* Link a hotel (opcional) */}
              <div>
                <label htmlFor="bookingLink" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.bookingLinkLabel}
                </label>
                <input
                  type="url"
                  id="bookingLink"
                  name="bookingLink"
                  value={formData.bookingLink}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t.bookingLinkPlaceholder}
                />
              </div>

              {/* Foto del hotel */}
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.imageLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept=".jpg,.jpeg,.png,.webp,.gif"
                  onChange={handleImageChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t.imageFormats}
                </p>
                {imageError && (
                  <p className="text-xs text-red-500 mt-1">{imageError}</p>
                )}
                {formData.image && !imageError && (
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
                  {t.submitButton}
                </button>
              </div>
            </form>
          </div>

          {/* Chatbot Interface */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <MessageCircle className="w-6 h-6 mr-2 text-blue-600" />
              {t.chatTitle}
            </h2>
            
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
              {chatStep === 'ubicacion' && (
                <div className="text-center text-gray-700 mt-8">
                  <p className="mb-4">{t.locationQuestion}</p>
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
                    {t.nextButton}
                  </button>
                </div>
              )}
              {chatStep === 'tipo' && (
                <div className="text-center text-gray-700 mt-8">
                  <p className="mb-4">{t.typeQuestion}</p>
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
                  {isLoading && <p>{t.loadingMessage}</p>}
                  {!isLoading && noResults && (
                    <div className="text-red-600 font-semibold mt-4">{t.noResultsMessage}</div>
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
                          <div className="text-gray-800 mb-2 line-clamp-3">{hotel.description}</div>
                          {hotel.address && <div className="text-gray-500 text-sm mb-1"><b>Dirección:</b> {hotel.address}</div>}
                          {hotel.locationPhrase && <div className="text-gray-500 text-sm mb-1"><b>Ubicación:</b> {hotel.locationPhrase}</div>}
                          {hotel.recreationAreas && <div className="text-gray-500 text-sm mb-1"><b>Servicios / áreas recreativas:</b> {formatRecreationAreas(hotel.recreationAreas)}</div>}
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
            <div className="flex justify-end mb-2">
              <button
                onClick={handleChatReset}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                {t.resetButton}
              </button>
            </div>
            {selectedHotel && (
              <HotelDetailModal hotel={selectedHotel} onClose={() => setSelectedHotel(null)} />
            )}

            {/* Free-form Chatbot - TEMPORARILY HIDDEN FOR PRESENTATION */}
            {/* 
            <div className="bg-gray-50 border border-gray-200 rounded-lg shadow p-6 mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <MessageCircle className="w-6 h-6 mr-2 text-blue-600" />
                {language === 'es' ? 'Chatbot libre' : 'Free-form Chatbot'}
              </h2>
              <div className="flex flex-col items-center">
                <div className="w-full flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={freeInput}
                    onChange={e => setFreeInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSendFreeMessage() }}
                    placeholder={t.chatPlaceholder}
                    disabled={freeIsLoading}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                  <button
                    onClick={handleSendFreeMessage}
                    disabled={!freeInput.trim() || freeIsLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {t.sendButton}
                  </button>
                </div>
                {freeIsLoading && <p className="text-center text-gray-500 w-full">{t.loadingMessage}</p>}
                {freeBotMessage && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-gray-900 text-left w-full max-w-xl">
                    <ReactMarkdown>{freeBotMessage}</ReactMarkdown>
                  </div>
                )}
                {freeNoResults && !freeIsLoading && (
                  <div className="text-red-600 font-semibold mt-4 text-center w-full">{t.noResultsMessage}</div>
                )}
                {freeHotelResults.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 w-full">
                    {freeHotelResults.map((hotel, idx) => (
                      <div
                        key={hotel.id || idx}
                        onClick={() => setFreeSelectedHotel(hotel)}
                        className="bg-white border rounded-lg shadow p-4 flex flex-col items-start text-left cursor-pointer hover:shadow-lg transition"
                      >
                        {hotel.imageUrl && (
                          <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-40 object-cover rounded mb-3" />
                        )}
                        <h3 className="text-xl font-bold mb-1">{hotel.name}</h3>
                        <div className="text-gray-800 mb-2 line-clamp-3">{hotel.description}</div>
                        {hotel.address && <div className="text-gray-500 text-sm mb-1"><b>Dirección:</b> {hotel.address}</div>}
                        {hotel.locationPhrase && <div className="text-gray-500 text-sm mb-1"><b>Ubicación:</b> {hotel.locationPhrase}</div>}
                        {hotel.recreationAreas && <div className="text-gray-500 text-sm mb-1"><b>Servicios / áreas recreativas:</b> {formatRecreationAreas(hotel.recreationAreas)}</div>}
                        {hotel.surroundings && hotel.surroundings.length > 0 && (
                          <div className="text-gray-500 text-sm mb-1">
                            <b>Alrededores:</b> {hotel.surroundings.join(', ')}
                          </div>
                        )}
                        {hotel.bookingLink && (
                          <a href={hotel.bookingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-2">{t.bookingLinkLabel}</a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {freeSelectedHotel && (
                  <HotelDetailModal hotel={freeSelectedHotel} onClose={() => setFreeSelectedHotel(null)} />
                )}
              </div>
            </div>
            */}
          </div>
        </div>
      </div>
      <ChatWidget apiUrl="/api/chat" theme="light" position="bottom-right" />
    </div>
  )
} 