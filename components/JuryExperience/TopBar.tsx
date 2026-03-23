'use client';

import React from 'react';

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  return (
    <div
      className="h-16 md:h-20 px-4 md:px-6 lg:px-12 flex items-center justify-between"
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

      {/* Spacer */}

    </div>
  );
};
