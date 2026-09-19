export type SignalOutcome = "legit" | "fraud" | "error";

export interface SignalEvent {
  outcome: SignalOutcome;
}

type Listener = (event: SignalEvent) => void;

const listeners = new Set<Listener>();

/** Fire-and-forget: called whenever a real prediction (or failed request) completes. */
export function emitSignal(event: SignalEvent) {
  listeners.forEach((listener) => listener(event));
}

/** Subscribe to real prediction events. Returns an unsubscribe function. */
export function subscribeSignal(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
