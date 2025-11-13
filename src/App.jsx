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
