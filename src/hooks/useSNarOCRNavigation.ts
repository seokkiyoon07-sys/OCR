'use client';

import { useRouter } from 'next/navigation';

export const useSNarOCRNavigation = () => {
  const router = useRouter();

  const navigateTo = (page: string) => {
    switch (page) {
      case 'landing':
        router.push('/');
        break;
      case 'upload':
        router.push('/upload');
        break;
      case 'results':
        router.push('/results');
        break;
      case 'pricing':
        router.push('/pricing');
        break;
      case 'faq':
        router.push('/faq');
        break;
      default:
        router.push('/');
    }
  };

  return { navigateTo };
};
