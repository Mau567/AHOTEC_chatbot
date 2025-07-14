import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, region, city, description, amenities, bookingLink, tags, submittedBy } = body

    const hotel = await prisma.hotel.create({
      data: {
        name,
        region,
        city,
        description,
        amenities: Array.isArray(amenities) ? amenities : [amenities],
        bookingLink,
        tags: Array.isArray(tags) ? tags : [tags],
        submittedBy
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