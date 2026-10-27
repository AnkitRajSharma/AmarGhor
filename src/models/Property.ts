import mongoose, { Document, Model, Schema } from 'mongoose';
import './User';

export type PropertyType = 'PG' | '1BHK' | '2BHK' | '3BHK' | 'Flat' | 'House' | 'Room';
export type ListingType = 'Rent' | 'Sale' | 'PG/Co-Living';
export type FurnishingType = 'Furnished' | 'Semi-Furnished' | 'Unfurnished';
export type PropertyStatus = 'available' | 'rented' | 'sold';

export interface IProperty extends Document {
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  location: {
    address: string;
    city: string;
    state?: string;
    pincode?: string;
    landmark?: string;
  };
  price: number; // Base Price / Monthly Rent
  brokeragePercentage: number; // 0% to 100%
  brokerageDiscount: number; // 0% to 100% discount on brokerage
  images: string[];
  amenities: string[];
  furnishing: FurnishingType;
  bedrooms?: number;
  baths?: number;
  roomSharing?: string;
  owner: mongoose.Types.ObjectId;
  ownerContact: {
    name: string;
    phone: string;
    whatsapp?: boolean;
  };
  contactRevealsCount: number;
  viewsCount: number;
  status: PropertyStatus;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a property title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide property details'],
      trim: true,
    },
    propertyType: {
      type: String,
      required: [true, 'Property type is required'],
      enum: ['PG', '1BHK', '2BHK', '3BHK', 'Flat', 'House', 'Room'],
      index: true,
    },
    listingType: {
      type: String,
      enum: ['Rent', 'Sale', 'PG/Co-Living'],
      default: 'Rent',
      index: true,
    },
    location: {
      address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        index: true,
      },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      landmark: { type: String, trim: true },
    },
    price: {
      type: Number,
      required: [true, 'Price / Rent is required'],
      min: [0, 'Price must be positive'],
      index: true,
    },
    brokeragePercentage: {
      type: Number,
      default: 0,
      min: [0, 'Brokerage percentage cannot be less than 0'],
      max: [100, 'Brokerage percentage cannot exceed 100'],
    },
    brokerageDiscount: {
      type: Number,
      default: 0,
      min: [0, 'Discount percentage cannot be less than 0'],
      max: [100, 'Discount percentage cannot exceed 100'],
    },
    images: {
      type: [String],
      validate: {
        validator: function (val: string[]) {
          return val.length > 0;
        },
        message: 'At least one property image is required',
      },
    },
    amenities: {
      type: [String],
      default: [],
    },
    furnishing: {
      type: String,
      enum: ['Furnished', 'Semi-Furnished', 'Unfurnished'],
      default: 'Semi-Furnished',
    },
    bedrooms: {
      type: Number,
      default: 1,
      min: 0,
    },
    baths: {
      type: Number,
      default: 1,
      min: 0,
    },
    roomSharing: {
      type: String,
      default: 'Private',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ownerContact: {
      name: {
        type: String,
        required: [true, 'Contact person name is required'],
      },
      phone: {
        type: String,
        required: [true, 'Contact phone number is required'],
      },
      whatsapp: {
        type: Boolean,
        default: true,
      },
    },
    contactRevealsCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['available', 'rented', 'sold'],
      default: 'available',
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for search
PropertySchema.index({
  title: 'text',
  description: 'text',
  'location.city': 'text',
  'location.address': 'text',
});

const Property: Model<IProperty> =
  mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema);

export default Property;
