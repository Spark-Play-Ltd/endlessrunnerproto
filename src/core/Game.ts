import * as THREE from 'three';
import { EventBus } from './EventBus';
import { GameEventPayloads } from './events';
import { SystemRegistry } from './SystemRegistry';
import type { UpdateContext } from './types';
import '../style.css';

export class Game {
  readonly events = new EventBus<GameEventPayloads>();

  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly systems = new SystemRegistry();
  private readonly clock = new THREE.Clock();

  private animationFrameId: number | null = null;

  constructor(private readonly rootElement: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);

    this.setupScene();
    this.setupCanvas();
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  }

  start(): void {
    if (this.animationFrameId !== null) {
      return;
    }

    this.clock.start();
    this.loop();
  }

  stop(): void {
    if (this.animationFrameId === null) {
      return;
    }

    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
    this.clock.stop();
  }

  registerSystem(system: Parameters<SystemRegistry['register']>[0]): void {
    this.systems.register(system);
  }

  private readonly loop = (): void => {
    const deltaTime = this.clock.getDelta();
    const elapsedTime = this.clock.elapsedTime;

    const context: UpdateContext = {
      game: this,
      deltaTime,
      elapsedTime
    };

    this.systems.update(context);
    this.renderer.render(this.scene, this.camera);

    this.animationFrameId = window.requestAnimationFrame(this.loop);
  };

  private setupScene(): void {
    this.scene.background = new THREE.Color('#202020');
    this.camera.position.set(0, 2, 5);
    this.camera.lookAt(0, 0, 0);
  }

  private setupCanvas(): void {
    this.rootElement.appendChild(this.renderer.domElement);
  }

  private readonly handleResize = (): void => {
    const { clientWidth, clientHeight } = this.rootElement;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };
}
