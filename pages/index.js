/**
 * Root route — always redirect to the main app dashboard.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/progress');
  }, [router]);

  return null;
}
