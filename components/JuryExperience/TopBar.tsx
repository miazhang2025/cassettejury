'use client';

import React from 'react';

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  return (
    <div
      className="h-20 md:h-20 px-6 md:px-12 flex items-center justify-between"
    >
      {/* Menu button */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-gray-200 transition mt-4 cursor-pointer"
        style={{ backgroundColor: 'transparent' }}
        aria-label="Open menu"
      >
        <img
          src="/menu.svg"
          alt="Menu"
          className="w-10 h-10"
        />
      </button>

      {/* Spacer */}

    </div>
  );
};
