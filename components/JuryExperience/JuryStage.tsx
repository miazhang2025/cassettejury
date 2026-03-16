'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useApp } from '@/context/AppContext';
import { useThreeJsScene } from '@/hooks/useThreeJsScene';
import { BlobHoverCard } from './BlobHoverCard';
import { APP_CONSTANTS } from '@/config/constants';
import { DiscussionResult } from '@/types/app';

interface JuryStageProps {
  onFightComplete?: () => void;
  triggerFight?: boolean;
  showResults?: boolean;
  discussionResult?: DiscussionResult | null;
}

export const JuryStage: React.FC<JuryStageProps> = ({
  onFightComplete,
  triggerFight = false,
  showResults = false,
  discussionResult = null,
}) => {
  const { selectedJuries } = useApp();
  const sceneHook = useThreeJsScene('jury-canvas', showResults);
  const blobsInitializedRef = useRef(false);

  // Initialize blobs on mount
  useEffect(() => {
    if (!sceneHook.isReady || blobsInitializedRef.current || !selectedJuries || selectedJuries.length === 0) {
      return;
    }

    // Add blobs to scene in two rows
    const blobsPerRow = Math.ceil(selectedJuries.length / 2);
    const rowPositions = [0.2, -0.4]; // Y positions for top and bottom rows

    let index = 0;
    for (let row = 0; row < 2; row++) {
      const rowSize = row === 0 ? blobsPerRow : selectedJuries.length - blobsPerRow;
      const spacing = 5.3 / (rowSize + 1); // Distribute evenly with padding
      
      for (let col = 0; col < rowSize; col++) {
        if (index >= selectedJuries.length) break;

        const jury = selectedJuries[index];
        const jitter = {
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
        };

        const position = new THREE.Vector3(
          -2.5 + (col + 1) * spacing + jitter.x,
          rowPositions[row] + jitter.y,
          (Math.random() * 0.5-1) + (row === 1 ? 1 : 0)
        );

        sceneHook.addBlob(jury.id, jury.color, position);
        index++;
      }
    }

    blobsInitializedRef.current = true;
  }, [sceneHook.isReady, sceneHook.addBlob, selectedJuries]);

  // Handle fight trigger
  useEffect(() => {
    if (!triggerFight || !sceneHook.isReady) return;

    sceneHook.triggerFight(APP_CONSTANTS.FIGHT_DURATION_MS).then(() => {
      onFightComplete?.();
    });
  }, [triggerFight, sceneHook.isReady, onFightComplete]);

  return (
    <>
      <canvas 
        id="jury-canvas" 
        style={{ 
          display: 'block',
          width: '100%',
          height: '100%',
          zIndex: 0,
        }} 
      />
      <BlobHoverCard 
        juryMember={sceneHook.hoveredBlobInfo.juryMember}
        position={sceneHook.hoveredBlobInfo.screenPosition}
        showResults={showResults}
        discussionResult={discussionResult}
      />
    </>
  );
};
