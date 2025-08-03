import { useEffect } from 'react';

export const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = title;
    
    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = 'Fact Zeel';
    };
  }, [title]);
};