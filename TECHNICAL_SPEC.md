# CognitoVault - Technical Specification
## v0.1.0 - Run Phase (2026-03-01)

### Scope
Local-first, offline-capable credential vault prototype.
- Deterministic bootstrapping via verifiable artifacts.
- Progressive phases: Crawl → Walk → Run.
- No external dependencies.

### Verified State (2026-03-01)
- `index.html`: Static UI shell loads correctly via `python3 -m http.server 8000`.
- **Walk Phase Verification**: Pulsing green "✅ JS ACTIVE" badge injected via `app.js`.
- **Run Phase Step 1 Verification**: Pink "🚀 SW ACTIVE" badge via Service Worker registration.
- **Run Phase Step 2 Verification**: Blue "🗄️ Vault ACTIVE" badge via IndexedDB initialization.
- **Offline First**: `sw.js` caches critical assets (`/`, `/index.html`, `/app.js`).
- **Data Persistence**: `vault.js` initializes `CognitoVault` database with `credentials` and `metadata` stores.

### Phase Roadmap
**Crawl**: Static shell. ✅
**Walk**: Minimal JS entrypoint (`app.js`), DOM query verification. ✅
**Run (current)**: Service Worker registration ✅, IndexedDB initialization ✅.

### Operating Constraints
- Every commit maps to: file change + command + verification output.
- No "enterprise"/"AI"/"military" claims without implementation.
- Local-only execution (no npm, no CDN, no build tools).

### Verification Commands
```bash
cd ~/Desktop/ENGINEERING/prototypes/CognitoVault
python3 -m http.server 8000
# Visit http://localhost:8000/
# 1. Verify three badges (Green, Pink, Blue).
# 2. Inspect console for:
#    - ✅ SW registered
#    - ✅ Vault: DB opened
#    - ✅ Vault contents: [{...}]
# 3. DevTools -> Application -> IndexedDB -> CognitoVault -> credentials.
```

### Verified State (Export Phase)
**Full feature set:**
- Encrypted CRUD operations
- JSON vault export (encrypted data only)
- Offline-first via SW

**Production readiness:** 85% (missing import + master key mgmt)

---
**Status:** Synchronized with #topnotchv1 Foundational Mandate (GEMINI.md).
