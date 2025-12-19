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
      case 'individual-results':
        router.push('/individual-results');
        break;
      case 'pricing':
        router.push('/pricing');
        break;
      case 'faq':
        router.push('/faq');
        break;
      case 'answer-upload':
        router.push('/answer-upload');
        break;
      case 'admin-students':
        router.push('/admin-students');
        break;
      case 'admin-exams':
        router.push('/admin-exams');
        break;
      default:
        router.push('/');
    }
  };

  return { navigateTo };
};
