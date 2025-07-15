'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Eye, Trash2, Pencil } from 'lucide-react'

interface Hotel {
  id: string
  name: string
  region: string
  city: string
  description: string
  bookingLink?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  isPaid: boolean
  price?: number
  createdAt: string
  imageUrl?: string
  aboutMessage?: string
  recreationAreas?: string
  locationPhrase?: string
  address?: string
  surroundings: string[]
  hotelType?: string
}

export default function AdminDashboard() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<Hotel>>({})
  const [loggedIn, setLoggedIn] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    fetchHotels()
  }, [])

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
    if (!confirm('¿Estás seguro de que quieres eliminar este hotel?')) return

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

  const startEditing = (hotel: Hotel) => {
    setEditingHotel(hotel)
    setEditFormData({
      name: hotel.name,
      region: hotel.region,
      city: hotel.city,
      description: hotel.description,
      bookingLink: hotel.bookingLink,
      aboutMessage: hotel.aboutMessage,
      recreationAreas: hotel.recreationAreas,
      locationPhrase: hotel.locationPhrase,
      address: hotel.address,
      surroundings: hotel.surroundings,
      hotelType: hotel.hotelType
    })
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditFormData(prev => ({ ...prev, [name]: value }))
  }

  const saveHotelEdits = async () => {
    if (!editingHotel) return
    try {
      const response = await fetch(`/api/hotels/${editingHotel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editFormData,
          surroundings: typeof editFormData.surroundings === 'string'
            ? (editFormData.surroundings as unknown as string).split(',').map(s => s.trim()).filter(Boolean)
            : editFormData.surroundings
        })
      })
      if (response.ok) {
        fetchHotels()
        setEditingHotel(null)
      }
    } catch (error) {
      console.error('Error updating hotel:', error)
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
          <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
          <form
            onSubmit={e => {
              e.preventDefault()
              if (username === 'AHOTEC2025' && password === 'AHOTEC2025') {
                setLoggedIn(true)
                setLoginError('')
              } else {
                setLoginError('Clave o contraseña incorrecta')
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clave</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
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
              Entrar
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
          <p className="mt-4 text-gray-600">Cargando hoteles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración AHOTEC</h1>
          <p className="text-gray-600 mt-2">Gestiona las solicitudes de hoteles y el chatbot</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
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
                <p className="text-sm font-medium text-gray-600">Aprobados</p>
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
                <p className="text-sm font-medium text-gray-600">Rechazados</p>
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
                <p className="text-sm font-medium text-gray-600">Pagados</p>
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
                {status === 'ALL' ? 'Todos' : 
                 status === 'PENDING' ? 'Pendientes' :
                 status === 'APPROVED' ? 'Aprobados' : 'Rechazados'}
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
                    Hotel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
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
                          {hotel.status === 'PENDING' ? 'Pendiente' :
                           hotel.status === 'APPROVED' ? 'Aprobado' : 'Rechazado'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(hotel.createdAt).toLocaleDateString('es-EC')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedHotel(hotel)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => startEditing(hotel)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Pencil className="w-4 h-4" />
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedHotel.city}, {selectedHotel.region}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedHotel.description}</p>
                  </div>
                  {selectedHotel.aboutMessage && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mensaje para el viajero</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedHotel.aboutMessage}</p>
                    </div>
                  )}
                  {selectedHotel.recreationAreas && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Áreas recreativas</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedHotel.recreationAreas}</p>
                    </div>
                  )}
                  {selectedHotel.locationPhrase && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Frase de localización</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedHotel.locationPhrase}</p>
                    </div>
                  )}
                  {selectedHotel.address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Dirección</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedHotel.address}</p>
                    </div>
                  )}
                  {selectedHotel.hotelType && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo de hotel</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedHotel.hotelType}</p>
                    </div>
                  )}
                  {selectedHotel.surroundings && selectedHotel.surroundings.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Alrededores</label>
                      <ul className="mt-1 list-disc list-inside text-sm text-gray-900 space-y-1">
                        {selectedHotel.surroundings.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedHotel.bookingLink && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Link de Reserva</label>
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
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Hotel Modal */}
        {editingHotel && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3 space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Hotel</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input type="text" name="name" value={editFormData.name as string || ''} onChange={handleEditChange} className="mt-1 w-full border px-2 py-1 rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                      <input type="text" name="city" value={editFormData.city as string || ''} onChange={handleEditChange} className="mt-1 w-full border px-2 py-1 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Región</label>
                      <input type="text" name="region" value={editFormData.region as string || ''} onChange={handleEditChange} className="mt-1 w-full border px-2 py-1 rounded" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea name="description" value={editFormData.description as string || ''} onChange={handleEditChange} className="mt-1 w-full border px-2 py-1 rounded" rows={3}></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Link de Reserva</label>
                    <input type="text" name="bookingLink" value={editFormData.bookingLink as string || ''} onChange={handleEditChange} className="mt-1 w-full border px-2 py-1 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mensaje para el viajero</label>
                    <textarea name="aboutMessage" value={editFormData.aboutMessage as string || ''} onChange={handleEditChange} className="mt-1 w-full border px-2 py-1 rounded" rows={2}></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Áreas recreativas</label>
                    <input type="text" name="recreationAreas" value={editFormData.recreationAreas as string || ''} onChange={handleEditChange} className="mt-1 w-full border px-2 py-1 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Frase de localización</label>
                    <input type="text" name="locationPhrase" value={editFormData.locationPhrase as string || ''} onChange={handleEditChange} className="mt-1 w-full border px-2 py-1 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dirección</label>
                    <input type="text" name="address" value={editFormData.address as string || ''} onChange={handleEditChange} className="mt-1 w-full border px-2 py-1 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de hotel</label>
                    <input type="text" name="hotelType" value={editFormData.hotelType as string || ''} onChange={handleEditChange} className="mt-1 w-full border px-2 py-1 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Alrededores (separados por coma)</label>
                    <textarea name="surroundings" value={(editFormData.surroundings as unknown as string[])?.join(', ') || ''} onChange={handleEditChange} className="mt-1 w-full border px-2 py-1 rounded" rows={2}></textarea>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button onClick={() => setEditingHotel(null)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors">Cancelar</button>
                  <button onClick={saveHotelEdits} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Guardar</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}