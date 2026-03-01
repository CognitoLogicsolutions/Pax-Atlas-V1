document.addEventListener('DOMContentLoaded', async () => {
  const createBadge = (text, color) => {
    const badge = document.createElement('div');
    badge.className = `badge ${color}-badge`;
    badge.innerHTML = `<span class="indicator"></span><span>${text}</span>`;
    document.querySelector('.badge').insertAdjacentElement('afterend', badge);
    return badge;
  };

  createBadge('✅ JS ACTIVE (Walk)', 'walk');
  createBadge('🚀 SW ACTIVE (Run)', 'run');
  let vaultBadge = createBadge('⏳ Vault booting...', 'vault');

  // SW (existing)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }

  // Vault + UI + Export
  if ('indexedDB' in window) {
    const { cognitoVault } = await import('./vault.js');
    await cognitoVault.init();

    cognitoVault.storeTestCredential();
    setTimeout(() => cognitoVault.listCredentials(), 500);

    // UI integration
    const { VaultUI } = await import('./ui.js');
    new VaultUI(cognitoVault);

    // Export integration
    const { VaultExport } = await import('./export.js');
    new VaultExport(cognitoVault);

    vaultBadge.innerHTML = '<span class="indicator"></span><span>🗄️ Vault + UI + Export ACTIVE</span>';
  }

  // Styles (add UI styles)
  const style = document.createElement('style');
  style.textContent = `
    /* Existing badges */
    .walk-badge { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
    .run-badge { background: rgba(236, 72, 153, 0.15); color: #ec4899; }
    .vault-badge { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
    .badge { display: inline-flex; gap: 0.4rem; font-size: 0.75rem; text-transform: uppercase; border: 1px solid; border-radius: 999px; padding: 0.25rem 0.6rem; margin-bottom: 0.25rem; animation: pulse 2s infinite; }
    
    /* New UI styles */
    .form-group { display: grid; gap: 0.75rem; margin: 1.5rem 0; }
    .form-group input { padding: 0.75rem; border: 1px solid var(--border); border-radius: 0.375rem; background: rgba(15,23,42,0.8); color: var(--fg); }
    .form-group button { padding: 0.75rem 1.25rem; background: var(--accent); color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500; }
    .list-container { margin-top: 1rem; }
    .credential-item { padding: 1rem; border: 1px solid var(--border); border-radius: 0.375rem; margin-bottom: 0.5rem; background: rgba(15,23,42,0.6); }
    .password { font-family: monospace; color: var(--muted); }
    h2 { color: var(--accent); margin: 1.5rem 0 0.75rem 0; font-size: 1.125rem; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }
  `;
  document.head.appendChild(style);
});
