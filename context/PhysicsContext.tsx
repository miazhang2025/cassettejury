'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { BlobInstance, PhysicsContextType } from '@/types/physics';
import { APP_CONSTANTS } from '@/config/constants';

const PhysicsContext = createContext<PhysicsContextType | undefined>(undefined);

export const PhysicsProvider = ({ children }: { children: ReactNode }) => {
  const [world] = useState<any>(null);
  const [blobs, setBlobs] = useState<BlobInstance[]>([]);
  const [isReady] = useState(false);

  const registerBlob = useCallback((blob: BlobInstance) => {
    setBlobs((prev) => {
      const existing = prev.find((b) => b.id === blob.id);
      if (existing) return prev;
      return [...prev, blob];
    });
  }, []);

  const unregisterBlob = useCallback((blobId: string) => {
    setBlobs((prev) => prev.filter((b) => b.id !== blobId));
  }, []);

  const applyForceToBlob = useCallback(
    (blobId: string, force: { x: number; y: number; z: number }) => {
      // This will be implemented when Three.js scene is set up
    },
    []
  );

  const triggerFight = useCallback(async () => {
    // This will be implemented when Three.js scene is set up
    return new Promise<void>((resolve) => {
      setTimeout(resolve, APP_CONSTANTS.FIGHT_DURATION_MS);
    });
  }, []);

  const settleBlobs = useCallback(() => {
    // This will be implemented when Three.js scene is set up
  }, []);

  const value: PhysicsContextType = {
    world,
    blobs,
    registerBlob,
    unregisterBlob,
    applyForceToBlob,
    triggerFight,
    settleBlobs,
    isReady,
  };

  return <PhysicsContext.Provider value={value}>{children}</PhysicsContext.Provider>;
};

export const usePhysics = () => {
  const context = useContext(PhysicsContext);
  if (!context) {
    throw new Error('usePhysics must be used within PhysicsProvider');
  }
  return context;
};
