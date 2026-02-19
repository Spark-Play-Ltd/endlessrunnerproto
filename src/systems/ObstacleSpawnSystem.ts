import { Obstacle } from '../entities/Obstacle';
import type { GameState } from '../core/GameState';
import type { System, UpdateContext } from '../core/types';
import { PatternManager, type ObstaclePattern } from './PatternManager';

interface ScheduledSpawn {
  laneIndex: 0 | 1 | 2;
  zPosition: number;
}

export class ObstacleSpawnSystem implements System {
  readonly id = 'obstacle-spawn-system';

  private readonly patternManager = new PatternManager();
  private nextPatternAnchorZ: number;

  constructor(private readonly state: GameState) {
    this.nextPatternAnchorZ = this.state.spawnLookAheadDistance;
  }

  update(_context: UpdateContext): void {
    if (!this.state.isRunActive) {
      return;
    }

    const playerZ = this.state.player.mesh.position.z;
    const spawnHorizonZ = playerZ + this.state.spawnLookAheadDistance;

    while (this.nextPatternAnchorZ <= spawnHorizonZ) {
      const pattern = this.patternManager.pickPattern();
      this.spawnPattern(pattern, this.nextPatternAnchorZ, playerZ);
      this.nextPatternAnchorZ += pattern.durationSeconds * this.state.forwardSpeed;
    }

    this.recycleObstacles(playerZ);
  }

  private spawnPattern(pattern: ObstaclePattern, anchorZ: number, playerZ: number): void {
    const scheduled = pattern.obstacles.map<ScheduledSpawn>((entry) => ({
      laneIndex: entry.laneIndex,
      zPosition: anchorZ + entry.timeOffsetSeconds * this.state.forwardSpeed
    }));

    if (!this.isPatternFair(scheduled, playerZ)) {
      return;
    }

    for (const spawn of scheduled) {
      const obstacle = new Obstacle(
        spawn.laneIndex,
        this.state.lanePositions[spawn.laneIndex],
        spawn.zPosition
      );

      this.state.obstacles.push(obstacle);
    }
  }

  private isPatternFair(spawns: ScheduledSpawn[], playerZ: number): boolean {
    const groupedBySlice = new Map<number, Set<number>>();

    for (const spawn of spawns) {
      if (spawn.zPosition - playerZ < this.state.minimumReactionDistance) {
        return false;
      }

      const slice = Math.round(spawn.zPosition * 10) / 10;
      const lanes = groupedBySlice.get(slice) ?? new Set<number>();
      lanes.add(spawn.laneIndex);
      groupedBySlice.set(slice, lanes);

      if (lanes.size === 3) {
        return false;
      }
    }

    const existingZ = this.state.obstacles.map((obstacle) => obstacle.mesh.position.z);

    for (const spawn of spawns) {
      for (const z of existingZ) {
        const distance = Math.abs(spawn.zPosition - z);
        if (distance > 0 && distance < this.state.minimumReactionDistance * 0.6) {
          return false;
        }
      }
    }

    return true;
  }

  private recycleObstacles(playerZ: number): void {
    const cleanupThreshold = playerZ - this.state.obstacleCleanupDistance;

    for (let i = this.state.obstacles.length - 1; i >= 0; i -= 1) {
      if (this.state.obstacles[i].mesh.position.z < cleanupThreshold) {
        this.state.obstacles.splice(i, 1);
      }
    }
  }
}
