import { AnalysisResult, HistoryRecord } from "../types";

const DB_NAME = 'DigitLensDB';
const DB_VERSION = 1;
const STORE_NAME = 'scans';

/**
 * StorageService:
 * In a production environment with a Backend, this service would communicate 
 * with AWS S3 (for images) and a Database (DynamoDB/PostgreSQL) for metadata.
 * 
 * Since this is a frontend-only demo, we use IndexedDB to simulate 
 * persistent cloud storage within the browser.
 */

const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
      reject("Could not open local database");
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('userEmail', 'userEmail', { unique: false });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const storageService = {
  saveScan: async (userEmail: string, file: File, result: AnalysisResult): Promise<void> => {
    try {
      const db = await getDB();
      const base64Image = await fileToBase64(file);
      
      const record = {
        id: crypto.randomUUID(),
        userEmail: userEmail.toLowerCase(),
        timestamp: Date.now(),
        imageData: base64Image,
        digit: result.digit,
        confidence: result.confidence,
        explanation: result.explanation
      };

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(record);

        request.onsuccess = () => resolve();
        request.onerror = () => reject("Failed to save to storage");
      });
    } catch (error) {
      console.error("Storage Error:", error);
      throw error; // Propagate error
    }
  },

  getUserHistory: async (userEmail: string): Promise<HistoryRecord[]> => {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('userEmail');
        const request = index.getAll(userEmail.toLowerCase());

        request.onsuccess = () => {
          // Sort by timestamp desc (newest first)
          const results = request.result.sort((a, b) => b.timestamp - a.timestamp);
          resolve(results as HistoryRecord[]);
        };
        request.onerror = () => reject("Failed to retrieve history");
      });
    } catch (error) {
      console.error("Storage Retrieve Error:", error);
      return [];
    }
  }
};