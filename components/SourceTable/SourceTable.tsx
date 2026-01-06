'use client';

import { DataTable } from 'mantine-datatable';
import { Badge, Group, ActionIcon, Text, Box } from '@mantine/core';
import { IconTrash, IconEye } from '@tabler/icons-react';
import { SourceDocument, DocumentStatus } from '@/types/sources';
import 'mantine-datatable/styles.css';

interface SourceTableProps {
  records: SourceDocument[];
  fetching?: boolean;
  onDelete?: (id: string) => void;
  onView?: (record: SourceDocument) => void;
}

const getStatusColor = (status: DocumentStatus) => {
  switch (status) {
    case 'indexed':
      return 'green';
    case 'processing':
      return 'blue';
    case 'queued':
      return 'yellow';
    case 'failed':
      return 'red';
    case 'uploaded':
      return 'gray';
    case 'deleted':
      return 'dark';
    default:
      return 'gray';
  }
};

export default function SourceTable({ records, fetching, onDelete, onView }: SourceTableProps) {
  return (
    <Box>
      <DataTable<SourceDocument>
        withTableBorder
        borderRadius="sm"
        withColumnBorders
        striped
        highlightOnHover
        minHeight={150}
        fetching={fetching}
        records={records}
        columns={[
          {
            accessor: 'filename',
            title: 'File Name',
            sortable: true,
          },
          {
            accessor: 'fileSize',
            title: 'Size',
            render: ({ fileSize }) => <Text size="sm">{(fileSize / 1024 / 1024).toFixed(2)} MB</Text>,
          },
          {
            accessor: 'uploadedAt',
            title: 'Uploaded At',
            sortable: true,
            render: ({ uploadedAt }) => <Text size="sm">{new Date(uploadedAt).toLocaleDateString()}</Text>,
          },
          {
            accessor: 'status',
            title: 'Status',
            render: ({ status }) => (
              <Badge color={getStatusColor(status)} variant="light">
                {status.toUpperCase()}
              </Badge>
            ),
          },
          {
            accessor: 'actions',
            title: 'Actions',
            textAlign: 'right',
            render: (record) => (
              <Group gap={4} justify="right" wrap="nowrap">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="blue"
                  onClick={() => onView?.(record)}
                  aria-label="View details"
                >
                  <IconEye size={16} />
                </ActionIcon>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="red"
                  onClick={() => onDelete?.(record.id)}
                  aria-label="Delete source"
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
        noRecordsText="No sources found"
      />
    </Box>
  );
}
