import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }
    const arrayBuffer = await file.arrayBuffer()
    const fileExt = file.name.split('.').pop()
    const fileName = `hotel_${Date.now()}.${fileExt}`
    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET || 'hotel-images')
      .upload(fileName, new Uint8Array(arrayBuffer), {
        contentType: file.type
      })
    if (error) {
      console.error('Error uploading image to Supabase:', error)
      return NextResponse.json({ error: 'Error uploading image' }, { status: 500 })
    }
    const { data: publicUrlData } = supabase.storage
      .from(process.env.SUPABASE_BUCKET || 'hotel-images')
      .getPublicUrl(fileName)
    return NextResponse.json({ success: true, imageUrl: publicUrlData?.publicUrl })
  } catch (err) {
    console.error('Upload image error:', err)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
