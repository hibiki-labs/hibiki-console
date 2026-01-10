import { NextRequest, NextResponse } from 'next/server';
import { listFiles, deleteFile } from '@/lib/minIO';
import { SourceDocument } from '@/types/sources';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const files = await listFiles();

    const documents: SourceDocument[] = files.map((file) => {
      // metadata keys are often returned in lowercase by MinIO client
      const meta = file.metaData || {};
      const originalName = meta['original-name'] || meta['Original-Name'] || file.name;
      const mimeType = meta['content-type'] || meta['Content-Type'] || 'application/octet-stream';
      
      return {
        id: file.name,
        filename: originalName,
        fileSize: file.size,
        mimeType: mimeType,
        uploadedAt: new Date(file.lastModified).toISOString(),
        uploadedBy: 'system', // Placeholder as we don't store user info in metadata yet
        status: 'uploaded', // Default status for MinIO files
      };
    });

    // Sort by uploadedAt descending (newest first)
    documents.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sources' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    await deleteFile(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting source:', error);
    return NextResponse.json(
      { error: 'Failed to delete source' },
      { status: 500 }
    );
  }
}
