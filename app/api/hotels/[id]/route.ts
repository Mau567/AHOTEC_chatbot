import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, approvedBy, price, isPaid } = body

    const hotel = await prisma.hotel.update({
      where: { id: params.id },
      data: {
        status,
        approvedBy,
        approvedAt: status !== 'PENDING' ? new Date() : null,
        price,
        isPaid
      }
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