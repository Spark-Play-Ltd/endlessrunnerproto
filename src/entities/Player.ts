import * as THREE from 'three';

export interface PlayerState {
  laneIndex: 0 | 1 | 2;
  isGrounded: boolean;
  isAlive: boolean;
}

export class Player {
  readonly mesh: THREE.Mesh;
  readonly state: PlayerState;

  constructor(initialLaneX: number) {
    this.mesh = this.createMesh();
    this.mesh.position.set(initialLaneX, 0.8, 0);

    this.state = {
      laneIndex: 1,
      isGrounded: true,
      isAlive: true
    };
  }

  private createMesh(): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(0.8, 1.6, 0.8);
    const material = new THREE.MeshStandardMaterial({ color: '#9a9a9a' });

    return new THREE.Mesh(geometry, material);
  }
}
