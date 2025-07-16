'use client'

import { useState } from 'react'
import ChatWidget from '@/components/ChatWidget'

export default function WidgetDemo() {
  // Language state
  const [language, setLanguage] = useState<'es' | 'en'>('es')

  // Translation object
  const t = {
    // Header
    demoTitle: language === 'es' ? 'AHOTEC Demo' : 'AHOTEC Demo',
    
    // Main content
    chatWidgetDemo: language === 'es' ? 'Chat Widget Demo' : 'Chat Widget Demo',
    demoDescription: language === 'es' ? 'Este es un ejemplo de cómo se vería el widget de chat integrado en el sitio web de AHOTEC' : 'This is an example of how the chat widget would look integrated into the AHOTEC website',
    
    // Hotel sections
    quitoHotels: language === 'es' ? 'Hoteles en Quito' : 'Hotels in Quito',
    quitoDescription: language === 'es' ? 'Descubre los mejores hoteles en la capital de Ecuador, desde opciones económicas hasta lujosos establecimientos en el centro histórico.' : 'Discover the best hotels in Ecuador\'s capital, from budget options to luxurious establishments in the historic center.',
    historicCenter: language === 'es' ? 'Hoteles en el Centro Histórico' : 'Hotels in the Historic Center',
    luxuryMariscal: language === 'es' ? 'Hoteles de lujo en La Mariscal' : 'Luxury hotels in La Mariscal',
    airportHotels: language === 'es' ? 'Hoteles cerca del aeropuerto' : 'Hotels near the airport',
    
    guayaquilHotels: language === 'es' ? 'Hoteles en Guayaquil' : 'Hotels in Guayaquil',
    guayaquilDescription: language === 'es' ? 'Explora las mejores opciones de hospedaje en la Perla del Pacífico, desde hoteles con vista al río hasta establecimientos en el centro comercial.' : 'Explore the best accommodation options in the Pearl of the Pacific, from hotels with river views to establishments in the commercial center.',
    maleconHotels: language === 'es' ? 'Hoteles en el Malecón 2000' : 'Hotels in Malecón 2000',
    guayaquilHistoric: language === 'es' ? 'Hoteles en el centro histórico' : 'Hotels in the historic center',
    
    // About section
    aboutAHOTEC: language === 'es' ? 'Sobre AHOTEC' : 'About AHOTEC',
    aboutDescription1: language === 'es' ? 'La Asociación de Hoteles del Ecuador (AHOTEC) es la organización líder que representa al sector hotelero del país. Nuestra misión es promover el desarrollo sostenible del turismo en Ecuador a través de la excelencia en el servicio y la innovación tecnológica.' : 'The Ecuador Hotels Association (AHOTEC) is the leading organization representing the country\'s hotel sector. Our mission is to promote sustainable tourism development in Ecuador through service excellence and technological innovation.',
    aboutDescription2: language === 'es' ? 'Con nuestro asistente inteligente, los visitantes pueden encontrar fácilmente los mejores hoteles en cualquier región de Ecuador, desde la costa hasta la sierra y la amazonía. Nuestro chatbot utiliza inteligencia artificial para proporcionar recomendaciones personalizadas basadas en las preferencias y necesidades de cada viajero.' : 'With our intelligent assistant, visitors can easily find the best hotels in any region of Ecuador, from the coast to the highlands and the Amazon. Our chatbot uses artificial intelligence to provide personalized recommendations based on each traveler\'s preferences and needs.',
    aboutDescription3: language === 'es' ? 'Los hoteles que aparecen en nuestro sistema han sido cuidadosamente seleccionados y verificados para garantizar la mejor experiencia de hospedaje para nuestros visitantes.' : 'The hotels featured in our system have been carefully selected and verified to ensure the best accommodation experience for our visitors.',
    
    // Instructions
    integrationTitle: language === 'es' ? '¿Cómo integrar el widget?' : 'How to integrate the widget?',
    instruction1: language === 'es' ? '1. El widget de chat aparecerá como un botón flotante en la esquina inferior derecha' : '1. The chat widget will appear as a floating button in the bottom right corner',
    instruction2: language === 'es' ? '2. Los usuarios pueden hacer clic para abrir el chat y hacer preguntas sobre hoteles' : '2. Users can click to open the chat and ask questions about hotels',
    instruction3: language === 'es' ? '3. El asistente responderá con recomendaciones basadas en la base de datos de hoteles' : '3. The assistant will respond with recommendations based on the hotel database',
    instruction4: language === 'es' ? '4. El widget se puede personalizar con diferentes temas y posiciones' : '4. The widget can be customized with different themes and positions',
    
    // Language toggle
    english: 'English',
    spanish: 'Español'
  }

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
              <span className="ml-2 text-xl font-bold text-gray-900">{t.demoTitle}</span>
            </div>
            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {language === 'es' ? t.english : t.spanish}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t.chatWidgetDemo}
          </h1>
          <p className="text-xl text-gray-600">
            {t.demoDescription}
          </p>
        </div>

        {/* Demo Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t.quitoHotels}</h2>
            <p className="text-gray-600 mb-4">
              {t.quitoDescription}
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">{t.historicCenter}</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">{t.luxuryMariscal}</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">{t.airportHotels}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t.guayaquilHotels}</h2>
            <p className="text-gray-600 mb-4">
              {t.guayaquilDescription}
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">{t.maleconHotels}</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">{t.guayaquilHistoric}</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">{t.airportHotels}</span>
              </div>
            </div>
          </div>
        </div>

        {/* More Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t.aboutAHOTEC}</h2>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              {t.aboutDescription1}
            </p>
            <p className="text-gray-600 mb-4">
              {t.aboutDescription2}
            </p>
            <p className="text-gray-600">
              {t.aboutDescription3}
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">{t.integrationTitle}</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>{t.instruction1}</p>
            <p>{t.instruction2}</p>
            <p>{t.instruction3}</p>
            <p>{t.instruction4}</p>
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