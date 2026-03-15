import * as THREE from 'three';

export class BlobGeometry {
  mesh: THREE.Mesh | null = null;
  position: THREE.Vector3;
  velocity: THREE.Vector3 = new THREE.Vector3();
  force: THREE.Vector3 = new THREE.Vector3();
  damping = 0.98;
  mass = 1;

  constructor(
    color: string,
    position: THREE.Vector3 = new THREE.Vector3(),
    radius: number = 0.8
  ) {
    const geometry = new THREE.IcosahedronGeometry(radius, 5);
    const material = new THREE.MeshPhongMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.1,
      shininess: 100,
      wireframe: false,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
    this.position = this.mesh.position.clone();
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

    if (highlighted) {
      (this.mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.4;
      (this.mesh.material as THREE.MeshPhongMaterial).emissive.setHex(0x9b0808);
    } else {
      (this.mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.1;
      (this.mesh.material as THREE.MeshPhongMaterial).emissive.setStyle(originalColor);
    }
  }

  dispose() {
    if (this.mesh) {
      (this.mesh.geometry as THREE.BufferGeometry).dispose();
      (this.mesh.material as THREE.Material).dispose();
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
    // Update each blob
    for (const blob of this.blobs) {
      // Apply gravity
      if (this.fightMode) {
        // Lighter gravity during fight
        blob.applyForce(this.gravity.clone().multiplyScalar(0.3 * blob.mass));
      } else {
        blob.applyForce(this.gravity.clone().multiplyScalar(blob.mass));
      }

      // Apply collision forces between blobs
      for (const other of this.blobs) {
        if (blob === other) continue;

        const direction = other.getWorldPosition().sub(blob.getWorldPosition());
        const distance = direction.length();
        const minDistance = 1.6; // Two blob radii

        if (distance < minDistance && distance > 0) {
          const overlap = minDistance - distance;
          const pushForce = direction.normalize().multiplyScalar(overlap * 10);

          if (this.fightMode) {
            blob.applyForce(pushForce.multiplyScalar(0.5));
          } else {
            blob.applyForce(pushForce.multiplyScalar(0.3));
          }
        }
      }

      // Constrain to box bounds - keep blobs fully inside the box
      const pos = blob.getWorldPosition();
      const margin = this.blobRadius;
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

      // Update blob
      blob.update(deltaTime);
    }
  }

  triggerFight() {
    this.fightMode = true;

    // Apply random forces to all blobs
    for (const blob of this.blobs) {
      const randomForce = new THREE.Vector3(
        (Math.random() - 0.5) * this.fightForce,
        (Math.random() - 0.5) * this.fightForce,
        (Math.random() - 0.5) * this.fightForce
      );
      blob.applyForce(randomForce);
    }
  }

  stopFight() {
    this.fightMode = false;
  }

  resetBlobs(originalPositions: Map<BlobGeometry, THREE.Vector3>) {
    for (const blob of this.blobs) {
      blob.velocity.set(0, 0, 0);
      blob.force.set(0, 0, 0);

      const originalPos = originalPositions.get(blob);
      if (originalPos && blob.mesh) {
        blob.mesh.position.copy(originalPos);
        blob.position.copy(originalPos);
      }
    }
  }
}
