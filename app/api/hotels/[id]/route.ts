import { NextRequest, NextResponse } from 'next/server'
import { prisma, supabase } from '@/lib/db'

function extractFilePath(url: string): string | null {
  try {
    const bucket = process.env.SUPABASE_BUCKET || 'hotel-images'
    const { pathname } = new URL(url)
    const idx = pathname.indexOf(`/${bucket}/`)
    if (idx === -1) return null
    return pathname.slice(idx + bucket.length + 2)
  } catch {
    return null
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const existingHotel = await prisma.hotel.findUnique({
      where: { id: params.id },
      select: { imageUrl: true }
    })
    const {
      status,
      approvedBy,
      price,
      isPaid,
      name,
      region,
      city,
      description,
      bookingLink,
      aboutMessage,
      recreationAreas,
      locationPhrase,
      address,
      surroundings,
      hotelType,
      imageUrl
    } = body

    const data: any = {}

    if (status) {
      data.status = status
      data.approvedBy = approvedBy
      data.approvedAt = status !== 'PENDING' ? new Date() : null
      if (price !== undefined) data.price = price
      if (isPaid !== undefined) data.isPaid = isPaid
    }

    if (name !== undefined) data.name = name
    if (region !== undefined) data.region = region
    if (city !== undefined) data.city = city
    if (description !== undefined) data.description = description
    if (bookingLink !== undefined) data.bookingLink = bookingLink
    if (aboutMessage !== undefined) data.aboutMessage = aboutMessage
    if (recreationAreas !== undefined) data.recreationAreas = recreationAreas
    if (locationPhrase !== undefined) data.locationPhrase = locationPhrase
    if (address !== undefined) data.address = address
    if (surroundings !== undefined) data.surroundings = surroundings
    if (hotelType !== undefined) data.hotelType = hotelType
    if (imageUrl !== undefined) data.imageUrl = imageUrl

    const hotel = await prisma.hotel.update({
      where: { id: params.id },
      data
    })

    if (existingHotel?.imageUrl && imageUrl !== existingHotel.imageUrl) {
      const path = extractFilePath(existingHotel.imageUrl)
      if (path) {
        await supabase.storage
          .from(process.env.SUPABASE_BUCKET || 'hotel-images')
          .remove([path])
      }
    }

    return NextResponse.json({
      success: true,
      hotel,
      message: 'Hotel updated successfully'
    })
  } catch (error) {
    console.error('Error updating hotel:', error)
    return NextResponse.json(
      { error: 'Failed to update hotel' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hotel = await prisma.hotel.delete({
      where: { id: params.id }
    })

    if (hotel.imageUrl) {
      const path = extractFilePath(hotel.imageUrl)
      if (path) {
        await supabase.storage
          .from(process.env.SUPABASE_BUCKET || 'hotel-images')
          .remove([path])
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Hotel deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting hotel:', error)
    return NextResponse.json(
      { error: 'Failed to delete hotel' },
      { status: 500 }
    )
  }
} 