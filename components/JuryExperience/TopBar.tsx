'use client';

import React from 'react';
import { toPng } from 'html-to-image';

interface TopBarProps {
  onMenuClick: () => void;
  style?: React.CSSProperties;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick, style }) => {
  const buildFontEmbedCSS = async (): Promise<string> => {
    try {
      const googleFontsUrl = 'https://fonts.googleapis.com/css2?family=Blaka&family=IBM+Plex+Mono:ital,wght@0,400;0,700;1,400&display=swap';
      const cssResponse = await fetch(googleFontsUrl);
      let css = await cssResponse.text();

      // Find all font file URLs and replace with base64 data URLs
      const fontUrls = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g)].map(m => m[1]);
      for (const url of fontUrls) {
        try {
          const fontRes = await fetch(url);
          const blob = await fontRes.blob();
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          css = css.replace(`url(${url})`, `url(${base64})`);
        } catch { /* skip individual font on error */ }
      }
      return css;
    } catch {
      return '';
    }
  };

  const handleScreenshot = async () => {
    try {
      const fontEmbedCSS = await buildFontEmbedCSS();
      const dataUrl = await toPng(document.body, {
        quality: 1,
        pixelRatio: 2,
        fontEmbedCSS,
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `cassette-jury-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Screenshot failed:', error);
      captureCanvasOnly();
    }
  };

  const captureCanvasOnly = () => {
    const canvasElement = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvasElement || canvasElement.width === 0 || canvasElement.height === 0) {
      console.error('Canvas not found or has invalid dimensions');
      return;
    }

    const dataUrl = canvasElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `cassette-jury-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed top-0 left-0 w-full h-16 md:h-20 px-4 md:px-6 lg:px-12 flex items-center justify-between"
      style={style}
    >
      {/* Menu button */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-gray-200 transition mt-2 cursor-pointer"
        style={{ backgroundColor: 'transparent' }}
        aria-label="Open menu"
      >
        <img
          src="/menu.svg"
          alt="Menu"
          className="w-8 h-8 md:w-10 md:h-10"
        />
      </button>

      {/* Screenshot button */}
      <button
        onClick={handleScreenshot}
        className="p-2 rounded-lg hover:bg-gray-200 transition mt-2 cursor-pointer"
        style={{ backgroundColor: 'transparent' }}
        aria-label="Take screenshot"
      >
        <svg
          className="w-8 h-8 md:w-10 md:h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>
    </div>
  );
};
