# AmarGhor (আমার ঘর) - Production Real Estate & PG Listing Platform

A modern, high-performance real estate and PG/co-living listing platform built with **Next.js (App Router)**, **Tailwind CSS**, **MongoDB Atlas (Mongoose)**, and **Cloudinary**.

---

## 🚀 Key Features

### 1. Dual-Role Authentication
- **Public (Buyer/Tenant):** Explore verified flats & PGs, filter by city/type/budget, view dynamic pricing breakdowns, save favorites to wishlist, and reveal owner contacts.
- **Broker / Owner (Seller):** Dedicated dashboard to create, manage, edit, and delete listings. Real-time lead tracking (listing views & contact reveals).

### 2. Dynamic Pricing & Brokerage Transparency
- **Base Price / Rent** (e.g. ₹24,000 / month)
- **Brokerage Percentage** (0% to 100%)
- **Brokerage Discount Percentage** (e.g. 20% OFF)
- **Net Brokerage Payable** calculated dynamically
- **Total Estimated Move-in Outlay** (Base Rent + Final Brokerage) calculated in real-time on property cards, listing forms, and detail pages.

### 3. "Reveal Contact" Interactive Action
- Hides the seller's phone number by default (`+91 98XXX XXXXX`) with privacy blur/lock.
- On click, triggers `/api/properties/[id]/reveal-contact`, increments the lead counter, and reveals the number with instant **Call Now** (`tel:`) and **WhatsApp** chat buttons.

### 4. Interactive Dual-Thumb Price Range Slider
- Smooth dual-thumb slider allowing users to filter listings between custom minimum and maximum monthly rent limits with quick preset chips (e.g. Under ₹10k, ₹10k-₹25k, etc.).

### 5. Cloudinary Image Storage (< 1MB strictly enforced)
- Frontend client compression fallback + backend validation strictly enforcing file sizes strictly `< 1 MB`.
- Multiple image uploads with cover photo tag and gallery lightboxes.

### 6. Hardware-Accelerated 60/90/120 FPS Experience
- Smooth animations with `framer-motion`, GPU transforms (`translateZ(0)`), and low-overhead rendering.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS with custom emerald brand palette
- **Database:** MongoDB Atlas via Mongoose
- **Image Storage:** Cloudinary
- **Form Validation:** React Hook Form
- **Auth:** JWT (HTTP-only secure cookies) + bcryptjs password hashing
- **Icons:** Lucide React

---

## 📂 Project Structure

```
Amar_Ghor_APP/
├── .env                       # MongoDB, Cloudinary, JWT secrets
├── house.png                  # App brand logo
├── public/                    # Static assets (house.png, logo.png, favicon.ico)
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with SEO metadata & providers
│   │   ├── page.tsx           # Homepage feed with search, slider & filters
│   │   ├── property/
│   │   │   ├── [id]/page.tsx  # Dynamic property details & price calculator
│   │   │   └── new/page.tsx   # Property listing creation page
│   │   ├── dashboard/page.tsx # Owner / Broker analytics & listings
│   │   ├── wishlist/page.tsx  # Saved properties
│   │   ├── auth/
│   │   │   ├── login/page.tsx # Sign-in page (with 1-click demo button)
│   │   │   └── register/page.tsx # Dual-role registration
│   │   └── api/
│   │       ├── auth/          # signup, login, logout, me
│   │       ├── properties/    # CRUD, search, user listings, reveal-contact
│   │       ├── upload/        # Cloudinary <1MB validated image upload
│   │       ├── wishlist/      # Wishlist sync
│   │       └── seed/          # Initial verified sample properties
│   ├── components/
│   │   ├── Navbar.tsx         # Brand logo, role badge & navigation
│   │   ├── Footer.tsx         # City links, disclaimers & copyright
│   │   ├── PropertyCard.tsx   # Card with dynamic pricing & heart button
│   │   ├── PriceRangeSlider.tsx # Dual-thumb interactive slider
│   │   ├── PropertyListingForm.tsx # Multi-image form with live calculation
│   │   ├── PricingBreakdownCard.tsx # Detailed cost breakdown
│   │   ├── ContactRevealButton.tsx # Masked/unmasked call & whatsapp action
│   │   ├── ImageGallery.tsx   # Lightbox gallery with thumbnails
│   │   └── FilterSidebar.tsx  # Property types, cities & price filters
│   ├── context/
│   │   ├── AuthContext.tsx    # User session state
│   │   └── WishlistContext.tsx# Saved properties state with localStorage
│   ├── lib/
│   │   ├── mongodb.ts         # Cached Mongoose connection
│   │   ├── cloudinary.ts      # Cloudinary uploader with 1MB guard
│   │   ├── jwt.ts             # JWT token sign & verify
│   │   ├── pricing.ts         # Dynamic pricing calculations & currency formatting
│   │   └── utils.ts           # Tailwind merge & phone masking helpers
│   └── models/
│       ├── User.ts            # User schema (Buyer / Seller)
│       └── Property.ts        # Property schema with indexing
```

---

## 📱 Android APK (Mobile App)

The production Android APK has been built and is located in the project root:
- **File:** `AmarGhor.apk` (~3.79 MB)
- **App Name:** AmarGhor
- **App Logo:** Configured with `house.png`
- **Package ID:** `com.amarghor.app`

### How to Install on Your Mobile Phone:
1. Transfer `AmarGhor.apk` to your phone via **WhatsApp document, Google Drive, Bluetooth, or USB cable**.
2. Tap the APK file on your phone and tap **Install** (allow "Install unknown apps" if prompted).
3. Start the AmarGhor backend on your computer so your phone can communicate over your Wi-Fi:
   ```bash
   npm run dev:mobile
   ```
   *(Or `npm run start` in production mode)*.
4. Open **AmarGhor** on your mobile phone to enjoy the full native experience with smooth 60/90/120 FPS transitions, contact reveals, image uploads, and live listings!

---

## 🏃 Running the Application

1. **Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

2. **Production Build & Start:**
   ```bash
   npm run build
   npm run start
   ```

3. **Demo Broker/Owner Credentials:**
   - Email: `seller@amarghor.com`
   - Password: `password123`
   *(Or click "Quick Demo Access" on `/auth/login` to auto-fill)*
