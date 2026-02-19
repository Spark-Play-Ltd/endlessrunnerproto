import { EventBus } from '../core/EventBus';
import { GameEvent, GameEventPayloads } from '../core/events';
import type { System, UpdateContext } from '../core/types';

export interface InputSystemConfig {
  swipeThresholdPx?: number;
}

export class InputSystem implements System {
  readonly id = 'input-system';

  private readonly swipeThresholdPx: number;
  private pointerStartX: number | null = null;
  private pointerStartY: number | null = null;

  constructor(
    private readonly rootElement: HTMLElement,
    private readonly events: EventBus<GameEventPayloads>,
    config: InputSystemConfig = {}
  ) {
    this.swipeThresholdPx = config.swipeThresholdPx ?? 32;

    this.rootElement.addEventListener('pointerdown', this.handlePointerDown);
    this.rootElement.addEventListener('pointerup', this.handlePointerUp);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  update(_context: UpdateContext): void {
    // Event-driven input only; no per-frame polling required yet.
  }

  private readonly emitLaneIntent = (direction: -1 | 1): void => {
    this.events.emit(GameEvent.LaneChangeIntent, { direction });
  };

  private readonly emitJumpIntent = (): void => {
    this.events.emit(GameEvent.JumpIntent, {});
  };

  private readonly handlePointerDown = (event: PointerEvent): void => {
    this.pointerStartX = event.clientX;
    this.pointerStartY = event.clientY;
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    if (this.pointerStartX === null || this.pointerStartY === null) {
      return;
    }

    const deltaX = event.clientX - this.pointerStartX;
    const deltaY = event.clientY - this.pointerStartY;

    this.pointerStartX = null;
    this.pointerStartY = null;

    if (Math.abs(deltaX) >= this.swipeThresholdPx && Math.abs(deltaX) > Math.abs(deltaY)) {
      this.emitLaneIntent(deltaX > 0 ? 1 : -1);
      return;
    }

    if (deltaY <= -this.swipeThresholdPx && Math.abs(deltaY) > Math.abs(deltaX)) {
      this.emitJumpIntent();
    }
  };

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.emitLaneIntent(-1);
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.emitLaneIntent(1);
      return;
    }

    if (event.code === 'Space') {
      event.preventDefault();
      this.emitJumpIntent();
    }
  };
}
