'use client';

import { Container, Title, Stack, Group, Button, Paper } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import FileUploadPanel from '@/components/FileUploadPanel/FileUploadPanel';
import SourceTable from '@/components/SourceTable/SourceTable';
import { SourceDocument } from '@/types/sources';

export default function DashboardSourcesPage() {
  const queryClient = useQueryClient();

  // Fetching documents
  const { data: records = [], isLoading, refetch, isFetching } = useQuery<SourceDocument[]>({
    queryKey: ['sources'],
    queryFn: async () => {
      const response = await fetch('/api/sources');
      if (!response.ok) {throw new Error('Failed to fetch sources');}
      return response.json();
    },
  });

  // Uploading documents
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => formData.append('file', file));

      const response = await fetch('/api/file-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {throw new Error('Upload failed');}
      return response.json();
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Files uploaded successfully!',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['sources'] });
    },
    onError: (error) => {
      notifications.show({
        title: 'Upload Error',
        message: error instanceof Error ? error.message : 'Failed to upload files',
        color: 'red',
      });
    },
  });

  // Deleting documents
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/sources?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!response.ok) {throw new Error('Delete failed');}
      return response.json();
    },
    onSuccess: () => {
      notifications.show({
        title: 'Deleted',
        message: 'Source document removed successfully',
        color: 'blue',
      });
      queryClient.invalidateQueries({ queryKey: ['sources'] });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete source',
        color: 'red',
      });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this source?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleView = (record: SourceDocument) => {
    alert(`Viewing details for: ${record.filename}`);
  };

  return (
    <Container fluid p="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={2}>Manage Sources</Title>
          <Button 
            variant="light" 
            leftSection={<IconRefresh size={16} />}
            onClick={() => refetch()}
            loading={isLoading || isFetching}
          >
            Refresh
          </Button>
        </Group>

        <Paper p="md" withBorder radius="md">
          <Title order={4} mb="md">Upload New Documents</Title>
          <FileUploadPanel 
            onDrop={(files) => uploadMutation.mutate(files)}
            loading={uploadMutation.isPending}
          />
        </Paper>

        <Paper p="md" withBorder radius="md">
           <Title order={4} mb="md">Document Library</Title>
           <SourceTable 
             records={records} 
             fetching={isLoading}
             onDelete={handleDelete}
             onView={handleView}
           />
        </Paper>
      </Stack>
    </Container>
  );
}
