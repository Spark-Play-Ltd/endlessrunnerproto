export type EventMap = Record<string, unknown>;

export class EventBus<TEvents extends EventMap> {
  private listeners = new Map<keyof TEvents, Set<(payload: TEvents[keyof TEvents]) => void>>();

  on<TKey extends keyof TEvents>(
    eventName: TKey,
    handler: (payload: TEvents[TKey]) => void
  ): () => void {
    const handlers = this.listeners.get(eventName) ?? new Set();
    handlers.add(handler as (payload: TEvents[keyof TEvents]) => void);
    this.listeners.set(eventName, handlers);

    return () => this.off(eventName, handler);
  }

  off<TKey extends keyof TEvents>(
    eventName: TKey,
    handler: (payload: TEvents[TKey]) => void
  ): void {
    const handlers = this.listeners.get(eventName);

    if (!handlers) {
      return;
    }

    handlers.delete(handler as (payload: TEvents[keyof TEvents]) => void);

    if (handlers.size === 0) {
      this.listeners.delete(eventName);
    }
  }

  emit<TKey extends keyof TEvents>(eventName: TKey, payload: TEvents[TKey]): void {
    const handlers = this.listeners.get(eventName);

    if (!handlers) {
      return;
    }

    handlers.forEach((handler) => handler(payload as TEvents[keyof TEvents]));
  }
}
