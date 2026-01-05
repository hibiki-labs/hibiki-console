'use client';

import { Container, Title, Stack, Group, Button, Paper } from '@mantine/core';
import { useState } from 'react';
import { IconRefresh } from '@tabler/icons-react';
import FileUploadPanel from '@/components/FileUploadPanel/FileUploadPanel';
import SourceTable from '@/components/SourceTable/SourceTable';
import { SourceDocument } from '@/types/sources';

// Mock data for initial display
const MOCK_DATA: SourceDocument[] = [
  {
    id: '1',
    filename: 'quarterly_report_q1.pdf',
    fileSize: 2500000,
    mimeType: 'application/pdf',
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'user-1',
    status: 'indexed',
  },
  {
    id: '2',
    filename: 'onboarding_guide.docx',
    fileSize: 1200000,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadedAt: new Date(Date.now() - 86400000).toISOString(),
    uploadedBy: 'user-1',
    status: 'processing',
  },
  {
    id: '3',
    filename: 'api_spec_v1.md',
    fileSize: 45000,
    mimeType: 'text/markdown',
    uploadedAt: new Date(Date.now() - 172800000).toISOString(),
    uploadedBy: 'user-2',
    status: 'failed',
  },
];

export default function DashboardSourcesPage() {
  const [records, setRecords] = useState<SourceDocument[]>(MOCK_DATA);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this source?')) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleView = (record: SourceDocument) => {
    alert(`Viewing details for: ${record.filename}`);
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleUpload = async (files: File[]) => {
    setUploading(true);
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('file', file);
    });

    try {
      const response = await fetch('/api/file-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Add new files to the list
        const newRecords: SourceDocument[] = result.data.map((file: any) => ({
          id: file.fileName, // Using filename as ID for now
          filename: file.originalName,
          fileSize: file.size,
          mimeType: file.mimeType,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'current-user', // Placeholder
          status: 'uploaded',
        }));
        
        setRecords((prev) => [...newRecords, ...prev]);
        alert('Files uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container fluid p="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={2}>Manage Sources</Title>
          <Button 
            variant="light" 
            leftSection={<IconRefresh size={16} />}
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
        </Group>

        <Paper p="md" withBorder radius="md">
          <Title order={4} mb="md">Upload New Documents</Title>
          <FileUploadPanel 
            onDrop={handleUpload}
            loading={uploading}
          />
        </Paper>

        <Paper p="md" withBorder radius="md">
           <Title order={4} mb="md">Document Library</Title>
           <SourceTable 
             records={records} 
             fetching={loading}
             onDelete={handleDelete}
             onView={handleView}
           />
        </Paper>
      </Stack>
    </Container>
  );
}
