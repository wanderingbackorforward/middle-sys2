import time
from threading import RLock

_store = {}
_lock = RLock()

def set(key, value):
    ts = time.time()
    with _lock:
        _store[key] = (value, ts)
    return True

def get(key, ttl=None):
    with _lock:
        v = _store.get(key)
        if not v:
            return None
        value, ts = v
    if ttl is None:
        return value
    if time.time() - ts <= ttl:
        return value
    return None

def get_last(key):
    with _lock:
        v = _store.get(key)
        if not v:
            return None
        return v[0]

def has(key):
    with _lock:
        return key in _store
