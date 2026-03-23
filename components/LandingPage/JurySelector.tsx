'use client';

import React, { useState, useCallback } from 'react';
import { JuryMember } from '@/config/juries';
import { JurySelectorCard } from './JurySelectorCard';
import { APP_CONSTANTS } from '@/config/constants';

interface JurySelectorProps {
  allJuries: JuryMember[];
  onSelectionChange: (selected: JuryMember[]) => void;
  onProceed: () => void;
}

export const JurySelector: React.FC<JurySelectorProps> = ({
  allJuries,
  onSelectionChange,
  onProceed,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(allJuries.slice(0, APP_CONSTANTS.SELECTED_JURIES_COUNT).map((j) => j.id))
  );

  const handleSelectJury = useCallback(
    (jury: JuryMember) => {
      const newSelected = new Set(selectedIds);

      if (newSelected.has(jury.id)) {
        // Deselect
        newSelected.delete(jury.id);
      } else if (newSelected.size < APP_CONSTANTS.SELECTED_JURIES_COUNT) {
        // Select if not at max
        newSelected.add(jury.id);
      }

      setSelectedIds(newSelected);

      const selectedJuries = allJuries.filter((j) => newSelected.has(j.id));
      onSelectionChange(selectedJuries);
    },
    [selectedIds, allJuries, onSelectionChange]
  );

  const isMaxSelected = selectedIds.size >= APP_CONSTANTS.SELECTED_JURIES_COUNT;

  return (
    <div
      className="flex-1 overflow-hidden flex flex-col px-3 sm:px-4 md:px-8 py-2 sm:py-3 md:py-4"
      style={{ borderColor: '#CCCCCC' }}
    >
      {/* Counter */}
      <div className="mb-2 text-xs md:text-sm font-medium text-center" style={{ color: '#4a4a4a' }}>
        Select {APP_CONSTANTS.SELECTED_JURIES_COUNT} of {APP_CONSTANTS.MAX_JURIES} jurors
      </div>

      {/* Grid of circular thumbnails - responsive: 2 cols mobile, 3 tablet, 6 desktop */}
      <div className="flex-1 overflow-y-auto w-full" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', maxWidth: '900px', margin: '0 auto', paddingRight: '8px', alignContent: 'start' }}>
        {allJuries.map((jury) => (
          <JurySelectorCard
            key={jury.id}
            jury={jury}
            isSelected={selectedIds.has(jury.id)}
            onSelect={handleSelectJury}
            maxSelected={isMaxSelected}
          />
        ))}
      </div>

      {/* Selection count indicator */}
      <div
        className="mt-2 text-center text-xs md:text-sm font-medium"
        style={{
          color: selectedIds.size === APP_CONSTANTS.SELECTED_JURIES_COUNT ? '#9B0808' : '#4a4a4a',
        }}
      >
        {selectedIds.size}/{APP_CONSTANTS.SELECTED_JURIES_COUNT} selected
      </div>
    </div>
  );
};
