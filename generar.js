const fs = require('fs');
const path = require('path');

const files = {
  'package.json': `{
    "name": "padel-pro-americano",
    "private": true,
    "version": "1.0.0",
    "type": "module",
    "scripts": { "dev": "vite", "build": "vite build" },
    "dependencies": {
      "react": "^18.2.0", "react-dom": "^18.2.0", "react-router-dom": "^6.22.0",
      "dexie": "^3.2.4", "dexie-react-hooks": "^1.1.7", "lucide-react": "^0.344.0"
    },
    "devDependencies": {
      "@vitejs/plugin-react": "^4.2.1", "autoprefixer": "^10.4.18",
      "postcss": "^8.4.35", "tailwindcss": "^3.4.1", "typescript": "^5.2.2", "vite": "^5.1.4"
    }
  }`,
  'index.html': `<!DOCTYPE html><html><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>`,
  'src/main.tsx': `import React from 'react'; import ReactDOM from 'react-dom/client'; import App from './App'; import './index.css'; ReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
  'src/index.css': `@tailwind base; @tailwind components; @tailwind utilities;`,
  'src/App.tsx': `export default function App() { return <h1 className="p-10 text-emerald-500 font-bold text-3xl">¡Padel App Instalada!</h1>; }`
};

console.log("🛠️ Iniciando creación de archivos...");

Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(process.cwd(), filePath);
  const folder = path.dirname(fullPath);
  
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
  
  fs.writeFileSync(fullPath, content);
  console.log(`✅ Creado: ${filePath}`);
});

console.log("🚀 Proceso terminado. Si no ves los archivos, presiona F5 o el icono de refrescar en VS Code.");