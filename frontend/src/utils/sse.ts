export type SSEHandlers = Record<string, (payload: any) => void>;

export function connectSSE(url: string, handlers: SSEHandlers) {
  let es: EventSource | null = null;
  let retry = 1000;
  let closed = false;

  const open = () => {
    es = new EventSource(url);
    es.addEventListener('message', (e: MessageEvent) => {
      try {
        const evt = JSON.parse(e.data);
        const fn = handlers[evt.channel];
        if (fn) fn(evt.payload);
      } catch {}
    });
    es.addEventListener('heartbeat', () => {});
    es.onerror = () => {
      if (es) es.close();
      es = null;
      if (!closed) {
        setTimeout(open, retry);
        retry = Math.min(retry * 2, 10000);
      }
    };
  };
  open();

  return () => {
    closed = true;
    if (es) es.close();
  };
}
