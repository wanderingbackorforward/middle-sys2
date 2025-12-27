import threading
import queue

class SseHub:
    def __init__(self):
        self._topics = {}
        self._lock = threading.Lock()

    def subscribe(self, topic: str):
        q = queue.Queue(maxsize=1024)
        with self._lock:
            self._topics.setdefault(topic, set()).add(q)
        return q

    def broadcast(self, topic: str, channel: str, payload):
        item = {"channel": channel, "payload": payload}
        with self._lock:
            for q in list(self._topics.get(topic, set())):
                try:
                    q.put_nowait(item)
                except Exception:
                    pass

