import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Property from '@/models/Property';
import mongoose from 'mongoose';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid property ID' }, { status: 400 });
    }

    await connectToDatabase();

    // Find and increment contact reveals count
    const property = await Property.findByIdAndUpdate(
      id,
      { $inc: { contactRevealsCount: 1 } },
      { new: true }
    );

    if (!property) {
      return NextResponse.json({ message: 'Property not found' }, { status: 404 });
    }

    const rawPhone = property.ownerContact?.phone || '';
    // Format sanitized phone for tel: and wa.me
    const numericPhone = rawPhone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${numericPhone.startsWith('91') ? numericPhone : '91' + numericPhone}?text=Hi%20${encodeURIComponent(property.ownerContact?.name || '')},%20I%20am%20interested%20in%20your%20property%20listing:%20${encodeURIComponent(property.title)}%20on%20AmarGhor.`;

    return NextResponse.json({
      success: true,
      revealedContact: {
        name: property.ownerContact?.name,
        phone: rawPhone,
        whatsapp: property.ownerContact?.whatsapp,
        whatsappUrl,
        telUrl: `tel:${rawPhone}`,
      },
      contactRevealsCount: property.contactRevealsCount,
    });
  } catch (error: any) {
    console.error('Contact reveal error:', error);
    return NextResponse.json(
      { message: error.message || 'Error revealing contact' },
      { status: 500 }
    );
  }
}
