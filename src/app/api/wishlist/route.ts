import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Property from '@/models/Property';
import { getUserFromRequest } from '@/lib/jwt';
import mongoose from 'mongoose';
import { maskPhoneNumber } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const userPayload = getUserFromRequest(req);
    const { searchParams } = new URL(req.url);
    const clientIds = searchParams.get('ids');

    let propertyIds: any[] = [];

    if (userPayload) {
      const user = await User.findById(userPayload.userId);
      if (user && user.wishlist) {
        propertyIds = user.wishlist;
      }
    } else if (clientIds) {
      // Guest users who store wishlist IDs in localStorage
      propertyIds = clientIds
        .split(',')
        .filter((id) => mongoose.Types.ObjectId.isValid(id.trim()))
        .map((id) => new mongoose.Types.ObjectId(id.trim()));
    }

    if (propertyIds.length === 0) {
      return NextResponse.json({ wishlist: [] });
    }

    const properties = await Property.find({ _id: { $in: propertyIds } }).lean();

    const sanitized = properties.map((prop: any) => ({
      ...prop,
      ownerContact: {
        ...prop.ownerContact,
        phone: maskPhoneNumber(prop.ownerContact?.phone || ''),
        isMasked: true,
      },
    }));

    return NextResponse.json({ wishlist: sanitized });
  } catch (error: any) {
    console.error('Wishlist GET error:', error);
    return NextResponse.json(
      { message: error.message || 'Error fetching wishlist' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload) {
      return NextResponse.json(
        { message: 'Authentication required to save to user account' },
        { status: 401 }
      );
    }

    const { propertyId } = await req.json();
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return NextResponse.json({ message: 'Invalid property ID' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(userPayload.userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const pId = new mongoose.Types.ObjectId(propertyId);
    const index = user.wishlist.findIndex((id) => id.toString() === propertyId);

    let isSaved = false;
    if (index > -1) {
      user.wishlist.splice(index, 1);
      isSaved = false;
    } else {
      user.wishlist.push(pId);
      isSaved = true;
    }

    await user.save();

    return NextResponse.json({
      message: isSaved ? 'Property saved to wishlist' : 'Property removed from wishlist',
      isSaved,
      wishlist: user.wishlist,
    });
  } catch (error: any) {
    console.error('Wishlist toggle error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update wishlist' },
      { status: 500 }
    );
  }
}
