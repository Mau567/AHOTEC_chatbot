import MistralClient from '@mistralai/mistralai'

// ---- Heuristics & helpers for deterministic pre-filtering ----
const AIRPORT_SYNONYMS = [
  'aeropuerto','airport','uio','gye','ltx',
  'mariscal sucre','quito airport','tababela',
  'jose joaquin de olmedo','guayaquil airport',
  'cotopaxi airport','latacunga airport'
];

// Landmark to city mapping for deterministic location resolution
const LANDMARK_CITY_MAP: Record<string, string> = {
  // Quito landmarks
  'parque la carolina': 'Quito',
  'la carolina': 'Quito',
  'centro historico': 'Quito',
  'centro histórico': 'Quito',
  'mitad del mundo': 'Quito',
  'teleferico': 'Quito',
  'teleférico': 'Quito',
  'basilica del voto nacional': 'Quito',
  'basílica': 'Quito',
  'plaza grande': 'Quito',
  'plaza foch': 'Quito',
  'la mariscal': 'Quito',
  'mariscal': 'Quito',
  'carolina': 'Quito',
  'estadio olimpico atahualpa': 'Quito',
  'atahualpa': 'Quito',
  'parque el ejido': 'Quito',
  'parque metropolitano': 'Quito',
  'la ronda': 'Quito',
  'san francisco': 'Quito',
  'plaza san francisco': 'Quito',
  
  // Guayaquil landmarks
  'malecon 2000': 'Guayaquil',
  'malecón 2000': 'Guayaquil',
  'malecon': 'Guayaquil',
  'malecón': 'Guayaquil',
  'cerro santa ana': 'Guayaquil',
  'santa ana': 'Guayaquil',
  'las peñas': 'Guayaquil',
  'parque seminario': 'Guayaquil',
  'parque de las iguanas': 'Guayaquil',
  'unicentro': 'Guayaquil',
  'mall del sol': 'Guayaquil',
  
  // Cuenca landmarks
  'parque calderon': 'Cuenca',
  'parque calderón': 'Cuenca',
  'catedral nueva': 'Cuenca',
  'rio tomebamba': 'Cuenca',
  'río tomebamba': 'Cuenca',
  'barranco': 'Cuenca',
  
  // Baños landmarks
  'pailon del diablo': 'Baños',
  'pailón del diablo': 'Baños',
  'casa del arbol': 'Baños',
  'árbol': 'Baños',
  'columpio': 'Baños',
  
  // Other landmarks
  'volcan cotopaxi': 'Latacunga',
  'volcán cotopaxi': 'Latacunga',
  'cotopaxi': 'Latacunga',
  'otavalo market': 'Otavalo',
  'mercado otavalo': 'Otavalo',
  'mindo cloud forest': 'Mindo',
  'bosque nublado': 'Mindo',
};

type Hotel = {
  id: string;
  name?: string;
  city?: string;
  region?: string;
  address?: string;
  description?: string;
  amenities?: string[];
  tags?: string[];
  locationPhrase?: string;
  surroundings?: string[];
};

function textIncludesAny(haystack: string, needles: string[]): boolean {
  const t = (haystack || '').toLowerCase();
  return needles.some(n => t.includes(n));
}

function hotelHasAirportSignal(h: Hotel): boolean {
  const fields = [
    h.name, h.city, h.region, h.address, h.description, h.locationPhrase,
    ...(h.tags || []), ...(h.amenities || []), ...(h.surroundings || [])
  ].filter(Boolean).map(v => String(v).toLowerCase());
  const needles = AIRPORT_SYNONYMS;
  return fields.some(f => needles.some(n => f.includes(n)));
}

function isGenericAirportQuery(q: string): boolean {
  const s = (q || '').trim().toLowerCase();
  // exactly "aeropuerto" / "airport" (with optional plural) or only airport-ish tokens
  if (/^(aeropuertos?|airports?)$/.test(s)) return true;
  // extremely short + only airport synonyms without a city/landmark
  return s.length <= 12 && (s === 'uio' || s === 'gye' || s === 'ltx');
}

