import { Suspense } from 'react';
import MembuatSoalCPNS from './membuatSoalCPNS';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MembuatSoalCPNS />
    </Suspense>
  );
}