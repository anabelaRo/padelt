# 🎾 Padelt - PWA

**Padelt** es una Progressive Web App (PWA) diseñada para organizadores de torneos de pádel. Permite gestionar torneos americanos de forma integral: desde la carga masiva de parejas vía WhatsApp hasta la generación automática de cuadros eliminatorios (playoffs).

---

## ✨ Características Principales

* **Offline First:** Funciona sin conexión a internet gracias a **Dexie.js** (IndexedDB). Ideal para clubes con mala señal.
* **Carga Masiva:** Pega la lista de inscriptos directamente desde WhatsApp y el sistema arma las zonas.
* **Algoritmo de Clasificación:** Cálculo automático de posiciones basado en:
    1.  Partidos Ganados.
    2.  Games a Favor.
    3.  Diferencia de Games (Favor - Contra).
* **Playoffs Elásticos:** El sistema detecta automáticamente si el torneo debe empezar en 16avos, 8vos, 4tos o Semis según la cantidad de clasificados.
* **Instalable:** Al ser una PWA, se puede añadir a la pantalla de inicio en iOS y Android como una app nativa.
* **Diseño Deportivo:** Interfaz limpia en tonos verde esmeralda y gris pizarra (Slate).

---

## 🛠️ Stack Tecnológico

* **Framework:** React (Vite) + TypeScript.
* **Base de Datos:** Dexie.js (Wrapper de IndexedDB para persistencia local).
* **Estilos:** Tailwind CSS.
* **Iconos:** Lucide React.
* **PWA:** Vite PWA Plugin.

---

## 📂 Estructura del Proyecto

```text
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
Crea una carpeta nueva e inicializa el proyecto.

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
Cada línea representa una pareja. El sistema las distribuirá en zonas automáticamente según la cantidad de parejas por zona que elijas.

🌐 Despliegue (Deploy) Gratis
La forma más rápida y gratuita de hostear esta app es con Vercel:

Sube tu código a un repositorio de GitHub.

Conecta el repositorio en Vercel.

Vercel detectará automáticamente la configuración de Vite.

Haz clic en Deploy.

Instalación: Una vez desplegado, abre el link en tu móvil.

Android: Click en "Instalar Aplicación".

iOS: Click en "Compartir" -> "Agregar al Inicio".

📈 Criterios de Desempate (Algoritmo)
El sistema utiliza la función calculateStandings para ordenar las tablas en tiempo real:

Puntos (Partidos Ganados): Se asigna prioridad al que ganó más encuentros.

Games Ganados: En caso de empate en partidos, clasifica el que hizo más games totales.

Diferencia de Games: Si persiste el empate, se calcula Games a Favor - Games en Contra.

📝 Licencia
Este proyecto es de código abierto. Puedes usarlo, modificarlo y distribuirlo para organizar tus torneos de pádel.

Diferencia: Si persiste el empate, se resta Games a Favor - Games en Contra.

📝 Licencia
Este proyecto es de uso libre para la comunidad de pádel. Puedes modificarlo y adaptarlo a las reglas de tu club.
