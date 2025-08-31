import { NextRequest, NextResponse } from 'next/server'
import { prisma, supabase } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Parse multipart/form-data
    const formData = await request.formData()
    const name = formData.get('name') as string
    const region = formData.get('region') as string
    const city = formData.get('city') as string
    const description = formData.get('description') as string
    const bookingLink = formData.get('bookingLink') as string
    const websiteLink = formData.get('websiteLink') as string
    const aboutMessage = formData.get('aboutMessage') as string
    const recreationAreas = formData.get('recreationAreas') as string
    const locationPhrase = formData.get('locationPhrase') as string
    const address = formData.get('address') as string
    const surroundingsRaw = formData.get('surroundings') as string
    const hotelType = formData.get('hotelType') as string
    const image = formData.get('image') as File | null

    // surroundingsRaw llega como string separado por comas
    const surroundings = surroundingsRaw ? surroundingsRaw.split(',').map(s => s.trim()).filter(s => s) : []

    let imageUrl: string | undefined = undefined
    if (image) {
      // Upload image to Supabase Storage
      const arrayBuffer = await image.arrayBuffer()
      const fileExt = image.name.split('.').pop()
      const fileName = `hotel_${Date.now()}.${fileExt}`
      const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET || 'hotel-images')
        .upload(fileName, new Uint8Array(arrayBuffer), {
          contentType: image.type
        })
      if (error) {
        console.error('Error uploading image to Supabase:', error)
        return NextResponse.json({ error: 'Error uploading image' }, { status: 500 })
      }
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(process.env.SUPABASE_BUCKET || 'hotel-images')
        .getPublicUrl(fileName)
      imageUrl = publicUrlData?.publicUrl
    }

    const hotel = await prisma.hotel.create({
      data: {
        name,
        region,
        city,
        description,
        bookingLink,
        websiteLink,
        aboutMessage,
        recreationAreas,
        locationPhrase,
        address,
        surroundings,
        hotelType,
        imageUrl
      }
    })

    return NextResponse.json({ 
      success: true, 
      hotel,
      message: 'Hotel submitted successfully! It will be reviewed by our team.'
    })
  } catch (error) {
    console.error('Error submitting hotel:', error)
    return NextResponse.json(
      { error: 'Failed to submit hotel' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const region = searchParams.get('region')
    const city = searchParams.get('city')

    const where: any = {}
    
    if (status) where.status = status
    if (region) where.region = { contains: region, mode: 'insensitive' }
    if (city) where.city = { contains: city, mode: 'insensitive' }

    const hotels = await prisma.hotel.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ hotels })
  } catch (error) {
    console.error('Error fetching hotels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hotels' },
      { status: 500 }
    )
  }
} 