import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Property from '@/models/Property';
import { getUserFromRequest } from '@/lib/jwt';
import { maskPhoneNumber } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search')?.trim() || '';
    const propertyType = searchParams.get('propertyType')?.trim() || '';
    const city = searchParams.get('city')?.trim() || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const furnishing = searchParams.get('furnishing');
    const amenities = searchParams.get('amenities');
    const sort = searchParams.get('sort') || 'newest';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '9', 10)));

    const filter: any = { status: 'available' };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
      ];
    }

    if (propertyType && propertyType !== 'all') {
      filter.propertyType = propertyType;
    }

    if (city && city !== 'all') {
      filter['location.city'] = { $regex: `^${city}$`, $options: 'i' };
    }

    if (minPrice !== null && minPrice !== undefined && minPrice !== '') {
      filter.price = filter.price || {};
      filter.price.$gte = Number(minPrice);
    }

    if (maxPrice !== null && maxPrice !== undefined && maxPrice !== '') {
      filter.price = filter.price || {};
      filter.price.$lte = Number(maxPrice);
    }

    if (furnishing && furnishing !== 'all') {
      filter.furnishing = furnishing;
    }

    if (amenities) {
      const amenitiesList = amenities.split(',').map((a) => a.trim()).filter(Boolean);
      if (amenitiesList.length > 0) {
        filter.amenities = { $all: amenitiesList };
      }
    }

    let sortOptions: any = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };
    if (sort === 'brokerage_asc') sortOptions = { brokeragePercentage: 1, price: 1 };
    if (sort === 'newest') sortOptions = { createdAt: -1 };

    const skip = (page - 1) * limit;

    const [properties, totalCount] = await Promise.all([
      Property.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('owner', 'name agencyName')
        .lean(),
      Property.countDocuments(filter),
    ]);

    // Mask contact phone by default for public browsing
    const sanitizedProperties = properties.map((prop: any) => ({
      ...prop,
      ownerContact: {
        ...prop.ownerContact,
        phone: maskPhoneNumber(prop.ownerContact?.phone || ''),
        isMasked: true,
      },
    }));

    return NextResponse.json({
      properties: sanitizedProperties,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
        hasMore: skip + properties.length < totalCount,
      },
    });
  } catch (error: any) {
    console.error('Fetch properties error:', error);
    return NextResponse.json(
      { message: error.message || 'Error fetching properties' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required to list a property' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const data = await req.json();

    const {
      title,
      description,
      propertyType,
      listingType = 'Rent',
      location,
      price,
      brokeragePercentage = 0,
      brokerageDiscount = 0,
      images,
      amenities = [],
      furnishing = 'Semi-Furnished',
      bedrooms = 1,
      baths = 1,
      roomSharing = 'Private',
      ownerContact,
    } = data;

    // Strict validation
    if (!title || !description || !propertyType || !location?.address || !location?.city || !price) {
      return NextResponse.json(
        { message: 'Please provide all required fields: title, description, property type, location, and price.' },
        { status: 400 }
      );
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { message: 'At least one property image is required.' },
        { status: 400 }
      );
    }

    const contactPhone = ownerContact?.phone?.trim();
    if (!contactPhone) {
      return NextResponse.json(
        { message: 'Contact phone number is required.' },
        { status: 400 }
      );
    }

    const numPrice = Number(price);
    const numBrokerage = Math.min(100, Math.max(0, Number(brokeragePercentage) || 0));
    const numDiscount = Math.min(100, Math.max(0, Number(brokerageDiscount) || 0));

    const newProperty = await Property.create({
      title: title.trim(),
      description: description.trim(),
      propertyType,
      listingType,
      location: {
        address: location.address.trim(),
        city: location.city.trim(),
        state: location.state?.trim() || '',
        pincode: location.pincode?.trim() || '',
        landmark: location.landmark?.trim() || '',
      },
      price: numPrice,
      brokeragePercentage: numBrokerage,
      brokerageDiscount: numDiscount,
      images,
      amenities: Array.isArray(amenities) ? amenities : [],
      furnishing,
      bedrooms: Number(bedrooms) || 1,
      baths: Number(baths) || 1,
      roomSharing: roomSharing || 'Private',
      owner: user.userId,
      ownerContact: {
        name: ownerContact.name?.trim() || user.name,
        phone: contactPhone,
        whatsapp: Boolean(ownerContact.whatsapp),
      },
      status: 'available',
      isVerified: true,
    });

    return NextResponse.json(
      {
        message: 'Property created successfully',
        property: newProperty,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Property creation error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create property' },
      { status: 500 }
    );
  }
}
