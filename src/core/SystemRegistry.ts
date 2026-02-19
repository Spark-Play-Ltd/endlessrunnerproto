import type { System, UpdateContext } from './types';

export class SystemRegistry {
  private systems: System[] = [];

  register(system: System): void {
    this.systems.push(system);
  }

  update(context: UpdateContext): void {
    for (const system of this.systems) {
      system.update(context);
    }
  }
}
