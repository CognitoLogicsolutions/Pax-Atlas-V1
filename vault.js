import { VaultCrypto } from './crypto.js';

// CognitoVault Vault Module - IndexedDB v0.1.0
class CognitoVault {
  constructor() {
    this.dbName = 'CognitoVault';
    this.version = 1;
    this.db = null;
  }

  // Initialize DB with schema
  init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ Vault: DB opened');
        resolve(this);
      };

      request.onupgradeneeded = (event) => {
        this.db = event.target.result;
        
        // Credentials store
        const credentials = this.db.createObjectStore('credentials', { keyPath: 'id' });
        credentials.createIndex('service', 'service', { unique: false });
        credentials.createIndex('created', 'created', { unique: false });
        
        // Metadata store  
        const metadata = this.db.createObjectStore('metadata', { keyPath: 'key' });
        
        console.log('✅ Vault: Schema created');
      };
    });
  }

  // Store encrypted credential (deterministic test entry)
  storeTestCredential() {
    if (!this.db) throw new Error('DB not initialized');
    
    const service = 'Demo Service';
    const username = 'demo@example.com';
    const plaintextPassword = 'testpass123';
    
    VaultCrypto.encrypt(plaintextPassword, 'master-pass-001')
      .then(encrypted => {
        const testCredential = {
          id: 'test-001',
          service,
          username,
          encryptedPassword: encrypted,  // Encrypted blob
          created: Date.now()
        };
        
        const tx = this.db.transaction('credentials', 'readwrite');
        const store = tx.objectStore('credentials');
        store.put(testCredential).onsuccess = () => {
          console.log('✅ Vault: Encrypted credential stored');
          console.log('🔒 Decrypted test will match:', plaintextPassword);
        };
      });
  }

  // Decrypt and retrieve credential
  async getCredential(id, masterPassword) {
    if (!this.db) throw new Error('DB not initialized');
    const tx = this.db.transaction('credentials', 'readonly');
    const store = tx.objectStore('credentials');
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = async () => {
        const cred = request.result;
        if (!cred?.encryptedPassword) return resolve(null);
        
        try {
          const password = await VaultCrypto.decrypt(cred.encryptedPassword, masterPassword);
          resolve({ ...cred, password });
        } catch (err) {
          console.error('❌ Vault: Decryption failed', err);
          resolve({ ...cred, password: '[DECRYPTION FAILED]' });
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // List all credentials (verification - remains encrypted)
  listCredentials() {
    if (!this.db) throw new Error('DB not initialized');
    
    const tx = this.db.transaction('credentials', 'readonly');
    const store = tx.objectStore('credentials');
    const request = store.getAll();
    
    request.onsuccess = () => {
      console.log('✅ Vault contents (encrypted):', request.result);
    };
  }
}

// Global instance
export const cognitoVault = new CognitoVault();
window.cognitoVault = cognitoVault;
