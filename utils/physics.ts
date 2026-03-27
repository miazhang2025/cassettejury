import * as THREE from 'three';

export class BlobGeometry {
  mesh: THREE.Mesh | null = null;
  position: THREE.Vector3;
  velocity: THREE.Vector3 = new THREE.Vector3();
  force: THREE.Vector3 = new THREE.Vector3();
  damping = 0.98;
  mass = 1;
  originalColor: string;
  targetBlob: BlobGeometry | null = null;
  rotationTime = 0;
  colliderRadius = 1.0; // Collision detection radius
  fightMode = false; // Track if this blob is fighting
  rotationSpeed = Math.random() * 3 + 1.5; // Random rotation speed between 1.5 and 4.5

  constructor(
    color: string,
    position: THREE.Vector3 = new THREE.Vector3(),
    meshOrRadius: THREE.Object3D | number = 0.8
  ) {
    this.originalColor = color;
    this.position = position;

    if (meshOrRadius instanceof THREE.Object3D) {
      // Use the provided mesh/model (loaded model)
      this.mesh = meshOrRadius as unknown as THREE.Mesh;
      this.mesh.position.copy(position);
      // Rotate -90 degrees on Y axis
      this.mesh.rotation.y = -Math.PI / 2;
      // Set default collider radius for models
      this.colliderRadius = 1.0;
      
      // Apply toon shading material
      this.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Extract the original texture map if it exists
          let originalMap: THREE.Texture | null = null;
          if (child.material instanceof THREE.Material && 'map' in child.material) {
            originalMap = (child.material as any).map;
          }

          // Create toon material with morphTargets support
          const toonMaterial = new THREE.MeshToonMaterial({
            color: '#ffffff',
            map: originalMap,
            // Note: morphTargets are automatically supported when geometry has morph attributes
          });
          
          child.material = toonMaterial;
          child.castShadow = false;
          child.receiveShadow = true;
          
          // Compute normals for smooth shading
          if (child.geometry) {
            child.geometry.computeVertexNormals();
          }
        }
      });
    } else {
      // Fallback: create a sphere if no model provided
      const radius = meshOrRadius as number;
      this.colliderRadius = radius;
      const geometry = new THREE.IcosahedronGeometry(radius, 5);
      // Compute vertex normals for smooth shading
      geometry.computeVertexNormals();
      const material = new THREE.MeshToonMaterial({
        color: '#ffffff',
      });

      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.position.copy(position);
      this.mesh.castShadow = false;
      this.mesh.receiveShadow = true;
    }
    
    this.position = this.mesh.position.clone();
  }

  getColliderBounds(): { center: THREE.Vector3; radius: number } {
    return {
      center: this.getWorldPosition(),
      radius: this.colliderRadius,
    };
  }

  checkCollision(other: BlobGeometry): boolean {
    const myBounds = this.getColliderBounds();
    const otherBounds = other.getColliderBounds();
    const distance = myBounds.center.distanceTo(otherBounds.center);
    return distance < myBounds.radius + otherBounds.radius;
  }

  update(deltaTime: number = 0.016) {
    if (!this.mesh) return;

    // Apply forces
    const acceleration = this.force.clone().divideScalar(this.mass);
    this.velocity.add(acceleration.multiplyScalar(deltaTime));

    // Apply damping
    this.velocity.multiplyScalar(this.damping);

    // Update position
    this.mesh.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    this.position.copy(this.mesh.position);

    // Add rotation animation on blob's own axes during fighting
    if (this.fightMode && this.mesh) {
      // Each blob rotates around its own center on y axis with different speed
      this.mesh.rotation.y += this.rotationSpeed * deltaTime;
    }

    // Reset forces
    this.force.set(0, 0, 0);
  }

  applyForce(force: THREE.Vector3) {
    this.force.add(force);
  }

  getWorldPosition(): THREE.Vector3 {
    return this.mesh?.getWorldPosition(new THREE.Vector3()) || new THREE.Vector3();
  }

  setHighlight(highlighted: boolean, originalColor: string) {
    if (!this.mesh) return;

    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        if (highlighted) {
          child.material.emissive?.setHex(0x9b0808);
          child.material.emissiveIntensity = 0.5;
        } else {
          child.material.emissive?.setStyle(originalColor);
          child.material.emissiveIntensity = 0;
        }
      }
    });
  }

  dispose() {
    if (this.mesh) {
      this.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) {
            child.geometry.dispose();
          }
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
    }
  }
}

export class PhysicsSimulator {
  gravity = new THREE.Vector3(0, -9.8, 0);
  blobs: BlobGeometry[] = [];
  fightMode = false;
  fightForce = 25;
  blobRadius = 0.8; // Standard blob radius
  boxBounds = {
    minX: -2.9,
    maxX: 2.9,
    minY: -2.1,
    maxY: 2.1,
    minZ: -1.7,
    maxZ: 1.7,
  };

