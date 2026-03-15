'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { JuryMember } from '@/config/juries';

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

    const camera = new THREE.OrthographicCamera(-1.5, 1.5, 1.5, -1.5, 0.1, 100);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#ffffff', 0.8);
    keyLight.position.set(2, 2, 2);
    scene.add(keyLight);

    // Create blob
    const geometry = new THREE.IcosahedronGeometry(0.8, 5);
    const material = new THREE.MeshPhongMaterial({
      color: jury.color,
      emissive: jury.color,
      emissiveIntensity: 0.1,
      shininess: 100,
      wireframe: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (meshRef.current) {
        meshRef.current.rotation.x += 0.005;
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
      geometry.dispose();
      material.dispose();
    };
  }, [jury.color]);

  const handleClick = () => {
    if (!maxSelected || isSelected) {
      onSelect(jury);
    }
  };

  const handleMouseEnter = () => {
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
          width: '80px',
          height: '80px',
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

      {/* Hover card */}
      {showCard && (
        <div
          className="fixed z-50 bg-white rounded-lg p-3 shadow-lg"
          style={{
            border: '2px solid #9B0808',
            backgroundColor: '#E5E5E1',
            left: `${cardPosition.left}px`,
            top: `${cardPosition.y - 140}px`,
            transform: cardPosition.transform,
            pointerEvents: 'none',
          }}
        >
          <h3 className="text-md" style={{ color: '#9B0808', fontFamily: "ibm-plex-mono" }}>
            {jury.name}
          </h3>
          <p className="text-xs mt-1" style={{ color: '#4a4a4a' }}>
            <span className="font-medium">{jury.age}</span> • {jury.pronouns.split('/')[0]}
          </p>
          <p className="text-xs font-medium mt-1" style={{ color: '#4a4a4a' }}>
            {jury.profession}
          </p>
          <p className="text-xs mt-2" style={{ color: '#4a4a4a' }}>
            {jury.bio}
          </p>
        </div>
      )}
    </div>
  );
};
