import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BlobGeometry, PhysicsSimulator } from '@/utils/physics';
import { juries, JuryMember } from '@/config/juries';

export interface HoveredBlobInfo {
  juryMember: JuryMember | null;
  screenPosition: { x: number; y: number } | null;
}

export const useThreeJsScene = (canvasElementId: string) => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const physicsRef = useRef<PhysicsSimulator | null>(null);
  const blobsRef = useRef<Map<string, BlobGeometry>>(new Map());
  const blobToJuryRef = useRef<Map<BlobGeometry, JuryMember>>(new Map());
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const originalBlobPositionsRef = useRef<Map<BlobGeometry, THREE.Vector3>>(new Map());

  const [isReady, setIsReady] = useState(false);
  const [hoveredBlobInfo, setHoveredBlobInfo] = useState<HoveredBlobInfo>({
    juryMember: null,
    screenPosition: null,
  });

  useEffect(() => {
    const canvas = document.getElementById(canvasElementId) as HTMLCanvasElement;
    if (!canvas) return;

    // Use a small delay to ensure DOM has fully laid out
    const timeoutId = setTimeout(() => {
      // Get the actual rendered dimensions from the canvas element
      const rect = canvas.getBoundingClientRect();
      let width = rect.width;
      let height = rect.height;

      // Fallback to window dimensions if canvas dimensions are 0
      if (width === 0 || height === 0) {
        width = window.innerWidth;
        height = window.innerHeight - 80; // Subtract approximate top/bottom bar heights
      }

      // Ensure we have valid dimensions
      if (width <= 0 || height <= 0) {
        console.warn('Invalid canvas dimensions, using fallback');
        return;
      }

      initializeScene(width, height, canvas);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [canvasElementId]);

  const initializeScene = (width: number, height: number, canvas: HTMLCanvasElement) => {
    // Set canvas pixel dimensions
    canvas.width = Math.floor(width);
    canvas.height = Math.floor(height);

    // Scene setup
    const scene = new THREE.Scene();
      scene.background = new THREE.Color('#9B0808');
    sceneRef.current = scene;
// Camera - perspective for true 3D
      const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
      camera.position.z = 8;
      camera.position.y = 60;
      camera.lookAt(50, 5, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#ffffff', 0.9);
    keyLight.position.set(3, 5, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Wooden box container
    const boxGeometry = new THREE.BoxGeometry(6, 4.5, 4);
    const boxMaterial = new THREE.MeshPhongMaterial({
      color: '#8B6F47',
      side: THREE.BackSide,
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    scene.add(box);

    // Physics simulator
    const physics = new PhysicsSimulator();
    physicsRef.current = physics;

    // Blobs will be added dynamically through the addBlob method
    // based on selectedJuries from the landing page

    // Handle window resize
    const handleResize = () => {
      const newRect = canvas.getBoundingClientRect();
      const newWidth = newRect.width;
      const newHeight = newRect.height;

      if (newWidth > 0 && newHeight > 0) {
        canvas.width = Math.floor(newWidth);
        canvas.height = Math.floor(newHeight);

        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(newWidth, newHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Handle mouse move for raycasting and dragging
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    // Handle drag
    let draggedBlob: BlobGeometry | null = null;
    let lastMousePos = { x: 0, y: 0 };
    let isDragging = false;

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      const intersects = raycasterRef.current.intersectObjects(
        Array.from(blobsRef.current.values()).map((b) => b.mesh!),
        false
      );

      if (intersects.length > 0) {
        const firstMesh = intersects[0].object as THREE.Mesh;
        for (const [_, blob] of blobsRef.current) {
          if (blob.mesh === firstMesh) {
            draggedBlob = blob;
            isDragging = true;
            lastMousePos = { x: mouseX, y: mouseY };
            break;
          }
        }
      }
    };

    const handleMouseUp = () => {
      draggedBlob = null;
      isDragging = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    let animationId: number;
    let hoveredBlob: BlobGeometry | null = null;
    let cameraAnimationTime = 0;
    const CAMERA_ANIMATION_DURATION = 2000; // 2 seconds subtle animation

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Subtle camera animation on load - from facing down to facing the box
      if (cameraAnimationTime < CAMERA_ANIMATION_DURATION) {
        const progress = cameraAnimationTime / CAMERA_ANIMATION_DURATION;
        const easeProgress = 1 - Math.cos(progress * Math.PI) / 2; // easeInOutCosine

        // Smoothly transition from higher position (more looking down) to final position
        const startY = 60;
        const endY = 20;
        const startZ = 12;
        const endZ = 8;

        camera.position.y = startY - (startY - endY) * easeProgress;
        camera.position.z = startZ - (startZ - endZ) * easeProgress;
        camera.position.x = 0; // Keep centered
        
        // Always look at the center (where the box is)
        camera.lookAt(0, 2, 0);

        cameraAnimationTime += 16; // Approximate frame time
      } else {
        // Ensure camera stays centered on box after animation
        camera.lookAt(0, 0, 0);
      }

      // Update physics - DISABLED: keep blobs static
      // physicsRef.current!.update();

      // Handle dragging - DISABLED: blobs stay in place
      // if (isDragging && draggedBlob) {
      //   const deltaX = mouseRef.current.x - lastMousePos.x;
      //   const deltaY = mouseRef.current.y - lastMousePos.y;
      //   const dragForce = new THREE.Vector3(deltaX * 50, deltaY * 50, 0);
      //   draggedBlob.applyForce(dragForce);
      //   lastMousePos = { x: mouseRef.current.x, y: mouseRef.current.y };
      // }

      // Raycasting for hover detection
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(
        Array.from(blobsRef.current.values()).map((b) => b.mesh!),
        false
      );

      // Update highlights
      for (const blob of blobsRef.current.values()) {
        if (hoveredBlob !== blob && draggedBlob !== blob) {
          const color = blob.mesh!.material instanceof THREE.MeshPhongMaterial
            ? blob.mesh!.material.color.getHexString()
            : '#ffffff';
          blob.setHighlight(false, color);
        }
      }

      if (intersects.length > 0 && !isDragging) {
        const firstMesh = intersects[0].object as THREE.Mesh;
        for (const [_, blob] of blobsRef.current) {
          if (blob.mesh === firstMesh) {
            hoveredBlob = blob;
            const color = blob.mesh!.material instanceof THREE.MeshPhongMaterial
              ? blob.mesh!.material.color.getHexString()
              : '#ffffff';
            blob.setHighlight(true, color);
            
            // Update hovered blob info with jury member data and screen position
            const blobWorldPos = blob.getWorldPosition();
            const screenPos = blobWorldPos.project(camera);
            const canvasRect = canvas.getBoundingClientRect();
            setHoveredBlobInfo({
              juryMember: blobToJuryRef.current.get(blob) || null,
              screenPosition: {
                x: canvasRect.left + (screenPos.x + 1) * (canvasRect.width / 2),
                y: canvasRect.top + (1 - screenPos.y) * (canvasRect.height / 2),
              },
            });
            break;
          }
        }
      } else if (!isDragging) {
        hoveredBlob = null;
        setHoveredBlobInfo({ juryMember: null, screenPosition: null });
      } else if (isDragging && draggedBlob) {
        const color = draggedBlob.mesh!.material instanceof THREE.MeshPhongMaterial
          ? draggedBlob.mesh!.material.color.getHexString()
          : '#ffffff';
        draggedBlob.setHighlight(true, color);
      }

      renderer.render(scene, camera);
    };

    animate();
    setIsReady(true);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      boxGeometry.dispose();
      boxMaterial.dispose();
    };
  };

  const addBlob = (id: string, color: string, position: THREE.Vector3) => {
    console.log('addBlob called with:', { id, color, position: { x: position.x, y: position.y, z: position.z } });
    console.log('Scene ready?', !!sceneRef.current, 'Physics ready?', !!physicsRef.current);

    if (!sceneRef.current || !physicsRef.current) {
      console.error('Scene or Physics not initialized in addBlob');
      return;
    }

    const blob = new BlobGeometry(color, position);
    console.log('Created BlobGeometry, mesh exists?', !!blob.mesh);

    if (blob.mesh) {
      console.log('Adding mesh to scene...');
      sceneRef.current.add(blob.mesh);
      blobsRef.current.set(id, blob);
      physicsRef.current.addBlob(blob);
      originalBlobPositionsRef.current.set(blob, position.clone());
      
      // Map blob to jury member - find the jury member with matching id
      const juryMember = juries.find((j) => j.id === id);
      if (juryMember) {
        console.log('Mapped blob to jury member:', juryMember.name);
        blobToJuryRef.current.set(blob, juryMember);
      }
      console.log('Blob added successfully. Total blobs in scene:', sceneRef.current.children.length);
    } else {
      console.error('Failed to create blob mesh');
    }
  };

  const removeBlob = (id: string) => {
    const blob = blobsRef.current.get(id);
    if (blob && sceneRef.current && physicsRef.current) {
      sceneRef.current.remove(blob.mesh!);
      physicsRef.current.removeBlob(blob);
      blobsRef.current.delete(id);
      originalBlobPositionsRef.current.delete(blob);
      blob.dispose();
    }
  };

  const triggerFight = async (duration: number = 3500): Promise<void> => {
    if (!physicsRef.current) return;

    physicsRef.current.triggerFight();

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        physicsRef.current?.stopFight();
        physicsRef.current?.resetBlobs(originalBlobPositionsRef.current);
        resolve();
      }, duration);
    });
  };

  return {
    isReady,
    addBlob,
    removeBlob,
    triggerFight,
    scene: sceneRef.current,
    physics: physicsRef.current,
    hoveredBlobInfo,
  };
};
