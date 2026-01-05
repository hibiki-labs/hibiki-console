import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/minIO';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('file') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const uploadResults = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name}`;
      
      const metaData = {
        'Content-Type': file.type,
        'Original-Name': file.name,
      };

      await uploadFile(fileName, buffer, metaData);

      uploadResults.push({
        fileName,
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Files uploaded successfully',
      data: uploadResults 
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error during file upload' },
      { status: 500 }
    );
  }
}
