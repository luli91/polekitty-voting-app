"use client"
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import Link from 'next/link'

export default function VotacionPage() {
  const [participantes, setParticipantes] = useState<any[]>([])
  const [categoria, setCategoria] = useState<any>(null)
  const [votos, setVotos] = useState<{ [key: number]: string | null }>({ 1: null, 2: null, 3: null })
  const [yaVoto, setYaVoto] = useState(false)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    const cargarDatos = async () => {
      const { data: catData } = await supabase.from('evento_categorias').select('*').eq('estado', 'abierta').single()
      if (catData) {
        setCategoria(catData)
        const { data: partData } = await supabase.from('evento_participantes').select('*').eq('categoria_id', catData.id)
        if (partData) setParticipantes(partData)
      }
      if (localStorage.getItem('voto_registrado')) setYaVoto(true)
    }
    cargarDatos()
  }, [])

  const handleSelect = (id: string) => {
    if (votos[1] === id) return setVotos({ ...votos, 1: null })
    if (votos[2] === id) return setVotos({ ...votos, 2: null })
    if (votos[3] === id) return setVotos({ ...votos, 3: null })
    if (!votos[1]) return setVotos({ ...votos, 1: id })
    if (!votos[2]) return setVotos({ ...votos, 2: id })
    if (!votos[3]) return setVotos({ ...votos, 3: id })
  }

  const getPuesto = (id: string) => {
    if (votos[1] === id) return 1
    if (votos[2] === id) return 2
    if (votos[3] === id) return 3
    return null
  }

  const enviarVoto = async () => {
    setEnviando(true)
    let deviceId = localStorage.getItem('device_id')
    if (!deviceId) {
      deviceId = crypto.randomUUID()
      localStorage.setItem('device_id', deviceId)
    }

    const { error } = await supabase.from('evento_votos').insert({
      categoria_id: categoria?.id,
      puesto_1_id: votos[1],
      puesto_2_id: votos[2],
      puesto_3_id: votos[3],
      dispositivo_id: deviceId
    })

    if (!error) {
      localStorage.setItem('voto_registrado', 'true')
      setYaVoto(true)
    } else {
      alert("Hubo un error al enviar tu voto.")
    }
    setEnviando(false)
  }

  const listosParaVotar = votos[1] && votos[2] && votos[3]

  if (yaVoto) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-6 font-sans relative">
        <img 
          src="/pole_kitty_fondo.jpg" 
          alt="Orejitas de fondo" 
          className="fixed bottom-0 sm:-bottom-10 left-1/2 -translate-x-1/2 w-[200%] sm:w-[150vw] max-w-[1000px] -z-10 mix-blend-multiply pointer-events-none"
        />
        <div className="bg-white p-8 rounded-none border-4 border-black text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative z-10">
          <h1 className="text-3xl font-black mb-4 uppercase">¡Voto Registrado!</h1>
          <p className="text-neutral-600 font-bold mb-6">Gracias por apoyar a las competidoras.</p>
          <Link href="/admin" className="text-xs uppercase font-black underline tracking-widest text-black">
            Ver resultados en vivo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center p-6 font-sans relative overflow-hidden z-0">
      
      {/* FONDO: Tu imagen exacta de las orejitas */}
      <img 
        src="/pole_kitty_fondo.jpg" 
        alt="Orejitas de fondo" 
        className="fixed bottom-0 sm:-bottom-10 left-1/2 -translate-x-1/2 w-[200%] sm:w-[150vw] max-w-[1000px] -z-10 mix-blend-multiply pointer-events-none"
      />

      {/* Botón discreto flotante para ir al Admin / Resultados */}
      <div className="absolute top-4 right-4 z-30">
        <Link href="/admin">
          <span className="text-[10px] font-black uppercase tracking-widest border border-black px-3 py-1 bg-white hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Resultados en vivo
          </span>
        </Link>
      </div>

      <div className="w-full max-w-md mt-8 relative z-10 pb-16">
        
        {/* LOGO */}
        <div className="mb-8 flex justify-center">
          <img 
            src="/logo-Polekitty.png" 
            alt="PoleKitty Logo" 
            className="w-48 h-auto mix-blend-multiply" 
          />
        </div>

        <div className="text-center mb-10">
          <h2 className="text-black text-xs font-bold tracking-[0.3em] mb-3 uppercase border-b-2 border-black inline-block pb-1 bg-white/90 px-2">
            Competencia Oficial
          </h2>
          <h1 className="text-4xl font-black mb-2 tracking-tight uppercase bg-white/90 inline-block px-2">{categoria?.nombre || 'Cargando...'}</h1>
          <p className="text-neutral-500 font-bold text-sm tracking-wide bg-white/90 inline-block px-2">Seleccioná tu top 3 en orden</p>
        </div>

        <div className="space-y-4 relative z-20">
          {participantes.map((p, index) => {
            const puesto = getPuesto(p.id)
            const isSelected = puesto !== null
            const numeroFoto = index + 1 // Mapea 1, 2, 3, 4 según el orden en que aparecen

            return (
              <div 
                key={p.id}
                onClick={() => handleSelect(p.id)}
                className={`flex items-center p-3 sm:p-5 cursor-pointer transition-all duration-200 border-2 ${
                  isSelected 
                    ? 'border-black bg-black text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] translate-y-[-2px]' 
                    : 'border-black bg-white text-black hover:bg-neutral-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center mr-3 sm:mr-4 text-sm font-bold border-2 ${
                  isSelected ? 'border-white bg-white text-black' : 'border-black text-transparent'
                }`}>
                  {isSelected ? `${puesto}º` : ''}
                </div>
                
                {/* FOTO USANDO EL ÍNDICE (staff-1.jpg, staff-2.jpg, etc.) */}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 overflow-hidden mr-3 sm:mr-4 shrink-0 flex items-center justify-center font-black text-xs relative ${
                  isSelected ? 'border-white bg-white text-black' : 'border-black bg-neutral-200 text-black'
                }`}>
                  <img 
                    src={`/participantes/staff-${numeroFoto}.jpg`} 
                    alt={p.nombre}
                    className="w-full h-full object-cover absolute inset-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span>
                    {p.nombre.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                  </span>
                </div>

                <span className="font-bold tracking-widest uppercase text-sm sm:text-lg truncate">
                  {p.nombre}
                </span>
              </div>
            )
          })}
        </div>

        <Button 
          onClick={enviarVoto}
          disabled={!listosParaVotar || enviando}
          className={`w-full mt-10 py-7 text-lg font-black tracking-[0.2em] transition-all duration-300 uppercase border-2 disabled:opacity-100 relative z-20 ${
            listosParaVotar 
              ? 'bg-black hover:bg-neutral-800 text-white border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
              : 'bg-white text-neutral-400 cursor-not-allowed border-neutral-300 shadow-none'
          }`}
        >
          {enviando ? 'ENVIANDO...' : 'CONFIRMAR VOTO'}
        </Button>
      </div>
    </div>
  )
}