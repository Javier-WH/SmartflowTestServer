declare global {
  namespace YT {
    class Player {
      constructor(element: HTMLElement | string, options: PlayerOptions);
 
    }

    interface PlayerOptions {
      events?: {
        onStateChange?: (event: PlayerEvent) => void;
      };
    }

    interface PlayerEvent {
      data: number;
    }

    enum PlayerState {
      UNSTARTED = -1,
      ENDED = 0,
      PLAYING = 1,
      PAUSED = 2,
      BUFFERING = 3,
      CUED = 5
    }
  }

  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export { }; 