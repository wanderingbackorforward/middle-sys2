import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

type Props = { title: string; url: string; status?: string }

export default function VideoTile({ title, url, status }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !url) return
    const useHls = Hls.isSupported() && url.endsWith('.m3u8')
    if (useHls) {
      const hls = new Hls({ startPosition: -1, autoStartLoad: true })
      hlsRef.current = hls
      hls.loadSource(url)
      hls.attachMedia(video)
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (!data || !data.fatal) return
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          try { hls.startLoad() } catch {}
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          try { hls.recoverMediaError() } catch {}
        } else {
          try {
            hls.destroy()
            const nh = new Hls({ autoStartLoad: true })
            hlsRef.current = nh
            nh.loadSource(url)
            nh.attachMedia(video)
          } catch {}
        }
      })
    } else {
      video.src = url
      const onError = () => {
        try {
          video.load()
          video.play().catch(()=>{})
        } catch {}
      }
      video.addEventListener('error', onError)
      return () => video.removeEventListener('error', onError)
    }
    return () => {
      const h = hlsRef.current
      if (h) {
        h.detachMedia()
        h.destroy()
        hlsRef.current = null
      }
    }
  }, [url])

  return (
    <div className="tech-card p-0 overflow-hidden relative group">
      <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded z-10 animate-pulse">
        {status || '在线'}
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 z-10">
        <div className="text-white font-bold">{title}</div>
      </div>
      <video
        ref={videoRef}
        className="w-full h-full object-cover bg-black"
        crossOrigin="anonymous"
        preload="auto"
        muted
        autoPlay
        playsInline
        controls
      />
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-500 transition-colors pointer-events-none"></div>
    </div>
  )
}

