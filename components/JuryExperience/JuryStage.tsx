'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useApp } from '@/context/AppContext';
import { useThreeJsScene } from '@/hooks/useThreeJsScene';
import { BlobHoverCard } from './BlobHoverCard';
import { APP_CONSTANTS } from '@/config/constants';
import { DiscussionResult } from '@/types/app';
import { playSound } from '@/utils/audio';
import { AUDIO_FILES, VOLUME_DEFAULTS } from '@/config/sounds';

interface JuryStageProps {
  onFightComplete?: () => void;
  triggerFight?: boolean;
  showResults?: boolean;
  discussionResult?: DiscussionResult | null;
  isProcessing?: boolean;
}

export const JuryStage: React.FC<JuryStageProps> = ({
  onFightComplete,
  triggerFight = false,
  showResults = false,
  discussionResult = null,
  isProcessing = false,
}) => {
  const { selectedJuries, settings } = useApp();
  const sceneHook = useThreeJsScene('jury-canvas', showResults, discussionResult);
  const blobsInitializedRef = useRef(false);
  const previousHoveredBlobRef = useRef<string | null>(null);

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
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
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

  // Handle fight trigger with looping until discussion result arrives
  useEffect(() => {
    if (!triggerFight || !sceneHook.isReady) return;

    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const startFight = async () => {
      if (!isMounted) return;

      try {
        // Trigger the fight animation
        await sceneHook.triggerFight();

        // If discussion result arrived, stop fighting and call complete
        if (discussionResult) {
          if (isMounted) {
            onFightComplete?.();
          }
          return;
        }

        // If no result yet, restart the fight animation with a small pause
        if (isMounted) {
          timeoutId = setTimeout(() => {
            startFight();
          }, 300); // Small pause between fight loops
        }
      } catch (error) {
        console.error('Fight animation error:', error);
      }
    };

    startFight();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [triggerFight, sceneHook.isReady, discussionResult, onFightComplete]);

  // Play sound when blob is hovered
  useEffect(() => {
    const currentHoveredId = sceneHook.hoveredBlobInfo.juryMember?.id || null;

    // Only play sound if we just started hovering on a new blob
    if (currentHoveredId && currentHoveredId !== previousHoveredBlobRef.current && settings.soundEnabled && !isProcessing) {
      playSound(AUDIO_FILES.SFX.paper, {
        volume: VOLUME_DEFAULTS.SFX,
      });
    }

    previousHoveredBlobRef.current = currentHoveredId;
  }, [sceneHook.hoveredBlobInfo.juryMember?.id, settings.soundEnabled, isProcessing]);

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
        isProcessing={isProcessing}
      />
    </>
  );
};
