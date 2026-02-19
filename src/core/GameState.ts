import { Obstacle } from '../entities/Obstacle';
import { Player } from '../entities/Player';

export interface GameStateConfig {
  laneWidth?: number;
  forwardSpeed?: number;
  laneChangeDuration?: number;
  jumpImpulse?: number;
  riseGravity?: number;
  fallGravity?: number;
  groundTolerance?: number;
  reactionTimeSeconds?: number;
  spawnLookAheadDistance?: number;
  obstacleCleanupDistance?: number;
  playerHitboxScale?: { x: number; y: number; z: number };
  obstacleHitboxScale?: { x: number; y: number; z: number };
  jumpClearanceMargin?: number;
}

export class GameState {
  readonly laneWidth: number;
  readonly lanePositions: [number, number, number];
  readonly forwardSpeed: number;
  readonly laneChangeDuration: number;

  readonly jumpImpulse: number;
  readonly riseGravity: number;
  readonly fallGravity: number;
  readonly groundTolerance: number;

  readonly reactionTimeSeconds: number;
  readonly spawnLookAheadDistance: number;
  readonly obstacleCleanupDistance: number;

  readonly playerHitboxScale: { x: number; y: number; z: number };
  readonly obstacleHitboxScale: { x: number; y: number; z: number };
  readonly jumpClearanceMargin: number;

  readonly player: Player;
  readonly playerGroundCenterY: number;
  readonly obstacles: Obstacle[] = [];

  isRunActive = true;

  constructor(config: GameStateConfig = {}) {
    this.laneWidth = config.laneWidth ?? 1.2;
    this.lanePositions = [-this.laneWidth, 0, this.laneWidth];
    this.forwardSpeed = config.forwardSpeed ?? 7;
    this.laneChangeDuration = config.laneChangeDuration ?? 0.13;

    this.jumpImpulse = config.jumpImpulse ?? 5.8;
    this.riseGravity = config.riseGravity ?? 22;
    this.fallGravity = config.fallGravity ?? 34;
    this.groundTolerance = config.groundTolerance ?? 0.02;

    this.reactionTimeSeconds = config.reactionTimeSeconds ?? 0.95;
    this.spawnLookAheadDistance = config.spawnLookAheadDistance ?? 36;
    this.obstacleCleanupDistance = config.obstacleCleanupDistance ?? 20;

    this.playerHitboxScale = config.playerHitboxScale ?? { x: 0.8, y: 0.86, z: 0.8 };
    this.obstacleHitboxScale = config.obstacleHitboxScale ?? { x: 0.86, y: 0.86, z: 0.86 };
    this.jumpClearanceMargin = config.jumpClearanceMargin ?? 0.1;

    this.player = new Player(this.lanePositions[1]);
    this.playerGroundCenterY = this.player.mesh.position.y;
  }

  get minimumReactionDistance(): number {
    return this.forwardSpeed * this.reactionTimeSeconds;
  }
}
