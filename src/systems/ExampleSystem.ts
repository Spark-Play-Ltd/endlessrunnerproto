import type { System, UpdateContext } from '../core/types';

export class ExampleSystem implements System {
  readonly id = 'example-system';

  update(_context: UpdateContext): void {
    // Intentionally empty. Future gameplay systems plug in here.
  }
}
