'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import OperativeForm from '@/components/OperativeForm';
import { Loader2 } from 'lucide-react';

function NewNoteFormContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || undefined;
  const print = searchParams.get('print') === 'true';

  return <OperativeForm noteId={id} initialPrint={print} />;
}

export default function NewNotePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen space-y-2">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Initializing form...</p>
      </div>
    }>
      <NewNoteFormContent />
    </Suspense>
  );
}
