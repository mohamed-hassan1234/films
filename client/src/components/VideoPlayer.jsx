import { Maximize, Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const formatTime = (seconds = 0) => {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const mins = Math.floor(safeSeconds / 60);
  const secs = Math.floor(safeSeconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const ControlButton = ({ children, label, onClick, className = "", small = false }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`grid place-items-center rounded-full bg-white/15 transition hover:bg-white/25 ${small ? "h-10 w-10" : "h-12 w-12"} ${className}`}
  >
    {children}
  </button>
);

const isMobileScreen = () => typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;

const VideoPlayer = ({ src, poster, onProgress }) => {
  const videoRef = useRef(null);
  const shellRef = useRef(null);
  const hideTimerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [controlsVisible, setControlsVisible] = useState(true);
  const [mobileLandscape, setMobileLandscape] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    setLoadError("");

    const tick = () => {
      setCurrentTime(video.currentTime || 0);
      setDuration(video.duration || 0);
      setPlaying(!video.paused);
      onProgress?.(video.currentTime || 0, video.duration || 0);
    };

    video.addEventListener("loadedmetadata", tick);
    video.addEventListener("timeupdate", tick);
    video.addEventListener("play", tick);
    video.addEventListener("pause", tick);
    return () => {
      video.removeEventListener("loadedmetadata", tick);
      video.removeEventListener("timeupdate", tick);
      video.removeEventListener("play", tick);
      video.removeEventListener("pause", tick);
    };
  }, [src, onProgress]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const seekTo = (seconds) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(seconds, 0), duration || seconds);
  };

  const skip = (seconds) => seekTo(currentTime + seconds);

  const changeVolume = (value) => {
    const nextVolume = Number(value);
    setVolume(nextVolume);
    setMuted(nextVolume === 0);
    if (videoRef.current) {
      videoRef.current.volume = nextVolume / 100;
      videoRef.current.muted = nextVolume === 0;
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setMuted(nextMuted);
  };

  const shouldRotatePlayer = () => isMobileScreen() && window.innerHeight > window.innerWidth;

  const lockLandscape = async () => {
    try {
      if (isMobileScreen() && window.screen?.orientation?.lock) {
        await window.screen.orientation.lock("landscape");
      }
    } catch {
      // Some mobile browsers only allow orientation lock after fullscreen, and some do not allow it at all.
    }
  };

  const unlockOrientation = () => {
    try {
      window.screen?.orientation?.unlock?.();
    } catch {
      // Orientation unlock is best-effort across mobile browsers.
    }
  };

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      unlockOrientation();
      setMobileLandscape(false);
      await document.exitFullscreen?.();
      return;
    }

    const video = videoRef.current;
    if (isMobileScreen() && video?.webkitEnterFullscreen && !shellRef.current?.requestFullscreen) {
      video.webkitEnterFullscreen();
      return;
    }

    await shellRef.current?.requestFullscreen?.();
    await lockLandscape();
    window.setTimeout(() => setMobileLandscape(shouldRotatePlayer()), 350);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
  }, []);

  const hideControls = useCallback(() => {
    clearHideTimer();
    setControlsVisible(false);
  }, [clearHideTimer]);

  const showControls = useCallback((autoHide = playing) => {
    clearHideTimer();
    setControlsVisible(true);
    if (autoHide) {
      hideTimerRef.current = window.setTimeout(() => setControlsVisible(false), 2200);
    }
  }, [clearHideTimer, playing]);

  useEffect(() => {
    if (playing) showControls(true);
    else showControls(false);
    return clearHideTimer;
  }, [playing, showControls, clearHideTimer]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const tagName = event.target?.tagName?.toLowerCase();
      if (["input", "textarea", "select"].includes(tagName) || event.target?.isContentEditable) return;

      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        toggle();
      } else if (event.key === "ArrowRight" || event.key === ">" || event.key === ".") {
        event.preventDefault();
        skip(10);
      } else if (event.key === "ArrowLeft" || event.key === "<" || event.key === ",") {
        event.preventDefault();
        skip(-10);
      } else if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        toggleFullscreen();
      } else if (event.key.toLowerCase() === "m") {
        event.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTime, duration, playing]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        unlockOrientation();
        setMobileLandscape(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const updateRotation = () => {
      if (document.fullscreenElement === shellRef.current) {
        setMobileLandscape(shouldRotatePlayer());
      }
    };

    window.addEventListener("orientationchange", updateRotation);
    window.addEventListener("resize", updateRotation);
    return () => {
      window.removeEventListener("orientationchange", updateRotation);
      window.removeEventListener("resize", updateRotation);
    };
  }, []);

  if (!src) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-zinc-950 text-center text-zinc-300">
        <div>
          <div className="text-xl font-semibold">No movie file uploaded yet</div>
          <p className="mt-2 text-sm">Admins can upload an MP4, WebM, or MOV file from the movie editor.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={shellRef}
      className="relative overflow-hidden rounded-lg bg-black outline-none"
      tabIndex={0}
      onMouseEnter={() => showControls(false)}
      onMouseMove={() => showControls(playing)}
      onMouseLeave={hideControls}
      onTouchStart={() => showControls(true)}
      onTouchEnd={() => showControls(true)}
    >
      <div
        className={
          mobileLandscape
            ? "absolute left-1/2 top-1/2 h-[100vw] w-[100vh] origin-center -translate-x-1/2 -translate-y-1/2 rotate-90 bg-black"
            : "relative"
        }
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className={mobileLandscape ? "h-full w-full bg-black object-contain" : "aspect-video w-full bg-black object-contain"}
          controls={false}
          playsInline
          onClick={toggle}
          onError={() => setLoadError("This video file could not be played by the browser. Use MP4/H.264 or WebM for the best result.")}
        />
        {loadError && (
          <div className="absolute inset-0 grid place-items-center bg-black/85 px-6 text-center text-zinc-200">
            <div>
              <div className="text-xl font-semibold">Video cannot play</div>
              <p className="mt-2 max-w-lg text-sm text-zinc-400">{loadError}</p>
            </div>
          </div>
        )}

        <div className={`pointer-events-none absolute inset-0 hidden place-items-center transition-opacity duration-300 sm:grid ${controlsVisible ? "opacity-100" : "opacity-0"} ${loadError ? "opacity-30" : ""}`}>
          <div className="pointer-events-auto flex items-center gap-4 rounded-full bg-black/35 p-2 backdrop-blur-sm">
            <ControlButton label="Back 10 seconds" onClick={() => skip(-10)} small>
              <RotateCcw size={18} />
            </ControlButton>
            <ControlButton label="Play or pause" onClick={toggle} className="h-16 w-16 bg-white text-black hover:bg-zinc-200">
              {playing ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
            </ControlButton>
            <ControlButton label="Forward 10 seconds" onClick={() => skip(10)} small>
              <RotateCw size={18} />
            </ControlButton>
          </div>
        </div>

        <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-3 transition-opacity duration-300 sm:p-4 ${controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"} ${loadError ? "pointer-events-none opacity-30" : ""}`}>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(event) => seekTo((Number(event.target.value) / 100) * duration)}
            className="mb-4 h-1 w-full accent-wave-red"
            aria-label="Video progress"
          />

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="min-w-24 text-xs text-zinc-200 sm:text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="mx-auto flex items-center gap-3 sm:hidden">
              <ControlButton label="Back 10 seconds" onClick={() => skip(-10)} small>
                <RotateCcw size={18} />
              </ControlButton>
              <ControlButton label="Play or pause" onClick={toggle} small className="bg-white text-black hover:bg-zinc-200">
                {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </ControlButton>
              <ControlButton label="Forward 10 seconds" onClick={() => skip(10)} small>
                <RotateCw size={18} />
              </ControlButton>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20" onClick={toggleMute} aria-label="Mute">
                {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(event) => changeVolume(event.target.value)}
                className="hidden w-24 accent-wave-red sm:block"
                aria-label="Volume"
              />
              <ControlButton label="Fullscreen" onClick={toggleFullscreen} small>
                <Maximize size={18} />
              </ControlButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
