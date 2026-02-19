export enum GameEvent {
  RunEnd = 'RUN_END',
  RunComplete = 'RUN_COMPLETE'
}

export interface GameEventPayloads {
  [GameEvent.RunEnd]: { reason: 'collision' | 'manual' | 'timeout' };
  [GameEvent.RunComplete]: { durationSeconds: number };
}
