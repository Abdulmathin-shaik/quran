/**
 * IndexedDB persistence layer for Al-Quran Al-Karim
 * Provides instant sub-millisecond retrieval of cached Surahs and reading state.
 */
const DB_NAME = 'QuranMcMasterDB';
const DB_VERSION = 1;

class QuranDB {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
  }

  init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        // Store for surah verses
        if (!db.objectStoreNames.contains('surahs')) {
          db.createObjectStore('surahs', { keyPath: 'id' });
        }
        // Store for user preferences and bookmarks
        if (!db.objectStoreNames.contains('userdata')) {
          db.createObjectStore('userdata', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.warn('IndexedDB initialization failed, falling back to in-memory/cache:', event.target.error);
        resolve(null);
      };
    });
  }

  async getSurah(id) {
    await this.initPromise;
    if (!this.db) return null;
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('surahs', 'readonly');
        const store = tx.objectStore('surahs');
        const request = store.get(Number(id));
        request.onsuccess = () => resolve(request.result ? request.result.data : null);
        request.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  }

  async saveSurah(id, data) {
    await this.initPromise;
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('surahs', 'readwrite');
        const store = tx.objectStore('surahs');
        store.put({ id: Number(id), data, timestamp: Date.now() });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  async countCachedSurahs() {
    await this.initPromise;
    if (!this.db) return 0;
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('surahs', 'readonly');
        const store = tx.objectStore('surahs');
        const countRequest = store.count();
        countRequest.onsuccess = () => resolve(countRequest.result);
        countRequest.onerror = () => resolve(0);
      } catch (e) {
        resolve(0);
      }
    });
  }

  async getSetting(key, defaultValue = null) {
    await this.initPromise;
    if (!this.db) {
      try {
        const val = localStorage.getItem(`quran_${key}`);
        return val !== null ? JSON.parse(val) : defaultValue;
      } catch {
        return defaultValue;
      }
    }
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('userdata', 'readonly');
        const store = tx.objectStore('userdata');
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ? req.result.value : defaultValue);
        req.onerror = () => resolve(defaultValue);
      } catch {
        resolve(defaultValue);
      }
    });
  }

  async saveSetting(key, value) {
    await this.initPromise;
    try {
      localStorage.setItem(`quran_${key}`, JSON.stringify(value));
    } catch {}
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('userdata', 'readwrite');
        const store = tx.objectStore('userdata');
        store.put({ key, value });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  }
}

window.quranDB = new QuranDB();
