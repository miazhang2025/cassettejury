// Single source of truth for the "can this browser handle many GLBs?" call.
//
// Policy: best visuals everywhere — real 3D models on desktop, Android, and
// Chrome on iOS. Only iOS WebKit (Safari, in-app browsers) gets the image
// fallback, because WKWebView's hard memory limits OOM the tab with 9-16
// GLBs in flight.
export function isLowMemoryWebView(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent;
  const classicIOS = /iPad|iPhone|iPod/.test(ua);
  // Modern iPadOS Safari masquerades as macOS ("MacIntel") but is still
  // WKWebView with the same memory limits — detect it via touch support.
  const masqueradingIPad =
    navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

  const isChromeOnIOS = /CriOS/.test(ua); // Chrome on iOS handles the GLBs fine

  return (classicIOS || masqueradingIPad) && !isChromeOnIOS;
}
