import MistralClient from '@mistralai/mistralai'

const client = new MistralClient(process.env.MISTRAL_API_KEY || '')

export async function getHotelRecommendations(query: string, hotels: any[]) {
  try {
    const hotelContext = hotels.map(hotel => 
      `Hotel: ${hotel.name}, Location: ${hotel.city}, ${hotel.region}, Description: ${hotel.description}, Amenities: ${hotel.amenities.join(', ')}, Tags: ${hotel.tags.join(', ')}`
    ).join('\n\n')

    const prompt = `You are a helpful hotel concierge for AHOTEC (Association of Hotels of Ecuador). 
    
Available hotels in our database:
${hotelContext}

User query: "${query}"

Please provide helpful recommendations based on the user's query. If they're asking about a specific area, recommend hotels in that area. If they mention specific amenities or preferences, prioritize hotels that match those criteria.

Respond in a friendly, helpful manner in Spanish (since this is for Ecuador). Keep your response concise but informative.`

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