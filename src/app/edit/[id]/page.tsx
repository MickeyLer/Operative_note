'use client';

import { use } from 'react';
import OperativeForm from '@/components/OperativeForm';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default function EditNotePage({ params }: EditPageProps) {
  const resolvedParams = use(params);
  return <OperativeForm noteId={resolvedParams.id} />;
}
