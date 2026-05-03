/**
 * Shared WebGL renderer for jury selector cards.
 *
 * iOS Safari hard-limits simultaneous WebGL contexts to ~8. With 16 jury cards
 * each creating their own WebGLRenderer, the page crashes. This module keeps
 * ONE WebGLRenderer alive and renders every registered card's scene per frame,
 * copying the output to each card's 2D canvas via drawImage.
 */

import * as THREE from 'three';

interface CardEntry {
  scene: THREE.Scene;
  camera: THREE.Camera;
  targetCanvas: HTMLCanvasElement;
  onBeforeRender: () => void;
}

const registry = new Map<string, CardEntry>();

let sharedRenderer: THREE.WebGLRenderer | null = null;
let offscreenCanvas: HTMLCanvasElement | null = null;
let rafId: number | null = null;

const RENDER_SIZE = 256;

function ensureRenderer(): THREE.WebGLRenderer {
  if (!sharedRenderer) {
    offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = RENDER_SIZE;
    offscreenCanvas.height = RENDER_SIZE;
    sharedRenderer = new THREE.WebGLRenderer({
      canvas: offscreenCanvas,
      antialias: true,
      alpha: false,
      powerPreference: 'low-power',
    });
    sharedRenderer.setSize(RENDER_SIZE, RENDER_SIZE, false);
    sharedRenderer.setPixelRatio(1);
  }
  return sharedRenderer;
}

function startLoop(): void {
  if (rafId !== null) return;

  const tick = () => {
    rafId = requestAnimationFrame(tick);
    if (registry.size === 0) return;

    const r = ensureRenderer();

    registry.forEach(({ scene, camera, targetCanvas, onBeforeRender }) => {
      onBeforeRender();
      r.render(scene, camera);

      const ctx = targetCanvas.getContext('2d');
      if (ctx && offscreenCanvas) {
        ctx.drawImage(offscreenCanvas, 0, 0, targetCanvas.width, targetCanvas.height);
      }
    });
  };

  rafId = requestAnimationFrame(tick);
}

function stopLoop(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

export function registerCard(
  id: string,
  scene: THREE.Scene,
  camera: THREE.Camera,
  targetCanvas: HTMLCanvasElement,
  onBeforeRender: () => void
): void {
  registry.set(id, { scene, camera, targetCanvas, onBeforeRender });
  startLoop();
}

export function unregisterCard(id: string): void {
  registry.delete(id);
  if (registry.size === 0) {
    stopLoop();
    if (sharedRenderer) {
      sharedRenderer.dispose();
      sharedRenderer = null;
      offscreenCanvas = null;
    }
  }
}
