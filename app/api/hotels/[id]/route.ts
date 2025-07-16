import { NextRequest, NextResponse } from 'next/server'
import { prisma, supabase } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contentType = request.headers.get('content-type') || ''

    const data: any = {}

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()

      const getString = (key: string) => formData.get(key) as string | null

      const status = getString('status')
      const approvedBy = getString('approvedBy')
      const price = getString('price')
      const isPaid = getString('isPaid')
      const name = getString('name')
      const region = getString('region')
      const city = getString('city')
      const description = getString('description')
      const bookingLink = getString('bookingLink')
      const aboutMessage = getString('aboutMessage')
      const recreationAreas = getString('recreationAreas')
      const locationPhrase = getString('locationPhrase')
      const address = getString('address')
      const surroundingsRaw = getString('surroundings')
      const hotelType = getString('hotelType')
      const image = formData.get('image') as File | null

      if (status) {
        data.status = status
        data.approvedBy = approvedBy || undefined
        data.approvedAt = status !== 'PENDING' ? new Date() : null
        if (price !== null) data.price = parseFloat(price)
        if (isPaid !== null) data.isPaid = isPaid === 'true' || isPaid === '1'
      }
      if (name !== null) data.name = name
      if (region !== null) data.region = region
      if (city !== null) data.city = city
      if (description !== null) data.description = description
      if (bookingLink !== null) data.bookingLink = bookingLink
      if (aboutMessage !== null) data.aboutMessage = aboutMessage
      if (recreationAreas !== null) data.recreationAreas = recreationAreas
      if (locationPhrase !== null) data.locationPhrase = locationPhrase
      if (address !== null) data.address = address
      if (surroundingsRaw !== null)
        data.surroundings = surroundingsRaw
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      if (hotelType !== null) data.hotelType = hotelType

      if (image && image.size > 0) {
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
          return NextResponse.json(
            { error: 'Error uploading image' },
            { status: 500 }
          )
        }
        const { data: publicUrlData } = supabase.storage
          .from(process.env.SUPABASE_BUCKET || 'hotel-images')
          .getPublicUrl(fileName)
        data.imageUrl = publicUrlData?.publicUrl
      }
    } else {
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
        hotelType,
        imageUrl
      } = body

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