require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true, // Allow all origins for mobile apps & web
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'amarghor_super_secure_jwt_token_key_2026_xyz987';
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dqrhieirs';
const CLOUD_API_KEY = process.env.CLOUDINARY_API_KEY || '796724996161429';
const CLOUD_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'imdciz1F9_cA7i0P-SXND2bRlos';

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_API_SECRET,
  secure: true,
});

// Connect to MongoDB Atlas Cloud
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log('✅ Connected to MongoDB Atlas Cloud Database');
  } catch (err) {
    console.error('❌ MongoDB Atlas connection error:', err.message);
  }
}
connectDB();

// ----------------- SCHEMAS & MODELS -----------------
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['buyer', 'seller'], default: 'buyer' },
    phone: { type: String, trim: true },
    agencyName: { type: String, trim: true },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  },
  { timestamps: true }
);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const PropertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    propertyType: { type: String, required: true, index: true },
    listingType: { type: String, default: 'Rent', index: true },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true, index: true },
      state: String,
      pincode: String,
      landmark: String,
    },
    price: { type: Number, required: true, index: true },
    brokeragePercentage: { type: Number, default: 0, min: 0, max: 100 },
    brokerageDiscount: { type: Number, default: 0, min: 0, max: 100 },
    images: { type: [String], required: true },
    amenities: { type: [String], default: [] },
    furnishing: { type: String, default: 'Semi-Furnished' },
    bedrooms: { type: Number, default: 1 },
    baths: { type: Number, default: 1 },
    roomSharing: { type: String, default: 'Private' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ownerContact: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      whatsapp: { type: Boolean, default: true },
    },
    contactRevealsCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    status: { type: String, enum: ['available', 'rented', 'sold'], default: 'available', index: true },
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);
const Property = mongoose.models.Property || mongoose.model('Property', PropertySchema);

// ----------------- AUTH HELPERS -----------------
function getUserFromReq(req) {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const user = getUserFromReq(req);
  if (!user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  req.user = user;
  next();
}

function maskPhoneNumber(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) {
    const last2 = digits.slice(-2);
    return `+91 ••••• ••${last2}`;
  }
  return '+91 ••••• •••••';
}

// ----------------- ROUTES -----------------

// Health check
app.get(['/', '/health', '/api/health'], async (req, res) => {
  await connectDB();
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected to MongoDB Atlas Cloud' : 'Connecting';
  const propertyCount = await Property.countDocuments().catch(() => 0);
  res.json({
    status: 'ok',
    message: 'AmarGhor API Backend is running',
    database: dbStatus,
    cloudProperties: propertyCount,
    timestamp: new Date().toISOString(),
  });
});

// AUTH: Sign Up
app.post('/api/auth/signup', async (req, res) => {
  try {
    await connectDB();
    const { name, email, password, role = 'buyer', phone, agencyName } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role === 'seller' ? 'seller' : 'buyer',
      phone: phone?.trim(),
      agencyName: agencyName?.trim(),
    });
    const token = jwt.sign(
      { userId: newUser._id.toString(), email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        agencyName: newUser.agencyName,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Signup failed' });
  }
});

// AUTH: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        agencyName: user.agencyName,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Login failed' });
  }
});

// AUTH: Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// AUTH: Current User
app.get('/api/auth/me', async (req, res) => {
  const tokenUser = getUserFromReq(req);
  if (!tokenUser) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  await connectDB();
  const user = await User.findById(tokenUser.userId).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ user });
});

