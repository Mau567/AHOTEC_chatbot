import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hotel = await prisma.hotel.findUnique({ where: { id: params.id } })
    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
    }
    return NextResponse.json({ hotel })
  } catch (error) {
    console.error('Error fetching hotel:', error)
    return NextResponse.json({ error: 'Failed to fetch hotel' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
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
      hotelType
    } = body

    const data: any = {}

    if (status) {
      data.status = status
      data.approvedBy = approvedBy
      data.approvedAt = status !== 'PENDING' ? new Date() : null
      data.price = price
      data.isPaid = isPaid
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

    const hotel = await prisma.hotel.update({
      where: { id: params.id },
      data
    })

    return NextResponse.json({ 
      success: true, 
      hotel,
      message: `Hotel ${status.toLowerCase()} successfully`
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
    await prisma.hotel.delete({
      where: { id: params.id }
    })

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
