'use client';

import React from 'react';

interface LandingContainerProps {
  children: React.ReactNode;
}

export const LandingContainer: React.FC<LandingContainerProps> = ({ children }) => {
  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#9B0808' }}>
      {/* Red outer frame */}
      <div className="w-full h-full p-5 md:p-8 flex items-center justify-center">
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
