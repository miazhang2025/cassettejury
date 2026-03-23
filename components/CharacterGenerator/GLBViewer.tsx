'use client';

import { useEffect, useRef } from 'react';

interface GLBViewerProps {
  glbUrl: string;
  characterName: string;
}

export default function GLBViewer({ glbUrl, characterName }: GLBViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current || !glbUrl) return;

    // Convert data URL to a usable format for the viewer
    const glbData = glbUrl.split(',')[1]; // Extract base64
    const binaryString = atob(glbData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'model/gltf-binary' });
    const objectUrl = URL.createObjectURL(blob);

    // Create HTML content with Babylon.js viewer (simpler than Three.js)
    const viewerHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            width: 100%; 
            height: 100vh; 
            background: #f5f5f2; 
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: system-ui, -apple-system, sans-serif;
          }
          #canvas { width: 100%; height: 100%; display: block; }
          .error { color: #dc2626; font-size: 16px; }
        </style>
      </head>
      <body>
        <canvas id="canvas"></canvas>
        <script src="https://cdn.babylonjs.com/babylon.js"></script>
        <script src="https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js"></script>
        <script>
          const canvas = document.getElementById('canvas');
          const engine = new BABYLON.Engine(canvas, true);
          const scene = new BABYLON.Scene(engine);
          
          scene.clearColor = new BABYLON.Color3(0.96, 0.96, 0.95);
          
          // Camera
          const camera = new BABYLON.ArcRotateCamera('camera', 0, 0, 3, BABYLON.Vector3.Zero(), scene);
          camera.attachControl(canvas, true);
          camera.useAutoRotationBehavior = true;
          camera.autoRotationBehavior.idleRotationSpeed = 0.3;
          camera.autoRotationBehavior.idleRotationWaitTime = 0;
          camera.minZ = 0.1;
          
          // Lights
          const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(5, 10, 7), scene);
          light.intensity = 0.8;
          
          // Load model
          BABYLON.SceneLoader.ImportMesh('', '${objectUrl}', '', scene, () => {
            const meshes = scene.meshes;
            if (meshes.length > 0) {
              const allMeshes = BABYLON.Mesh.MergeMeshes(meshes.filter(m => m !== scene.activeCamera));
              if (allMeshes) {
                const boundingInfo = allMeshes.getHierarchyBoundingVectors();
                const boundingVector = boundingInfo.max.subtract(boundingInfo.min);
                const maxDim = Math.max(boundingVector.x, boundingVector.y, boundingVector.z);
                const scale = 3 / maxDim;
                allMeshes.scaling.scaleInPlace(scale);
              }
            }
          }, undefined, (error) => {
            console.error('Model load error:', error);
            document.body.innerHTML = '<div class="error">Failed to load 3D model. The model file may be invalid.</div>';
          });
          
          engine.runRenderLoop(() => {
            scene.render();
          });
          
          window.addEventListener('resize', () => {
            engine.resize();
          });
        </script>
      </body>
      </html>
    `;

    const blob2 = new Blob([viewerHTML], { type: 'text/html' });
    const htmlUrl = URL.createObjectURL(blob2);
    
    if (iframeRef.current) {
      iframeRef.current.src = htmlUrl;
    }

    return () => {
      URL.revokeObjectURL(objectUrl);
      URL.revokeObjectURL(htmlUrl);
    };
  }, [glbUrl]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-96 rounded-lg border border-gray-300 bg-gray-50"
      title={`3D Model - ${characterName}`}
      style={{ display: 'block' }}
    />
  );
}
