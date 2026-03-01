// CognitoVault Export Module - JSON Backup v0.1.0
export class VaultExport {
  constructor(vault) {
    this.vault = vault;
    this.initUI();
  }

  initUI() {
    // Export button (above credentials list)
    const exportBtn = document.createElement('button');
    exportBtn.textContent = '📤 Export Vault Backup';
    exportBtn.className = 'export-btn';
    exportBtn.onclick = () => this.exportVault();
    
    // Inject styles for export button
    const style = document.createElement('style');
    style.textContent = `
      .export-btn {
        width: 100%;
        padding: 0.75rem;
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 0.375rem;
        margin: 1rem 0;
        cursor: pointer;
        font-weight: 600;
        transition: background 0.2s;
      }
      .export-btn:hover {
        background: rgba(59, 130, 246, 0.2);
      }
    `;
    document.head.appendChild(style);
    
    const listContainer = document.getElementById('credentials-list');
    listContainer.parentNode.insertBefore(exportBtn, listContainer);
  }

  async exportVault() {
    try {
      // Get all credentials (encrypted)
      const tx = this.vault.db.transaction('credentials', 'readonly');
      const store = tx.objectStore('credentials');
      
      const credentials = await new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      // Vault metadata
      const metadataTx = this.vault.db.transaction('metadata', 'readonly');
      const metaStore = metadataTx.objectStore('metadata');
      
      const metadata = await new Promise((resolve, reject) => {
        const req = metaStore.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      const backup = {
        version: '0.1.0',
        exportDate: new Date().toISOString(),
        credentials: credentials.map(c => ({
          id: c.id,
          service: c.service,
          username: c.username,
          encryptedPassword: c.encryptedPassword,  // Keep encrypted
          created: c.created
        })),
        meta: metadata.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {})
      };

      // Trigger download
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cognitovault-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('✅ Export: Vault backup created', backup);
    } catch (err) {
      console.error('❌ Export failed:', err);
    }
  }
}

// Global export for prototype integration
window.VaultExport = VaultExport;
