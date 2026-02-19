import type { Game } from './Game';

export interface UpdateContext {
  readonly game: Game;
  readonly deltaTime: number;
  readonly elapsedTime: number;
}

export interface System {
  readonly id: string;
  update(context: UpdateContext): void;
}
