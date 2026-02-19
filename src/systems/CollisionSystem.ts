import * as THREE from 'three';
import { EventBus } from '../core/EventBus';
import { GameEvent, GameEventPayloads } from '../core/events';
import type { GameState } from '../core/GameState';
import type { System, UpdateContext } from '../core/types';

export class CollisionSystem implements System {
  readonly id = 'collision-system';

  private readonly playerSize = new THREE.Vector3(0.8, 1.6, 0.8);
  private readonly obstacleSize = new THREE.Vector3(0.9, 1.2, 0.9);
  private readonly playerBox = new THREE.Box3();
  private readonly obstacleBox = new THREE.Box3();
  private readonly scaledPlayerSize = new THREE.Vector3();
  private readonly scaledObstacleSize = new THREE.Vector3();

  constructor(
    private readonly state: GameState,
    private readonly events: EventBus<GameEventPayloads>
  ) {}

  update(_context: UpdateContext): void {
    if (!this.state.isRunActive || !this.state.player.state.isAlive) {
      return;
    }

    this.scaledPlayerSize
      .copy(this.playerSize)
      .multiply(new THREE.Vector3(
        this.state.playerHitboxScale.x,
        this.state.playerHitboxScale.y,
        this.state.playerHitboxScale.z
      ));

    this.playerBox.setFromCenterAndSize(this.state.player.mesh.position, this.scaledPlayerSize);

    for (const obstacle of this.state.obstacles) {
      this.scaledObstacleSize
        .copy(this.obstacleSize)
        .multiply(new THREE.Vector3(
          this.state.obstacleHitboxScale.x,
          this.state.obstacleHitboxScale.y,
          this.state.obstacleHitboxScale.z
        ));

      this.obstacleBox.setFromCenterAndSize(obstacle.mesh.position, this.scaledObstacleSize);

      if (!this.playerBox.intersectsBox(this.obstacleBox)) {
        continue;
      }

      const playerBottomY = this.playerBox.min.y;
      const obstacleTopY = this.obstacleBox.max.y;
      const clearsObstacle = playerBottomY >= obstacleTopY - this.state.jumpClearanceMargin;

      if (clearsObstacle) {
        continue;
      }

      this.state.isRunActive = false;
      this.state.player.state.isAlive = false;
      this.events.emit(GameEvent.RunEnd, { reason: 'collision_obstacle' });
      return;
    }
  }
}
