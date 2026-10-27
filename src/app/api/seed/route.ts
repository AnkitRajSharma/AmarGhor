import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Property from '@/models/Property';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectToDatabase();

    const count = await Property.countDocuments();
    if (count > 0) {
      return NextResponse.json({
        message: `Database already has ${count} properties. Skipping seed.`,
        count,
      });
    }

    // Create a demo seller account
    let demoSeller = await User.findOne({ email: 'seller@amarghor.com' });
    if (!demoSeller) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      demoSeller = await User.create({
        name: 'Sourav Ganguly (Prime Properties)',
        email: 'seller@amarghor.com',
        password: hashedPassword,
        role: 'seller',
        phone: '+91 98301 23456',
        agencyName: 'AmarGhor Prime Realty',
      });
    }

    // Demo listings
    const sampleProperties = [
      {
        title: 'Luxury 2BHK Furnished Apartment in New Town Action Area 1',
        description: 'Spacious and sunlit 2BHK flat featuring modern modular kitchen, Italian marble flooring, 2 attached balconies overlooking the eco-park greenery, covered reserved parking, and 24/7 security with power backup. Walking distance to IT hubs.',
        propertyType: '2BHK',
        listingType: 'Rent',
        location: {
          address: 'Street No 122, Action Area 1, Near Axis Mall',
          city: 'Kolkata',
          state: 'West Bengal',
          pincode: '700156',
          landmark: 'Opposite Novotel Hotel',
        },
        price: 24000,
        brokeragePercentage: 15,
        brokerageDiscount: 20,
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80',
        ],
        amenities: ['WiFi', 'AC', 'Power Backup', 'Lift', 'Parking', 'Gym', 'Security', 'Balcony', 'Geyser'],
        furnishing: 'Furnished',
        bedrooms: 2,
        baths: 2,
        owner: demoSeller._id,
        ownerContact: {
          name: 'Sourav Ganguly',
          phone: '+91 98301 23456',
          whatsapp: true,
        },
        contactRevealsCount: 14,
        viewsCount: 156,
        status: 'available',
        isVerified: true,
      },
      {
        title: 'Executive High-End Boys & Girls PG near Koramangala 5th Block',
        description: 'All-inclusive premium co-living space with high-speed WiFi, 3-times daily nutritious home-cooked meals, daily housekeeping, biometric access, laundry machines, and rooftop chillout lounge. Ideal for tech professionals and students.',
        propertyType: 'PG',
        listingType: 'PG/Co-Living',
        location: {
          address: '80 Feet Road, 5th Block, Koramangala',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560095',
          landmark: 'Near Sony World Signal',
        },
        price: 13500,
        brokeragePercentage: 0,
        brokerageDiscount: 0,
        images: [
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop&q=80',
        ],
        amenities: ['WiFi', 'AC', 'RO Water', 'Washing Machine', 'Housekeeping', 'Power Backup', 'Security', 'Food Included'],
        furnishing: 'Furnished',
        bedrooms: 1,
        baths: 1,
        roomSharing: 'Double Sharing',
        owner: demoSeller._id,
        ownerContact: {
          name: 'Rohan Sharma',
          phone: '+91 98450 99881',
          whatsapp: true,
        },
        contactRevealsCount: 29,
        viewsCount: 312,
        status: 'available',
        isVerified: true,
      },
      {
        title: 'Modern 1BHK Flat in Andheri West near Metro Station',
        description: 'Bright and airy 1BHK apartment located in a prime gated society. 5 mins walk to the metro station. Fully modular kitchen, piped gas line, dedicated covered car park, security intercom, and peaceful residential neighborhood.',
        propertyType: '1BHK',
        listingType: 'Rent',
        location: {
          address: 'Lokhandwala Complex, Off Link Road, Andheri West',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400053',
          landmark: 'Near Infinity Mall',
        },
        price: 36000,
        brokeragePercentage: 25,
        brokerageDiscount: 15,
        images: [
          'https://images.unsplash.com/photo-1502005229762-ae1b460002f2?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&auto=format&fit=crop&q=80',
        ],
        amenities: ['Lift', 'Parking', 'Security', 'Piped Gas', 'Balcony', 'Power Backup'],
        furnishing: 'Semi-Furnished',
        bedrooms: 1,
        baths: 1,
        owner: demoSeller._id,
        ownerContact: {
          name: 'Pooja Kulkarni',
          phone: '+91 98200 45678',
          whatsapp: true,
        },
        contactRevealsCount: 8,
        viewsCount: 94,
        status: 'available',
        isVerified: true,
      },
      {
        title: '3BHK Duplex Independent Villa with Private Garden',
        description: 'Magnificent independent duplex house nestled inside a secured green township in Gurgaon. Features 3 en-suite bedrooms, modular Italian kitchen, private terrace garden, solar water heater, EV charging socket, and 2 covered car spaces.',
        propertyType: 'House',
        listingType: 'Rent',
        location: {
          address: 'Vipul World, Sector 48, Sohna Road',
          city: 'Delhi NCR',
          state: 'Haryana',
          pincode: '122018',
          landmark: 'Close to Subhash Chowk',
        },
        price: 55000,
        brokeragePercentage: 20,
        brokerageDiscount: 25,
        images: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=1200&auto=format&fit=crop&q=80',
        ],
        amenities: ['Private Garden', 'Parking', 'Power Backup', 'EV Charger', 'Security', 'Pet Friendly', 'Balcony'],
        furnishing: 'Semi-Furnished',
        bedrooms: 3,
        baths: 3,
        owner: demoSeller._id,
        ownerContact: {
          name: 'Amit Verma',
          phone: '+91 98111 77665',
          whatsapp: true,
        },
        contactRevealsCount: 42,
        viewsCount: 410,
        status: 'available',
        isVerified: true,
      },
      {
        title: 'Co-living Single Private Room with Attached Bath in Hitec City',
        description: 'Designed specifically for IT professionals working in Madhapur and Hitec City. Private air-conditioned bedroom with attached modern bathroom, orthopaedic mattress, study desk, 300 Mbps fiber internet, and 100% power backup.',
        propertyType: 'Room',
        listingType: 'PG/Co-Living',
        location: {
          address: 'Kavuri Hills, Phase 2, Madhapur',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500081',
          landmark: 'Near Durgam Cheruvu Metro',
        },
        price: 16000,
        brokeragePercentage: 10,
        brokerageDiscount: 50,
        images: [
          'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&auto=format&fit=crop&q=80',
        ],
        amenities: ['WiFi', 'AC', 'Attached Bath', 'Power Backup', 'Geyser', 'Washing Machine', 'Housekeeping'],
        furnishing: 'Furnished',
        bedrooms: 1,
        baths: 1,
        roomSharing: 'Single Private',
        owner: demoSeller._id,
        ownerContact: {
          name: 'Venkat Reddy',
          phone: '+91 99890 12345',
          whatsapp: true,
        },
        contactRevealsCount: 19,
        viewsCount: 220,
        status: 'available',
        isVerified: true,
      },
      {
        title: 'Spacious 2BHK Flat near Hinjewadi IT Park Phase 1',
        description: 'Well-ventilated east-facing 2BHK flat in a premium high-rise society. Amenities include swimming pool, gym, clubhouse, squash court, landscaped podium garden, and children play area. Just 5 minutes from IT offices.',
        propertyType: '2BHK',
        listingType: 'Rent',
        location: {
          address: 'Blue Ridge Township, Phase 1, Hinjewadi',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411057',
          landmark: 'Near Cognizant Campus',
        },
        price: 26000,
        brokeragePercentage: 15,
        brokerageDiscount: 10,
        images: [
          'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200&auto=format&fit=crop&q=80',
        ],
        amenities: ['WiFi', 'Lift', 'Parking', 'Gym', 'Swimming Pool', 'Security', 'Clubhouse', 'Power Backup'],
        furnishing: 'Semi-Furnished',
        bedrooms: 2,
        baths: 2,
        owner: demoSeller._id,
        ownerContact: {
          name: 'Nitin Deshmukh',
          phone: '+91 97654 32109',
          whatsapp: true,
        },
        contactRevealsCount: 22,
        viewsCount: 280,
        status: 'available',
        isVerified: true,
      },
    ];

    await Property.insertMany(sampleProperties);

    return NextResponse.json({
      message: 'Database seeded successfully with initial verified properties!',
      count: sampleProperties.length,
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ message: error.message || 'Seed failed' }, { status: 500 });
  }
}
