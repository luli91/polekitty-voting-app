"use client"
import { useState, useEffect } from 'react'
import { supabase } from "@/lib/supabase"
import confetti from 'canvas-confetti'
import Link from 'next/link'

export default function AdminResultados() {
  const [resultados, setResultados] = useState<any[]>([])
  const [ganadoraAnunciada, setGanadoraAnunciada] = useState<any>(null)
  const [eventoTerminado, setEventoTerminado] = useState(false)

  // FECHA DE CIERRE DEL EVENTO (Modificá esto cuando Flor te confirme la hora exacta del final)
  const FECHA_FIN_EVENTO = new Date('2026-11-30T02:00:00')

  const cargarResultados = async () => {
    // Como quitamos las categorías, traemos todos los participantes y votos directamente
    const { data: participantes } = await supabase.from('evento_participantes').select('*')
    const { data: votos } = await supabase.from('evento_votos').select('*')

    if (participantes && votos) {
      const calculos = participantes.map((p: any) => {
        const votosPos1 = votos.filter((v: any) => v.puesto_1_id === p.id).length
        const votosPos2 = votos.filter((v: any) => v.puesto_2_id === p.id).length
        const votosPos3 = votos.filter((v: any) => v.puesto_3_id === p.id).length
        const total = votosPos1 + votosPos2 + votosPos3

        return { ...p, pos1: votosPos1, pos2: votosPos2, pos3: votosPos3, total }
      })

      calculos.sort((a: any, b: any) => b.total - a.total)
      setResultados(calculos)

      // Verificamos si ya pasó la hora de finalización del evento
      const ahora = new Date()
      if (ahora >= FECHA_FIN_EVENTO && calculos.length > 0) {
        setEventoTerminado(true)
      }
    }
  }

  useEffect(() => {
    cargarResultados()

    const channel = supabase
      .channel('votos_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'evento_votos' }, () => {
        cargarResultados()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // Disparar confeti automáticamente cuando el evento finaliza y hay resultados
  useEffect(() => {
    if (eventoTerminado && resultados.length > 0 && !ganadoraAnunciada) {
      const ganadora = resultados[0]
      setGanadoraAnunciada(ganadora)

      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti({
          particleCount,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#000000', '#ffffff', '#737373', '#d4d4d4']
        });
      }, 250);
    }
  }, [eventoTerminado, resultados])

  return (
    <div className="min-h-screen bg-white text-black p-6 md:p-12 font-sans flex flex-col items-center relative overflow-hidden z-0">
      
      {/* FONDO: Orejitas fijas */}
      <img 
        src="/pole_kitty_fondo.jpg" 
        alt="Orejitas de fondo" 
        className="fixed top-[40vh] sm:top-[45vh] left-1/2 -translate-x-1/2 w-[220%] sm:w-[120vw] max-w-[1200px] -z-10 mix-blend-multiply pointer-events-none"
      />

      {/* PANTALLA GIGANTE DE GANADORA (MODAL DE FESTEJO SIN FOTOS) */}
      {ganadoraAnunciada && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-white border-8 border-black p-8 sm:p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full relative">
            
            <span className="bg-black text-white text-sm font-black uppercase px-4 py-2 tracking-[0.3em] inline-block mb-6 shadow-[4px_4px_0px_0px_rgba(150,150,150,1)]">
              ¡GANADORA DE LA MUESTRA! 
            </span>

            <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mb-4">
              {ganadoraAnunciada.nombre}
            </h2>
            <p className="text-neutral-500 font-bold uppercase tracking-widest text-sm mb-8">
              Total de votos: {ganadoraAnunciada.total} 
            </p>

            <button 
              onClick={() => setGanadoraAnunciada(null)}
              className="w-full py-4 bg-black text-white font-black text-lg uppercase tracking-widest hover:bg-neutral-800 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] transition-all"
            >
              Cerrar Festejo
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-3xl relative z-10">
        
        {/* LOGO */}
        <div className="mb-6 flex justify-center">
          <img 
            src="/logo-Polekitty.png" 
            alt="PoleKitty Logo" 
            className="w-40 h-auto mix-blend-multiply" 
          />
        </div>

        {/* TARJETA DE RESULTADOS */}
        <div className="bg-white p-6 sm:p-8 rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b-4 border-black gap-4">
            <div>
              <h2 className="text-black text-xs font-bold tracking-[0.3em] mb-2 uppercase border-b-2 border-black inline-block pb-1 bg-white/90 px-2">
                Resultados
              </h2>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                Muestra Anual - Mejor Performance
              </h1>
              <span className="bg-black text-white font-bold text-xs px-3 py-1 uppercase mt-2 inline-block">
                {eventoTerminado ? 'Evento Finalizado' : 'Votación en Curso'}
              </span>
            </div>
            
            <Link 
              href="/"
              className="text-xs font-black uppercase underline tracking-wider"
            >
              ← Volver a votar
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b-4 border-black text-xs font-black uppercase tracking-wider bg-neutral-100">
                  <th className="px-4 py-3 border-r-2 border-black">#</th>
                  <th className="px-4 py-3 border-r-2 border-black">Participante</th>
                  <th className="px-4 py-3 text-center border-r-2 border-black">1º Puesto</th>
                  <th className="px-4 py-3 text-center border-r-2 border-black">2º Puesto</th>
                  <th className="px-4 py-3 text-center border-r-2 border-black">3º Puesto</th>
                  <th className="px-4 py-3 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((r, index) => {
                  const isFirst = index === 0 && r.total > 0;

                  return (
                    <tr 
                      key={r.id} 
                      className={`border-b-2 border-black transition-colors ${
                        isFirst ? 'bg-neutral-900 text-white font-bold' : 'hover:bg-neutral-50'
                      }`}
                    >
                      <td className="px-4 py-4 border-r-2 border-black font-black">
                        <div className={`w-7 h-7 rounded-none flex items-center justify-center text-xs font-black border-2 ${
                          isFirst ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                        }`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-4 py-4 border-r-2 border-black font-black uppercase tracking-wide">
                        {r.nombre}
                      </td>
                      <td className="px-4 py-4 text-center border-r-2 border-black font-bold">{r.pos1}</td>
                      <td className="px-4 py-4 text-center border-r-2 border-black font-bold">{r.pos2}</td>
                      <td className="px-4 py-4 text-center border-r-2 border-black font-bold">{r.pos3}</td>
                      <td className="px-4 py-4 text-center font-black text-base">{r.total}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}