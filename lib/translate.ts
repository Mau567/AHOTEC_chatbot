export async function translateText(text: string, targetLang: 'en' | 'es'): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
  const res = await fetch(url)
  const data = await res.json()
  return data[0].map((item: any) => item[0]).join('')
}
