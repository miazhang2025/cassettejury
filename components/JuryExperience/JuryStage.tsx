'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useApp } from '@/context/AppContext';
import { useThreeJsScene } from '@/hooks/useThreeJsScene';
import { BlobHoverCard } from './BlobHoverCard';
import { APP_CONSTANTS } from '@/config/constants';

interface JuryStageProps {
  onFightComplete?: () => void;
  triggerFight?: boolean;
}

export const JuryStage: React.FC<JuryStageProps> = ({ onFightComplete, triggerFight = false }) => {
  const { selectedJuries } = useApp();
  const sceneHook = useThreeJsScene('jury-canvas');
  const blobsInitializedRef = useRef(false);

  // Initialize blobs on mount
  useEffect(() => {
    if (!sceneHook.isReady || blobsInitializedRef.current || !selectedJuries || selectedJuries.length === 0) {
      return;
    }

    console.log('Initializing blobs with selectedJuries:', selectedJuries);

    // Add blobs to scene in a 3x3 grid
    let index = 0;
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        if (index >= selectedJuries.length) break;

        const jury = selectedJuries[index];
        const jitter = {
          x: (Math.random() - 0.5) * 0.3,
          y: (Math.random() - 0.5) * 0.3,
        };

        const position = new THREE.Vector3(
          x * 1.8 + jitter.x,
          y * 1.2 + jitter.y,
          Math.random() * 0.5 - 0.25
        );

        console.log(`Adding blob ${jury.id} at position`, position);
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
      />
    </>
  );
};
