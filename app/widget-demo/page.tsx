'use client'

import ChatWidget from '@/components/ChatWidget'
import LanguageToggle from '@/components/LanguageToggle'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'

export default function WidgetDemo() {
  const { language } = useLanguage()
  const t = translations[language]
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
            <LanguageToggle />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {language === 'es' ? 'Demo del Widget de Chat' : 'Chat Widget Demo'}
          </h1>
          <p className="text-xl text-gray-600">
            {language === 'es'
              ? 'Este es un ejemplo de cómo se vería el widget de chat integrado en el sitio web de AHOTEC'
              : 'This is an example of how the chat widget would look integrated in the AHOTEC website'}
          </p>
        </div>

        {/* Demo Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{language === 'es' ? 'Hoteles en Quito' : 'Hotels in Quito'}</h2>
            <p className="text-gray-600 mb-4">
              {language === 'es'
                ? 'Descubre los mejores hoteles en la capital de Ecuador, desde opciones económicas hasta lujosos establecimientos en el centro histórico.'
                : 'Discover the best hotels in Ecuador\'s capital, from budget options to luxury places in the historic center.'}
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">{language === 'es' ? 'Hoteles en el Centro Histórico' : 'Hotels in the Historic Center'}</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">{language === 'es' ? 'Hoteles de lujo en La Mariscal' : 'Luxury hotels in La Mariscal'}</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">{language === 'es' ? 'Hoteles cerca del aeropuerto' : 'Hotels near the airport'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{language === 'es' ? 'Hoteles en Guayaquil' : 'Hotels in Guayaquil'}</h2>
            <p className="text-gray-600 mb-4">
              {language === 'es'
                ? 'Explora las mejores opciones de hospedaje en la Perla del Pacífico, desde hoteles con vista al río hasta establecimientos en el centro comercial.'
                : 'Explore the best lodging options in the Pearl of the Pacific, from riverside hotels to downtown establishments.'}
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">{language === 'es' ? 'Hoteles en el Malecón 2000' : 'Hotels on the Malecón 2000'}</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">{language === 'es' ? 'Hoteles en el centro histórico' : 'Hotels in the historic center'}</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">{language === 'es' ? 'Hoteles cerca del aeropuerto' : 'Hotels near the airport'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* More Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{language === 'es' ? 'Sobre AHOTEC' : 'About AHOTEC'}</h2>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              {language === 'es'
                ? 'La Asociación de Hoteles del Ecuador (AHOTEC) es la organización líder que representa al sector hotelero del país. Nuestra misión es promover el desarrollo sostenible del turismo en Ecuador a través de la excelencia en el servicio y la innovación tecnológica.'
                : 'The Ecuador Hotels Association (AHOTEC) is the leading organization representing the hotel sector in the country. Our mission is to promote sustainable tourism development in Ecuador through service excellence and technological innovation.'}
            </p>
            <p className="text-gray-600 mb-4">
              {language === 'es'
                ? 'Con nuestro asistente inteligente, los visitantes pueden encontrar fácilmente los mejores hoteles en cualquier región de Ecuador, desde la costa hasta la sierra y la amazonía. Nuestro chatbot utiliza inteligencia artificial para proporcionar recomendaciones personalizadas basadas en las preferencias y necesidades de cada viajero.'
                : 'With our smart assistant, visitors can easily find the best hotels anywhere in Ecuador, from the coast to the Andes and the Amazon. Our chatbot uses artificial intelligence to provide personalized recommendations based on each traveler\'s preferences and needs.'}
            </p>
            <p className="text-gray-600">
              {language === 'es'
                ? 'Los hoteles que aparecen en nuestro sistema han sido cuidadosamente seleccionados y verificados para garantizar la mejor experiencia de hospedaje para nuestros visitantes.'
                : 'The hotels listed in our system have been carefully selected and verified to guarantee the best lodging experience for our visitors.'}
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">{language === 'es' ? '¿Cómo integrar el widget?' : 'How to integrate the widget?'}</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>{language === 'es' ? '1. El widget de chat aparecerá como un botón flotante en la esquina inferior derecha' : '1. The chat widget will appear as a floating button in the bottom right corner'}</p>
            <p>{language === 'es' ? '2. Los usuarios pueden hacer clic para abrir el chat y hacer preguntas sobre hoteles' : '2. Users can click to open the chat and ask questions about hotels'}</p>
            <p>{language === 'es' ? '3. El asistente responderá con recomendaciones basadas en la base de datos de hoteles' : '3. The assistant will respond with recommendations based on the hotel database'}</p>
            <p>{language === 'es' ? '4. El widget se puede personalizar con diferentes temas y posiciones' : '4. The widget can be customized with different themes and positions'}</p>
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