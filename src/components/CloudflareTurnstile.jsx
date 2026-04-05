import { useEffect, useRef, useState } from 'react';

const SITE_KEY = '1x00000000000000000000AA'; // Cloudflare test key (always passes)

/**
 * Cloudflare Turnstile widget component.
 * Renders the Turnstile checkbox and calls onVerify with the token.
 *
 * Props:
 *   onVerify(token) - called when user passes verification
 *   onExpire()      - called when token expires
 *   theme           - 'dark' | 'light' | 'auto' (default: 'dark')
 */
export default function CloudflareTurnstile({ onVerify, onExpire, theme = 'dark' }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for the Turnstile script to load
    const checkReady = () => {
      if (window.turnstile) {
        setIsReady(true);
        return;
      }
      setTimeout(checkReady, 100);
    };
    checkReady();

    return () => {
      // Cleanup widget on unmount
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!isReady || !containerRef.current) return;

    // Remove existing widget if re-rendering
    if (widgetIdRef.current !== null) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch (e) { /* ignore */ }
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      theme: theme,
      callback: (token) => {
        onVerify?.(token);
      },
      'expired-callback': () => {
        onExpire?.();
      },
    });
  }, [isReady, theme, onVerify, onExpire]);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        justifyContent: 'center',
        margin: '0.75rem 0',
        minHeight: '65px',
      }}
    />
  );
}
