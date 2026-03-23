import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { BlobGeometry, PhysicsSimulator } from '@/utils/physics';
import { juries, JuryMember } from '@/config/juries';
import { DiscussionResult } from '@/types/app';

export interface HoveredBlobInfo {
  juryMember: JuryMember | null;
  screenPosition: { x: number; y: number } | null;
}

export const useThreeJsScene = (canvasElementId: string, showResults: boolean = false, discussionResult: DiscussionResult | null = null) => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const physicsRef = useRef<PhysicsSimulator | null>(null);
  const blobsRef = useRef<Map<string, BlobGeometry>>(new Map());
  const blobToJuryRef = useRef<Map<BlobGeometry, JuryMember>>(new Map());
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const originalBlobPositionsRef = useRef<Map<BlobGeometry, THREE.Vector3>>(new Map());
  const modelCacheRef = useRef<Map<string, THREE.Group>>(new Map());
  const animationCacheRef = useRef<Map<string, THREE.AnimationClip[]>>(new Map());
  const gltfLoaderRef = useRef<GLTFLoader | null>(null);
  const stageRef = useRef<THREE.Group | null>(null);
  const blobBasePositionsRef = useRef<Map<BlobGeometry, THREE.Vector3>>(new Map());

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

  // Apply position offset when results show/hide (when not fighting)
  useEffect(() => {
    if (!showResults) {
      const offsetX = 0;
      
      // Apply offset to stage
      if (stageRef.current) {
        stageRef.current.position.x = offsetX;
      }
      
      // Apply offset to all blobs
      for (const [blob, basePos] of blobBasePositionsRef.current.entries()) {
        if (blob.mesh) {
          blob.mesh.position.x = basePos.x + offsetX;
        }
      }
    }
  }, [showResults]);

  // Stop fight when results are shown
  useEffect(() => {
    if (showResults && discussionResult && physicsRef.current) {
      physicsRef.current.stopFight();
      physicsRef.current.resetBlobs(originalBlobPositionsRef.current);
      
      // Reset blob rotation to initial loaded state
      for (const blob of blobsRef.current.values()) {
        if (blob.mesh) {
          blob.mesh.rotation.set(0, -Math.PI / 2, 0);
        }
      }
      
      // Apply position offset after resetting blobs
      const offsetX = -1;
      
      // Apply offset to stage
      if (stageRef.current) {
        stageRef.current.position.x = offsetX;
      }
      
      // Apply offset to all blobs
      for (const [blob, basePos] of blobBasePositionsRef.current.entries()) {
        if (blob.mesh) {
          blob.mesh.position.x = basePos.x + offsetX;
        }
      }
    }
  }, [showResults, discussionResult]);

  const initializeScene = (width: number, height: number, canvas: HTMLCanvasElement) => {
    // Set canvas pixel dimensions
    canvas.width = Math.floor(width);
    canvas.height = Math.floor(height);

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#9B0808');
    sceneRef.current = scene;

    // Camera - perspective for true 3D
    const camera = new THREE.PerspectiveCamera(20, width / height, 0.1, 1000);
    camera.position.z = 12;
    camera.position.y = 4;
    camera.lookAt(0, 2, 0);
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

    const keyLight = new THREE.DirectionalLight('#ffffff', 5.0);
    keyLight.position.set(-3, 5, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Load stage model
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('/stage.glb', (gltf) => {
      const stage = gltf.scene;
      
      // Rotate -90 degrees on Y axis and scale to 5
      stage.rotation.y = -Math.PI / 2;
      stage.scale.set(5, 5, 5);
      stage.position.y = -0.7;  // Move stage lower
      
      // Preserve textures - only add shadow properties and smooth shading
      stage.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // Compute normals for smooth shading
          if (child.geometry) {
            child.geometry.computeVertexNormals();
          }
        }
      });
      
      stageRef.current = stage;
      scene.add(stage);
    });

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

    // Camera navigation controls - declare before handlers that use them
    let cameraTheta = 0; // Horizontal angle (around Y axis)
    let cameraDistance = 12; // Distance from center (normal viewing distance, matches initial z=12)
    let targetTheta = cameraTheta;
    let targetDistance = cameraDistance;
    const MIN_DISTANCE = 8;
    const MAX_DISTANCE = 18;
    const CAMERA_ROTATION_SPEED = 0.005;
    const SMOOTHING_FACTOR = 0.1; // Interpolation factor for smooth movement

    let isRotatingCamera = false;
    let lastCameraMouseX = 0;

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
      // Left-click for camera rotation
      if (e.button === 0) {
        isRotatingCamera = true;
        lastCameraMouseX = e.clientX;
        e.preventDefault();
        return;
      }

      // Left-click for blob interaction
      const rect = canvas.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      const intersects = raycasterRef.current.intersectObjects(
        Array.from(blobsRef.current.values()).map((b) => b.mesh!),
        true  // recursive: true to detect intersections with child meshes
      );

      if (intersects.length > 0) {
        const firstMesh = intersects[0].object as THREE.Mesh;
        
        // Find the top-level blob that contains this intersected mesh
        for (const [_, blob] of blobsRef.current) {
          let current: THREE.Object3D | null = firstMesh;
          while (current) {
            if (current === blob.mesh) {
              draggedBlob = blob;
              isDragging = true;
              lastMousePos = { x: mouseX, y: mouseY };
              break;
            }
            current = current.parent;
          }
          
          if (draggedBlob) {
            break;
          }
        }
      }
    };

    const handleMouseUp = () => {
      draggedBlob = null;
      isDragging = false;
      isRotatingCamera = false;
    };

    const handleCameraMouseMove = (e: MouseEvent) => {
      if (isRotatingCamera) {
        const deltaX = e.clientX - lastCameraMouseX;
        targetTheta -= deltaX * CAMERA_ROTATION_SPEED;
        lastCameraMouseX = e.clientX;
      }
    };

    const handleMouseWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDirection = e.deltaY > 0 ? 1 : -1;
      targetDistance = Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, targetDistance + zoomDirection * 0.5));
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousemove', handleCameraMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault()); // Prevent context menu
    canvas.addEventListener('wheel', handleMouseWheel, { passive: false });

    let animationId: number;
    let hoveredBlob: BlobGeometry | null = null;
    let cameraAnimationTime = 0;
    const CAMERA_ANIMATION_DURATION = 2500; // 2.5 seconds pull-back animation
    const initialCameraDistance = 4; // Start closer for the pull-back effect
    const initialCameraTheta = cameraTheta; // Store initial angle for smooth animation

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Get time for animations (must be first)
      const time = Date.now() * 0.001; // Convert to seconds

      // Smooth interpolation for camera angle and distance
      cameraTheta += (targetTheta - cameraTheta) * SMOOTHING_FACTOR;
      cameraDistance += (targetDistance - cameraDistance) * SMOOTHING_FACTOR;

      // Calculate camera shift based on whether results are showing
      const cameraShiftX = showResults && discussionResult ? -2 : 0; // Shift left by 2 units when results show

      // Subtle camera animation on load - pull back from close-up to normal distance
      if (cameraAnimationTime < CAMERA_ANIMATION_DURATION) {
        const progress = cameraAnimationTime / CAMERA_ANIMATION_DURATION;
        const easeProgress = 1 - Math.cos(progress * Math.PI) / 2; // easeInOutCosine

        // Pull back effect: start at initialCameraDistance (3) and zoom out to targetDistance (5)
        const startDistance = initialCameraDistance;
        const endDistance = targetDistance;

        const lerpedDistance = startDistance + (endDistance - startDistance) * easeProgress;

        // Calculate camera position based on angle and distance, with Y offset
        camera.position.x = Math.sin(cameraTheta) * lerpedDistance + cameraShiftX;
        camera.position.y = 4; // Match initial camera y position
        camera.position.z = Math.cos(cameraTheta) * lerpedDistance;

        cameraAnimationTime += 16; // Approximate frame time
      } else {
        // Synchronize camera distance when animation ends to prevent jump
        if (cameraAnimationTime >= CAMERA_ANIMATION_DURATION && cameraDistance !== targetDistance) {
          cameraDistance = targetDistance;
        }
        
        // After animation, use interactive camera controls
        camera.position.x = Math.sin(cameraTheta) * cameraDistance + cameraShiftX;
        camera.position.y = 4; // Match initial camera y position
        camera.position.z = Math.cos(cameraTheta) * cameraDistance;
      }

      // Always look at the center of the box, shifted when results show
      camera.lookAt(cameraShiftX, 0, 0);

      // Apply camera shake during fighting
      let isAnyBlobFighting = false;
      for (const blob of blobsRef.current.values()) {
        if (blob.fightMode) {
          isAnyBlobFighting = true;
          break;
        }
      }

      if (isAnyBlobFighting) {
        const shakeAmount = 0.15; // Shake intensity
        const baseShakeFrequency = 4; // Base frequency
        // Dynamic frequency that varies over time between 7.7-14.3 Hz
        const shakeFrequency = baseShakeFrequency * (0.5 + 0.3 * Math.sin(time * 0.8));
        const shakeX = Math.sin(time * shakeFrequency) * shakeAmount;
        const shakeY = Math.cos(time * shakeFrequency * 0.7) * shakeAmount;
        const shakeZ = Math.sin(time * shakeFrequency * 0.5) * shakeAmount;
        
        camera.position.x += shakeX;
        camera.position.y += shakeY;
        camera.position.z += shakeZ;
      }

      // Update physics
      physicsRef.current!.update();

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
        true  // recursive: true to detect intersections with child meshes in loaded models
      );

      // Update highlights
      for (const blob of blobsRef.current.values()) {
        if (hoveredBlob !== blob && draggedBlob !== blob) {
          blob.setHighlight(false, blob.originalColor || '#ffffff');
        }
      }

      if (intersects.length > 0 && !isDragging) {
        const firstMesh = intersects[0].object as THREE.Mesh;
        
        // Find the top-level blob that contains this intersected mesh
        for (const [_, blob] of blobsRef.current) {
          // Check if the intersected object is the blob mesh itself or one of its descendants
          let current: THREE.Object3D | null = firstMesh;
          while (current) {
            if (current === blob.mesh) {
              // Found the blob!
              hoveredBlob = blob;
              blob.setHighlight(true, blob.originalColor || '#ffffff');
              
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
            current = current.parent;
          }
          
          if (hoveredBlob === blob) {
            break;
          }
        }
      } else if (!isDragging) {
        hoveredBlob = null;
        setHoveredBlobInfo({ juryMember: null, screenPosition: null });
      } else if (isDragging && draggedBlob) {
        draggedBlob.setHighlight(true, draggedBlob.originalColor || '#ffffff');
      }

      // Apply scale animation to blobs
      for (const blob of blobsRef.current.values()) {
        if (blob.mesh) {
          // Create a pulsing effect with sine wave: ranges from 0.95 to 1.05
          const scale = 1 + Math.sin(time * 2 + blob.mesh.position.x) * 0.05;
          blob.mesh.scale.set(scale, scale, scale);
        }
      }

      renderer.render(scene, camera);
    };

    animate();
    setIsReady(true);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousemove', handleCameraMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
      canvas.removeEventListener('wheel', handleMouseWheel);
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  };

  const addBlob = (id: string, color: string, position: THREE.Vector3) => {
    if (!sceneRef.current || !physicsRef.current) {
      return;
    }

    if (!gltfLoaderRef.current) {
      gltfLoaderRef.current = new GLTFLoader();
    }

    const juryMember = juries.find((j) => j.id === id);
    if (!juryMember) {
      console.warn(`Jury member with id ${id} not found`);
      return;
    }

    const loader = gltfLoaderRef.current;
    const modelPath = `/jury/${id}.glb`;

    // Check if model is already cached
    if (modelCacheRef.current.has(modelPath)) {
      const cachedModel = modelCacheRef.current.get(modelPath)!;
      const clonedModel = cachedModel.clone();
      const cachedAnimations = animationCacheRef.current.get(modelPath) || [];
      
      const blob = new BlobGeometry(color, position, clonedModel);
      if (blob.mesh) {
        sceneRef.current.add(blob.mesh);
        blobsRef.current.set(id, blob);
        physicsRef.current.addBlob(blob);
        originalBlobPositionsRef.current.set(blob, position.clone());
        blobBasePositionsRef.current.set(blob, position.clone());
        blobToJuryRef.current.set(blob, juryMember);

      }
    } else {
      // Load the model
      loader.load(
        modelPath,
        (gltf) => {
          // Cache the loaded model and animations
          modelCacheRef.current.set(modelPath, gltf.scene);
          if (gltf.animations && gltf.animations.length > 0) {
            animationCacheRef.current.set(modelPath, gltf.animations);
          }

          const clonedModel = gltf.scene.clone();
          const blob = new BlobGeometry(color, position, clonedModel);

          if (blob.mesh) {
            sceneRef.current!.add(blob.mesh);
            blobsRef.current.set(id, blob);
            physicsRef.current!.addBlob(blob);
            originalBlobPositionsRef.current.set(blob, position.clone());
            blobBasePositionsRef.current.set(blob, position.clone());
            blobToJuryRef.current.set(blob, juryMember);
          }
        },
        undefined,
        (error) => {
          console.error(`Failed to load model for ${id}:`, error);
          // Fallback to sphere
          const blob = new BlobGeometry(color, position, 0.8);
          if (blob.mesh) {
            sceneRef.current!.add(blob.mesh);
            blobsRef.current.set(id, blob);
            physicsRef.current!.addBlob(blob);
            originalBlobPositionsRef.current.set(blob, position.clone());
            blobBasePositionsRef.current.set(blob, position.clone());
            blobToJuryRef.current.set(blob, juryMember);
          }
        }
      );
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

  const triggerFight = async (): Promise<void> => {
    if (!physicsRef.current) return;

    physicsRef.current.triggerFight();

    return new Promise<void>((resolve) => {
      // Fight will be stopped by the useEffect when results are shown
      resolve();
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
