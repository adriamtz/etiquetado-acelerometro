// Proyecto: Etiquetado acelerómetro - PWA React
// Descripción: Proyecto completo listo para Vite. Incluye App principal, Service Worker básico, manifest PWA, y estilos.
// Instrucciones rápidas (leer antes de usar):
// 1) Crea un nou projecte Vite (o usa la plantilla):
//    npm create vite@latest etiqueta-acelerometro -- --template react
// 2) Copia els fitxers següents a la carpeta del projecte (sobreescriu quan correspongui):
//    - package.json (veure més abaix)
//    - index.html
//    - public/manifest.json
//    - public/logo-dark.png  <-- posa aquí la icona que m'has adjuntat
//    - src/main.jsx
//    - src/App.jsx
//    - src/styles.css
//    - src/service-worker.js
// 3) Instala dependències i arrenca el servidor de desenvolupament:
//    npm install
//    npm run dev
// 4) Per fer build i deploy (Vercel / Netlify):
//    npm run build
//    Després puja la carpeta `dist` a Vercel/Netlify (ambdós ofereixen HTTPS gratuït i PWA instal·lable)
//
// Format CSV d'exportació (per defecte): etiquetas_YYYY-MM-DD_HHMM.csv
// columns: tipo,etiqueta,timestamp_inicio,timestamp_fin,comentario
// - Para eventos instantáneos timestamp_inicio tiene valor y timestamp_fin queda vacío.
//
// ---------------------------------------------------------------------------

/* === package.json ===
{
  "name": "etiquetado-acelerometro",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
=== end package.json ===

/* === index.html === */
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="manifest" href="/manifest.json">
    <title>Etiquetado acelerómetro</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
/* === end index.html === */

/* === public/manifest.json === */
{
  "short_name": "EtiqAcel",
  "name": "Etiquetado acelerómetro",
  "icons": [
    {
      "src": "/logo-dark.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/logo-dark.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#ffffff",
  "background_color": "#ffffff"
}
/* === end manifest.json === */

/* === src/main.jsx === */
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Registrar service worker (simple). En desarrollo això no produirà errors; al build serà útil.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(err => {
      console.warn('ServiceWorker registration failed:', err)
    })
  })
}
/* === end src/main.jsx === */

/* === src/App.jsx === */
import React, { useEffect, useState, useRef } from 'react'

const ESTADOS = [
  { key: 'desc_tumbada', label: 'Descansando tumbada' },
  { key: 'desc_pie', label: 'Descansando de pie' },
  { key: 'com_parada', label: 'Comiendo parada' },
  { key: 'com_despl', label: 'Comiendo mientras se desplaza' },
  { key: 'rumiando', label: 'Rumiando' },
  { key: 'desplazandose', label: 'Desplazándose' },
  { key: 'corriendo', label: 'Corriendo' }
]

const EVENTOS = [
  { key: 'se_tumba', label: 'Se tumba' },
  { key: 'se_levanta', label: 'Se levanta' },
  { key: 'salta', label: 'Salta' },
  { key: 'otro', label: 'Otro' }
]

const STORAGE_KEY = 'etiquetas_etiquetado'

function ahoraISO() {
  return new Date().toISOString()
}

