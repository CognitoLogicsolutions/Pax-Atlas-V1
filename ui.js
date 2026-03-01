import { VaultCrypto } from './crypto.js';

// CognitoVault UI Module - Interactive CRUD with Encryption
export class VaultUI {
  constructor(vault) {
    this.vault = vault;
    this.initUI();
  }

  initUI() {
    // Add UI container below badges
    const uiContainer = document.createElement('section');
    uiContainer.innerHTML = `
      <h2>Vault Operations</h2>
      
      <!-- Add encrypted credential form -->
      <form id="add-form" class="form-group">
        <input type="text" id="service" placeholder="Service" required>
        <input type="email" id="username" placeholder="Username/Email" required>
        <input type="password" id="password" placeholder="Password" required>
        <input type="password" id="master-key" placeholder="Master Password" required>
        <button type="submit">Add Encrypted Credential</button>
      </form>
      
      <!-- Credentials list -->
      <div id="credentials-list" class="list-container">
        <p>No credentials</p>
      </div>
    `;
    document.querySelector('main').appendChild(uiContainer);

    // Event listeners
    document.getElementById('add-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addCredential();
    });

    // Refresh list
    this.refreshList();
  }

  async addCredential() {
    const service = document.getElementById('service').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const masterKey = document.getElementById('master-key').value;

    const id = `cred-${Date.now()}`;
    
    try {
      const encrypted = await VaultCrypto.encrypt(password, masterKey);
      const credential = { id, service, username, encryptedPassword: encrypted, created: Date.now() };

      const tx = this.vault.db.transaction('credentials', 'readwrite');
      const store = tx.objectStore('credentials');
      
      return new Promise((resolve, reject) => {
        const request = store.put(credential);
        request.onsuccess = () => {
          console.log('✅ UI: Encrypted credential added');
          this.refreshList();
          document.getElementById('add-form').reset();
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error('❌ UI: Encryption failed', err);
    }
  }

  async refreshList() {
    const tx = this.vault.db.transaction('credentials', 'readonly');
    const store = tx.objectStore('credentials');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const credentials = request.result;
        const list = document.getElementById('credentials-list');
        
        if (credentials.length === 0) {
          list.innerHTML = '<p>No credentials</p>';
          return;
        }

        list.innerHTML = credentials.map(cred => `
          <div class="credential-item">
            <strong>${cred.service}</strong>
            <div>${cred.username}</div>
            <div class="password">🔒 Encrypted</div>
            <small>${new Date(cred.created).toLocaleString()}</small>
          </div>
        `).join('');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }
}
