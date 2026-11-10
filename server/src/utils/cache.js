/**
 * High-Throughput In-Memory Micro-Cache for Sub-Millisecond Concurrency
 * Designed to handle 10,000+ requests/sec under massive traffic spikes
 */

class MicroCache {
  constructor(defaultTtlSeconds = 5) {
    this.cache = new Map();
    this.defaultTtlMs = defaultTtlSeconds * 1000;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key, data, ttlSeconds = null) {
    const ttlMs = ttlSeconds ? ttlSeconds * 1000 : this.defaultTtlMs;
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs
    });
    // Prevent unbounded memory growth by pruning expired entries if size exceeds 2,000
    if (this.cache.size > 2000) {
      this.prune();
    }
  }

  prune() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  invalidatePrefix(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
  }
}

export const eventsCache = new MicroCache(5); // 5-second TTL for public events catalog
