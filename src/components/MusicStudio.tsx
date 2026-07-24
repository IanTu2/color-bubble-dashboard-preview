import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { Language } from '../types'

type RepeatMode = 'off' | 'all' | 'one'

type MusicTrack = {
  id: string
  title: string
  artist: string
  url: string
  favorite: boolean
  temporary?: boolean
  source?: 'audio' | 'youtube'
}

type MusicStudioProps = {
  language: Language
  userId: string
  onNotice: (message: string) => void
  mode?: 'compact' | 'full'
  onExpand?: () => void
  onCollapse?: () => void
}

function storageKey(userId: string, suffix: string) {
  return `bubble-space-v2-music-${userId}-${suffix}`
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return '0:00'
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

function extractYouTubeId(value: string) {
  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    let candidate = ''

    if (host === 'youtu.be') {
      candidate = url.pathname.split('/').filter(Boolean)[0] ?? ''
    } else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (url.pathname === '/watch') {
        candidate = url.searchParams.get('v') ?? ''
      } else {
        const parts = url.pathname.split('/').filter(Boolean)
        if (['embed', 'shorts', 'live'].includes(parts[0] ?? '')) candidate = parts[1] ?? ''
      }
    }

    return /^[A-Za-z0-9_-]{6,20}$/.test(candidate) ? candidate : null
  } catch {
    return null
  }
}

function trackSource(track: MusicTrack | null) {
  if (!track) return { type: 'none' as const, youtubeId: null }
  const youtubeId = extractYouTubeId(track.url)
  if (track.source === 'youtube' || youtubeId) return { type: 'youtube' as const, youtubeId }
  return { type: 'audio' as const, youtubeId: null }
}

