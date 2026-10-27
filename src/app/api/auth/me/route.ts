import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    await connectToDatabase();
    const user = await User.findById(payload.userId).select('-password');
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        agencyName: user.agencyName,
        wishlist: user.wishlist,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