function resolveAirportCity(q: string): string | null {
  const s = (q || '').toLowerCase();
  if (s.match(/mariscal sucre|quito airport|uio|tababela/)) return 'Quito';
  if (s.match(/jose joaquin de olmedo|josé joaquín de olmedo|guayaquil airport|gye/)) return 'Guayaquil';
  if (s.match(/cotopaxi airport|latacunga airport|ltx/)) return 'Latacunga';
  return null;
}

// Resolve landmark queries to their city
function resolveLandmarkCity(q: string): string | null {
  const normalized = q.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove accents for flexible matching
  
  // Check each landmark in the map
  for (const [landmark, city] of Object.entries(LANDMARK_CITY_MAP)) {
    const normalizedLandmark = landmark
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    
    if (normalized.includes(normalizedLandmark)) {
      return city;
    }
  }
  return null;
}

const client = new MistralClient(process.env.MISTRAL_API_KEY || '')

// Generic queries that are too vague and should return no results
const GENERIC_QUERIES = [
  'aeropuerto', 'airport', 'parque', 'park', 'iglesia', 'church',
  'centro', 'center', 'hotel', 'restaurante', 'restaurant', 'mall',
  'downtown', 'ciudad', 'city', 'lugar', 'place', 'zona', 'zone', 'area'
]

/**
 * Validates if a user query is too generic/vague
 * Returns true if the query is too generic (should return no results)
 */
export function isGenericQuery(query: string): boolean {
  const normalized = query.trim().toLowerCase()
  // Check if query is exactly one of the generic terms
  return GENERIC_QUERIES.some(generic => normalized === generic)
}

/**
 * Extracts keywords from locationPhrase or address using AI
 * These are fields that need AI to extract searchable keywords
 */
export async function extractKeywordsFromText(text: string, lang: string = 'es'): Promise<string[]> {
  if (!text || !text.trim()) return []
  
  try {
    const prompt = lang === 'en'
      ? `Extract ONLY the actual location keywords that appear in this text. Extract:
- Neighborhood names mentioned in the text
- Landmarks mentioned in the text
- Points of interest mentioned in the text
- Airport names mentioned in the text
- Street names or areas mentioned in the text
- Any other specific location identifiers mentioned in the text

IMPORTANT: Only extract keywords that are actually written in the text. Do NOT infer or add city names that are not explicitly mentioned.

Text: "${text}"

Return ONLY a JSON array of keywords (strings), e.g.: ["keyword1", "keyword2", "keyword3"]
No extra text, no explanations, just the JSON array.`
      : `Extrae SOLO las palabras clave de ubicación que realmente aparecen en este texto. Extrae:
- Nombres de barrios mencionados en el texto
- Puntos de interés mencionados en el texto
- Nombres de aeropuertos mencionados en el texto
- Nombres de calles o áreas mencionados en el texto
- Cualquier otro identificador de ubicación específico mencionado en el texto

IMPORTANTE: Solo extrae palabras clave que estén realmente escritas en el texto. NO infieras ni agregues nombres de ciudades que no estén explícitamente mencionados.

Texto: "${text}"

Devuelve SOLO un array JSON de palabras clave (strings), p.ej.: ["palabra1", "palabra2", "palabra3"]
Sin texto extra, sin explicaciones, solo el array JSON.`

    const response = await client.chat({
      model: 'mistral-small-latest',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      maxTokens: 200,
      temperature: 0.0
    })

    const content = response.choices[0]?.message?.content || '[]'
    const match = content.match(/\[[\s\S]*\]/)
    if (match) {
      try {
        const keywords = JSON.parse(match[0])
        return Array.isArray(keywords) ? keywords.filter(k => typeof k === 'string' && k.trim().length > 0) : []
      } catch {
        return []
      }
    }
    return []
  } catch (error) {
    console.error('Error extracting keywords:', error)
    return []
  }
}