export function MusicStudio({
  language,
  userId,
  onNotice,
  mode = 'full',
  onExpand,
  onCollapse,
}: MusicStudioProps) {
  const copy = language === 'zh'
    ? {
        title: '音樂工作室', subtitle: '播放清單、佇列、收藏、速度與循環控制', addUrl: '加入網址音樂', trackTitle: '歌曲名稱', artist: '演出者（選填）', audioUrl: '直接音訊或 YouTube 網址', add: '加入曲庫', local: '暫時載入本機音樂', library: '我的曲庫', queue: '播放佇列', favorites: '只看收藏', all: '全部歌曲', empty: '曲庫目前是空的', emptyQueue: '播放佇列目前是空的', play: '播放', pause: '暫停', previous: '上一首', next: '下一首', shuffle: '隨機播放', repeatOff: '不循環', repeatAll: '全部循環', repeatOne: '單曲循環', volume: '音量', speed: '速度', addQueue: '加入佇列', playNow: '立即播放', favorite: '收藏', unfavorite: '取消收藏', remove: '移除', moveUp: '往上移', moveDown: '往下移', invalidUrl: '請貼上有效的 YouTube 網址，或可直接播放的 MP3、M4A、OGG 音訊網址。', added: '歌曲已加入曲庫。', localAdded: '本機音樂已暫時加入；重新整理後需重新選取檔案。', playbackFailed: '這個來源無法播放。YouTube 請貼影片網址；其他來源必須是可直接播放的音訊檔案網址。', nowPlaying: '正在播放', noTrack: '尚未選擇歌曲', clearQueue: '清空佇列', expand: '開啟音樂工作室', collapse: '收合音樂工作室', sourceHint: '支援 YouTube 影片網址，以及可直接播放的 MP3、M4A、OGG 等音訊網址。一般網頁網址無法播放。', youtube: 'YouTube', directAudio: '音訊', openPlayer: '開啟音樂播放器',
      }
    : {
        title: 'Music Studio', subtitle: 'Library, queue, favorites, speed, and repeat controls', addUrl: 'Add audio URL', trackTitle: 'Track title', artist: 'Artist (optional)', audioUrl: 'Direct audio or YouTube URL', add: 'Add to library', local: 'Load local audio temporarily', library: 'Library', queue: 'Play queue', favorites: 'Favorites only', all: 'All tracks', empty: 'Your library is empty', emptyQueue: 'The queue is empty', play: 'Play', pause: 'Pause', previous: 'Previous', next: 'Next', shuffle: 'Shuffle', repeatOff: 'Repeat off', repeatAll: 'Repeat all', repeatOne: 'Repeat one', volume: 'Volume', speed: 'Speed', addQueue: 'Add to queue', playNow: 'Play now', favorite: 'Favorite', unfavorite: 'Remove favorite', remove: 'Remove', moveUp: 'Move up', moveDown: 'Move down', invalidUrl: 'Paste a valid YouTube URL or a directly playable MP3, M4A, or OGG URL.', added: 'Track added to the library.', localAdded: 'Local audio added temporarily. Select it again after refreshing.', playbackFailed: 'This source could not be played. Use a YouTube video URL or a directly playable audio file URL.', nowPlaying: 'Now playing', noTrack: 'No track selected', clearQueue: 'Clear queue', expand: 'Open music studio', collapse: 'Collapse music studio', sourceHint: 'Supports YouTube video URLs and directly playable MP3, M4A, or OGG URLs. Ordinary webpage URLs cannot play.', youtube: 'YouTube', directAudio: 'Audio', openPlayer: 'Open music player',
      }

  const libraryKey = storageKey(userId, 'library')
  const queueKey = storageKey(userId, 'queue')
  const settingsKey = storageKey(userId, 'settings')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const youtubeRef = useRef<HTMLIFrameElement | null>(null)
  const youtubeReadyRef = useRef(false)
  const temporaryUrlsRef = useRef<Set<string>>(new Set())
  const autoPlayRef = useRef(false)

  const [tracks, setTracks] = useState<MusicTrack[]>(() => readJson(libraryKey, []))
  const [queue, setQueue] = useState<string[]>(() => readJson(queueKey, []))
  const [currentId, setCurrentId] = useState<string | null>(() => readJson(storageKey(userId, 'current'), null))
  const initialSettings = readJson<{ volume: number; speed: number; repeat: RepeatMode; shuffle: boolean }>(settingsKey, {
    volume: 0.72,
    speed: 1,
    repeat: 'off',
    shuffle: false,
  })
  const [volume, setVolume] = useState(initialSettings.volume)
  const [speed, setSpeed] = useState(initialSettings.speed)
  const [repeat, setRepeat] = useState<RepeatMode>(initialSettings.repeat)
  const [shuffle, setShuffle] = useState(initialSettings.shuffle)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  const currentTrack = tracks.find((track) => track.id === currentId) ?? null
  const currentSource = trackSource(currentTrack)
  const currentYouTubeId = currentSource.youtubeId
  const visibleTracks = useMemo(() => tracks.filter((track) => !favoritesOnly || track.favorite), [favoritesOnly, tracks])
  const queuedTracks = queue.map((id) => tracks.find((track) => track.id === id)).filter((track): track is MusicTrack => Boolean(track))

  const sendYouTubeCommand = (func: 'playVideo' | 'pauseVideo' | 'stopVideo') => {
    youtubeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args: [] }),
      'https://www.youtube.com',
    )
  }

  const playCurrentYouTube = () => {
    if (youtubeReadyRef.current) {
      sendYouTubeCommand('playVideo')
      autoPlayRef.current = false
    } else {
      autoPlayRef.current = true
    }
    setIsPlaying(true)
  }

  useEffect(() => {
    window.localStorage.setItem(libraryKey, JSON.stringify(tracks.filter((track) => !track.temporary)))
  }, [libraryKey, tracks])

  useEffect(() => {
    const persistentIds = queue.filter((id) => tracks.some((track) => track.id === id && !track.temporary))
    window.localStorage.setItem(queueKey, JSON.stringify(persistentIds))
  }, [queue, queueKey, tracks])

  useEffect(() => {
    window.localStorage.setItem(settingsKey, JSON.stringify({ volume, speed, repeat, shuffle }))
  }, [repeat, settingsKey, shuffle, speed, volume])

  useEffect(() => {
    window.localStorage.setItem(storageKey(userId, 'current'), JSON.stringify(currentTrack?.temporary ? null : currentId))
  }, [currentId, currentTrack?.temporary, userId])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
    audio.playbackRate = speed
  }, [speed, volume])

  useEffect(() => {
    if (currentSource.type === 'youtube') {
      audioRef.current?.pause()
      youtubeReadyRef.current = false
      setProgress(0)
      setDuration(0)
      return
    }

    const audio = audioRef.current
    if (!audio || !currentTrack || !autoPlayRef.current) return
    autoPlayRef.current = false
    audio.load()
    void audio.play().then(() => setIsPlaying(true)).catch(() => {
      setIsPlaying(false)
      onNotice(copy.playbackFailed)
    })
  }, [currentTrack, currentSource.type, copy.playbackFailed, onNotice])

  useEffect(() => {
    if (!currentTrack || !('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist || 'Bubble Space',
      album: 'Bubble Space Music Studio',
    })
  }, [currentTrack])

  useEffect(() => () => {
    temporaryUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    temporaryUrlsRef.current.clear()
  }, [])

  const playTrack = async (track: MusicTrack) => {
    setQueue((current) => current.includes(track.id) ? current : [...current, track.id])
    const source = trackSource(track)

    if (currentId === track.id) {
      if (source.type === 'youtube') {
        playCurrentYouTube()
      } else if (audioRef.current) {
        await audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
          setIsPlaying(false)
          onNotice(copy.playbackFailed)
        })
      }
      return
    }

    autoPlayRef.current = true
    setIsPlaying(false)
    setCurrentId(track.id)
  }

  const togglePlay = async () => {
    if (!currentTrack) {
      const firstTrack = queuedTracks[0] ?? tracks[0]
      if (firstTrack) await playTrack(firstTrack)
      return
    }

    if (currentSource.type === 'youtube') {
      if (isPlaying) {
        sendYouTubeCommand('pauseVideo')
        setIsPlaying(false)
      } else {
        playCurrentYouTube()
      }
      return
    }

    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      await audio.play().then(() => setIsPlaying(true)).catch(() => {
        setIsPlaying(false)
        onNotice(copy.playbackFailed)
      })
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  const selectNext = (direction: 1 | -1) => {
    if (queue.length === 0) return
    const currentIndex = Math.max(0, queue.indexOf(currentId ?? ''))
    let nextIndex = currentIndex
    if (shuffle && queue.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * queue.length)
      } while (nextIndex === currentIndex)
    } else {
      nextIndex = currentIndex + direction
      if (nextIndex >= queue.length) nextIndex = repeat === 'all' ? 0 : queue.length - 1
      if (nextIndex < 0) nextIndex = repeat === 'all' ? queue.length - 1 : 0
    }
    const nextTrack = tracks.find((track) => track.id === queue[nextIndex])
    if (nextTrack) void playTrack(nextTrack)
  }

  const onEnded = () => {
    if (repeat === 'one') {
      if (audioRef.current) audioRef.current.currentTime = 0
      void audioRef.current?.play().catch(() => onNotice(copy.playbackFailed))
      return
    }
    const currentIndex = queue.indexOf(currentId ?? '')
    if (currentIndex === queue.length - 1 && repeat === 'off') {
      setIsPlaying(false)
      return
    }
    selectNext(1)
  }

  const addUrlTrack = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const title = String(form.get('title') ?? '').trim()
    const artist = String(form.get('artist') ?? '').trim()
    const urlValue = String(form.get('url') ?? '').trim()
    try {
      const url = new URL(urlValue)
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('protocol')
      const source = extractYouTubeId(url.toString()) ? 'youtube' : 'audio'
      const track: MusicTrack = { id: createId(), title, artist, url: url.toString(), favorite: false, source }
      setTracks((current) => [...current, track])
      setQueue((current) => [...current, track.id])
      formElement.reset()
      onNotice(copy.added)
    } catch {
      onNotice(copy.invalidUrl)
    }
  }

  const addLocalTracks = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return
    const additions = files.map<MusicTrack>((file) => {
      const url = URL.createObjectURL(file)
      temporaryUrlsRef.current.add(url)
      return { id: createId(), title: file.name.replace(/\.[^.]+$/, ''), artist: '', url, favorite: false, temporary: true, source: 'audio' }
    })
    setTracks((current) => [...current, ...additions])
    setQueue((current) => [...current, ...additions.map((track) => track.id)])
    event.target.value = ''
    onNotice(copy.localAdded)
  }

  const removeTrack = (track: MusicTrack) => {
    if (track.temporary) {
      URL.revokeObjectURL(track.url)
      temporaryUrlsRef.current.delete(track.url)
    }
    setTracks((current) => current.filter((item) => item.id !== track.id))
    setQueue((current) => current.filter((id) => id !== track.id))
    if (currentId === track.id) {
      audioRef.current?.pause()
      sendYouTubeCommand('stopVideo')
      setCurrentId(null)
      setIsPlaying(false)
    }
  }

  const moveQueue = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= queue.length) return
    setQueue((current) => {
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const repeatLabel = repeat === 'one' ? copy.repeatOne : repeat === 'all' ? copy.repeatAll : copy.repeatOff
  const currentSourceLabel = currentSource.type === 'youtube' ? copy.youtube : copy.directAudio

  return (
    <section className={`music-studio music-studio-${mode}`}>
      <audio
        ref={audioRef}
        src={currentSource.type === 'audio' ? currentTrack?.url : undefined}
        onPlay={() => setIsPlaying(true)}
        onPause={() => currentSource.type === 'audio' && setIsPlaying(false)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
        onTimeUpdate={(event) => setProgress(event.currentTarget.currentTime)}
        onEnded={onEnded}
        onError={() => currentSource.type === 'audio' && currentTrack && onNotice(copy.playbackFailed)}
      />

      {currentYouTubeId ? (
        <iframe
          className="music-youtube-frame"
          ref={youtubeRef}
          title={`${currentTrack?.title ?? copy.youtube} YouTube player`}
          src={`https://www.youtube.com/embed/${currentYouTubeId}?enablejsapi=1&playsinline=1&rel=0&origin=${encodeURIComponent(window.location.origin)}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          onLoad={() => {
            youtubeReadyRef.current = true
            if (autoPlayRef.current) {
              sendYouTubeCommand('playVideo')
              autoPlayRef.current = false
              setIsPlaying(true)
            }
          }}
        />
      ) : null}

      {mode === 'compact' ? (
        <button
          className={`music-orb-launcher${isPlaying ? ' playing' : ''}`}
          type="button"
          aria-label={copy.openPlayer}
          title={currentTrack ? `${copy.openPlayer}：${currentTrack.title}` : copy.openPlayer}
          onClick={onExpand}
        >
          <span aria-hidden="true">♫</span>
          {isPlaying ? <i aria-hidden="true" /> : null}
        </button>
      ) : (
        <>
          <header className="music-studio-head">
            <div><p className="eyebrow">BUBBLE AUDIO</p><h2>{copy.title}</h2><p>{copy.subtitle}</p></div>
            <div className="music-studio-head-actions">
              <label className="local-audio-button"><input type="file" accept="audio/*" multiple onChange={addLocalTracks} />＋ {copy.local}</label>
              <button className="music-collapse-button" type="button" aria-label={copy.collapse} title={copy.collapse} onClick={onCollapse}>—</button>
            </div>
          </header>

          <div className="music-now-playing">
            <div className={`album-orb${isPlaying ? ' playing' : ''}`} aria-hidden="true"><span>♫</span></div>
            <div className="now-playing-copy"><p>{copy.nowPlaying} · {currentSourceLabel}</p><strong>{currentTrack?.title ?? copy.noTrack}</strong><span>{currentTrack?.artist || 'Bubble Space'}</span></div>
            <div className="transport-controls">
              <button type="button" aria-label={copy.previous} title={copy.previous} onClick={() => selectNext(-1)}>⏮</button>
              <button className="play-toggle" type="button" aria-label={isPlaying ? copy.pause : copy.play} onClick={() => void togglePlay()}>{isPlaying ? 'Ⅱ' : '▶'}</button>
              <button type="button" aria-label={copy.next} title={copy.next} onClick={() => selectNext(1)}>⏭</button>
            </div>
            <div className="music-timeline">
              <span>{formatTime(progress)}</span>
              <input type="range" min="0" max={Math.max(duration, 1)} step="0.1" value={Math.min(progress, Math.max(duration, 1))} disabled={currentSource.type === 'youtube'} onChange={(event) => {
                const value = Number(event.target.value)
                setProgress(value)
                if (audioRef.current) audioRef.current.currentTime = value
              }} />
              <span>{formatTime(duration)}</span>
            </div>
            <div className="music-control-grid">
              <button className={shuffle ? 'active' : ''} type="button" title={copy.shuffle} onClick={() => setShuffle((value) => !value)}>⤨ {copy.shuffle}</button>
              <button type="button" title={repeatLabel} onClick={() => setRepeat((value) => value === 'off' ? 'all' : value === 'all' ? 'one' : 'off')}>↻ {repeatLabel}</button>
              <label><span>{copy.volume}</span><input type="range" min="0" max="1" step="0.02" value={volume} disabled={currentSource.type === 'youtube'} onChange={(event) => setVolume(Number(event.target.value))} /></label>
              <label><span>{copy.speed}</span><select value={speed} disabled={currentSource.type === 'youtube'} onChange={(event) => setSpeed(Number(event.target.value))}><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label>
            </div>
          </div>

          <div className="music-columns">
            <section className="music-panel library-panel">
              <div className="music-panel-head"><h3>{copy.library}</h3><div className="music-filter-tabs"><button className={!favoritesOnly ? 'active' : ''} type="button" onClick={() => setFavoritesOnly(false)}>{copy.all}</button><button className={favoritesOnly ? 'active' : ''} type="button" onClick={() => setFavoritesOnly(true)}>♥ {copy.favorites}</button></div></div>
              <form className="audio-url-form" onSubmit={addUrlTrack}>
                <input name="title" required maxLength={80} placeholder={copy.trackTitle} />
                <input name="artist" maxLength={80} placeholder={copy.artist} />
                <input name="url" required inputMode="url" placeholder={copy.audioUrl} />
                <button className="primary-button" type="submit">＋ {copy.add}</button>
              </form>
              <p className="audio-source-hint">{copy.sourceHint}</p>
              <div className="music-track-list">
                {visibleTracks.length === 0 ? <div className="music-empty">{copy.empty}</div> : null}
                {visibleTracks.map((track) => {
                  const source = trackSource(track)
                  return (
                    <article className={`music-track-row${track.id === currentId ? ' current' : ''}`} key={track.id}>
                      <button className="track-play-button" type="button" title={copy.playNow} onClick={() => void playTrack(track)}>▶</button>
                      <div><strong>{track.title}</strong><span>{track.artist || 'Bubble Space'} · {source.type === 'youtube' ? copy.youtube : copy.directAudio}{track.temporary ? ' · Local' : ''}</span></div>
                      <button className={track.favorite ? 'favorite active' : 'favorite'} type="button" title={track.favorite ? copy.unfavorite : copy.favorite} onClick={() => setTracks((current) => current.map((item) => item.id === track.id ? { ...item, favorite: !item.favorite } : item))}>♥</button>
                      <button type="button" title={copy.addQueue} onClick={() => setQueue((current) => [...current, track.id])}>＋</button>
                      <button type="button" title={copy.remove} onClick={() => removeTrack(track)}>×</button>
                    </article>
                  )
                })}
              </div>
            </section>

            <section className="music-panel queue-panel">
              <div className="music-panel-head"><h3>{copy.queue}</h3><button type="button" onClick={() => setQueue([])}>{copy.clearQueue}</button></div>
              <div className="music-queue-list">
                {queuedTracks.length === 0 ? <div className="music-empty">{copy.emptyQueue}</div> : null}
                {queuedTracks.map((track, index) => (
                  <article className={`queue-row${track.id === currentId ? ' current' : ''}`} key={`${track.id}-${index}`}>
                    <button type="button" onClick={() => void playTrack(track)}>{track.id === currentId && isPlaying ? '♫' : index + 1}</button>
                    <div><strong>{track.title}</strong><span>{track.artist || 'Bubble Space'} · {trackSource(track).type === 'youtube' ? copy.youtube : copy.directAudio}</span></div>
                    <button type="button" title={copy.moveUp} onClick={() => moveQueue(index, -1)}>↑</button>
                    <button type="button" title={copy.moveDown} onClick={() => moveQueue(index, 1)}>↓</button>
                    <button type="button" title={copy.remove} onClick={() => setQueue((current) => current.filter((_, itemIndex) => itemIndex !== index))}>×</button>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </section>
  )
}
