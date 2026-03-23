'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { JuryMember } from '@/config/juries';
import { playSound } from '@/utils/audio';
import { AUDIO_FILES, VOLUME_DEFAULTS } from '@/config/sounds';
import { useApp } from '@/context/AppContext';

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
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0, transform: 'translateX(-50%)', left: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#E5E5E1');

    const camera = new THREE.OrthographicCamera(-0.8, 0.8, 0.8, -0.8, 0.1, 100);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#ffffff', 2);
    keyLight.position.set(2, 2, 2);
    scene.add(keyLight);

    // Load jury model
    const loader = new GLTFLoader();
    loader.load(
      `/jury/${jury.id}.glb`,
      (gltf) => {
        const model = gltf.scene;
        
        // Rotate -90 degrees on Y axis
        model.rotation.y = -Math.PI / 2;
        
        // Apply toon shading material
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            // Extract the original texture map if it exists
            let originalMap: THREE.Texture | null = null;
            if (child.material instanceof THREE.Material && 'map' in child.material) {
              originalMap = (child.material as any).map;
            }

            const toonMaterial = new THREE.MeshToonMaterial({
              color: '#ffffff',
              map: originalMap,
            });
            child.material = toonMaterial;
            child.castShadow = true;
            child.receiveShadow = true;
            // Compute normals for smooth shading
            if (child.geometry) {
              child.geometry.computeVertexNormals();
            }
          }
        });
        
        scene.add(model);
        meshRef.current = model as any;
      },
      undefined,
      (error) => {
        console.error(`Failed to load model for ${jury.id}:`, error);
        // Fallback: create a sphere if model fails to load
        const geometry = new THREE.IcosahedronGeometry(0.8, 5);
        // Compute vertex normals for smooth shading
        geometry.computeVertexNormals();
        const material = new THREE.MeshToonMaterial({
          color: '#ffffff',
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        meshRef.current = mesh;
      }
    );

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (meshRef.current) {
        meshRef.current.rotation.y += 0.01;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      const newWidth = canvas.clientWidth;
      const newHeight = canvas.clientHeight;
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      // Only dispose geometry/material if they exist (fallback case)
      if (meshRef.current?.geometry) {
        (meshRef.current.geometry as THREE.BufferGeometry).dispose();
      }
      if (meshRef.current?.material) {
        if (Array.isArray(meshRef.current.material)) {
          meshRef.current.material.forEach((m) => m.dispose());
        } else {
          (meshRef.current.material as THREE.Material).dispose();
        }
      }
    };
  }, [jury.color, jury.id]);

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
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
              minWidth: '220px',
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
