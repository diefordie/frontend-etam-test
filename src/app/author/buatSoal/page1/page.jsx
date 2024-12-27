import { Suspense } from 'react';
import MembuatSoal from './membuatSoal';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MembuatSoal />
    </Suspense>
  );
}