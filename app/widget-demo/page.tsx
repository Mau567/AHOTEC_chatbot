'use client'

import ChatWidget from '@/components/ChatWidget'

export default function WidgetDemo() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">AHOTEC Demo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Chat Widget Demo
          </h1>
          <p className="text-xl text-gray-600">
            Este es un ejemplo de cómo se vería el widget de chat integrado en el sitio web de AHOTEC
          </p>
        </div>

        {/* Demo Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Hoteles en Quito</h2>
            <p className="text-gray-600 mb-4">
              Descubre los mejores hoteles en la capital de Ecuador, desde opciones económicas hasta lujosos establecimientos en el centro histórico.
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Hoteles en el Centro Histórico</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Hoteles de lujo en La Mariscal</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Hoteles cerca del aeropuerto</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Hoteles en Guayaquil</h2>
            <p className="text-gray-600 mb-4">
              Explora las mejores opciones de hospedaje en la Perla del Pacífico, desde hoteles con vista al río hasta establecimientos en el centro comercial.
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Hoteles en el Malecón 2000</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Hoteles en el centro histórico</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Hoteles cerca del aeropuerto</span>
              </div>
            </div>
          </div>
        </div>

        {/* More Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Sobre AHOTEC</h2>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              La Asociación de Hoteles del Ecuador (AHOTEC) es la organización líder que representa al sector hotelero del país. 
              Nuestra misión es promover el desarrollo sostenible del turismo en Ecuador a través de la excelencia en el servicio 
              y la innovación tecnológica.
            </p>
            <p className="text-gray-600 mb-4">
              Con nuestro asistente inteligente, los visitantes pueden encontrar fácilmente los mejores hoteles en cualquier 
              región de Ecuador, desde la costa hasta la sierra y la amazonía. Nuestro chatbot utiliza inteligencia artificial 
              para proporcionar recomendaciones personalizadas basadas en las preferencias y necesidades de cada viajero.
            </p>
            <p className="text-gray-600">
              Los hoteles que aparecen en nuestro sistema han sido cuidadosamente seleccionados y verificados para garantizar 
              la mejor experiencia de hospedaje para nuestros visitantes.
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">¿Cómo integrar el widget?</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>1. El widget de chat aparecerá como un botón flotante en la esquina inferior derecha</p>
            <p>2. Los usuarios pueden hacer clic para abrir el chat y hacer preguntas sobre hoteles</p>
            <p>3. El asistente responderá con recomendaciones basadas en la base de datos de hoteles</p>
            <p>4. El widget se puede personalizar con diferentes temas y posiciones</p>
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      <ChatWidget 
        apiUrl="/api/chat"
        theme="light"
        position="bottom-right"
      />
    </div>
  )
} 