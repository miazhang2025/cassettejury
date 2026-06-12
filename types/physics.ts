export interface BlobInstance {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  color: string;
  highlighted: boolean;
}

export interface PhysicsState {
  isInitialized: boolean;
  blobs: BlobInstance[];
}

export interface PhysicsContextType {
  world: unknown; // Reserved for a future Rapier.World instance
  blobs: BlobInstance[];
  registerBlob: (blob: BlobInstance) => void;
  unregisterBlob: (blobId: string) => void;
  applyForceToBlob: (blobId: string, force: { x: number; y: number; z: number }) => void;
  triggerFight: () => Promise<void>;
  settleBlobs: () => void;
  isReady: boolean;
}