// PROPERTIES: List with search & filters
app.get('/api/properties', async (req, res) => {
  try {
    await connectDB();
    const {
      search,
      propertyType,
      city,
      minPrice,
      maxPrice,
      furnishing,
      amenities,
      sort = 'newest',
      page = 1,
      limit = 9,
    } = req.query;

    const filter = { status: 'available' };
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
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (furnishing && furnishing !== 'all') {
      filter.furnishing = furnishing;
    }
    if (amenities) {
      const list = amenities.split(',').map((a) => a.trim()).filter(Boolean);
      if (list.length > 0) filter.amenities = { $all: list };
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };
    if (sort === 'brokerage_asc') sortOptions = { brokeragePercentage: 1, price: 1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [properties, totalCount] = await Promise.all([
      Property.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .populate('owner', 'name agencyName')
        .lean(),
      Property.countDocuments(filter),
    ]);

    const sanitized = properties.map((prop) => ({
      ...prop,
      ownerContact: {
        ...prop.ownerContact,
        phone: maskPhoneNumber(prop.ownerContact?.phone),
        isMasked: true,
      },
    }));

    res.json({
      properties: sanitized,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum) || 1,
        hasMore: skip + properties.length < totalCount,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error fetching properties' });
  }
});

// PROPERTIES: Current Seller's Listings
app.get('/api/properties/user', requireAuth, async (req, res) => {
  try {
    await connectDB();
    const properties = await Property.find({ owner: req.user.userId }).sort({ createdAt: -1 }).lean();
    res.json({ properties });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PROPERTIES: Detail by ID
app.get('/api/properties/:id', async (req, res) => {
  try {
    await connectDB();
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    )
      .populate('owner', 'name agencyName email')
      .lean();

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const currentUser = getUserFromReq(req);
    const isOwner = currentUser && property.owner?._id?.toString() === currentUser.userId;

    const sanitized = {
      ...property,
      ownerContact: {
        ...property.ownerContact,
        phone: isOwner ? property.ownerContact?.phone : maskPhoneNumber(property.ownerContact?.phone),
        isMasked: !isOwner,
      },
    };

    res.json({ property: sanitized, isOwner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PROPERTIES: Create (Saves directly to MongoDB Cloud)
app.post('/api/properties', requireAuth, async (req, res) => {
  try {
    await connectDB();
    const data = req.body;
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

    if (!title || !description || !propertyType || !location?.address || !location?.city || !price) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'At least one property image is required' });
    }

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
      price: Number(price),
      brokeragePercentage: Number(brokeragePercentage) || 0,
      brokerageDiscount: Number(brokerageDiscount) || 0,
      images,
      amenities: Array.isArray(amenities) ? amenities : [],
      furnishing,
      bedrooms: Number(bedrooms) || 1,
      baths: Number(baths) || 1,
      roomSharing: roomSharing || 'Private',
      owner: req.user.userId,
      ownerContact: {
        name: ownerContact?.name?.trim() || req.user.name,
        phone: ownerContact?.phone?.trim(),
        whatsapp: Boolean(ownerContact?.whatsapp),
      },
      status: 'available',
      isVerified: true,
    });

    console.log('✅ New Property saved to MongoDB Cloud Atlas:', newProperty._id);

    res.status(201).json({
      message: 'Property created and shared in MongoDB Cloud successfully',
      property: newProperty,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create property' });
  }
});

// PROPERTIES: Update (Updates in MongoDB Cloud)
app.put('/api/properties/:id', requireAuth, async (req, res) => {
  try {
    await connectDB();
    const existing = await Property.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (existing.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to edit this listing' });
    }

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
      if (req.body[key] !== undefined) {
        existing[key] = req.body[key];
      }
    });

    const updated = await existing.save();
    console.log('✅ Property updated in MongoDB Cloud Atlas:', updated._id);

    res.json({
      message: 'Property updated in MongoDB Cloud successfully',
      property: updated,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Update failed' });
  }
});

// PROPERTIES: Delete
app.delete('/api/properties/:id', requireAuth, async (req, res) => {
  try {
    await connectDB();
    const existing = await Property.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (existing.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property deleted from MongoDB Cloud successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PROPERTIES: Reveal Contact (Lead tracker)
app.post('/api/properties/:id/reveal-contact', async (req, res) => {
  try {
    await connectDB();
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $inc: { contactRevealsCount: 1 } },
      { new: true }
    );
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json({
      revealed: true,
      contact: {
        name: property.ownerContact?.name,
        phone: property.ownerContact?.phone,
        whatsapp: property.ownerContact?.whatsapp,
      },
      revealsCount: property.contactRevealsCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPLOAD: Image upload to Cloudinary (with fallback)
app.post('/api/upload', requireAuth, async (req, res) => {
  try {
    const { base64 } = req.body;
    if (!base64) {
      return res.status(400).json({ message: 'Base64 image string is required' });
    }

    // Check size limit: 1 MB
    const stringLength = base64.length - (base64.indexOf(',') + 1);
    const sizeInBytes = Math.ceil((stringLength * 3) / 4);
    if (sizeInBytes > 1024 * 1024) {
      return res.status(400).json({ message: 'Image exceeds 1MB limit' });
    }

    let url = '';
    try {
      const result = await cloudinary.uploader.upload(base64, {
        folder: 'amarghor_properties',
        resource_type: 'image',
        transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
      });
      url = result.secure_url;
    } catch (cloudErr) {
      console.warn('Cloudinary upload warning (using compressed data URL fallback):', cloudErr.message);
      url = base64;
    }

    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Image upload failed' });
  }
});

// WISHLIST: Get & Update
app.get('/api/wishlist', requireAuth, async (req, res) => {
  try {
    await connectDB();
    const user = await User.findById(req.user.userId).populate('wishlist');
    res.json({ wishlist: user?.wishlist || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/wishlist', requireAuth, async (req, res) => {
  try {
    await connectDB();
    const { propertyId, action } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (action === 'add') {
      if (!user.wishlist.includes(propertyId)) user.wishlist.push(propertyId);
    } else if (action === 'remove') {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== propertyId);
    }
    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start Express Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
