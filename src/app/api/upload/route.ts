import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { getUserFromRequest } from '@/lib/jwt';

export const runtime = 'nodejs';

// Max file size allowed strictly 1 MB
const MAX_FILE_SIZE = 1024 * 1024; // 1,048,576 bytes

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { message: 'Authentication required to upload images' },
        { status: 401 }
      );
    }

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          { message: 'No file provided in form data' },
          { status: 400 }
        );
      }

      // Backend validation: strictly under 1 MB
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            message: `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds strictly allowed limit of 1 MB. Please compress or choose a smaller image.`,
          },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const base64Data = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;

      let url = '';
      try {
        url = await uploadImageToCloudinary(base64Data, 'amarghor_properties');
      } catch (cloudErr: any) {
        console.warn('Cloudinary upload warning (using compressed data URL fallback):', cloudErr.message);
        url = base64Data;
      }

      return NextResponse.json({
        url,
        size: file.size,
        name: file.name,
      });
    } else if (contentType.includes('application/json')) {
      const { base64 } = await req.json();

      if (!base64) {
        return NextResponse.json(
          { message: 'Base64 image string is required' },
          { status: 400 }
        );
      }

      let url = '';
      try {
        url = await uploadImageToCloudinary(base64, 'amarghor_properties');
      } catch (cloudErr: any) {
        console.warn('Cloudinary upload warning (using compressed base64 fallback):', cloudErr.message);
        url = base64;
      }

      return NextResponse.json({ url });
    }

    return NextResponse.json(
      { message: 'Unsupported content-type. Please use multipart/form-data or application/json.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { message: error.message || 'Image upload failed' },
      { status: 400 }
    );
  }
}
