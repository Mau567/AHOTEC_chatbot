import MistralClient from '@mistralai/mistralai'

const client = new MistralClient(process.env.MISTRAL_API_KEY || '')

export async function getHotelRecommendations(query: string, hotels: any[], lang: string = 'es') {
  try {
    const hotelContext = hotels.map(hotel => 
      `Hotel: ${hotel.name}, Location: ${hotel.city}, ${hotel.region}, Description: ${hotel.description}, Amenities: ${hotel.amenities?.join(', ')}, Tags: ${hotel.tags?.join(', ')}`
    ).join('\n\n')

    const prompt = lang === 'en'
      ? `You are a helpful hotel concierge for AHOTEC (Association of Hotels of Ecuador).

Available hotels in our database:
${hotelContext}

User query: "${query}"

Please provide helpful recommendations based on the user's query. If they're asking about a specific area, recommend hotels in that area. If they mention specific amenities or preferences, prioritize hotels that match those criteria.

Respond in a friendly, helpful manner in English. Keep your response concise but informative.`
      : `Eres un asistente hotelero para AHOTEC (Asociación de Hoteles del Ecuador).

Hoteles disponibles en nuestra base de datos:
${hotelContext}

Consulta del usuario: "${query}"

Por favor, proporciona recomendaciones útiles basadas en la consulta del usuario. Si pregunta por una zona específica, recomienda hoteles en esa zona. Si menciona preferencias o amenidades, prioriza los hoteles que coincidan.

Responde de manera amigable y útil en español. Sé conciso pero informativo.`

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

    return response.choices[0]?.message?.content || (lang === 'en' ? 'Sorry, I could not find hotels matching your query.' : 'Lo siento, no pude encontrar hoteles que coincidan con tu consulta.')
  } catch (error) {
    console.error('Error calling Mistral AI:', error)
    return lang === 'en' ? 'Sorry, there was a technical problem. Please try again later.' : 'Lo siento, hay un problema técnico. Por favor intenta de nuevo más tarde.'
  }
}

export async function getHotelsBySemanticLocation(locationQuery: string, hotels: any[], lang: string = 'es') {
  try {
    const hotelContext = hotels.map(hotel =>
      `ID: ${hotel.id}\nNombre: ${hotel.name}\nCiudad: ${hotel.city}\nRegión: ${hotel.region}\nDirección: ${hotel.address}\nFraseUbicacion: ${hotel.locationPhrase}\nAlrededores: ${(hotel.surroundings || []).join(', ')}`
    ).join('\n---\n')

    const prompt = lang === 'en'
      ? `You are an assistant for finding hotels in Ecuador.\n\nHere are the available hotels (with all their location data):\n${hotelContext}\n\nThe user is searching for: "${locationQuery}"\n\nReturn a JSON array with the IDs of the hotels most related to the user's search. Example response: ["id1", "id2"]\n\nOnly respond with the JSON array, no explanation.`
      : `Eres un asistente para encontrar hoteles en Ecuador.\n\nEstos son los hoteles disponibles (con todos sus datos de ubicación):\n${hotelContext}\n\nEl usuario busca: "${locationQuery}"\n\nDevuelve un array JSON con los IDs de los hoteles que más se relacionan con la búsqueda del usuario. Ejemplo de respuesta: ["id1", "id2"]\n\nSolo responde con el array JSON, sin explicación.`

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