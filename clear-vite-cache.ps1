# PowerShell script om Vite cache en build output te wissen en dev server te starten
rd /s /q node_modules\.vite
rd /s /q dist
npm run dev
