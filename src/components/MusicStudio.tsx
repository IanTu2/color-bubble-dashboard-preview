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
        title: '音樂工作室', subtitle: '播放清單、佇列、收藏、速度與循環控制', addUrl: '加入網址音樂', trackTitle: '歌曲名稱', artist: '演出者（選填）', audioUrl: '直接音訊網址（MP3、M4A、OGG 等）', add: '加入曲庫', local: '暫時載入本機音樂', library: '我的曲庫', queue: '播放佇列', favorites: '只看收藏', all: '全部歌曲', empty: '曲庫目前是空的', emptyQueue: '播放佇列目前是空的', play: '播放', pause: '暫停', previous: '上一首', next: '下一首', shuffle: '隨機播放', repeatOff: '不循環', repeatAll: '全部循環', repeatOne: '單曲循環', volume: '音量', speed: '速度', addQueue: '加入佇列', playNow: '立即播放', favorite: '收藏', unfavorite: '取消收藏', remove: '移除', moveUp: '往上移', moveDown: '往下移', invalidUrl: '請輸入可用的 http 或 https 音訊網址。', added: '歌曲已加入曲庫。', localAdded: '本機音樂已暫時加入；重新整理後需重新選取檔案。', playbackFailed: '瀏覽器無法播放這個來源，請確認它是直接音訊網址。', nowPlaying: '正在播放', noTrack: '尚未選擇歌曲', clearQueue: '清空佇列', expand: '展開音樂工作室', collapse: '收合為小型播放器',
      }
    : {
        title: 'Music Studio', subtitle: 'Library, queue, favorites, speed, and repeat controls', addUrl: 'Add audio URL', trackTitle: 'Track title', artist: 'Artist (optional)', audioUrl: 'Direct audio URL (MP3, M4A, OGG, etc.)', add: 'Add to library', local: 'Load local audio temporarily', library: 'Library', queue: 'Play queue', favorites: 'Favorites only', all: 'All tracks', empty: 'Your library is empty', emptyQueue: 'The queue is empty', play: 'Play', pause: 'Pause', previous: 'Previous', next: 'Next', shuffle: 'Shuffle', repeatOff: 'Repeat off', repeatAll: 'Repeat all', repeatOne: 'Repeat one', volume: 'Volume', speed: 'Speed', addQueue: 'Add to queue', playNow: 'Play now', favorite: 'Favorite', unfavorite: 'Remove favorite', remove: 'Remove', moveUp: 'Move up', moveDown: 'Move down', invalidUrl: 'Enter a valid http or https direct audio URL.', added: 'Track added to the library.', localAdded: 'Local audio added temporarily. Select it again after refreshing.', playbackFailed: 'The browser could not play this source. Use a direct audio URL.', nowPlaying: 'Now playing', noTrack: 'No track selected', clearQueue: 'Clear queue', expand: 'Expand music studio', collapse: 'Collapse to compact player',
      }

  const libraryKey = storageKey(userId, 'library')
  const queueKey = storageKey(userId, 'queue')
  const settingsKey = storageKey(userId, 'settings')
  const audioRef = useRef<HTMLAudioElement | null>(null)
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
  const visibleTracks = useMemo(() => tracks.filter((track) => !favoritesOnly || track.favorite), [favoritesOnly, tracks])
  const queuedTracks = queue.map((id) => tracks.find((track) => track.id === id)).filter((track): track is MusicTrack => Boolean(track))

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
    const audio = audioRef.current
    if (!audio || !currentTrack || !autoPlayRef.current) return
    autoPlayRef.current = false
    audio.load()
    void audio.play().then(() => setIsPlaying(true)).catch(() => onNotice(copy.playbackFailed))
  }, [currentTrack, copy.playbackFailed, onNotice])

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
    if (currentId === track.id && audioRef.current) {
      await audioRef.current.play().then(() => setIsPlaying(true)).catch(() => onNotice(copy.playbackFailed))
      return
    }
    autoPlayRef.current = true
    setCurrentId(track.id)
  }

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (!currentTrack) {
      const firstTrack = queuedTracks[0] ?? tracks[0]
      if (firstTrack) await playTrack(firstTrack)
      return
    }
    if (audio.paused) {
      await audio.play().then(() => setIsPlaying(true)).catch(() => onNotice(copy.playbackFailed))
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
      const track: MusicTrack = { id: createId(), title, artist, url: url.toString(), favorite: false }
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
      return { id: createId(), title: file.name.replace(/\.[^.]+$/, ''), artist: '', url, favorite: false, temporary: true }
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

  return (
    <section className={`music-studio music-studio-${mode}`}>
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
        onTimeUpdate={(event) => setProgress(event.currentTarget.currentTime)}
        onEnded={onEnded}
        onError={() => currentTrack && onNotice(copy.playbackFailed)}
      />

      {mode === 'compact' ? (
        <div className="music-compact-player">
          <div className={`compact-album-orb${isPlaying ? ' playing' : ''}`} aria-hidden="true">♫</div>
          <div className="compact-track-copy">
            <strong>{currentTrack?.title ?? copy.noTrack}</strong>
            <span>{currentTrack?.artist || 'Bubble Space'}</span>
          </div>
          <div className="compact-transport-controls">
            <button type="button" aria-label={copy.previous} title={copy.previous} onClick={() => selectNext(-1)}>‹</button>
            <button className="compact-play-toggle" type="button" aria-label={isPlaying ? copy.pause : copy.play} onClick={() => void togglePlay()}>{isPlaying ? 'Ⅱ' : '▶'}</button>
            <button type="button" aria-label={copy.next} title={copy.next} onClick={() => selectNext(1)}>›</button>
          </div>
          <button className="music-expand-button" type="button" aria-label={copy.expand} title={copy.expand} onClick={onExpand}>↗</button>
          <div className="compact-progress" aria-hidden="true"><span style={{ width: `${duration > 0 ? Math.min(100, (progress / duration) * 100) : 0}%` }} /></div>
        </div>
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
            <div className="now-playing-copy"><p>{copy.nowPlaying}</p><strong>{currentTrack?.title ?? copy.noTrack}</strong><span>{currentTrack?.artist || 'Bubble Space'}</span></div>
            <div className="transport-controls">
              <button type="button" aria-label={copy.previous} title={copy.previous} onClick={() => selectNext(-1)}>⏮</button>
              <button className="play-toggle" type="button" aria-label={isPlaying ? copy.pause : copy.play} onClick={() => void togglePlay()}>{isPlaying ? 'Ⅱ' : '▶'}</button>
              <button type="button" aria-label={copy.next} title={copy.next} onClick={() => selectNext(1)}>⏭</button>
            </div>
            <div className="music-timeline">
              <span>{formatTime(progress)}</span>
              <input type="range" min="0" max={Math.max(duration, 1)} step="0.1" value={Math.min(progress, Math.max(duration, 1))} onChange={(event) => {
                const value = Number(event.target.value)
                setProgress(value)
                if (audioRef.current) audioRef.current.currentTime = value
              }} />
              <span>{formatTime(duration)}</span>
            </div>
            <div className="music-control-grid">
              <button className={shuffle ? 'active' : ''} type="button" title={copy.shuffle} onClick={() => setShuffle((value) => !value)}>⤨ {copy.shuffle}</button>
              <button type="button" title={repeatLabel} onClick={() => setRepeat((value) => value === 'off' ? 'all' : value === 'all' ? 'one' : 'off')}>↻ {repeatLabel}</button>
              <label><span>{copy.volume}</span><input type="range" min="0" max="1" step="0.02" value={volume} onChange={(event) => setVolume(Number(event.target.value))} /></label>
              <label><span>{copy.speed}</span><select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label>
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
              <div className="music-track-list">
                {visibleTracks.length === 0 ? <div className="music-empty">{copy.empty}</div> : null}
                {visibleTracks.map((track) => (
                  <article className={`music-track-row${track.id === currentId ? ' current' : ''}`} key={track.id}>
                    <button className="track-play-button" type="button" title={copy.playNow} onClick={() => void playTrack(track)}>▶</button>
                    <div><strong>{track.title}</strong><span>{track.artist || 'Bubble Space'}{track.temporary ? ' · Local' : ''}</span></div>
                    <button className={track.favorite ? 'favorite active' : 'favorite'} type="button" title={track.favorite ? copy.unfavorite : copy.favorite} onClick={() => setTracks((current) => current.map((item) => item.id === track.id ? { ...item, favorite: !item.favorite } : item))}>♥</button>
                    <button type="button" title={copy.addQueue} onClick={() => setQueue((current) => [...current, track.id])}>＋</button>
                    <button type="button" title={copy.remove} onClick={() => removeTrack(track)}>×</button>
                  </article>
                ))}
              </div>
            </section>

            <section className="music-panel queue-panel">
              <div className="music-panel-head"><h3>{copy.queue}</h3><button type="button" onClick={() => setQueue([])}>{copy.clearQueue}</button></div>
              <div className="music-queue-list">
                {queuedTracks.length === 0 ? <div className="music-empty">{copy.emptyQueue}</div> : null}
                {queuedTracks.map((track, index) => (
                  <article className={`queue-row${track.id === currentId ? ' current' : ''}`} key={`${track.id}-${index}`}>
                    <button type="button" onClick={() => void playTrack(track)}>{track.id === currentId && isPlaying ? '♫' : index + 1}</button>
                    <div><strong>{track.title}</strong><span>{track.artist || 'Bubble Space'}</span></div>
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
