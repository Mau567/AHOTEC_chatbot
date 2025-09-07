import MistralClient from '@mistralai/mistralai'

const client = new MistralClient(process.env.MISTRAL_API_KEY || '')

export async function getHotelRecommendations(query: string, hotels: any[], lang: string = 'es') {
  try {
    const hotelContext = hotels.map(hotel => 
      `Hotel: ${hotel.name}, Location: ${hotel.city}, ${hotel.region}, Description: ${hotel.description}, Amenities: ${hotel.amenities?.join(', ')}, Tags: ${hotel.tags?.join(', ')}`
    ).join('\n\n')

    const prompt = lang === 'en'
      ? `You are a helpful hotel concierge for AHOTEC (Federation of Hotels of Ecuador).

Available hotels in our database:
${hotelContext}

User query: "${query}"

Please provide helpful recommendations based on the user's query. If they're asking about a specific area, recommend hotels in that area. If they mention specific amenities or preferences, prioritize hotels that match those criteria.

Respond in a friendly, helpful manner in English. Keep your response concise but informative.`
      : `Eres un asistente hotelero para AHOTEC (Federación Hotelera del Ecuador).

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
      ? `You are an assistant for finding hotels in Ecuador.\n\nHere are the available hotels (with all their location data):\n${hotelContext}\n\nThe user is searching for: "${locationQuery}"\n\nCRITICAL RULES:\n1. ONLY return hotels that are in the SAME CITY/REGION as the location being searched.\n2. For airports: "Mariscal Sucre Airport" or "Quito Airport" = only hotels in Quito/Sierra region.\n3. For airports: "José Joaquín de Olmedo Airport" or "Guayaquil Airport" = only hotels in Guayaquil/Costa region.\n4. For airports: "Cotopaxi Airport" or "Latacunga Airport" = only hotels in Latacunga/Sierra region.\n5. If the search is too vague (like just "airport", "church", "park"), return empty array [].\n6. If the search doesn't match any known location in Ecuador, return empty array [].\n7. NEVER return hotels from different cities unless explicitly searching for a multi-city region.\n\nExamples:\n- "Mariscal Sucre Airport" → only hotels in Quito/Sierra region\n- "Quito Airport" → only hotels in Quito/Sierra region\n- "Guayaquil Airport" → only hotels in Guayaquil/Costa region\n- "church" → return [] (too vague)\n- "San Francisco Church Quito" → hotels in Quito near that church\n- "La Carolina Park" → hotels in Quito near that park\n\nReturn a JSON array with the IDs of the hotels most related to the user's search. Example: ["id1", "id2"]\n\nOnly respond with the JSON array, no explanation.`
      : `Eres un asistente para encontrar hoteles en Ecuador.\n\nEstos son los hoteles disponibles (con todos sus datos de ubicación):\n${hotelContext}\n\nEl usuario busca: "${locationQuery}"\n\nREGLAS CRÍTICAS:\n1. SOLO devuelve hoteles que estén en la MISMA CIUDAD/REGIÓN que la ubicación buscada.\n2. Para aeropuertos: "Aeropuerto Mariscal Sucre" o "Aeropuerto de Quito" = solo hoteles en región Quito/Sierra.\n3. Para aeropuertos: "Aeropuerto José Joaquín de Olmedo" o "Aeropuerto de Guayaquil" = solo hoteles en región Guayaquil/Costa.\n4. Para aeropuertos: "Aeropuerto Cotopaxi" o "Aeropuerto de Latacunga" = solo hoteles en región Latacunga/Sierra.\n5. Si la búsqueda es muy vaga (como solo "aeropuerto", "iglesia", "parque"), devuelve array vacío [].\n6. Si la búsqueda no coincide con ninguna ubicación conocida en Ecuador, devuelve array vacío [].\n7. NUNCA devuelvas hoteles de diferentes ciudades a menos que busques explícitamente una región multi-ciudad.\n\nEjemplos:\n- "Aeropuerto Mariscal Sucre" → solo hoteles en región Quito/Sierra\n- "Aeropuerto de Quito" → solo hoteles en región Quito/Sierra\n- "Aeropuerto de Guayaquil" → solo hoteles en región Guayaquil/Costa\n- "iglesia" → devuelve [] (muy vago)\n- "Iglesia San Francisco Quito" → hoteles en Quito cerca de esa iglesia\n- "Parque La Carolina" → hoteles en Quito cerca de ese parque\n\nDevuelve un array JSON con los IDs de los hoteles que más se relacionan con la búsqueda del usuario. Ejemplo: ["id1", "id2"]\n\nSolo responde con el array JSON, sin explicación.`

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