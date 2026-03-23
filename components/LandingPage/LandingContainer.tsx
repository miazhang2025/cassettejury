'use client';

import React from 'react';
import { useRandomGibberish } from '@/hooks/useRandomGibberish';
import { SOUND_FOLDERS } from '@/config/sounds';
import { useApp } from '@/context/AppContext';

interface LandingContainerProps {
  children: React.ReactNode;
}

export const LandingContainer: React.FC<LandingContainerProps> = ({ children }) => {
  const { settings } = useApp();

  // Play ambient gibberish sounds during landing page
  useRandomGibberish({
    folderPath: SOUND_FOLDERS.GIBBERISH,
    enabled: settings.soundEnabled,
  });

  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#9B0808' }}>
      {/* Red outer frame */}
      <div className="w-full h-full p-4 sm:p-5 md:p-8 flex items-center justify-center">
        {/* White inner frame */}
        <div
          className="w-full h-full rounded-sm flex flex-col overflow-hidden"
          style={{ backgroundColor: '#E5E5E1'}}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
