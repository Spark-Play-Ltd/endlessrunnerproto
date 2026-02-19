export enum GameEvent {
  RunEnd = 'RUN_END',
  RunComplete = 'RUN_COMPLETE',
  LaneChangeIntent = 'LANE_CHANGE_INTENT',
  JumpIntent = 'JUMP_INTENT',
  PlayerLanded = 'PLAYER_LANDED'
}

export interface GameEventPayloads {
  [GameEvent.RunEnd]: { reason: 'collision_obstacle' | 'manual' | 'timeout' };
  [GameEvent.RunComplete]: { durationSeconds: number };
  [GameEvent.LaneChangeIntent]: { direction: -1 | 1 };
  [GameEvent.JumpIntent]: Record<string, never>;
  [GameEvent.PlayerLanded]: { z: number };
}