export default function App() {
  const [activo, setActivo] = useState(null) // key del estado activo
  const [registros, setRegistros] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      return []
    }
  })
  const [otroTexto, setOtroTexto] = useState('')
  const timerRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registros))
  }, [registros])

  // Funció per iniciar un estat
  function startEstado(key, label) {
    const now = ahoraISO()
    // Si ja hi ha un estat actiu i és el mateix, tanquem-lo
    if (activo === key) {
      // tancar
      endEstado()
      return
    }
    // si hi ha un altre actiu, tancar
    if (activo) {
      // tancar l'actual
      endEstado()
    }
    // crear nou registre amb timestamp_inicio
    const nuevo = {
      tipo: 'estado',
      etiqueta: label,
      key: key,
      timestamp_inicio: now,
      timestamp_fin: null,
      comentario: ''
    }
    setRegistros(prev => [...prev, nuevo])
    setActivo(key)
  }

  function endEstado() {
    if (!activo) return
    const now = ahoraISO()
    // actualitzar l'últim registre actiu (buscar del final)
    setRegistros(prev => {
      const copia = [...prev]
      for (let i = copia.length - 1; i >= 0; i--) {
        if (copia[i].tipo === 'estado' && copia[i].key === activo && !copia[i].timestamp_fin) {
          copia[i] = { ...copia[i], timestamp_fin: now }
          break
        }
      }
      return copia
    })
    setActivo(null)
  }

  function pushEvento(key, label) {
    const now = ahoraISO()
    let comentario = ''
    if (key === 'otro' && otroTexto.trim()) comentario = otroTexto.trim()
    const nuevo = {
      tipo: 'evento',
      etiqueta: label === 'Otro' ? comentario || 'Otro' : label,
      key,
      timestamp_inicio: now,
      timestamp_fin: null,
      comentario
    }
    setRegistros(prev => [...prev, nuevo])
    // netejar camp 'otro'
    setOtroTexto('')
  }

  function exportCSV() {
    // crear header
    const header = ['tipo', 'etiqueta', 'timestamp_inicio', 'timestamp_fin', 'comentario']
    const rows = registros.map(r => [r.tipo, r.etiqueta, r.timestamp_inicio || '', r.timestamp_fin || '', r.comentario || ''])
    const csv = [header, ...rows].map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const now = new Date()
    const fn = `etiquetas_${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}.csv`
    a.href = url
    a.setAttribute('download', fn)
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function clearAll() {
    if (!confirm('¿Borrar todos los registros guardados?')) return
    setRegistros([])
    setActivo(null)
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <img src="/logo-dark.png" alt="logo" className="logo" />
        <div>
          <h1>Etiquetado acelerómetro</h1>
          <p className="sub">Idioma: español — Guarda localmente y exporta CSV</p>
        </div>
      </header>

      <main>
        <section className="panel estados">
          <h2>Estados (pulsa para iniciar / pulsar de nuevo para terminar)</h2>
          <div className="grid-estados">
            {ESTADOS.map(e => (
              <button
                key={e.key}
                className={`btn-estado ${activo === e.key ? 'activo' : ''}`}
                onClick={() => startEstado(e.key, e.label)}
              >
                {e.label}
              </button>
            ))}
          </div>
        </section>

        <section className="panel eventos">
          <h2>Eventos (instantáneos)</h2>
          <div className="grid-eventos">
            {EVENTOS.map(ev => (
              <div key={ev.key} className="evento-wrap">
                {ev.key === 'otro' ? (
                  <div className="otro-inline">
                    <input placeholder="Describir otro..." value={otroTexto} onChange={e => setOtroTexto(e.target.value)} />
                    <button className="btn-evento" onClick={() => pushEvento(ev.key, ev.label)}>OK</button>
                  </div>
                ) : (
                  <button className="btn-evento" onClick={() => pushEvento(ev.key, ev.label)}>{ev.label}</button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="panel acciones">
          <button className="btn-primario" onClick={exportCSV}>Exportar CSV</button>
          <button className="btn-sec" onClick={endEstado} disabled={!activo}>Terminar estado activo</button>
          <button className="btn-sec" onClick={clearAll}>Borrar todo</button>
        </section>

        <section className="panel listado">
          <h2>Registros (últimos 200)</h2>
          <div className="list-scroll">
            {registros.slice(-200).reverse().map((r, idx) => (
              <div key={idx} className={`registro ${r.tipo}`}>
                <div className="left">
                  <strong>{r.etiqueta}</strong>
                  <div className="meta">{r.tipo} · {r.timestamp_inicio}{r.timestamp_fin ? ` → ${r.timestamp_fin}` : ''}</div>
                </div>
                <div className="right">{r.comentario}</div>
              </div>
            ))}
            {registros.length === 0 && <p className="empty">No hay registros todavía.</p>}
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <small>Guardado en local. Para instalar como app, desplegar en HTTPS (Vercel/Netlify recomiendan).</small>
      </footer>
    </div>
  )
}
/* === end src/App.jsx === */

/* === src/styles.css === */
:root{
  --bg:#f6f7f9;
  --card:#ffffff;
  --muted:#666;
  --accent:#7bd389; /* verde per actiu */
  --accent-2:#ffb56b; /* taronja */
  --danger:#ff6b6b;
}
*{box-sizing:border-box}
body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,'Helvetica Neue',Arial; margin:0; background:var(--bg); color:#111}
.app-root{max-width:900px;margin:12px auto;padding:12px}
.app-header{display:flex;gap:12px;align-items:center}
.logo{width:56px;height:56px;object-fit:contain}
.app-header h1{margin:0;font-size:1.2rem}
.sub{margin:0;color:var(--muted);font-size:0.9rem}
main{margin-top:12px}
.panel{background:var(--card);padding:12px;border-radius:10px;box-shadow:0 6px 18px rgba(10,10,10,0.04);margin-bottom:12px}
.panel h2{margin:0 0 8px 0;font-size:1rem}
.grid-estados{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.btn-estado{padding:12px;border-radius:8px;border:1px solid #e6e6e6;background:#f3f4f6;font-weight:600}
.btn-estado.activo{background:linear-gradient(90deg,var(--accent),#5ec07a);color:white;border-color:rgba(0,0,0,0.05);box-shadow:0 4px 12px rgba(0,0,0,0.08)}
.btn-estado.activo[data-key='com_despl']{background:linear-gradient(90deg,var(--accent-2),#ff9e4a)}
.grid-eventos{display:flex;gap:8px;flex-wrap:wrap}
.btn-evento{padding:8px 12px;border-radius:8px;border:1px solid #ddd;background:#fff}
.otro-inline{display:flex;gap:8px}
.otro-inline input{padding:8px;border-radius:8px;border:1px solid #ddd;min-width:140px}
.acciones{display:flex;gap:8px;align-items:center}
.btn-primario{background:linear-gradient(90deg,#4fce7a,#3bb26a);color:white;padding:10px 14px;border-radius:8px;border:none;font-weight:700}
.btn-sec{padding:8px 12px;border-radius:8px;border:1px solid #ddd;background:#fff}
.list-scroll{max-height:260px;overflow:auto}
.registro{display:flex;justify-content:space-between;padding:8px 6px;border-bottom:1px solid #f1f1f1}
.registro .meta{color:var(--muted);font-size:0.85rem}
.empty{color:var(--muted)}
.app-footer{text-align:center;color:var(--muted);font-size:0.85rem;margin-top:6px}

/* small responsive */
@media (max-width:520px){
  .grid-estados{grid-template-columns:repeat(1,1fr)}
}
/* === end src/styles.css === */

/* === src/service-worker.js === */
// Service worker simple per cache d'actius estàtics (no és una solució completa Workbox, però útil per PWA bàsica)
const CACHE_NAME = 'etiquetado-cache-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/styles.css',
  '/logo-dark.png'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)).catch(()=>{})
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  )
})
/* === end src/service-worker.js === */

// FIN DEL DOCUMENTO
