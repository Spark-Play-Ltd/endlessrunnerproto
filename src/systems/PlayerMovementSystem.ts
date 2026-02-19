import { EventBus } from '../core/EventBus';
import { GameEvent, GameEventPayloads } from '../core/events';
import type { GameState } from '../core/GameState';
import type { System, UpdateContext } from '../core/types';

interface LaneTransition {
  fromX: number;
  toX: number;
  elapsed: number;
  duration: number;
}

export class PlayerMovementSystem implements System {
  readonly id = 'player-movement-system';

  private laneTransition: LaneTransition | null = null;
  private verticalVelocity = 0;

  constructor(state: GameState, events: EventBus<GameEventPayloads>) {
    this.state = state;
    this.events = events;

    events.on(GameEvent.LaneChangeIntent, ({ direction }) => {
      this.handleLaneIntent(direction);
    });

    events.on(GameEvent.JumpIntent, () => {
      this.handleJumpIntent();
    });
  }

  private readonly state: GameState;
  private readonly events: EventBus<GameEventPayloads>;

  update(context: UpdateContext): void {
    const { player } = this.state;

    if (!this.state.isRunActive || !player.state.isAlive) {
      return;
    }

    player.mesh.position.z += this.state.forwardSpeed * context.deltaTime;

    this.updateLaneTransition(context.deltaTime);
    this.updateJumpAndGrounding(context.deltaTime);
  }

  private updateLaneTransition(deltaTime: number): void {
    if (!this.laneTransition) {
      return;
    }

    this.laneTransition.elapsed += deltaTime;
    const t = Math.min(this.laneTransition.elapsed / this.laneTransition.duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);

    this.state.player.mesh.position.x =
      this.laneTransition.fromX + (this.laneTransition.toX - this.laneTransition.fromX) * eased;

    if (t >= 1) {
      this.laneTransition = null;
    }
  }

  private updateJumpAndGrounding(deltaTime: number): void {
    const { player, playerGroundCenterY, riseGravity, fallGravity, groundTolerance } = this.state;

    const gravity = this.verticalVelocity > 0 ? riseGravity : fallGravity;
    this.verticalVelocity -= gravity * deltaTime;
    player.mesh.position.y += this.verticalVelocity * deltaTime;

    const groundLimit = playerGroundCenterY + groundTolerance;

    if (player.mesh.position.y <= groundLimit && this.verticalVelocity <= 0) {
      const wasAirborne = !player.state.isGrounded;

      player.mesh.position.y = playerGroundCenterY;
      this.verticalVelocity = 0;
      player.state.isGrounded = true;

      if (wasAirborne) {
        this.events.emit(GameEvent.PlayerLanded, { z: player.mesh.position.z });
      }
      return;
    }

    player.state.isGrounded = false;
  }

  private handleJumpIntent(): void {
    const { player, jumpImpulse } = this.state;

    if (!player.state.isGrounded || !player.state.isAlive) {
      return;
    }

    this.verticalVelocity = jumpImpulse;
    player.state.isGrounded = false;
  }

  private handleLaneIntent(direction: -1 | 1): void {
    const { player, lanePositions } = this.state;

    if (!player.state.isGrounded || !player.state.isAlive) {
      return;
    }

    const nextLane = Math.max(0, Math.min(2, player.state.laneIndex + direction)) as 0 | 1 | 2;

    if (nextLane === player.state.laneIndex) {
      return;
    }

    player.state.laneIndex = nextLane;
    this.laneTransition = {
      fromX: player.mesh.position.x,
      toX: lanePositions[nextLane],
      elapsed: 0,
      duration: this.state.laneChangeDuration
    };
  }
}
