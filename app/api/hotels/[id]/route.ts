import { NextRequest, NextResponse } from 'next/server'
import { prisma, supabase } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let parsed: any = {}

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()

      const getString = (key: string) => {
        const val = formData.get(key)
        return typeof val === 'string' ? val : undefined
      }

      parsed = {
        status: getString('status'),
        approvedBy: getString('approvedBy'),
        price: getString('price') ? parseFloat(getString('price') as string) : undefined,
        isPaid: getString('isPaid') ? getString('isPaid') === 'true' : undefined,
        name: getString('name'),
        region: getString('region'),
        city: getString('city'),
        description: getString('description'),
        bookingLink: getString('bookingLink'),
        aboutMessage: getString('aboutMessage'),
        recreationAreas: getString('recreationAreas'),
        locationPhrase: getString('locationPhrase'),
        address: getString('address'),
        surroundings: getString('surroundings'),
        hotelType: getString('hotelType'),
        image: formData.get('image') as File | null
      }
    } else {
      const body = await request.json()
      parsed = body
    }

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
      imageUrl,
      image
    } = parsed

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
    if (surroundings !== undefined) {
      if (typeof surroundings === 'string') {
        data.surroundings = surroundings
          .split(',')
          .map(s => s.trim())
          .filter(s => s)
      } else {
        data.surroundings = surroundings
      }
    }
    if (hotelType !== undefined) data.hotelType = hotelType
    if (imageUrl !== undefined) data.imageUrl = imageUrl

    if (image) {
      const arrayBuffer = await image.arrayBuffer()
      const fileExt = image.name.split('.').pop()
      const fileName = `hotel_${Date.now()}.${fileExt}`
      const { error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET || 'hotel-images')
        .upload(fileName, new Uint8Array(arrayBuffer), {
          contentType: image.type
        })
      if (error) {
        console.error('Error uploading image to Supabase:', error)
        return NextResponse.json({ error: 'Error uploading image' }, { status: 500 })
      }
      const { data: publicUrlData } = supabase.storage
        .from(process.env.SUPABASE_BUCKET || 'hotel-images')
        .getPublicUrl(fileName)
      data.imageUrl = publicUrlData?.publicUrl
    }

    const hotel = await prisma.hotel.update({
      where: { id: params.id },
      data
    })

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