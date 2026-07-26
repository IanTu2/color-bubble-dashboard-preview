export type YouTubePlayer = {
  cueVideoById: (videoId: string) => void
  loadVideoById: (videoId: string) => void
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  setVolume: (volume: number) => void
  setPlaybackRate: (rate: number) => void
  getCurrentTime: () => number
  getDuration: () => number
  getPlayerState: () => number
  destroy: () => void
}

type YouTubeEvent = {
  target: YouTubePlayer
  data: number
}

type YouTubePlayerOptions = {
  width?: string
  height?: string
  videoId?: string
  playerVars?: Record<string, string | number>
  events?: {
    onReady?: (event: YouTubeEvent) => void
    onStateChange?: (event: YouTubeEvent) => void
    onError?: (event: YouTubeEvent) => void
  }
}

export type YouTubeApi = {
  Player: new (elementId: string, options: YouTubePlayerOptions) => YouTubePlayer
  PlayerState: {
    ENDED: number
    PLAYING: number
    PAUSED: number
  }
}

declare global {
  interface Window {
    YT?: YouTubeApi
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiPromise: Promise<YouTubeApi> | null = null

export function loadYouTubeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (apiPromise) return apiPromise

  apiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady

    window.onYouTubeIframeAPIReady = () => {
      previousReady?.()
      if (window.YT?.Player) {
        resolve(window.YT)
      } else {
        reject(new Error('YouTube API loaded without a Player constructor.'))
      }
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-bubble-youtube-api]')
    if (existingScript) return

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.dataset.bubbleYoutubeApi = 'true'
    script.onerror = () => reject(new Error('Unable to load the YouTube IFrame API.'))
    document.head.appendChild(script)
  })

  return apiPromise
}
