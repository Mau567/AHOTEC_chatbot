import MistralClient from '@mistralai/mistralai'

// ---- Heuristics & helpers for deterministic pre-filtering ----
const AIRPORT_SYNONYMS = [
  'aeropuerto','airport','uio','gye','ltx',
  'mariscal sucre','quito airport','tababela',
  'jose joaquin de olmedo','guayaquil airport',
  'cotopaxi airport','latacunga airport'
];

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

const client = new MistralClient(process.env.MISTRAL_API_KEY || '')

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

  // --- Specific airport queries: narrow hotel set to the mapped city and later enforce airport proximity ---
  const airportCity = resolveAirportCity(locationQuery);
  const narrowedHotels: Hotel[] = airportCity
    ? typedHotels.filter(h => (h.city || '').toLowerCase() === airportCity.toLowerCase())
    : typedHotels;

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

  // If it’s an airport-specific query, require airport signals to avoid unrelated city hotels.
  if (airportCity || textIncludesAny(locationQuery.toLowerCase(), AIRPORT_SYNONYMS)) {
    const idSet = new Set(
      typedHotels.filter(h => hotelHasAirportSignal(h)).map(h => h.id)
    );
    ids = ids.filter(id => idSet.has(id));
  }

  return ids;
}