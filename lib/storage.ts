export function getImagePathFromUrl(imageUrl: string): string | null {
  const bucket = process.env.SUPABASE_BUCKET || 'hotel-images'
  const idx = imageUrl.indexOf(`${bucket}/`)
  if (idx === -1) return null
  return imageUrl.substring(idx + bucket.length + 1)
}

import { supabase } from './db'

export async function deleteImageFromStorage(imageUrl?: string | null) {
  if (!imageUrl) return
  const path = getImagePathFromUrl(imageUrl)
  if (!path) return
  await supabase.storage
    .from(process.env.SUPABASE_BUCKET || 'hotel-images')
    .remove([path])
}