/**
 * Builds a complete keyword set for a hotel
 * Combines direct keywords (region, city, surroundings) with AI-extracted keywords (locationPhrase, address)
 */
export async function buildHotelKeywords(hotel: any, lang: string = 'es'): Promise<string[]> {
  const keywords: string[] = []
  
  // Direct keywords (no AI needed)
  if (hotel.region) keywords.push(hotel.region.toLowerCase().trim())
  if (hotel.city) keywords.push(hotel.city.toLowerCase().trim())
  if (hotel.surroundings && Array.isArray(hotel.surroundings)) {
    hotel.surroundings.forEach((surrounding: string) => {
      if (surrounding && surrounding.trim()) {
        keywords.push(surrounding.toLowerCase().trim())
      }
    })
  }
  
  // AI-extracted keywords
  if (hotel.locationPhrase) {
    const locationKeywords = await extractKeywordsFromText(hotel.locationPhrase, lang)
    keywords.push(...locationKeywords.map(k => k.toLowerCase().trim()))
  }
  
  if (hotel.address) {
    const addressKeywords = await extractKeywordsFromText(hotel.address, lang)
    keywords.push(...addressKeywords.map(k => k.toLowerCase().trim()))
  }
  
  // Remove duplicates and empty strings
  return Array.from(new Set(keywords.filter(k => k.length > 0)))
}

/**
 * Finds hotels that match the user's location query by comparing with hotel keywords
 * Simple direct matching - if user query matches any keyword, hotel is included
 */
export async function findMatchingHotelsByKeywords(
  userQuery: string,
  hotelsWithKeywords: Array<{ id: string; keywords: string[]; name?: string; city?: string }>,
  lang: string = 'es'
): Promise<string[]> {
  if (hotelsWithKeywords.length === 0) return []
  
  const userQueryLower = userQuery.toLowerCase().trim()
  const matchingIds: string[] = []
  
  // First, check for exact city matches (highest priority)
  // If user query is a city name, only match hotels from that exact city
  const cityMatch = hotelsWithKeywords.find(h => 
    h.city && h.city.toLowerCase().trim() === userQueryLower
  )
  
  if (cityMatch) {
    // User query is a city name - only return hotels from that exact city
    const exactCityMatches = hotelsWithKeywords
      .filter(h => h.city && h.city.toLowerCase().trim() === userQueryLower)
      .map(h => h.id)
    console.log('🔍 DEBUG - Exact city match found:', userQueryLower, 'Hotels:', exactCityMatches.length)
    return exactCityMatches
  }
  
  // For non-city queries, match against keywords
  // Normalize user query for matching (remove accents, lowercase)
  const normalize = (str: string) => str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
  
  const normalizedQuery = normalize(userQuery)
  
  // Extract meaningful words from the query (ignore common words)
  const commonWords = ['hotel', 'hoteles', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'close', 'near', 'cerca', 'de', 'del', 'la', 'el', 'los', 'las']
  const queryWords = normalizedQuery
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
  
  for (const hotel of hotelsWithKeywords) {
    let hasMatch = false
    
    // Check if any keyword matches the user query or query words
    for (const keyword of hotel.keywords) {
      const normalizedKeyword = normalize(keyword)
      
      // Check for exact match
      if (normalizedKeyword === normalizedQuery) {
        hasMatch = true
        break
      }
      
      // Check if query contains the keyword (e.g., "hotels near airport" contains "airport")
      if (normalizedQuery.includes(normalizedKeyword) && normalizedKeyword.length > 2) {
        hasMatch = true
        break
      }
      
      // Check if keyword contains the query (e.g., keyword "airport" is in query "airport")
      if (normalizedKeyword.includes(normalizedQuery) && normalizedQuery.length > 2) {
        hasMatch = true
        break
      }
      
      // Check if any query word matches the keyword (e.g., "airport" in query matches "airport" keyword)
      for (const queryWord of queryWords) {
        if (normalizedKeyword.includes(queryWord) || queryWord.includes(normalizedKeyword)) {
          hasMatch = true
          break
        }
      }
      
      if (hasMatch) break
    }
    
    if (hasMatch) {
      matchingIds.push(hotel.id)
    }
  }
  
  console.log('🔍 DEBUG - Keyword matches found:', matchingIds.length, 'for query:', userQueryLower, 'matching IDs:', matchingIds)
  return matchingIds
}

