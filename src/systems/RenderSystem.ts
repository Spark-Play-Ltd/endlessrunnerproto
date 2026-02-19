import * as THREE from 'three';
import type { GameState } from '../core/GameState';

export interface RenderSystemConfig {
  enableFog?: boolean;
  fogColor?: number | string;
  fogNear?: number;
  fogFar?: number;
}

export class RenderSystem {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;

  private readonly desiredCameraPosition = new THREE.Vector3();
  private readonly desiredLookTarget = new THREE.Vector3();
  private readonly renderedObstacleMeshes = new Map<string, THREE.Mesh>();

  constructor(
    private readonly rootElement: HTMLElement,
    private readonly state: GameState,
    config: RenderSystemConfig = {}
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 500);

    this.setupScene(config);
    this.scene.add(this.state.player.mesh);

    this.setupCamera();
    this.rootElement.appendChild(this.renderer.domElement);
    this.resize();
  }

  update(deltaTime: number): void {
    this.syncObstacleMeshes();
    this.updateCamera(deltaTime);
    this.render();
  }

  resize(): void {
    const width = Math.max(this.rootElement.clientWidth, 1);
    const height = Math.max(this.rootElement.clientHeight, 1);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height, false);
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private syncObstacleMeshes(): void {
    const activeIds = new Set(this.state.obstacles.map((obstacle) => obstacle.id));

    for (const obstacle of this.state.obstacles) {
      if (!this.renderedObstacleMeshes.has(obstacle.id)) {
        this.scene.add(obstacle.mesh);
        this.renderedObstacleMeshes.set(obstacle.id, obstacle.mesh);
      }
    }

    for (const [id, mesh] of this.renderedObstacleMeshes.entries()) {
      if (!activeIds.has(id)) {
        this.scene.remove(mesh);
        this.renderedObstacleMeshes.delete(id);
      }
    }
  }

  private setupScene(config: RenderSystemConfig): void {
    this.scene.background = new THREE.Color('#222222');

    if (config.enableFog) {
      this.scene.fog = new THREE.Fog(
        config.fogColor ?? '#222222',
        config.fogNear ?? 50,
        config.fogFar ?? 140
      );
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(8, 14, 10);
    this.scene.add(directionalLight);

    const groundGeometry = new THREE.PlaneGeometry(300, 1000);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: '#777777' });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI * 0.5;
    this.scene.add(ground);

    this.addLaneDebugLines();
  }

  private addLaneDebugLines(): void {
    const lineMaterial = new THREE.LineBasicMaterial({ color: '#555555' });
    const zMin = -500;
    const zMax = 500;

    for (const laneX of this.state.lanePositions) {
      const points = [new THREE.Vector3(laneX, 0.02, zMin), new THREE.Vector3(laneX, 0.02, zMax)];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMaterial);
      this.scene.add(line);
    }
  }

  private setupCamera(): void {
    this.camera.position.set(0, 3, -6);
    this.camera.lookAt(0, 1, 10);
  }

  private updateCamera(deltaTime: number): void {
    const damping = 1 - Math.exp(-8 * deltaTime);

    this.desiredCameraPosition.copy(this.state.player.mesh.position).add(new THREE.Vector3(0, 3, -6));
    this.camera.position.lerp(this.desiredCameraPosition, damping);

    this.desiredLookTarget.copy(this.state.player.mesh.position).add(new THREE.Vector3(0, 1, 10));
    this.camera.lookAt(this.desiredLookTarget);
  }
}
