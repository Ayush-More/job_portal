# Next.js Build Cache Issue - Fix & Prevention

## Issue Description

```
Error: ENOENT: no such file or directory, open 'C:\Project\freelancing\ittihadplacement\.next\server\pages\_app\build-manifest.json'
```

This error occurs when:
- The `.next` build directory is corrupted
- The build process was interrupted
- Next.js development server crashes unexpectedly
- Mixing different Node versions or package managers

## ✅ Solution Applied

### Quick Fix (Immediate)

```bash
# Stop all Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Remove corrupted build cache
Remove-Item -Path .next -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path .turbo -Recurse -Force -ErrorAction SilentlyContinue

# Restart dev server
npm run dev
```

### Alternative Fix (Linux/Mac)

```bash
# Kill all node processes
pkill -f node

# Clean build cache
rm -rf .next
rm -rf .turbo

# Restart dev server
npm run dev
```

### Full Clean Build (if above doesn't work)

```bash
# Stop server
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Clean everything
Remove-Item -Path .next -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path .turbo -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path node_modules -Recurse -Force -ErrorAction SilentlyContinue

# Reinstall dependencies
npm install

# Rebuild and start
npm run dev
```

## Prevention

### 1. Graceful Server Shutdown
- Use `Ctrl + C` to stop the dev server properly
- Avoid force-closing terminal windows

### 2. Keep Build Cache Clean
Add this to your `package.json` scripts:

```json
{
  "scripts": {
    "clean": "Remove-Item -Path .next, .turbo -Recurse -Force -ErrorAction SilentlyContinue",
    "dev": "npm run clean && next dev --turbopack",
    "build": "npm run clean && next build",
    "start": "next start"
  }
}
```

### 3. Handle Crashes Properly
- Monitor Node process memory usage
- Increase Node heap size if needed: `node --max-old-space-size=4096`
- Check for infinite loops in code

### 4. Use `.gitignore`
Ensure these are in `.gitignore`:
```
.next/
.turbo/
node_modules/
.env.local
```

## Root Causes

| Cause | Fix |
|-------|-----|
| Interrupted build process | Clean `.next` directory |
| Multiple dev servers on same port | Use different ports or kill previous process |
| Corrupted cache | Delete `.next` and rebuild |
| Node version mismatch | Use `.nvmrc` and `nvm use` |
| Out of disk space | Free up disk space |
| Package manager mismatch | Use consistent package manager (npm/yarn/pnpm) |

## Commands Reference

### Quick Restart (Windows)
```powershell
Get-Process node | Stop-Process -Force; npm run dev
```

### Monitor Node Process
```powershell
Get-Process node -ErrorAction SilentlyContinue | Select ProcessName, Id, Memory
```

### View All Ports in Use
```powershell
netstat -ano | findstr :3000
```

### Kill Process on Specific Port
```powershell
Get-NetTCPConnection -LocalPort 3000 | Stop-Process -Force
```

## Status

✅ **Fix Applied**: Build cache cleared and server restarted  
✅ **Server Status**: Running and ready  
✅ **Next Steps**: Hard refresh browser and test

---

If the error persists after applying these fixes, please:
1. Check Node.js version: `node --version`
2. Check npm version: `npm --version`
3. Run a full clean build
4. Check system disk space: `Get-Volume`
