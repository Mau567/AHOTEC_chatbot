'use client'

import { useState, useEffect } from 'react'
import { useRef } from 'react'
import { CheckCircle, XCircle, Clock, Eye, Trash2, Edit } from 'lucide-react'

interface Hotel {
  id: string
  name: string
  region: string
  city: string
  description: string
  websiteLink?: string
  bookingLink?: string
  aboutMessage?: string
  recreationAreas?: string
  locationPhrase?: string
  address?: string
  surroundings: string[]
  hotelType?: string
  imageUrl?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  isPaid: boolean
  price?: number
  approvedBy?: string
  createdAt: string
}

export default function AdminDashboard() {
  // Language state
  const [language, setLanguage] = useState<'es' | 'en'>('es')

  // Translation object
  const t = {
    // Login
    adminLogin: language === 'es' ? 'Admin Login' : 'Admin Login',
    username: language === 'es' ? 'Clave' : 'Username',
    password: language === 'es' ? 'Contraseña' : 'Password',
    loginError: language === 'es' ? 'Clave o contraseña incorrecta' : 'Incorrect username or password',
    enter: language === 'es' ? 'Entrar' : 'Enter',
    
    // Header
    adminPanel: language === 'es' ? 'Panel de Administración AHOTEC' : 'AHOTEC Administration Panel',
    adminSubtitle: language === 'es' ? 'Gestiona las solicitudes de hoteles y el chatbot' : 'Manage hotel requests and chatbot',
    
    // Stats
    pending: language === 'es' ? 'Pendientes' : 'Pending',
    approved: language === 'es' ? 'Aprobados' : 'Approved',
    rejected: language === 'es' ? 'Rechazados' : 'Rejected',
    paid: language === 'es' ? 'Pagados' : 'Paid',
    
    // Filters
    all: language === 'es' ? 'Todos' : 'All',
    
    // Table headers
    hotel: language === 'es' ? 'Hotel' : 'Hotel',
    location: language === 'es' ? 'Ubicación' : 'Location',
    status: language === 'es' ? 'Estado' : 'Status',
    date: language === 'es' ? 'Fecha' : 'Date',
    actions: language === 'es' ? 'Acciones' : 'Actions',
    
    // Status labels
    pendingStatus: language === 'es' ? 'Pendiente' : 'Pending',
    approvedStatus: language === 'es' ? 'Aprobado' : 'Approved',
    rejectedStatus: language === 'es' ? 'Rechazado' : 'Rejected',
    
    // Modal labels
    description: language === 'es' ? 'Descripción' : 'Description',
    message: language === 'es' ? 'Mensaje' : 'Message',
    recreationAreas: language === 'es' ? 'Servicios / áreas recreativas' : 'Services / recreation areas',
    locationPhrase: language === 'es' ? 'Frase de ubicación' : 'Location phrase',
    address: language === 'es' ? 'Dirección' : 'Address',
    surroundings: language === 'es' ? 'Alrededores' : 'Surroundings',
    hotelType: language === 'es' ? 'Tipo / Categoría de hotel' : 'Hotel type / Category',
    websiteLink: language === 'es' ? 'Link al sitio web' : 'Website Link',
    bookingLink: language === 'es' ? 'Link de Reserva' : 'Booking Link',
    close: language === 'es' ? 'Cerrar' : 'Close',
    
    // Edit modal
    editHotel: language === 'es' ? 'Editar' : 'Edit',
    currentImage: language === 'es' ? 'Imagen actual / nueva' : 'Current / new image',
    preview: language === 'es' ? 'Vista previa' : 'Preview',
    currentImageAlt: language === 'es' ? 'Imagen actual' : 'Current image',
    noImage: language === 'es' ? 'Sin imagen' : 'No image',
    imageFormats: language === 'es' ? 'Formatos permitidos: JPG, JPEG, PNG, WEBP, GIF. Tamaño máximo: 4MB.' : 'Allowed formats: JPG, JPEG, PNG, WEBP, GIF. Maximum size: 4MB.',
    name: language === 'es' ? 'Nombre' : 'Name',
    region: language === 'es' ? 'Región' : 'Region',
    city: language === 'es' ? 'Ciudad' : 'City',
    surroundingsComma: language === 'es' ? 'Alrededores (separados por coma)' : 'Surroundings (comma separated)',
    selectOption: language === 'es' ? 'Selecciona una opción' : 'Select an option',
    cancel: language === 'es' ? 'Cancelar' : 'Cancel',
    save: language === 'es' ? 'Guardar' : 'Save',
    
    // Loading
    loadingHotels: language === 'es' ? 'Cargando hoteles...' : 'Loading hotels...',
    
    // Confirmation
    deleteConfirm: language === 'es' ? '¿Estás seguro de que quieres eliminar este hotel?' : 'Are you sure you want to delete this hotel?',
    
    // Error messages
    technicalError: language === 'es' ? 'Lo siento, hay un problema técnico. Por favor intenta de nuevo.' : 'Sorry, there is a technical problem. Please try again.',
    
    // Hotel type options
    hotel4or5: language === 'es' ? 'Hotel / Resort / 5* o 4*' : 'Hotel / Resort / 5* or 4*',
    hotel3orLess: language === 'es' ? 'Hotel / 2* o 3*' : 'Hotel / 2* or 3*',
    hostel: language === 'es' ? 'Hostal / Bed and Breakfast / 3*, 2* o 1*' : 'Hostel / Bed and Breakfast / 3*, 2* or 1*',
    countryInn: language === 'es' ? 'Hostería / Hacienda / Lodge / 5*, 4* o 3*' : 'Hostería / Hacienda / Lodge / 5*, 4* or 3*',
    
    // Language toggle
    english: 'English',
    spanish: 'Español',
    
    // Logout
    logout: language === 'es' ? 'Cerrar Sesión' : 'Logout'
  }

  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null)
  const [editData, setEditData] = useState<any>({})
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    // Verificar si el usuario ya está autenticado
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify')
      if (response.ok) {
        const data = await response.json()
        if (data.authenticated) {
          setLoggedIn(true)
          fetchHotels()
        } else {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error)
      setLoading(false)
    }
  }

  const fetchHotels = async () => {
    try {
      const response = await fetch('/api/hotels')
      const data = await response.json()
      setHotels(data.hotels || [])
    } catch (error) {
      console.error('Error fetching hotels:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateHotelStatus = async (hotelId: string, status: 'APPROVED' | 'REJECTED', price?: number) => {
    try {
      const response = await fetch(`/api/hotels/${hotelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status, 
          approvedBy: 'admin', // In real app, get from auth
          price,
          isPaid: status === 'APPROVED'
        })
      })

      if (response.ok) {
        fetchHotels()
        setSelectedHotel(null)
      }
    } catch (error) {
      console.error('Error updating hotel:', error)
    }
  }

  const deleteHotel = async (hotelId: string) => {
    if (!confirm(t.deleteConfirm)) return

    try {
      const response = await fetch(`/api/hotels/${hotelId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchHotels()
      }
    } catch (error) {
      console.error('Error deleting hotel:', error)
    }
  }

  const startEditHotel = (hotel: Hotel) => {
    setEditingHotel(hotel)
    setEditData({ ...hotel, surroundings: hotel.surroundings.join(', ') } as any)
    setEditImagePreview(hotel.imageUrl || null)
  }

  // Add handler for image change in edit modal
  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null
    setEditImageFile(file)
    if (file) {
      setEditImagePreview(URL.createObjectURL(file))
    } else {
      setEditImagePreview(null)
    }
  }

  const saveHotelEdits = async () => {
    if (!editingHotel) return
    try {
      const payload: any = { ...editData }
      if (typeof payload.surroundings === 'string') {
        payload.surroundings = payload.surroundings
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s)
      }
      // If a new image is selected, upload it first
      if (editImageFile) {
        const formData = new FormData()
        formData.append('image', editImageFile)
        const uploadRes = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData
        })
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          if (uploadData.imageUrl) {
            payload.imageUrl = uploadData.imageUrl
          }
        } else {
          console.error('Image upload failed')
        }
      }

      const response = await fetch(`/api/hotels/${editingHotel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (response.ok) {
        fetchHotels()
        setEditingHotel(null)
        setEditImageFile(null)
        setEditImagePreview(null)
      }
    } catch (error) {
      console.error('Error editing hotel:', error)
    }
  }

  const filteredHotels = hotels.filter(hotel => 
    filter === 'ALL' ? true : hotel.status === filter
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'REJECTED': return <XCircle className="w-5 h-5 text-red-500" />
      case 'PENDING': return <Clock className="w-5 h-5 text-yellow-500" />
      default: return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-green-600 bg-green-100'
      case 'REJECTED': return 'text-red-600 bg-red-100'
      case 'PENDING': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {language === 'es' ? t.english : t.spanish}
            </button>
          </div>
          <h2 className="text-2xl font-bold mb-6 text-center">{t.adminLogin}</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              setLoginError('')
              
              try {
                const response = await fetch('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ username, password })
                })
                
                const data = await response.json()
                
                if (response.ok && data.success) {
                  setLoggedIn(true)
                  setLoginError('')
                  fetchHotels()
                } else {
                  setLoginError(t.loginError)
                }
              } catch (error) {
                console.error('Error en login:', error)
                setLoginError(t.loginError)
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.username}</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {loginError && <div className="text-red-600 text-sm">{loginError}</div>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold"
            >
              {t.enter}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.loadingHotels}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t.adminPanel}</h1>
              <p className="text-gray-600 mt-2">{t.adminSubtitle}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {language === 'es' ? t.english : t.spanish}
              </button>
              <button
                onClick={async () => {
                  try {
                    await fetch('/api/auth/logout', { method: 'POST' })
                    setLoggedIn(false)
                    setUsername('')
                    setPassword('')
                  } catch (error) {
                    console.error('Error en logout:', error)
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                {t.logout}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t.pending}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {hotels.filter(h => h.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t.approved}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {hotels.filter(h => h.status === 'APPROVED').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t.rejected}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {hotels.filter(h => h.status === 'REJECTED').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">$</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t.paid}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {hotels.filter(h => h.isPaid).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'ALL' ? t.all : 
                 status === 'PENDING' ? t.pending :
                 status === 'APPROVED' ? t.approved : t.rejected}
              </button>
            ))}
          </div>
        </div>

        {/* Hotels List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.hotel}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.location}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.status}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.date}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHotels.map((hotel) => (
                  <tr key={hotel.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{hotel.city}</div>
                      <div className="text-sm text-gray-500">{hotel.region}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(hotel.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(hotel.status)}`}>
                          {hotel.status === 'PENDING' ? t.pendingStatus :
                           hotel.status === 'APPROVED' ? t.approvedStatus : t.rejectedStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(hotel.createdAt).toLocaleDateString(language === 'es' ? 'es-EC' : 'en-US')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setSelectedHotel(hotel)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditHotel(hotel)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {hotel.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updateHotelStatus(hotel.id, 'APPROVED')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateHotelStatus(hotel.id, 'REJECTED')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteHotel(hotel.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hotel Detail Modal */}
        {selectedHotel && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedHotel.name}</h3>
                {selectedHotel.imageUrl && (
                  <img src={selectedHotel.imageUrl} alt="Imagen del hotel" className="h-40 w-full object-cover rounded-md mb-4 border" />
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.location}</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedHotel.city}, {selectedHotel.region}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.description}</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedHotel.description}</p>
                  </div>
                  {selectedHotel.aboutMessage && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t.message}</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedHotel.aboutMessage}</p>
                    </div>
                  )}
                  {selectedHotel.recreationAreas && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t.recreationAreas}</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedHotel.recreationAreas}</p>
                    </div>
                  )}
                  {selectedHotel.locationPhrase && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t.locationPhrase}</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedHotel.locationPhrase}</p>
                    </div>
                  )}
                  {selectedHotel.address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t.address}</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedHotel.address}</p>
                    </div>
                  )}
                  {selectedHotel.surroundings.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t.surroundings}</label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedHotel.surroundings.map((s, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedHotel.hotelType && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t.hotelType}</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedHotel.hotelType}</p>
                    </div>
                  )}
                  {selectedHotel.websiteLink && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t.websiteLink}</label>
                      <a href={selectedHotel.websiteLink} target="_blank" rel="noopener noreferrer" className="mt-1 text-sm text-blue-600 hover:text-blue-800">
                        {selectedHotel.websiteLink}
                      </a>
                    </div>
                  )}
                  {selectedHotel.bookingLink && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t.bookingLink}</label>
                      <a href={selectedHotel.bookingLink} target="_blank" rel="noopener noreferrer" className="mt-1 text-sm text-blue-600 hover:text-blue-800">
                        {selectedHotel.bookingLink}
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setSelectedHotel(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    {t.close}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {editingHotel && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t.editHotel} {editingHotel.name}</h3>
                <div className="space-y-4">
                  {/* Image preview and upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.currentImage}</label>
                    {editImagePreview ? (
                      <img src={editImagePreview} alt={t.preview} className="h-32 rounded-md object-cover border mb-2" />
                    ) : editingHotel.imageUrl ? (
                      <img src={editingHotel.imageUrl} alt={t.currentImageAlt} className="h-32 rounded-md object-cover border mb-2" />
                    ) : (
                      <div className="h-32 w-full bg-gray-100 flex items-center justify-center text-gray-400 border rounded-md mb-2">{t.noImage}</div>
                    )}
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.gif"
                      onChange={handleEditImageChange}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">{t.imageFormats}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.name}</label>
                    <input type="text" className="mt-1 w-full border px-2 py-1 rounded" value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t.region}</label>
                      <input type="text" className="mt-1 w-full border px-2 py-1 rounded" value={editData.region || ''} onChange={e => setEditData({ ...editData, region: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t.city}</label>
                      <input type="text" className="mt-1 w-full border px-2 py-1 rounded" value={editData.city || ''} onChange={e => setEditData({ ...editData, city: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.description}</label>
                    <textarea className="mt-1 w-full border px-2 py-1 rounded" value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })}></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.message}</label>
                    <textarea className="mt-1 w-full border px-2 py-1 rounded" value={editData.aboutMessage || ''} onChange={e => setEditData({ ...editData, aboutMessage: e.target.value })}></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.recreationAreas}</label>
                    <textarea className="mt-1 w-full border px-2 py-1 rounded" value={editData.recreationAreas || ''} onChange={e => setEditData({ ...editData, recreationAreas: e.target.value })}></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.locationPhrase}</label>
                    <input type="text" className="mt-1 w-full border px-2 py-1 rounded" value={editData.locationPhrase || ''} onChange={e => setEditData({ ...editData, locationPhrase: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.address}</label>
                    <input type="text" className="mt-1 w-full border px-2 py-1 rounded" value={editData.address || ''} onChange={e => setEditData({ ...editData, address: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.surroundingsComma}</label>
                    <input
                      type="text"
                      className="mt-1 w-full border px-2 py-1 rounded"
                      value={Array.isArray(editData.surroundings) ? editData.surroundings.join(', ') : editData.surroundings || ''}
                      onChange={e => setEditData({ ...editData, surroundings: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.hotelType}</label>
                    <select
                      className="mt-1 w-full border px-2 py-1 rounded"
                      value={editData.hotelType || ''}
                      onChange={e => setEditData({ ...editData, hotelType: e.target.value })}
                      required
                    >
                      <option value="">{t.selectOption}</option>
                      <option value="Hotel / Resort / 5* o 4*">{t.hotel4or5}</option>
                      <option value="Hotel / 2* o 3*">{t.hotel3orLess}</option>
                      <option value="Hostal / Bed and Breakfast / 3*, 2* o 1*">{t.hostel}</option>
                      <option value="Hostería / Hacienda / Lodge / 5*, 4* o 3*">{t.countryInn}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.websiteLink}</label>
                    <input type="text" className="mt-1 w-full border px-2 py-1 rounded" value={editData.websiteLink || ''} onChange={e => setEditData({ ...editData, websiteLink: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.bookingLink}</label>
                    <input type="text" className="mt-1 w-full border px-2 py-1 rounded" value={editData.bookingLink || ''} onChange={e => setEditData({ ...editData, bookingLink: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button onClick={() => setEditingHotel(null)} type="button" className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors">{t.cancel}</button>
                  <button onClick={saveHotelEdits} type="button" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">{t.save}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 