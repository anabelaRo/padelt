const fs = require('fs');
const pkg = {
  "name": "padel-pro-americano",
  "type": "module",
  "scripts": { "dev": "vite" },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "dexie": "^3.2.4",
    "dexie-react-hooks": "^1.1.7",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.2.2",
    "vite": "^5.1.4"
  }
};
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log("✅ package.json creado con éxito");