/**
 * Free-form chatbot that uses all hotel data as context
 * Allows natural conversation about hotels in the database
 */
export async function freeFormChatbot(
  userMessage: string,
  hotels: any[],
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  lang: string = 'es'
): Promise<string> {
  try {
    // Build comprehensive hotel context with all available information
    const hotelContext = hotels.map(hotel => {
      const parts = [
        `Nombre: ${hotel.name || 'N/A'}`,
        `Ciudad: ${hotel.city || 'N/A'}`,
        `Región: ${hotel.region || 'N/A'}`,
        `Tipo: ${hotel.hotelType || 'N/A'}`,
        `Descripción: ${hotel.description || 'N/A'}`,
        hotel.address ? `Dirección: ${hotel.address}` : null,
        hotel.locationPhrase ? `Ubicación: ${hotel.locationPhrase}` : null,
        hotel.recreationAreas ? `Servicios: ${hotel.recreationAreas}` : null,
        hotel.surroundings && Array.isArray(hotel.surroundings) && hotel.surroundings.length > 0
          ? `Alrededores: ${hotel.surroundings.join(', ')}`
          : null,
        hotel.websiteLink ? `Sitio web: ${hotel.websiteLink}` : null,
        hotel.bookingLink ? `Reservas: ${hotel.bookingLink}` : null
      ].filter(Boolean).join('\n')
      return parts
    }).join('\n\n---\n\n')

    const systemPrompt = lang === 'en'
      ? `You are Lucía, a friendly and helpful hotel assistant for AHOTEC (Federation of Hotels of Ecuador). You help users find information about hotels in Ecuador using the hotel database provided to you.

You have access to information about ${hotels.length} hotels in Ecuador. Use this information to answer questions about:
- Hotel locations, cities, and regions
- Hotel types and categories
- Hotel amenities and services
- Points of interest near hotels
- Recommendations based on user preferences
- Any other questions about hotels in Ecuador

IMPORTANT: When you mention a hotel by name in your response, ALWAYS include its website link and booking link in markdown format. Format links like this:
- [Visit website](websiteLink) or [Book now](bookingLink)
- If a hotel has both links, include both: [Visit website](websiteLink) | [Book now](bookingLink)
- Only include links for hotels that are actually mentioned in your response

Be conversational, friendly, and helpful. If the user asks about something not in the database, politely let them know. Always base your answers on the actual hotel data provided.

HOTEL DATABASE:
${hotelContext}`
      : `Eres Lucía, una asistente hotelera amigable y útil para AHOTEC (Federación Hotelera del Ecuador). Ayudas a los usuarios a encontrar información sobre hoteles en Ecuador usando la base de datos de hoteles que se te proporciona.

Tienes acceso a información sobre ${hotels.length} hoteles en Ecuador. Usa esta información para responder preguntas sobre:
- Ubicaciones de hoteles, ciudades y regiones
- Tipos y categorías de hoteles
- Servicios y amenidades de hoteles
- Puntos de interés cerca de hoteles
- Recomendaciones basadas en preferencias del usuario
- Cualquier otra pregunta sobre hoteles en Ecuador

IMPORTANTE: Cuando menciones un hotel por nombre en tu respuesta, SIEMPRE incluye su enlace al sitio web y enlace de reservas en formato markdown. Formatea los enlaces así:
- [Visitar sitio web](websiteLink) o [Reservar ahora](bookingLink)
- Si un hotel tiene ambos enlaces, incluye ambos: [Visitar sitio web](websiteLink) | [Reservar ahora](bookingLink)
- Solo incluye enlaces para hoteles que realmente menciones en tu respuesta

Sé conversacional, amigable y útil. Si el usuario pregunta sobre algo que no está en la base de datos, indícaselo amablemente. Siempre basa tus respuestas en los datos reales de hoteles proporcionados.

BASE DE DATOS DE HOTELES:
${hotelContext}`

    // Build conversation messages
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ]

    // Add conversation history (last 10 messages to avoid token limits)
    const recentHistory = conversationHistory.slice(-10)
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      })
    })

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    })

    const response = await client.chat({
      model: 'mistral-small-latest',
      messages,
      maxTokens: 1000,
      temperature: 0.7 // Higher temperature for more natural conversation
    })

    return response.choices[0]?.message?.content || (lang === 'en' 
      ? 'Sorry, I could not process your message. Please try again.' 
      : 'Lo siento, no pude procesar tu mensaje. Por favor intenta de nuevo.')
  } catch (error) {
    console.error('Error in free-form chatbot:', error)
    return lang === 'en' 
      ? 'Sorry, there was a technical problem. Please try again later.' 
      : 'Lo siento, hay un problema técnico. Por favor intenta de nuevo más tarde.'
  }
}

