export async function translateText(text: string, lang: string): Promise<string> {
  if (!text || lang === 'es') return text;
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=es|${lang}`);
    const data = await res.json();
    return data?.responseData?.translatedText || text;
  } catch {
    return text;
  }
}

export async function translateHotels(hotels: any[], lang: string) {
  if (lang === 'es') return hotels;
  return Promise.all(
    hotels.map(async (hotel) => ({
      ...hotel,
      name: await translateText(hotel.name, lang),
      description: await translateText(hotel.description, lang),
      locationPhrase: hotel.locationPhrase ? await translateText(hotel.locationPhrase, lang) : null,
      address: hotel.address ? await translateText(hotel.address, lang) : null,
      recreationAreas: hotel.recreationAreas ? await translateText(hotel.recreationAreas, lang) : null,
      surroundings: hotel.surroundings
        ? await Promise.all(hotel.surroundings.map((s: string) => translateText(s, lang)))
        : [],
    }))
  );
}
