🎾 Padelt - PWA
Padelt es una Progressive Web App (PWA) diseñada para organizadores de torneos de pádel. Permite gestionar torneos americanos de forma integral: desde la carga masiva de parejas vía WhatsApp hasta la generación automática de cuadros eliminatorios (playoffs).

✨ Características Principales
Offline First: Funciona sin conexión a internet gracias a Dexie.js (IndexedDB). Ideal para clubes con mala señal.

Carga Masiva: Pega la lista de inscriptos directamente desde WhatsApp.

Algoritmo de Clasificación: Cálculo automático de posiciones basado en:

Partidos Ganados.

Games a Favor.

Diferencia de Games (Favor - Contra).

Playoffs Elásticos: El sistema detecta automáticamente si el torneo debe empezar en 16avos, 8vos, 4tos o Semis según la cantidad de clasificados elegida.

Instalable: Al ser una PWA, se puede añadir a la pantalla de inicio en iOS y Android como una app nativa.

Diseño Deportivo: Interfaz limpia en tonos verde esmeralda y gris pizarra (Slate).

🛠️ Stack Tecnológico
Framework: React (Vite) + TypeScript.

Base de Datos: Dexie.js (Wrapper de IndexedDB).

Estilos: Tailwind CSS.

Iconos: Lucide React.

PWA: Vite PWA Plugin.

📂 Estructura del Proyecto
Plaintext
src/
├── components/
│   ├── Bracket.tsx          # Renderizado visual del cuadro eliminatorio
│   ├── StandingsTable.tsx   # Tabla de posiciones en vivo por zona
│   └── Layout.tsx           # Navegación inferior y estructura global
├── db/
│   └── db.ts                # Configuración de Dexie y Esquema de tablas
├── logic/
│   └── tournamentLogic.ts   # Algoritmos de desempate y generación de cruces
├── pages/
│   ├── Dashboard.tsx        # Estadísticas globales e inicio
│   ├── TournamentCreator.tsx # Carga de parejas y configuración inicial
│   └── TournamentDetail.tsx  # Gestión de partidos, tablas y brackets
└── App.tsx                  # Enrutado de la aplicación
🚀 Instalación y Uso Local
Clonar el repositorio o descargar archivos.

Instalar dependencias:

Bash
npm install
Ejecutar en modo desarrollo:

Bash
npm run dev
Construir para producción:

Bash
npm run build
📲 Formato de Carga (WhatsApp)
Para que la carga de parejas sea exitosa, copia y pega la lista de inscriptos en el siguiente formato dentro del creador de torneos:

Plaintext
Juan Perez / Pablo Gomez
Martin Castro / Lucas Diaz
Sofia Garcia / Ana Lopez
Carlos Ruiz / Jorge Nuñez
Cada línea representa una pareja. El sistema las distribuirá en zonas según la configuración elegida.

🌐 Despliegue (Deploy)
La forma más rápida y gratuita de hostear esta app es con Vercel o Netlify:

Sube tu código a un repositorio de GitHub.

Conecta el repositorio en Vercel.

Vercel detectará automáticamente que usas Vite. Haz clic en Deploy.

Importante: Una vez desplegado, accede desde tu móvil y selecciona "Agregar a la pantalla de inicio" para usarla como app.

📈 Criterios de Desempate (Algoritmo)
El sistema utiliza la función calculateStandings para ordenar las tablas:

Puntos (Partidos Ganados): Se asigna prioridad al que ganó más encuentros.

Games Ganados: En caso de empate en partidos, clasifica el que hizo más games.

Diferencia: Si persiste el empate, se resta Games a Favor - Games en Contra.

📝 Licencia
Este proyecto es de uso libre para la comunidad de pádel. Puedes modificarlo y adaptarlo a las reglas de tu club.
