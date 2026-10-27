import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Property from '@/models/Property';
import { getUserFromRequest } from '@/lib/jwt';
import { maskPhoneNumber } from '@/lib/utils';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid property ID' }, { status: 400 });
    }

    await connectToDatabase();

    // Increment view count asynchronously
    const property = await Property.findByIdAndUpdate(
      id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    )
      .populate('owner', 'name agencyName email')
      .lean();

    if (!property) {
      return NextResponse.json({ message: 'Property not found' }, { status: 404 });
    }

    // Check if the current user is the owner
    const currentUser = getUserFromRequest(req);
    const isOwner =
      currentUser &&
      (property.owner?._id?.toString() === currentUser.userId ||
        property.owner?.toString() === currentUser.userId);

    // If not owner, mask the phone number on default detail view
    const sanitized = {
      ...property,
      ownerContact: {
        ...property.ownerContact,
        phone: isOwner
          ? property.ownerContact?.phone
          : maskPhoneNumber(property.ownerContact?.phone || ''),
        isMasked: !isOwner,
      },
    };

    return NextResponse.json({ property: sanitized, isOwner });
  } catch (error: any) {
    console.error('Fetch property by ID error:', error);
    return NextResponse.json(
      { message: error.message || 'Error fetching property' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid property ID' }, { status: 400 });
    }

    await connectToDatabase();
    const existing = await Property.findById(id);

    if (!existing) {
      return NextResponse.json({ message: 'Property not found' }, { status: 404 });
    }

    if (existing.owner.toString() !== user.userId) {
      return NextResponse.json(
        { message: 'You are not authorized to update this listing' },
        { status: 403 }
      );
    }

    const data = await req.json();

    const allowedUpdates = [
      'title',
      'description',
      'propertyType',
      'listingType',
      'location',
      'price',
      'brokeragePercentage',
      'brokerageDiscount',
      'images',
      'amenities',
      'furnishing',
      'bedrooms',
      'baths',
      'roomSharing',
      'ownerContact',
      'status',
    ];

    allowedUpdates.forEach((key) => {
      if (data[key] !== undefined) {
        (existing as any)[key] = data[key];
      }
    });

    const updated = await existing.save();

    return NextResponse.json({
      message: 'Property updated successfully',
      property: updated,
    });
  } catch (error: any) {
    console.error('Update property error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update property' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid property ID' }, { status: 400 });
    }

    await connectToDatabase();
    const existing = await Property.findById(id);

    if (!existing) {
      return NextResponse.json({ message: 'Property not found' }, { status: 404 });
    }

    if (existing.owner.toString() !== user.userId) {
      return NextResponse.json(
        { message: 'You are not authorized to delete this listing' },
        { status: 403 }
      );
    }

    await Property.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Property deleted successfully' });
  } catch (error: any) {
    console.error('Delete property error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to delete property' },
      { status: 500 }
    );
  }
}
