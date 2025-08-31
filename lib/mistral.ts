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
      ? `You are an assistant for finding hotels in Ecuador.\n\nHere are the available hotels (with all their location data):\n${hotelContext}\n\nThe user is searching for: "${locationQuery}"\n\nIMPORTANT: Only return hotels if the user's query matches a specific, well-known, and complete location (such as a full city name, region, neighborhood, or a well-known landmark with its full name). If the query is a single generic word (like 'church', 'center', 'park', 'street', etc.) or is too vague or ambiguous, return an empty array.\n\nExamples:\n- If the user searches for 'church', return [].\n- If the user searches for 'San Francisco Church', return hotels near that landmark.\n- If the user searches for 'center', return [].\n- If the user searches for 'Historic Center of Quito', return hotels in that area.\n- If the user searches for 'park', return [].\n- If the user searches for 'La Carolina Park', return hotels near that park.\n\nReturn a JSON array with the IDs of the hotels most related to the user's search. Only include hotels that are truly near or relevant to the user's location query. Do NOT include hotels from other cities or regions unless they are genuinely related. Only mention hotels in your answer that are included in the JSON array of IDs you return. Example response: ["id1", "id2"]\n\nOnly respond with the JSON array, no explanation.`
      : `Eres un asistente para encontrar hoteles en Ecuador.\n\nEstos son los hoteles disponibles (con todos sus datos de ubicación):\n${hotelContext}\n\nEl usuario busca: "${locationQuery}"\n\nIMPORTANTE: Solo devuelve hoteles si la consulta del usuario coincide con una ubicación específica, reconocida y completa (como el nombre completo de una ciudad, región, barrio o un punto de referencia conocido con su nombre completo). Si la consulta es una sola palabra genérica (como 'iglesia', 'centro', 'parque', 'calle', etc.) o es demasiado vaga o ambigua, devuelve un array vacío.\n\nEjemplos:\n- Si el usuario busca 'iglesia', devuelve [].\n- Si el usuario busca 'Iglesia San Francisco', devuelve hoteles cerca de ese lugar.\n- Si el usuario busca 'centro', devuelve [].\n- Si el usuario busca 'Centro Histórico de Quito', devuelve hoteles en esa zona.\n- Si el usuario busca 'parque', devuelve [].\n- Si el usuario busca 'Parque La Carolina', devuelve hoteles cerca de ese parque.\n\nDevuelve un array JSON con los IDs de los hoteles que más se relacionan con la búsqueda del usuario. Solo incluye hoteles que estén realmente cerca o sean relevantes para la ubicación buscada. NO incluyas hoteles de otras ciudades o regiones a menos que estén genuinamente relacionados. Solo menciona hoteles en tu respuesta que estén incluidos en el array JSON de IDs que devuelves. Ejemplo de respuesta: ["id1", "id2"]\n\nSolo responde con el array JSON, sin explicación.`

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

export async function translateText(text: string, targetLang: 'en' | 'es') {
  if (!text) return text
  if (targetLang === 'es') return text
  try {
    const prompt = `Traduce al ${targetLang === 'en' ? 'inglés' : 'español'} el siguiente texto:\n${text}`
    const response = await client.chat({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      maxTokens: text.length + 60
    })
    return response.choices[0]?.message?.content?.trim() || text
  } catch {
    return text
  }
}

export async function translateHotelData(hotel: any, lang: 'en' | 'es') {
  if (lang === 'es') return hotel
  return {
    ...hotel,
    name: await translateText(hotel.name, lang),
    description: await translateText(hotel.description, lang),
    locationPhrase: hotel.locationPhrase ? await translateText(hotel.locationPhrase, lang) : undefined,
    recreationAreas: hotel.recreationAreas ? await translateText(hotel.recreationAreas, lang) : undefined,
    address: hotel.address ? await translateText(hotel.address, lang) : undefined,
    surroundings: hotel.surroundings ? await Promise.all(hotel.surroundings.map((s: string) => translateText(s, lang))) : undefined,
    aboutMessage: hotel.aboutMessage ? await translateText(hotel.aboutMessage, lang) : undefined
  }
}