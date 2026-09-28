"""Bounded, process-local reuse of identical requests, including in-flight work."""

from collections import OrderedDict
from concurrent.futures import Future
from copy import deepcopy
from threading import Lock
from time import monotonic


class InferenceCache:
    def __init__(self, max_entries=128, ttl_seconds=300, clock=monotonic):
        self.max_entries = max_entries
        self.ttl_seconds = ttl_seconds
        self.clock = clock
        self.values = OrderedDict()
        self.pending = {}
        self.lock = Lock()

    def get_or_compute(self, key, compute, cache_if=lambda value: True):
        with self.lock:
            cached = self.values.get(key)
            if cached and cached[0] > self.clock():
                self.values.move_to_end(key)
                return deepcopy(cached[1]), "hit"
            self.values.pop(key, None)
            future = self.pending.get(key)
            owner = future is None
            if owner:
                future = self.pending[key] = Future()
        if not owner:
            return deepcopy(future.result()), "shared"
        try:
            result = compute()
            with self.lock:
                if cache_if(result):
                    self.values[key] = (self.clock() + self.ttl_seconds, deepcopy(result))
                    while len(self.values) > self.max_entries:
                        self.values.popitem(last=False)
                self.pending.pop(key, None)
                future.set_result(result)
            return deepcopy(result), "miss"
        except BaseException as error:
            with self.lock:
                self.pending.pop(key, None)
                future.set_exception(error)
            raise
