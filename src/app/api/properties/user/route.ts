import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Property from '@/models/Property';
import { getUserFromRequest } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    await connectToDatabase();

    const properties = await Property.find({ owner: user.userId })
      .sort({ createdAt: -1 })
      .lean();

    // Summary statistics for broker/owner dashboard
    const totalListings = properties.length;
    const activeListings = properties.filter((p) => p.status === 'available').length;
    const rentedListings = properties.filter((p) => p.status === 'rented').length;
    const totalViews = properties.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
    const totalContactReveals = properties.reduce(
      (acc, p) => acc + (p.contactRevealsCount || 0),
      0
    );

    return NextResponse.json({
      properties,
      stats: {
        totalListings,
        activeListings,
        rentedListings,
        totalViews,
        totalContactReveals,
      },
    });
  } catch (error: any) {
    console.error('Fetch user properties error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch user properties' },
      { status: 500 }
    );
  }
}
