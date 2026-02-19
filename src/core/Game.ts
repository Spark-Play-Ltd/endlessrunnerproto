import * as THREE from 'three';
import { EventBus } from './EventBus';
import { GameEvent, GameEventPayloads } from './events';
import { GameState } from './GameState';
import { SystemRegistry } from './SystemRegistry';
import { InputSystem } from '../systems/InputSystem';
import { PlayerMovementSystem } from '../systems/PlayerMovementSystem';
import { ObstacleSpawnSystem } from '../systems/ObstacleSpawnSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { RenderSystem } from '../systems/RenderSystem';
import type { UpdateContext } from './types';
import '../style.css';

export class Game {
  readonly events = new EventBus<GameEventPayloads>();

  private readonly state = new GameState();
  private readonly systems = new SystemRegistry();
  private readonly renderSystem: RenderSystem;
  private readonly clock = new THREE.Clock();

  private readonly targetFrameDuration = 1 / 60;

  private animationFrameId: number | null = null;
  private lastFrameTime = 0;

  constructor(private readonly rootElement: HTMLElement) {
    this.renderSystem = new RenderSystem(this.rootElement, this.state, {
      enableFog: true,
      fogColor: '#222222',
      fogNear: 50,
      fogFar: 140
    });

    this.registerSystem(new InputSystem(this.rootElement, this.events));
    this.registerSystem(new PlayerMovementSystem(this.state, this.events));
    this.registerSystem(new ObstacleSpawnSystem(this.state));
    this.registerSystem(new CollisionSystem(this.state, this.events));

    this.events.on(GameEvent.RunEnd, () => {
      this.state.isRunActive = false;
      this.state.player.state.isAlive = false;
    });

    window.addEventListener('resize', this.handleResize);
  }

  start(): void {
    if (this.animationFrameId !== null) {
      return;
    }

    this.clock.start();
    this.lastFrameTime = 0;
    this.animationFrameId = window.requestAnimationFrame(this.loop);
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

  update(deltaTime: number): void {
    const context: UpdateContext = {
      game: this,
      deltaTime,
      elapsedTime: this.clock.elapsedTime
    };

    this.systems.update(context);
    this.renderSystem.update(deltaTime);
  }

  private readonly loop = (timestampMs: number): void => {
    const timestampSeconds = timestampMs * 0.001;

    if (this.lastFrameTime === 0) {
      this.lastFrameTime = timestampSeconds;
    }

    const frameDelta = timestampSeconds - this.lastFrameTime;

    if (frameDelta >= this.targetFrameDuration) {
      this.lastFrameTime = timestampSeconds;
      const deltaTime = this.clock.getDelta();
      this.update(deltaTime);
    }

    this.animationFrameId = window.requestAnimationFrame(this.loop);
  };

  private readonly handleResize = (): void => {
    this.renderSystem.resize();
  };
}