  addBlob(blob: BlobGeometry) {
    this.blobs.push(blob);
  }

  removeBlob(blob: BlobGeometry) {
    const idx = this.blobs.indexOf(blob);
    if (idx > -1) {
      this.blobs.splice(idx, 1);
    }
  }

  update(deltaTime: number = 0.016) {
    // Always update blobs, but only apply physics during fight
    for (const blob of this.blobs) {
      // Update blob
      blob.update(deltaTime);
      
      // Only apply physics forces during fight mode
      if (this.fightMode) {
        // No gravity during fight - blobs stay elevated
        // blob.applyForce(this.gravity.clone().multiplyScalar(0.3 * blob.mass));

        // During fight mode, apply forces towards target blob
        if (blob.targetBlob) {
          const targetPos = blob.targetBlob.getWorldPosition();
          const blobPos = blob.getWorldPosition();
          const direction = targetPos.clone().sub(blobPos);
          const distance = direction.length();

          if (distance > 0) {
            // Apply force towards target with magnitude based on distance
            const forceMagnitude = Math.min(distance * 8, this.fightForce);
            const attackForce = direction.normalize().multiplyScalar(forceMagnitude);
            blob.applyForce(attackForce);
          }
        }

        // Apply collision forces between blobs
        for (const other of this.blobs) {
          if (blob === other) continue;

          // Use blob collider radii for collision detection
          const minDistance = blob.colliderRadius + other.colliderRadius;
          const direction = other.getWorldPosition().sub(blob.getWorldPosition());
          const distance = direction.length();

          if (distance < minDistance && distance > 0) {
            const overlap = minDistance - distance;
            const pushForce = direction.normalize().multiplyScalar(overlap * 10);
            blob.applyForce(pushForce.multiplyScalar(0.5));
          }
        }

        // Constrain to box bounds - keep blobs fully inside the box using collider radius
        const pos = blob.getWorldPosition();
        const margin = blob.colliderRadius;
        const bounceDamping = 0.7; // Energy loss on bounce

        // X-axis constraint
        if (pos.x < this.boxBounds.minX + margin) {
          blob.velocity.x = Math.abs(blob.velocity.x) * bounceDamping;
          blob.mesh!.position.x = this.boxBounds.minX + margin;
        }
        if (pos.x > this.boxBounds.maxX - margin) {
          blob.velocity.x = -Math.abs(blob.velocity.x) * bounceDamping;
          blob.mesh!.position.x = this.boxBounds.maxX - margin;
        }

        // Y-axis constraint
        if (pos.y < this.boxBounds.minY + margin) {
          blob.velocity.y = Math.abs(blob.velocity.y) * bounceDamping;
          blob.mesh!.position.y = this.boxBounds.minY + margin;
        }
        if (pos.y > this.boxBounds.maxY - margin) {
          blob.velocity.y = -Math.abs(blob.velocity.y) * bounceDamping;
          blob.mesh!.position.y = this.boxBounds.maxY - margin;
        }

        // Z-axis constraint
        if (pos.z < this.boxBounds.minZ + margin) {
          blob.velocity.z = Math.abs(blob.velocity.z) * bounceDamping;
          blob.mesh!.position.z = this.boxBounds.minZ + margin;
        }
        if (pos.z > this.boxBounds.maxZ - margin) {
          blob.velocity.z = -Math.abs(blob.velocity.z) * bounceDamping;
          blob.mesh!.position.z = this.boxBounds.maxZ - margin;
        }
      }
    }
  }

  triggerFight() {
    this.fightMode = true;

    // Assign each blob a random target blob to move towards
    for (const blob of this.blobs) {
      blob.fightMode = true; // Set fight mode on blob
      if (this.blobs.length > 1) {
        // Select a random other blob as target
        let target = blob;
        while (target === blob) {
          target = this.blobs[Math.floor(Math.random() * this.blobs.length)];
        }
        blob.targetBlob = target;
        blob.rotationTime = 0; // Reset rotation animation
      }
    }
  }

  stopFight() {
    this.fightMode = false;
    
    // Stop fight mode on all blobs
    for (const blob of this.blobs) {
      blob.fightMode = false;
    }
  }

  resetBlobs(originalPositions: Map<BlobGeometry, THREE.Vector3>) {
    for (const blob of this.blobs) {
      blob.velocity.set(0, 0, 0);
      blob.force.set(0, 0, 0);
      blob.targetBlob = null;
      blob.rotationTime = 0;

      const originalPos = originalPositions.get(blob);
      if (originalPos && blob.mesh) {
        blob.mesh.position.copy(originalPos);
        blob.position.copy(originalPos);
        // Reset rotation to initial state (X and Z back to 0, Y stays at -PI/2)
        blob.mesh.rotation.x = 0;
        blob.mesh.rotation.z = 0;
      }
    }
  }
}
