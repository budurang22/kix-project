import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router';
import { getPageTitle } from '../utils/page-title.js';
export default function NavigationEffects() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();
  const previousPath = useRef(null);
  useEffect(() => {
    document.title = `${getPageTitle(pathname)} | KIX.`;
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    document.getElementById('main')?.focus({ preventScroll: true });
    if (navigationType !== 'POP' && !hash)
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash, navigationType]);
  return null;
}