export async function getHotelRecommendations(query: string, hotels: any[], lang: string = 'es') {
  try {
    const hotelContext = hotels.map(hotel => 
      `Hotel: ${hotel.name}, Location: ${hotel.city}, ${hotel.region}, Description: ${hotel.description}, Amenities: ${hotel.amenities?.join(', ')}, Tags: ${hotel.tags?.join(', ')}`
    ).join('\n\n')

    const prompt = lang === 'en'
      ? `You are Lucía, a helpful hotel concierge for AHOTEC (Federation of Hotels of Ecuador).

Available hotels in our database:
${hotelContext}

User query: "${query}"

Please provide helpful recommendations based on the user's query. If they're asking about a specific area, recommend hotels in that area. If they mention specific amenities or preferences, prioritize hotels that match those criteria.

Respond in a friendly, helpful manner in English. Keep your response concise but informative.`
      : `Eres Lucía, una asistente hotelera para AHOTEC (Federación Hotelera del Ecuador).

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
      temperature: 0.3
    })

    return response.choices[0]?.message?.content || (lang === 'en' ? 'Sorry, I could not find hotels matching your query.' : 'Lo siento, no pude encontrar hoteles que coincidan con tu consulta.')
  } catch (error) {
    console.error('Error calling Mistral AI:', error)
    return lang === 'en' ? 'Sorry, there was a technical problem. Please try again later.' : 'Lo siento, hay un problema técnico. Por favor intenta de nuevo más tarde.'
  }
}

export async function getHotelsBySemanticLocation(locationQuery: string, hotels: any[], lang: string = 'es') {
  const typedHotels: Hotel[] = hotels as Hotel[];

  // --- Deterministic handling: generic "aeropuerto"/"airport" should return all airport-proximate hotels ---
  if (isGenericAirportQuery(locationQuery)) {
    const ids = typedHotels.filter(hotelHasAirportSignal).map(h => h.id);
    return ids;
  }

  // --- Check for known landmarks first (highest priority for precision) ---
  const landmarkCity = resolveLandmarkCity(locationQuery);
  if (landmarkCity) {
    console.log(`🎯 LANDMARK DETECTED: "${locationQuery}" → ${landmarkCity} (deterministic match)`);
  }
  
  // --- Specific airport queries: narrow hotel set to the mapped city and later enforce airport proximity ---
  const airportCity = resolveAirportCity(locationQuery);
  if (airportCity) {
    console.log(`✈️ AIRPORT DETECTED: "${locationQuery}" → ${airportCity}`);
  }
  
  // Prioritize landmark match, then airport match, then all hotels
  const targetCity = landmarkCity || airportCity;
  const narrowedHotels: Hotel[] = targetCity
    ? typedHotels.filter(h => (h.city || '').toLowerCase() === targetCity.toLowerCase())
    : typedHotels;
  
  if (targetCity) {
    console.log(`📍 Pre-filtered to ${targetCity}: ${narrowedHotels.length} hotels`);
  }

  const hotelContext = narrowedHotels.map(hotel =>
    `ID: ${hotel.id}\nNombre: ${hotel.name}\nCiudad: ${hotel.city}\nRegión: ${hotel.region}\nDirección: ${hotel.address}\nFraseUbicacion: ${hotel.locationPhrase}\nAlrededores: ${(hotel.surroundings || []).join(', ')}`
  ).join('\n---\n')

  const prompt =
  lang === 'en'
  ? `SYSTEM:
    You are a deterministic filter that returns ONLY hotel IDs in Ecuador matching a user's location query.
    You will receive:
    1) A hotel inventory with location fields (hotelContext) including IDs, city, province/region (Sierra, Costa, Amazon, Galápagos), and optionally landmarks/coordinates.
    2) A free-text location query (locationQuery).
    
    Your ONLY output must be a JSON array of hotel IDs, e.g.: ["id1","id2"]. No extra text, no comments, no JSON object—just a flat JSON array. If no match: return [].
    
    GOALS (priority order):
    1) High precision: prefer exact CITY matches. Never include hotels outside the intended city.
    2) If the query clearly names a REGION (e.g., "Sierra", "Costa", "Amazon", "Galápagos") without a specific city, then match by region ONLY (still in Ecuador).
    3) Airport rules (map airports → city/region):
       - "Mariscal Sucre Airport" / "Quito Airport" / "UIO" / "Tababela" → city Quito, region Sierra.
       - "José Joaquín de Olmedo Airport" / "Guayaquil Airport" / "GYE" → city Guayaquil, region Costa.
       - "Cotopaxi Airport" / "Latacunga Airport" / "LTX" → city Latacunga, region Sierra.
       (Never output hotels from outside the mapped city for these).
    4) Landmarks & generic categories: If the query is generic "airport"/"aeropuerto" with no city, return ALL hotels that explicitly mention airport proximity in their fields (name/description/amenities/tags/locationPhrase/surroundings). For other generic types like "church"/"park" without a city, return [].
    5) If a location is outside Ecuador or unknown/ambiguous, return [].
    
    NORMALIZATION & MATCHING:
    - Be accent-insensitive and case-insensitive (e.g., "José Joaquín de Olmedo" == "Jose Joaquin de Olmedo").
    - Accept common aliases and abbreviations:
      - Quito ↔ DMQ, UIO (airport code context), Tababela (airport area).
      - Guayaquil ↔ GYE (airport code).
      - Latacunga ↔ LTX (airport code).
      - Popular Ecuador cities (non-exhaustive): Quito, Guayaquil, Cuenca, Baños (Baños de Agua Santa), Mindo, Otavalo, Montañita, Salinas, Tena, Puyo, Loja, Esmeraldas, Riobamba, Ambato, Ibarra; Galápagos hubs: Puerto Ayora, Puerto Baquerizo Moreno.
    - If the query names BOTH a city and a region, city wins (filter by that city inside that region).
    
    STRICT RULES:
    - Return hotels ONLY from the same city as the resolved query (Rule 1). The ONLY exception is when the query is clearly region-level (e.g., "hotels in Sierra"): then match by region.
    - NEVER mix different cities unless the query explicitly asks for a multi-city region (e.g., "Sierra road trip", "Costa y Sierra"). If not explicit, do not mix.
    - If the query is vague or a non-Ecuador place, return [].
    - Do not infer availability, price, or distance—this step is city/region filtering ONLY.
    
    INPUTS:
    - hotelContext: JSON-like block with hotel entries, each including: id, name, city, region (Sierra/Costa/Amazon/Galápagos), and possibly landmark tags.
    - locationQuery: free text.
    
    OUTPUT:
    - ONLY a JSON array of hotel IDs (strings), strictly valid JSON. Sorted by relevance (exact city match > landmark-in-city > region-only queries). If no match: [].
    - If the query includes airport terms, rank airport-proximate hotels above other matches.
    
    EXAMPLES (follow EXACTLY):
    
    hotelContext contains Quito, Guayaquil, Latacunga, etc.
    
    Q: "Mariscal Sucre Airport"
    A: ["<IDs in QUITO only>"]
    
    Q: "Quito Airport"
    A: ["<IDs in QUITO only>"]
    
    Q: "José Joaquín de Olmedo Airport"
    A: ["<IDs in GUAYAQUIL only>"]
    
    Q: "church"
    A: []   // too vague
    
    Q: "San Francisco Church Quito"
    A: ["<IDs in QUITO only>"]
    
    Q: "La Carolina Park"
    A: ["<IDs in QUITO only>"]
    
    Q: "Sierra"
    A: ["<IDs whose region is SIERRA only>"]
    
    Now perform the task.
    
    HOTEL INVENTORY:
    ${hotelContext}
    
    USER LOCATION QUERY:
    "${locationQuery}"`
  : `SYSTEMA:
    Eres un filtro determinista que devuelve SOLO IDs de hoteles en Ecuador que coincidan con la consulta de ubicación del usuario.
    Recibirás:
    1) Un inventario de hoteles con campos de ubicación (hotelContext) incluyendo IDs, ciudad, provincia/región (Sierra, Costa, Amazonía, Galápagos), y opcionalmente hitos/coordenadas.
    2) Una consulta de ubicación en texto libre (locationQuery).
    
    Tu ÚNICA salida debe ser un array JSON de IDs de hoteles, p.ej.: ["id1","id2"]. Sin texto extra, sin comentarios, sin objeto JSON—solo un array plano. Si no hay coincidencias: devuelve [].
    
    OBJETIVOS (en orden de prioridad):
    1) Máxima precisión: prioriza coincidencia exacta de CIUDAD. Nunca incluyas hoteles fuera de la ciudad prevista.
    2) Si la consulta nombra claramente una REGIÓN (p.ej., "Sierra", "Costa", "Amazonía", "Galápagos") sin una ciudad específica, entonces filtra por región ÚNICAMENTE (siempre dentro de Ecuador).
    3) Reglas de aeropuertos (mapear aeropuerto → ciudad/región):
       - "Aeropuerto Mariscal Sucre" / "Aeropuerto de Quito" / "UIO" / "Tababela" → ciudad Quito, región Sierra.
       - "Aeropuerto José Joaquín de Olmedo" / "Aeropuerto de Guayaquil" / "GYE" → ciudad Guayaquil, región Costa.
       - "Aeropuerto Cotopaxi" / "Aeropuerto de Latacunga" / "LTX" → ciudad Latacunga, región Sierra.
       (Nunca devuelvas hoteles fuera de la ciudad mapeada para estos casos).
    4) Puntos de interés y categorías genéricas: Si la consulta es genérica "aeropuerto" sin ciudad, devuelve TODOS los hoteles que indiquen proximidad al aeropuerto en sus campos (nombre/descripción/amenities/tags/locationPhrase/surroundings). Para otros genéricos como "iglesia"/"parque" sin ciudad, devuelve [].
    5) Si la ubicación está fuera de Ecuador o es desconocida/ambigua, devuelve [].
    
    NORMALIZACIÓN Y COINCIDENCIA:
    - Ignora mayúsculas/minúsculas y acentos (p.ej., "Jose Joaquin de Olmedo" == "José Joaquín de Olmedo").
    - Acepta alias y abreviaturas comunes:
      - Quito ↔ DMQ, UIO (contexto aeropuerto), Tababela (zona aeropuerto).
      - Guayaquil ↔ GYE (código aeropuerto).
      - Latacunga ↔ LTX (código aeropuerto).
      - Ciudades frecuentes (no exhaustivo): Quito, Guayaquil, Cuenca, Baños (Baños de Agua Santa), Mindo, Otavalo, Montañita, Salinas, Tena, Puyo, Loja, Esmeraldas, Riobamba, Ambato, Ibarra; Galápagos: Puerto Ayora, Puerto Baquerizo Moreno.
    - Si la consulta nombra CIUDAD y REGIÓN, manda la ciudad (filtra esa ciudad dentro de la región).
    
    REGLAS ESTRICTAS:
    - Devuelve hoteles SOLO de la misma ciudad que la consulta resuelta (Regla 1). La ÚNICA excepción es cuando la consulta es claramente regional (p.ej., "hoteles en Sierra"): allí filtra por región.
    - NUNCA mezcles ciudades distintas salvo que la consulta pida explícitamente una región multi-ciudad (p.ej., "road trip por Sierra", "Costa y Sierra"). Si no es explícito, no mezcles.
    - Si la consulta es vaga o es un lugar no ecuatoriano, devuelve [].
    - No infieras disponibilidad, precio o distancia—esta etapa es SOLO filtrado por ciudad/región.
    
    ENTRADAS:
    - hotelContext: bloque tipo JSON con entradas de hotel, cada una con: id, nombre, ciudad, región (Sierra/Costa/Amazonía/Galápagos) y, si existe, etiquetas de hitos.
    - locationQuery: texto libre.
    
    SALIDA:
    - SOLO un array JSON de IDs (strings), JSON válido estricto. Ordenado por relevancia (coincidencia exacta por ciudad > hito-en-ciudad > consultas solo de región).
    - Si la consulta incluye términos de aeropuerto, prioriza hoteles cercanos al aeropuerto sobre otras coincidencias.
    
    EJEMPLOS (síguelos AL PIE DE LA LETRA):
    
    hotelContext contiene Quito, Guayaquil, Latacunga, etc.
    
    P: "Aeropuerto Mariscal Sucre"
    R: ["<IDs SOLO de QUITO>"]
    
    P: "Aeropuerto de Quito"
    R: ["<IDs SOLO de QUITO>"]
    
    P: "Aeropuerto José Joaquín de Olmedo"
    R: ["<IDs SOLO de GUAYAQUIL>"]
    
    P: "iglesia"
    R: []   // muy vago
    
    P: "Iglesia San Francisco Quito"
    R: ["<IDs SOLO de QUITO>"]
    
    P: "Parque La Carolina"
    R: ["<IDs SOLO de QUITO>"]
    
    P: "Sierra"
    R: ["<IDs cuya región sea SIERRA>"]
    
    Ahora realiza la tarea.
    
    INVENTARIO DE HOTELES:
    ${hotelContext}
    
    CONSULTA DEL USUARIO:
    "${locationQuery}"`

  const response = await client.chat({
    model: 'mistral-small-latest',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: locationQuery }
    ],
    maxTokens: 200,
    temperature: 0.0
  })

  // Extraer el array JSON de la respuesta
  const text = response.choices[0]?.message?.content || '[]';
  const match = text.match(/\[[\s\S]*\]/);
  let ids: string[] = [];
  if (match) {
    try { ids = JSON.parse(match[0]); } catch { ids = []; }
  }

  // If it's an airport-specific query, require airport signals to avoid unrelated city hotels.
  if (airportCity || textIncludesAny(locationQuery.toLowerCase(), AIRPORT_SYNONYMS)) {
    const idSet = new Set(
      typedHotels.filter(h => hotelHasAirportSignal(h)).map(h => h.id)
    );
    ids = ids.filter(id => idSet.has(id));
  }

  // CRITICAL: If we detected a landmark, ensure ONLY hotels from that city are returned
  // This is a safety check in case the AI returned hotels from other cities
  if (landmarkCity) {
    const cityHotelIds = new Set(
      typedHotels
        .filter(h => (h.city || '').toLowerCase() === landmarkCity.toLowerCase())
        .map(h => h.id)
    );
    ids = ids.filter(id => cityHotelIds.has(id));
    console.log(`🔒 LANDMARK SAFETY: Enforced ${landmarkCity}-only filter. Final count: ${ids.length}`);
  }

  return ids;
}