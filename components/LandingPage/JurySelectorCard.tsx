'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { JuryMember } from '@/config/juries';
import { playSound } from '@/utils/audio';
import { AUDIO_FILES, VOLUME_DEFAULTS } from '@/config/sounds';
import { useApp } from '@/context/AppContext';
import { registerCard, unregisterCard } from '@/utils/sharedThreeRenderer';

interface JurySelectorCardProps {
  jury: JuryMember;
  isSelected: boolean;
  onSelect: (jury: JuryMember) => void;
  maxSelected?: boolean;
}

export const JurySelectorCard: React.FC<JurySelectorCardProps> = ({
  jury,
  isSelected,
  onSelect,
  maxSelected = false,
}) => {
  const { settings } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0, transform: 'translateX(-80%)', left: 0 });
  const isMobile =
    typeof window !== 'undefined' &&
    (window.innerWidth < 768 || ('ontouchstart' in window && navigator.maxTouchPoints > 0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cleanupFn: (() => void) | null = null;
    let cancelled = false;

    // Small timeout to ensure canvas is laid out by browser
    const timeoutId = setTimeout(() => {
      if (cancelled) return;

      // Set 2D canvas pixel dimensions (drawImage target)
      const size = Math.max(canvas.clientWidth || 140, 1);
      canvas.width = size;
      canvas.height = size;

      // Per-card scene and camera — all share ONE WebGLRenderer via sharedThreeRenderer
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#E5E5E1');

      const camera = new THREE.OrthographicCamera(-0.8, 0.8, 0.8, -0.8, 0.1, 100);
      camera.position.z = 3;

      // Lighting
      const ambientLight = new THREE.AmbientLight('#ffffff', 1.5);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight('#ffffff', 2);
      keyLight.position.set(2, 2, 2);
      scene.add(keyLight);

      // Load jury model
      const loader = new GLTFLoader();
      let modelLoadAttempts = 0;
      const maxAttempts = 2;

      const loadModel = () => {
        loader.load(
          `/jury/${jury.id}.glb`,
          (gltf) => {
            const model = gltf.scene;
            model.rotation.y = -Math.PI / 2;
            model.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                let originalMap: THREE.Texture | null = null;
                if (child.material instanceof THREE.Material && 'map' in child.material) {
                  originalMap = (child.material as any).map;
                }
                const toonMaterial = new THREE.MeshToonMaterial({
                  color: '#ffffff',
                  map: originalMap,
                  emissive: '#000000',
                });
                child.material = toonMaterial;
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.geometry) {
                  child.geometry.computeVertexNormals();
                }
              }
            });
            scene.add(model);
            meshRef.current = model as any;
          },
          undefined,
          () => {
            modelLoadAttempts++;
            if (modelLoadAttempts < maxAttempts) {
              setTimeout(() => loadModel(), 500);
            } else {
              const geometry = new THREE.IcosahedronGeometry(0.8, 5);
              geometry.computeVertexNormals();
              const material = new THREE.MeshToonMaterial({ color: '#ffffff', emissive: '#000000' });
              const mesh = new THREE.Mesh(geometry, material);
              scene.add(mesh);
              meshRef.current = mesh;
            }
          }
        );
      };

      loadModel();

      // Update canvas pixel dimensions on resize
      const handleResize = () => {
        const newSize = Math.max(canvas.clientWidth || 140, 1);
        canvas.width = newSize;
        canvas.height = newSize;
      };
      window.addEventListener('resize', handleResize);

      // Register with the single shared WebGLRenderer
      registerCard(jury.id, scene, camera, canvas, () => {
        if (meshRef.current) {
          meshRef.current.rotation.y += 0.01;
        }
      });

      cleanupFn = () => {
        window.removeEventListener('resize', handleResize);
        unregisterCard(jury.id);
        meshRef.current = null;
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              (child.material as THREE.Material)?.dispose();
            }
          }
        });
      };
    }, 50);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      if (cleanupFn) {
        cleanupFn();
      } else {
        unregisterCard(jury.id);
      }
    };
  }, [jury.id]);

  const handleClick = () => {
    if (!maxSelected || isSelected) {
      // Play click sound
      if (settings.soundEnabled) {
        playSound(AUDIO_FILES.SFX.click, {
          volume: VOLUME_DEFAULTS.SFX,
        });
      }
      onSelect(jury);
    }
  };

  const handleMouseEnter = () => {
    // Play hover sound
    if (settings.soundEnabled) {
      playSound(AUDIO_FILES.SFX.paper, {
        volume: VOLUME_DEFAULTS.SFX,
      });
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const blobCenterX = rect.left + rect.width / 2;
      const cardWidth = 320;
      const padding = 20;
      
      // Check if we're near the left edge - use higher threshold to ensure card stays visible
      if (blobCenterX < 180) {
        // Position from left edge
        setCardPosition({
          x: 0,
          y: rect.top,
          transform: 'translateX(0)',
          left: padding,
        });
      }
      // Check if we're near the right edge
      else if (blobCenterX > window.innerWidth - 180) {
        // Position from right edge
        setCardPosition({
          x: 0,
          y: rect.top,
          transform: 'translateX(0)',
          left: window.innerWidth - cardWidth - padding,
        });
      }
      // Center normally
      else {
        setCardPosition({
          x: blobCenterX,
          y: rect.top,
          transform: 'translateX(-50%)',
          left: blobCenterX,
        });
      }
      setShowCard(true);
    }
  };

  const handleMouseLeave = () => {
    setShowCard(false);
  };

  const longPressTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchMovedRef = React.useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    touchMovedRef.current = false;

    longPressTimerRef.current = setTimeout(() => {
      if (!touchMovedRef.current) {
        handleMouseEnter();
      }
    }, 500);

    const onMove = (me: TouchEvent) => {
      const t = me.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.sqrt(dx * dx + dy * dy) > 10) {
        touchMovedRef.current = true;
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
      }
    };
    const onEnd = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      setShowCard(false);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onEnd, { passive: true });
  };

  const borderColor = isSelected ? '#9B0808' : 'transparent';
  const borderWidth = isSelected ? 3 : 0;

  return (
    <div ref={containerRef} className="flex justify-center">
      <div
        className="rounded-full overflow-hidden cursor-pointer transition-all"
        style={{
          width: 'clamp(100px, 25vw, 140px)',
          height: 'clamp(100px, 25vw, 140px)',
          border: `${borderWidth}px solid ${borderColor}`,
          opacity: maxSelected && !isSelected ? 0.5 : 1,
          pointerEvents: maxSelected && !isSelected ? 'none' : 'auto',
        }}
        onClick={handleClick}
        onMouseEnter={isMobile ? undefined : handleMouseEnter}
        onMouseLeave={isMobile ? undefined : handleMouseLeave}
        onTouchStart={isMobile ? handleTouchStart : undefined}
      >
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Hover card - responsive sizing for mobile */}
      {showCard && (
        <div
          style={{
            position: 'fixed',
            left: `${cardPosition.left}px`,
            top: `${cardPosition.y - 140}px`,
            zIndex: 50,
            pointerEvents: 'none',
            transform: cardPosition.transform,
          }}
        >
          <div
            className="rounded-lg"
            style={{
              backgroundImage: 'url(/blobcard.webp)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minWidth: '300px',
              maxWidth: 'min(350px, 90vw)',
              paddingLeft: '50px',
              paddingRight: '15px',
              paddingBottom: '30px',
              paddingTop: '30px',
            }}
          >
            {/* Name */}
            <h3
              className="text-lg"
              style={{
                fontFamily: "'Blaka', serif",
                color: '#9B0808',
                fontSize: 'clamp(14px, 4vw, 18px)',
              }}
            >
              {jury.name}
            </h3>

            <div className="space-y-1 text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#333333' }}>
              {/* Age */}
              <p>
                <span style={{ fontWeight: 600 }}>Age:</span> {jury.age}
              </p>

              {/* Pronouns */}
              <p>
                <span style={{ fontWeight: 600 }}>Pronouns:</span> {jury.pronouns.split('/')[0]}
              </p>

              {/* Profession */}
              <p>
                <span style={{ fontWeight: 600 }}>Role:</span> {jury.profession}
              </p>

              {/* Bio */}
              <p style={{ lineHeight: '1.3', marginTop: '4px' }}>
                <span style={{ fontStyle: 'italic' }}>{jury.bio}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
