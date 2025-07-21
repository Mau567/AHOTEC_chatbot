import MistralClient from '@mistralai/mistralai'

const client = new MistralClient(process.env.MISTRAL_API_KEY || '')

export async function getHotelRecommendations(query: string, hotels: any[]) {
  try {
    const hotelContext = hotels.map(hotel => 
      `Hotel: ${hotel.name}, Location: ${hotel.city}, ${hotel.region}, Description: ${hotel.description}, Amenities: ${hotel.amenities?.join(', ')}, Tags: ${hotel.tags?.join(', ')}`
    ).join('\n\n')

    const prompt = `You are a helpful hotel concierge for AHOTEC (Association of Hotels of Ecuador). \n\nAvailable hotels in our database:\n${hotelContext}\n\nUser query: "${query}"\n\nPlease provide helpful recommendations based on the user's query. If they're asking about a specific area, recommend hotels in that area. If they mention specific amenities or preferences, prioritize hotels that match those criteria.\n\nRespond in a friendly, helpful manner in Spanish (since this is for Ecuador). Keep your response concise but informative.`

    const response = await client.chat({
      model: 'mistral-small-latest',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      maxTokens: 500,
      temperature: 0.7
    })

    return response.choices[0]?.message?.content || 'Lo siento, no pude encontrar hoteles que coincidan con tu consulta.'
  } catch (error) {
    console.error('Error calling Mistral AI:', error)
    return 'Lo siento, hay un problema técnico. Por favor intenta de nuevo más tarde.'
  }
}

export async function getHotelsBySemanticLocation(locationQuery: string, hotels: any[]) {
  try {
    const hotelContext = hotels.map(hotel =>
      `ID: ${hotel.id}\nNombre: ${hotel.name}\nCiudad: ${hotel.city}\nRegión: ${hotel.region}\nDirección: ${hotel.address}\nFraseUbicacion: ${hotel.locationPhrase}\nAlrededores: ${(hotel.surroundings || []).join(', ')}`
    ).join('\n---\n')

    const prompt = `Eres un asistente para encontrar hoteles en Ecuador.\n\nEstos son los hoteles disponibles (con todos sus datos de ubicación):\n${hotelContext}\n\nEl usuario busca: "${locationQuery}"\n\nDevuelve un array JSON con los IDs de los hoteles que más se relacionan con la búsqueda del usuario. Ejemplo de respuesta: ["id1", "id2"]\n\nSolo responde con el array JSON, sin explicación.`

    const response = await client.chat({
      model: 'mistral-small-latest',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      maxTokens: 300,
      temperature: 0.2
    })

    // Extraer el array JSON de la respuesta
    const text = response.choices[0]?.message?.content || '[]'
    const match = text.match(/\[.*\]/)
    if (match) {
      return JSON.parse(match[0])
    }
    return []
  } catch (error) {
    console.error('Error calling Mistral AI (semantic location):', error)
    return []
  }
} 