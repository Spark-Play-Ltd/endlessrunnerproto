import * as THREE from 'three';

let obstacleSequence = 0;

export class Obstacle {
  readonly id: string;
  readonly laneIndex: 0 | 1 | 2;
  readonly mesh: THREE.Mesh;

  constructor(laneIndex: 0 | 1 | 2, x: number, z: number) {
    this.id = `obstacle-${obstacleSequence++}`;
    this.laneIndex = laneIndex;

    const geometry = new THREE.BoxGeometry(0.9, 1.2, 0.9);
    const material = new THREE.MeshStandardMaterial({ color: '#8a8a8a' });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.name = this.id;
    this.mesh.position.set(x, 0.6, z);
  }
}
