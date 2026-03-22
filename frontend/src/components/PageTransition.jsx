'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { navigateWithTransition } from '@/lib/navigation';

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleNavigation = (event) => {
      const { href, replace = false, scroll = true } = event.detail || {};
      if (!href || href === pathname) return;
      navigateWithTransition(router, href, { replace, scroll });
    };

    window.addEventListener('taskflow:navigate', handleNavigation);
    return () => window.removeEventListener('taskflow:navigate', handleNavigation);
  }, [pathname, router]);

  return (
    <div key={pathname} className="page-transition-shell animate-page-enter">
      {children}
    </div>
  );
}
