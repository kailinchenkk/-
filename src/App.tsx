import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Map, 
  Music, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles, 
  ExternalLink,
  Users,
  MessageCircle,
  CheckCircle,
  Compass,
  ArrowRight,
  Settings,
  X,
  Camera,
  Upload,
  Link,
  RotateCcw,
  Trash2
} from "lucide-react";
import weddingConfigDefault from "../wedding_config.json";

// Absolute path to the generated premium AI wedding hero image
const HERO_IMAGE_URL = (weddingConfigDefault && weddingConfigDefault.heroImages && weddingConfigDefault.heroImages[0])
  ? weddingConfigDefault.heroImages[0]
  : "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='1000' viewBox='0 0 8 10'><rect width='8' height='10' fill='%23F1F5F9'/></svg>";
const OLD_HERO_IMAGE_URL = HERO_IMAGE_URL;

const VENUE_PHOTOS = [
  {
    url: "https://cdn.phototourl.com/free/2026-06-09-5a9ed55c-b667-407d-b2e4-43800c944670.webp",
    title: "",
    desc: ""
  },
  {
    url: "https://cdn.phototourl.com/free/2026-06-09-d43c580e-9bd3-40f0-b7b8-d65deae67ab1.jpg",
    title: "",
    desc: ""
  },
  {
    url: "https://cdn.phototourl.com/free/2026-06-09-04a0e8ce-fa17-4178-a779-87837163b0c2.webp",
    title: "",
    desc: ""
  },
  {
    url: "https://cdn.phototourl.com/free/2026-06-09-08f743e2-42fe-4d82-a523-6d13ea040878.webp",
    title: "",
    desc: ""
  },
  {
    url: "https://cdn.phototourl.com/free/2026-06-09-184185b6-660c-458f-86d5-e9dc57c4910c.webp",
    title: "",
    desc: ""
  }
];

// Helper function to compress and resize photo client-side using Canvas to bypass LocalStorage 5MB quota
const compressAndResizeImage = (file: File, maxWidth = 1200, maxHeight = 1600): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Check file extension/type for Apple's HEIC format
    const isHeic = file.type?.toLowerCase().includes("heic") || 
                   file.type?.toLowerCase().includes("heif") || 
                   file.name?.toLowerCase().endsWith(".heic") || 
                   file.name?.toLowerCase().endsWith(".heif");
    if (isHeic) {
      reject(new Error("HEIC_FORMAT"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Downscale the image retaining proportional size & orientation ratios
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(readerEvent.target?.result as string);
            return;
          }

          // Render image onto the sandbox canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Quality of 0.8 ensures files under 200KB preserving exquisite wedding portrait detail
          const dataURL = canvas.toDataURL("image/jpeg", 0.8);
          resolve(dataURL);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error("IMAGE_LOAD_ERROR"));
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => reject(new Error("FILE_READ_ERROR"));
    reader.readAsDataURL(file);
  });
};

export default function App() {
  // Wedding details which are live editable by the user for perfect personalization
  const [groomName, setGroomName] = useState(() => localStorage.getItem("wedding_groomName") || weddingConfigDefault.groomName || "長升");
  const [brideName, setBrideName] = useState(() => localStorage.getItem("wedding_brideName") || weddingConfigDefault.brideName || "凱琳");
  const [groomFullName, setGroomFullName] = useState(() => localStorage.getItem("wedding_groomFullName") || weddingConfigDefault.groomFullName || "黃長升");
  const [groomParents, setGroomParents] = useState(() => localStorage.getItem("wedding_groomParents") || weddingConfigDefault.groomParents || "黃國曜 江秀妙");
  const [brideFullName, setBrideFullName] = useState(() => localStorage.getItem("wedding_brideFullName") || weddingConfigDefault.brideFullName || "陳凱琳");
  const [brideParents, setBrideParents] = useState(() => localStorage.getItem("wedding_brideParents") || weddingConfigDefault.brideParents || "陳朝原 林玉惠");
  const [groomEng, setGroomEng] = useState(() => localStorage.getItem("wedding_groomEng") || weddingConfigDefault.groomEng || "Chang-Sheng");
  const [brideEng, setBrideEng] = useState(() => localStorage.getItem("wedding_brideEng") || weddingConfigDefault.brideEng || "Kai-Lin");
  const [dateStr, setDateStr] = useState(() => localStorage.getItem("wedding_dateStr") || weddingConfigDefault.dateStr || "2026年9月12日");
  const [dayOfWeek, setDayOfWeek] = useState(() => localStorage.getItem("wedding_dayOfWeek") || weddingConfigDefault.dayOfWeek || "星期六");
  const [timeStr, setTimeStr] = useState(() => localStorage.getItem("wedding_timeStr") || weddingConfigDefault.timeStr || "午宴 12:00 正式開席");
  const [locationName, setLocationName] = useState(() => localStorage.getItem("wedding_locationName") || weddingConfigDefault.locationName || "唯愛庭園");
  const [hallName, setHallName] = useState(() => localStorage.getItem("wedding_hallName") || weddingConfigDefault.hallName || "奧蘿拉廳");
  const [addressStr, setAddressStr] = useState(() => localStorage.getItem("wedding_addressStr") || weddingConfigDefault.addressStr || "50064彰化縣彰化市延和里大埔路2巷126號");
  const [formUrl, setFormUrl] = useState(() => localStorage.getItem("wedding_formUrl") || weddingConfigDefault.formUrl || "https://forms.gle/rXoKhFVd743hNDiM9");
  const [lineUrl, setLineUrl] = useState(() => localStorage.getItem("wedding_lineUrl") || weddingConfigDefault.lineUrl || "https://lin.ee/8wBEd1x");
  const [heroImages, setHeroImages] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("wedding_heroImages");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Automatic migration: If it contains reference to the old default image, upgrade it to the new one
          return parsed.map(img => 
            img.includes("wedding_cover_1780931252909.png") ? HERO_IMAGE_URL : img
          );
        }
      }
    } catch (e) {}
    // If no localStorage, fallback to static import config heroImages if available
    if (weddingConfigDefault && Array.isArray(weddingConfigDefault.heroImages) && weddingConfigDefault.heroImages.length > 0) {
      return weddingConfigDefault.heroImages.map(img => 
        img.includes("wedding_cover_1780931252909.png") ? HERO_IMAGE_URL : img
      );
    }
    const legacy = localStorage.getItem("wedding_heroImage") || HERO_IMAGE_URL;
    const finalLegacy = legacy.includes("wedding_cover_1780931252909.png") ? HERO_IMAGE_URL : legacy;
    return [finalLegacy];
  });
  const [slideState, setSlideState] = useState({ current: 0, prev: 0 });
  const currentSlideIndex = slideState.current;
  const prevSlideIndex = slideState.prev;

  // Preload all hero cover images to cache them in browser memory and eliminate any network load flash
  useEffect(() => {
    if (Array.isArray(heroImages)) {
      heroImages.forEach((url) => {
        if (url) {
          const img = new Image();
          img.src = url;
        }
      });
    }
  }, [heroImages]);

  const heroImage = heroImages[currentSlideIndex] || HERO_IMAGE_URL;
  const [heroImagePosition, setHeroImagePosition] = useState(() => localStorage.getItem("wedding_heroImagePosition") || weddingConfigDefault.heroImagePosition || "center");
  const [groomPhoto, setGroomPhoto] = useState(() => localStorage.getItem("wedding_groomPhoto") || weddingConfigDefault.groomPhoto || "");
  const [bridePhoto, setBridePhoto] = useState(() => localStorage.getItem("wedding_bridePhoto") || weddingConfigDefault.bridePhoto || "");

  // File loading state tracks
  const [isCompressing, setIsCompressing] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Interface control states
  const [isPlaying, setIsPlaying] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [stickyCtaVisible, setStickyCtaVisible] = useState(false);
  const [activeVenuePhotoIndex, setActiveVenuePhotoIndex] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  const scrollCarousel = (direction: "left" | "right") => {
    const el = carouselRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.85;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };

  const scrollToIndex = (index: number) => {
    const el = carouselRef.current;
    if (!el) return;
    const cards = Array.from(el.children) as HTMLElement[];
    const cardEl = cards[index];
    if (cardEl) {
      el.scrollTo({
        left: cardEl.offsetLeft - (el.clientWidth - cardEl.clientWidth) / 2,
        behavior: "smooth"
      });
      setCurrentCarouselIndex(index);
    }
  };

  const handleCarouselScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const width = el.clientWidth;
    const children = Array.from(el.children);
    let closestIndex = 0;
    let minDiff = Infinity;
    children.forEach((child, idx) => {
      const card = child as HTMLElement;
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const containerCenter = scrollLeft + width / 2;
      const diff = Math.abs(cardCenter - containerCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });
    if (closestIndex >= 0 && closestIndex < VENUE_PHOTOS.length) {
      setCurrentCarouselIndex(closestIndex);
    }
  };

  // Saving state for synchronizing config to Express server
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Check if we are in admin mode (using URL parameter ?edit=true or ?admin=true)
  // By default, if the domain is a dev sandbox, we show it so the user can edit seamlessly.
  // Guests will access the normal URL without these parameters and won't see any settings gear.
  const isAdmin = useMemo(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get("edit") === "false" || params.get("guest") === "true") {
      return false;
    }
    const hasParam = params.get("edit") === "true" || params.get("admin") === "true";
    const isDevHost = window.location.hostname === "localhost" || 
                       window.location.hostname === "127.0.0.1" || 
                       window.location.hostname.includes("ais-dev-");
    return hasParam || isDevHost;
  }, []);

  // Fetch wedding configuration on mount from backend Express server
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/wedding-config");
        if (res.ok) {
          const data = await res.json();
          if (data && data.status !== "none") {
            if (data.groomName) setGroomName(data.groomName);
            if (data.brideName) setBrideName(data.brideName);
            if (data.groomFullName) setGroomFullName(data.groomFullName);
            if (data.groomParents) setGroomParents(data.groomParents);
            if (data.brideFullName) setBrideFullName(data.brideFullName);
            if (data.brideParents) setBrideParents(data.brideParents);
            if (data.groomEng) setGroomEng(data.groomEng);
            if (data.brideEng) setBrideEng(data.brideEng);
            if (data.dateStr) setDateStr(data.dateStr);
            if (data.dayOfWeek) setDayOfWeek(data.dayOfWeek);
            if (data.timeStr) setTimeStr(data.timeStr);
            if (data.locationName) setLocationName(data.locationName);
            if (data.hallName) setHallName(data.hallName);
            if (data.addressStr) setAddressStr(data.addressStr);
            if (data.formUrl) setFormUrl(data.formUrl);
            if (data.lineUrl) setLineUrl(data.lineUrl);
            if (Array.isArray(data.heroImages) && data.heroImages.length > 0) {
              setHeroImages(data.heroImages);
            }
            if (data.heroImagePosition) setHeroImagePosition(data.heroImagePosition);
            if (data.groomPhoto !== undefined) setGroomPhoto(data.groomPhoto);
            if (data.bridePhoto !== undefined) setBridePhoto(data.bridePhoto);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch server wedding config on mount:", err);
      }
    };
    fetchConfig();
  }, []);

  const handlePublishToServer = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const configData = {
        groomName,
        brideName,
        groomFullName,
        groomParents,
        brideFullName,
        brideParents,
        groomEng,
        brideEng,
        dateStr,
        dayOfWeek,
        timeStr,
        locationName,
        hallName,
        addressStr,
        formUrl,
        lineUrl,
        heroImages,
        heroImagePosition,
        groomPhoto,
        bridePhoto
      };
      
      const res = await fetch("/api/wedding-config", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(configData)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        alert("儲存至線上伺服器失敗，請稍後再試！");
      }
    } catch (e) {
      console.error(e);
      alert("儲存失敗，連線伺服器時發生問題，請確認網路！");
    } finally {
      setIsSaving(false);
    }
  };

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false
  });

  // YouTube Background Player Refs & State
  const ytPlayerRef = useRef<any>(null);
  const userManuallyPausedRef = useRef(false);
  const [ytPlayerReady, setYtPlayerReady] = useState(false);

  // Countdown timing calculation (Target: 2026-09-12 12:00:00)
  useEffect(() => {
    const targetDate = new Date("2026-09-12T12:00:00").getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Monitor scroll for bottom sticky CTA display
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setStickyCtaVisible(true);
      } else {
        setStickyCtaVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-save wedding configurations to localStorage on every change dynamically
  useEffect(() => {
    try {
      localStorage.setItem("wedding_groomName", groomName);
      localStorage.setItem("wedding_brideName", brideName);
      localStorage.setItem("wedding_groomFullName", groomFullName);
      localStorage.setItem("wedding_groomParents", groomParents);
      localStorage.setItem("wedding_brideFullName", brideFullName);
      localStorage.setItem("wedding_brideParents", brideParents);
      localStorage.setItem("wedding_groomEng", groomEng);
      localStorage.setItem("wedding_brideEng", brideEng);
      localStorage.setItem("wedding_dateStr", dateStr);
      localStorage.setItem("wedding_dayOfWeek", dayOfWeek);
      localStorage.setItem("wedding_timeStr", timeStr);
      localStorage.setItem("wedding_locationName", locationName);
      localStorage.setItem("wedding_hallName", hallName);
      localStorage.setItem("wedding_addressStr", addressStr);
      localStorage.setItem("wedding_formUrl", formUrl);
      localStorage.setItem("wedding_lineUrl", lineUrl);
      localStorage.setItem("wedding_heroImages", JSON.stringify(heroImages));
      localStorage.setItem("wedding_heroImage", heroImages[0] || HERO_IMAGE_URL);
      localStorage.setItem("wedding_heroImagePosition", heroImagePosition);
      localStorage.setItem("wedding_groomPhoto", groomPhoto);
      localStorage.setItem("wedding_bridePhoto", bridePhoto);
    } catch (e) {
      console.warn("Storage auto-saving failure (likely storage limit exceeded for large base64 strings):", e);
    }
  }, [
    groomName, brideName, groomFullName, groomParents, brideFullName, brideParents,
    groomEng, brideEng, dateStr, dayOfWeek, timeStr, locationName, hallName,
    addressStr, formUrl, lineUrl, heroImages, heroImagePosition, groomPhoto, bridePhoto
  ]);

  // Automatic slideshow/carousel interval player sets
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setSlideState((old) => ({ current: (old.current + 1) % heroImages.length, prev: old.current }));
    }, 4500); // 4.5 seconds slide duration
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Inject the YouTube Iframe Player API script elegantly
  useEffect(() => {
    // If global onYouTubeIframeAPIReady has not been configured yet
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    }

    // Bind initialization callbacks to trigger the invisible background player
    const initPlayer = () => {
      try {
        ytPlayerRef.current = new (window as any).YT.Player("youtube-bg-player", {
          height: "0",
          width: "0",
          videoId: "IpFX2vq8HKw",
          playerVars: {
            autoplay: 1,
            loop: 1,
            playlist: "IpFX2vq8HKw", // Required for looping inside YT embed parameters
            controls: 0,
            showinfo: 0,
            rel: 0,
            modestbranding: 1
          },
          events: {
            onReady: (event: any) => {
              setYtPlayerReady(true);
              try {
                event.target.playVideo();
              } catch (e) {
                console.warn("Autoplay blocked:", e);
              }
            },
            onStateChange: (event: any) => {
              // Playing state (value = 1)
              if (event.data === 1) {
                setIsPlaying(true);
              } else {
                setIsPlaying(false);
              }
            }
          }
        });
      } catch (err) {
        console.warn("Trouble initializing background YouTube iframe:", err);
      }
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    }

    return () => {
      // Graceful cleanup references
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === "function") {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, []);

  // Human gesture interaction fallback to ensure autoplay works on modern mobile devices and desktops
  useEffect(() => {
    const handleGesture = () => {
      if (userManuallyPausedRef.current) return;
      if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === "function") {
        try {
          ytPlayerRef.current.playVideo();
        } catch (e) {}
        // Remove listeners once action is attempted
        document.removeEventListener("click", handleGesture);
        document.removeEventListener("touchstart", handleGesture);
      }
    };

    document.addEventListener("click", handleGesture);
    document.addEventListener("touchstart", handleGesture);

    return () => {
      document.removeEventListener("click", handleGesture);
      document.removeEventListener("touchstart", handleGesture);
    };
  }, []);

  // Soft Background music controller leveraging YouTube Player API
  const toggleBgm = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!ytPlayerRef.current || typeof ytPlayerRef.current.playVideo !== "function") {
      alert("音樂串流載入中，請稍候再試或再次點擊！");
      return;
    }
    
    if (isPlaying) {
      userManuallyPausedRef.current = true;
      ytPlayerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      userManuallyPausedRef.current = false;
      ytPlayerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  // Copy address to clipboard
  const copyAddress = () => {
    navigator.clipboard.writeText(addressStr);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-okinawa-foam/30 select-none pb-24 relative overflow-hidden font-sans accent-okinawa-gold antialiased">
      {/* Hidden YouTube Iframe Player Node (Completely invisible to match elegant UI) */}
      <div id="youtube-bg-player" className="absolute opacity-0 pointer-events-none w-0 h-0 invisible" />

      {/* FIXED FLOATING ACTIONS: Top Bar Header & Audios */}
      <header className="fixed top-0 left-0 w-full z-40 px-4 py-3 flex items-center justify-between backdrop-blur-md bg-white/40 border-b border-okinawa-clear/10">
        <div className="flex items-center space-x-2">
          <span className="font-serif text-[13px] sm:text-[14px] tracking-widest text-okinawa-deep font-bold">
            {groomName}&{brideName}婚禮邀請
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Subtle Music Equilizer Button */}
          <button
            id="bgm-panel-toggle"
            onClick={(e) => toggleBgm(e)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs tracking-wider transition-all duration-300 ${
              isPlaying 
                ? "bg-okinawa-blue stroke-white text-white border-okinawa-blue animate-pulse" 
                : "bg-white/80 text-okinawa-blue border-okinawa-clear/30 hover:bg-white"
            }`}
            title="播放/暫停 沖繩背景音樂"
          >
            {isPlaying ? (
              <div className="flex items-end space-x-0.5 h-3 w-3 mr-1">
                <span className="w-0.5 bg-white animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '0.8s' }} />
                <span className="w-0.5 h-3 bg-white animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '1.2s' }} />
                <span className="w-0.5 h-2 bg-white animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '0.9s' }} />
              </div>
            ) : (
              <Music className="w-3.5 h-3.5 mr-1" />
            )}
            <span className="font-medium text-[11px]">
              {isPlaying ? "暫停音樂" : "播放音樂"}
            </span>
            {isPlaying ? <Volume2 className="w-3 h-3 text-white" /> : <VolumeX className="w-3 h-3" />}
          </button>
        </div>
      </header>

      {/* BACKGROUND GRAPHIC ARTWORK: Delicate Okinawa Ocean Animals Outline (Avoid Cartoonish, extremely elegant thin SVGs) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Giant Floating Whale Shark (鯨鯊) - Glides slowly from left to right */}
        <div className="absolute top-[25%] -left-36 opacity-30 animate-float-slow text-okinawa-clear">
          <svg className="w-72 md:w-96 h-auto stroke-current fill-none" viewBox="0 0 200 100" strokeWidth="0.8">
            <path d="M10,50 C25,48 50,30 80,25 C110,20 140,28 160,35 C175,40 185,48 195,50 C185,52 175,60 160,65 C140,72 110,80 80,75 C50,70 25,52 10,50 Z" />
            <path d="M73,27 C78,12 88,6 91,11 C86,20 80,26 77,26" />
            <path d="M52,43 C42,56 36,66 39,69 C46,66 52,51 54,46" />
            <path d="M185,50 C190,40 195,35 198,35 C195,45 190,50 185,50 C190,50 195,55 198,65 C195,60 190,50 185,50 Z" />
            <circle cx="95" cy="35" r="0.8" className="fill-current" />
            <circle cx="105" cy="38" r="1.2" className="fill-current" />
            <circle cx="115" cy="40" r="0.8" className="fill-current" />
            <circle cx="125" cy="42" r="1.2" className="fill-current" />
            <circle cx="135" cy="45" r="0.8" className="fill-current" />
            <circle cx="100" cy="46" r="0.8" className="fill-current" />
            <circle cx="110" cy="49" r="1.0" className="fill-current" />
            <circle cx="120" cy="51" r="0.8" className="fill-current" />
          </svg>
        </div>

        {/* Elegant Coral in upper-right corner */}
        <div className="absolute top-[8%] -right-8 opacity-20 text-okinawa-gold animate-float-medium">
          <svg className="w-40 md:w-56 h-auto stroke-current fill-none" viewBox="0 0 100 120" strokeWidth="1">
            <path d="M50,110 C50,70 30,50 25,30 C20,10 30,15 35,25 C38,32 45,55 52,60 C53,40 45,30 50,10 C55,10 58,25 56,40 C60,45 75,30 85,15 C90,10 92,20 80,45 C75,55 62,75 62,110" />
            <path d="M35,62 C25,50 15,45 12,30 C10,20 18,22 22,35 C25,44 32,54 35,62 Z" />
            <path d="M60,65 C70,55 80,50 82,35 C84,25 76,28 72,40 C68,48 62,56 60,65 Z" />
          </svg>
        </div>

        {/* Floating Sea Turtle (海龜) - Near middle right */}
        <div className="absolute top-[50%] -right-12 opacity-[0.25] text-okinawa-clear animate-float-slow" style={{ animationDelay: '4s' }}>
          <svg className="w-24 md:w-32 h-auto stroke-current fill-none" viewBox="0 0 100 100" strokeWidth="0.8">
            <ellipse cx="50" cy="50" rx="18" ry="22" />
            <path d="M50,28 L50,72" />
            <path d="M32,50 L68,50" />
            <path d="M38,36 C42,42 58,42 62,36" />
            <path d="M38,64 C42,58 58,58 62,64" />
            <path d="M50,28 C50,18 46,12 50,6 C54,12 50,18 50,28 Z" />
            <path d="M34,32 C22,26 12,29 16,38 C23,47 31,40 34,36" />
            <path d="M66,32 C78,26 88,29 84,38 C77,47 69,40 66,36" />
            <path d="M34,66 C25,70 20,76 22,80 C25,83 31,79 34,72" />
            <path d="M66,66 C75,70 80,76 78,80 C75,83 69,79 66,72" />
          </svg>
        </div>

        {/* Elegant Wave line decoration at bottom */}
        <div className="absolute bottom-24 left-0 w-full opacity-25 text-okinawa-blue/60">
          <svg className="w-full h-24 stroke-current fill-none" viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path d="M0,50 C300,90 600,10 900,80 C1200,30 1350,70 1440,50 L1440,100 L0,100 Z" strokeWidth="1" />
            <path d="M0,60 C320,40 620,100 880,30 C1180,85 1320,45 1440,65" strokeWidth="0.5" strokeDasharray="5,5" />
          </svg>
        </div>
      </div>

      {/* DETAILED CONTENT CONTAINER */}
      <div className="relative z-10 max-w-lg mx-auto px-4 pt-16">
        
        {/* HERO SECTION / WEDDING PREVIEW CAPTURE (Japanese Editorial Magazine style) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="my-5 bg-white p-3 shadow-2xl rounded-2xl border border-okinawa-clear/10 relative overflow-hidden"
          id="wedding-hero-section"
        >
          {/* Photo frame with soft drop shadow */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-100 group">
            {/* Carousel Images Crossfade Layer - Uses a native CSS GPU-accelerated double buffering approach to guarantee absolutely zero flashing or rendering gaps on mobile/tablet browsers */}
            <div className="absolute inset-0 bg-slate-100">
              {heroImages.map((imgUrl, index) => {
                const isActive = index === currentSlideIndex;
                const isPrev = index === prevSlideIndex;
                
                let opacityClass = "opacity-0";
                let zIndexStyle = 1;
                
                if (isActive) {
                  opacityClass = "opacity-100";
                  zIndexStyle = 5;
                } else if (isPrev) {
                  opacityClass = "opacity-100";
                  zIndexStyle = 4;
                }
                
                return (
                  <img
                    key={index}
                    src={imgUrl || HERO_IMAGE_URL}
                    alt={`Wedding cover photo ${index + 1}`}
                    referrerPolicy="no-referrer"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${opacityClass} transform group-hover:scale-102`}
                    style={{ 
                      objectPosition: heroImagePosition,
                      zIndex: zIndexStyle,
                      pointerEvents: isActive ? 'auto' : 'none'
                    }}
                  />
                );
              })}
            </div>
            
            {/* Summer Ocean overlay dust of glitter - updated gradient from top to bottom with legacy browser engine inline fallback */}
            <div 
              className="absolute inset-0 bg-gradient-to-b from-okinawa-deep/60 via-transparent to-transparent pointer-events-none z-10" 
              style={{ backgroundImage: 'linear-gradient(to bottom, rgba(12, 58, 96, 0.6), transparent)' }}
            />

            {/* Slider arrows for simple browsing (only show when there's >1 image) */}
            {heroImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSlideState((old) => ({ current: (old.current - 1 + heroImages.length) % heroImages.length, prev: old.current }));
                  }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/25 hover:bg-black/50 text-white transition-all active:scale-90"
                  title="上一張"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSlideState((old) => ({ current: (old.current + 1) % heroImages.length, prev: old.current }));
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/25 hover:bg-black/50 text-white transition-all active:scale-90"
                  title="下一張"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {/* Slider Dots indicators */}
            {heroImages.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-1.5 z-20">
                {heroImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSlideState((old) => ({ current: idx, prev: old.current }));
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentSlideIndex 
                        ? 'bg-okinawa-gold scale-125 w-3' 
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                    title={`第 ${idx + 1} 頁`}
                  />
                ))}
              </div>
            )}



            {/* Overlapping Top Typography (Japanese wedding magazine format now placed at the top) */}
            <div className="absolute top-6 sm:top-20 left-0 w-full text-center px-4 text-white select-none pointer-events-none z-10">
              <span className="block font-serif text-3xl md:text-4xl font-bold tracking-[0.12em] mb-1 drop-shadow-lg text-okinawa-foam">
                {groomName} & {brideName}
              </span>
              <p className="font-serif text-[11px] tracking-[0.25em] uppercase text-okinawa-sand/90 font-bold drop-shadow-md">
                Wedding Invitation
              </p>
              <div className="w-16 h-[1px] bg-okinawa-sand/60 mx-auto mt-2.5 mb-1 animate-pulse" />
              <p className="text-[10px] tracking-wider text-[#EBF7FA] font-bold drop-shadow-sm">
                Save the Date • {dateStr}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ROMANTIC INTRODUCTION INVITATION BOX */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="text-center my-12 px-6 py-10 bg-white/70 backdrop-blur-md rounded-3xl border border-okinawa-clear/15 relative"
          id="invitation-text-card"
        >
          {/* Subtle gold ribbon or shell decoration */}
          <div className="flex justify-center mb-6">
            <span className="text-okinawa-gold animate-bounce">
              <Sparkles className="w-6 h-6" />
            </span>
          </div>
          
          <h2 className="font-serif text-2xl tracking-[0.2em] text-okinawa-deep font-semibold mb-6">
            誠 摯 邀 請
          </h2>
          
          <div className="space-y-4 text-okinawa-deep/80 text-[13px] leading-relaxed tracking-widest font-serif pb-6">
            <p className="font-bold text-[16px] text-okinawa-gold tracking-widest pb-1">
              “ 𝑾𝒆 𝒂𝒓𝒆 𝒈𝒆𝒕𝒕𝒊𝒏𝒈 𝒎𝒂𝒓𝒓𝒊𝒆𝒅! ”
            </p>
            <p className="text-[12px] sm:text-[13px] text-okinawa-deep/75 leading-relaxed">
              迎向幸福的道路上，因為有您的陪伴與祝福而更加璀璨。<br />
              誠摯期待您的光臨，與我們共同分享這份執手相伴的喜悅。
            </p>
          </div>

          {/* 雙方主婚人與全名資訊區塊 */}
          <div className="mt-6 pt-6 border-t border-okinawa-clear/15 space-y-6 text-[15px] sm:text-[16px] md:text-[17px] font-serif tracking-[0.15em] leading-relaxed text-okinawa-deep/90">
            <div className="grid grid-cols-2 gap-4 md:gap-8 md:divide-x md:divide-okinawa-clear/20">
              {/* 新郎側 - 左邊 */}
              <div className="flex flex-col items-center text-center px-1 md:pr-2 animate-fadeIn">
                {/* 新郎方形照片 */}
                <div className="relative aspect-square w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 shrink-0 rounded-3xl overflow-hidden border-2 border-okinawa-clear/20 bg-[#F6FBFC] shadow-lg mb-4 hover:scale-105 transition-transform duration-300">
                  {groomPhoto ? (
                    <img 
                      src={groomPhoto} 
                      alt="新郎個人照" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 select-none">
                      <div className="w-12 h-12 rounded-full bg-[#EBF7FA] flex items-center justify-center mb-2">
                        <span className="text-[16px] text-okinawa-blue font-serif font-bold">G</span>
                      </div>
                      <span className="text-[11px] font-sans text-okinawa-deep/60 font-bold leading-none">Groom</span>
                    </div>
                  )}
                </div>

                {/* 新郎資訊放照片下方 */}
                <div className="w-full min-w-0">
                  <div>
                    <span className="inline-block text-[11px] sm:text-[12px] text-okinawa-gold bg-okinawa-gold/10 px-3 py-0.5 rounded-full font-bold">
                      新郎
                    </span>
                    <p className="font-bold text-[18px] sm:text-[20px] md:text-[22px] text-okinawa-deep mt-1 leading-snug">{groomFullName}</p>
                  </div>
                  <div className="space-y-1 pt-2 mt-2 border-t border-okinawa-clear/10">
                    <p className="text-[12px] sm:text-[13px] text-okinawa-gold/85 font-semibold uppercase tracking-[0.15em]">男方家長</p>
                    <p className="font-bold text-[15px] sm:text-[16px] md:text-[17px] text-okinawa-deep leading-normal">{groomParents}</p>
                  </div>
                </div>
              </div>
              
              {/* 新娘側 - 右邊 */}
              <div className="flex flex-col items-center text-center px-1 md:pl-2 animate-fadeIn">
                {/* 新娘方形照片 */}
                <div className="relative aspect-square w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 shrink-0 rounded-3xl overflow-hidden border-2 border-okinawa-clear/20 bg-[#F6FBFC] shadow-lg mb-4 hover:scale-105 transition-transform duration-300">
                  {bridePhoto ? (
                    <img 
                      src={bridePhoto} 
                      alt="新娘個人照" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 select-none">
                      <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-2">
                        <span className="text-[16px] text-rose-400 font-serif font-bold">B</span>
                      </div>
                      <span className="text-[11px] font-sans text-okinawa-deep/60 font-bold leading-none">Bride</span>
                    </div>
                  )}
                </div>

                {/* 新娘資訊放照片下方 */}
                <div className="w-full min-w-0">
                  <div>
                    <span className="inline-block text-[11px] sm:text-[12px] text-okinawa-gold bg-okinawa-gold/10 px-3 py-0.5 rounded-full font-bold">
                      新娘
                    </span>
                    <p className="font-bold text-[18px] sm:text-[20px] md:text-[22px] text-okinawa-deep mt-1 leading-snug">{brideFullName}</p>
                  </div>
                  <div className="space-y-1 pt-2 mt-2 border-t border-okinawa-clear/10">
                    <p className="text-[12px] sm:text-[13px] text-okinawa-gold/85 font-semibold uppercase tracking-[0.15em]">女方家長</p>
                    <p className="font-bold text-[15px] sm:text-[16px] md:text-[17px] text-okinawa-deep leading-normal">{brideParents}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 text-[11px] text-okinawa-gold font-semibold tracking-[0.3em] uppercase text-center">
              —— 誠 摯 恭 請 光 臨 ——
            </div>
          </div>
        </motion.div>

        {/* COUNTDOWN TIMER: Build excitement with elegance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="my-10 bg-gradient-to-br from-okinawa-deep to-okinawa-blue p-6 rounded-3xl text-white text-center shadow-xl relative overflow-hidden"
          style={{ backgroundColor: "#0C3A60", backgroundImage: "linear-gradient(135deg, #0C3A60, #1E6F9F)" }}
          id="wedding-countdown-timer"
        >
          {/* Background vector waves in timer */}
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
            <svg className="w-full h-full fill-white" viewBox="0 0 100 100" preserveAspectRatio="none">
              <circle cx="20" cy="120" r="80" />
              <circle cx="80" cy="140" r="60" />
            </svg>
          </div>

          <h3 className="text-xs font-serif tracking-[0.4em] uppercase text-okinawa-clear font-semibold mb-4 flex items-center justify-center space-x-1">
            <span>幸福倒數</span>
            <span className="text-okinawa-sand">•</span>
            <span>COUNTDOWN</span>
          </h3>

          <div className="grid grid-cols-4 gap-2 px-2 max-w-sm mx-auto">
            <div className="bg-white/10 rounded-xl py-3 px-1 backdrop-blur-sm border border-white/10">
              <span className="block font-serif text-2xl md:text-3xl font-light text-okinawa-sand">
                {timeLeft.days}
              </span>
              <span className="text-[10px] text-okinawa-foam/70 tracking-widest">DAYS</span>
            </div>
            <div className="bg-white/10 rounded-xl py-3 px-1 backdrop-blur-sm border border-white/10">
              <span className="block font-serif text-2xl md:text-3xl font-light text-okinawa-sand">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-okinawa-foam/70 tracking-widest">HRS</span>
            </div>
            <div className="bg-white/10 rounded-xl py-3 px-1 backdrop-blur-sm border border-white/10">
              <span className="block font-serif text-2xl md:text-3xl font-light text-okinawa-sand">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-okinawa-foam/70 tracking-widest">MINS</span>
            </div>
            <div className="bg-white/10 rounded-xl py-3 px-1 backdrop-blur-sm border border-white/10">
              <span className="block font-serif text-2xl md:text-3xl font-light text-okinawa-sand">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-okinawa-foam/70 tracking-widest">SECS</span>
            </div>
          </div>

          <p className="mt-4 text-[11px] text-[#EBF7FA]/80 tracking-widest font-serif leading-relaxed">
            我們將於 {dateStr} (六) 與您相聚
          </p>
        </motion.div>

        {/* CORE INFORMATION CARD SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="my-10 space-y-5"
          id="wedding-info-section"
        >
          <div className="text-center mb-6">
            <span className="inline-block text-[11px] text-okinawa-blue font-semibold tracking-[0.3em] uppercase bg-okinawa-clear/15 px-3 py-1 rounded-full">
              Wedding Details / 婚宴資訊
            </span>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl border border-okinawa-clear/10 divide-y divide-okinawa-clear/10 space-y-5">
            
            {/* Date block */}
            <div className="flex items-start space-x-4 pt-1">
              <div className="p-3 bg-okinawa-foam rounded-2xl text-okinawa-blue mt-1">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-okinawa-clear font-semibold tracking-widest">DATE</p>
                <h4 className="font-serif text-xl font-medium tracking-wide text-okinawa-deep mt-1">
                  {dateStr}
                </h4>
                <p className="text-xs text-okinawa-gold/90 tracking-widest mt-0.5 font-bold font-serif">
                  ({dayOfWeek})
                </p>
              </div>
            </div>

            {/* Time block */}
            <div className="flex items-start space-x-4 pt-5">
              <div className="p-3 bg-okinawa-foam rounded-2xl text-okinawa-blue mt-1">
                <Clock className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-okinawa-clear font-semibold tracking-widest">TIME</p>
                <h4 className="font-serif text-base font-medium text-okinawa-deep mt-1 leading-normal">
                  {timeStr}
                </h4>
              </div>
            </div>

            {/* Location block */}
            <div className="flex items-start space-x-4 pt-5">
              <div className="p-3 bg-okinawa-foam rounded-2xl text-okinawa-blue mt-1">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-okinawa-clear font-semibold tracking-widest">VENUE</p>
                <h4 className="font-serif text-xl font-medium text-okinawa-deep mt-1">
                  {locationName}
                </h4>
                <p className="text-sm text-okinawa-gold font-semibold font-serif tracking-widest mt-0.5">
                  {hallName}
                </p>
              </div>
            </div>

            {/* Address & Navigation block */}
            <div className="pt-5" id="navigation-address-box">
              <div className="bg-okinawa-foam/40 p-4 rounded-2xl border border-okinawa-clear/15">
                <div className="flex items-start justify-between space-x-2">
                  <div>
                    <span className="text-[10px] text-okinawa-blue bg-white px-2 py-0.5 rounded-full font-semibold border border-okinawa-clear/15">
                      喜宴地址
                    </span>
                    <p className="text-xs text-okinawa-deep font-serif leading-relaxed mt-2.5 tracking-wider font-semibold">
                      {addressStr}
                    </p>
                  </div>
                  <button
                    onClick={copyAddress}
                    className="text-xs text-okinawa-blue font-medium whitespace-nowrap px-2 py-1 bg-white hover:bg-white/80 rounded-lg shadow-sm border border-okinawa-clear/20 active:scale-95 transition-all"
                  >
                    {showCopied ? "已複製!" : "複製"}
                  </button>
                </div>

                {/* Embedded Google Map */}
                <div className="mt-4 aspect-[4/3] w-full rounded-xl overflow-hidden border border-okinawa-clear/15 shadow-md bg-white">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3643.4174298152484!2d120.5533936094192!3d24.051600478376216!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x346938434d271b55%3A0x92ea3dc9f12cb403!2z5ZSv5oSb5bqt5ZySIFZlbmEgTWFub3I!5e0!3m2!1szh-TW!2stw!4v1781012247535!5m2!1szh-TW!2stw" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={true} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>

                {/* GOOGLE MAPS REDIRECT BUTTON WITH DEEP BLUE & SAND ACCENTS */}
                <div className="mt-4">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName + " " + hallName + " " + addressStr)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-okinawa-deep hover:bg-okinawa-blue text-[#EBF7FA] rounded-xl font-medium text-xs tracking-widest transition-all duration-300 shadow-lg active:scale-98 relative group overflow-hidden"
                  >
                    {/* Golden sandy edge highlighting luxury design */}
                    <div 
                      className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-okinawa-sand to-transparent opacity-60" 
                      style={{ backgroundImage: "linear-gradient(to right, transparent, #D9B782, transparent)" }}
                    />
                    <Map className="w-4 h-4 text-okinawa-sand" />
                    <span>開啟 GOOGLE 地圖導航</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>

            {/* Venue Gallery Grid block */}
            <div className="pt-5" id="venue-environment-block">
              <div className="flex items-center space-x-2.5 mb-3">
                <span className="text-[10px] text-okinawa-gold bg-okinawa-gold/10 px-2 py-0.5 rounded-full font-bold border border-okinawa-gold/20">
                  VENUE TOUR
                </span>
                <span className="text-xs font-semibold text-okinawa-deep font-serif tracking-wider">
                  喜宴莊園環境導覽
                </span>
              </div>

              {/* Horizontal scrolling carousel slider ("左右滑的那種") */}
              <div className="relative group/carousel mt-2">
                {/* Scroll track */}
                <div
                  ref={carouselRef}
                  onScroll={handleCarouselScroll}
                  className="flex overflow-x-auto gap-3.5 pb-4 pt-1 snap-x snap-mandatory no-scrollbar scroll-smooth"
                >
                  {VENUE_PHOTOS.map((photo, index) => (
                    <div
                      key={index}
                      onClick={() => setActiveVenuePhotoIndex(index)}
                      className="flex-shrink-0 w-[78%] xs:w-[68%] min-w-[210px] sm:min-w-[250px] aspect-[4/3] rounded-xl overflow-hidden shadow-md border border-okinawa-clear/15 cursor-pointer bg-okinawa-foam/10 snap-center relative active:scale-[0.98] transition-all duration-350 hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <img
                        src={photo.url}
                        alt={photo.title || "婚宴會場實景"}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                      
                      {/* Information overlay */}
                      {(photo.title || photo.desc) && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent z-10" />
                          <div className="absolute bottom-3.5 left-3.5 right-3.5 z-20 text-left">
                            {photo.title && (
                              <p className="text-[11px] sm:text-xs font-serif font-bold text-white tracking-widest drop-shadow-md mb-0.5">
                                {photo.title}
                              </p>
                            )}
                            {photo.desc && (
                              <p className="text-[9px] text-white/80 line-clamp-1 font-medium leading-normal drop-shadow-sm">
                                {photo.desc}
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Left/Right navigation buttons for absolute ease of use on desktop */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollCarousel("left");
                  }}
                  disabled={currentCarouselIndex === 0}
                  className="absolute left-1 top-[42%] -translate-y-1/2 z-20 p-1.5 rounded-full bg-white/95 hover:bg-white text-okinawa-deep shadow-md active:scale-90 transition-all disabled:opacity-0 disabled:cursor-not-allowed border border-okinawa-gold/20 flex items-center justify-center cursor-pointer"
                  title="前一張"
                >
                  <ChevronLeft className="w-4 h-4 text-okinawa-deep" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollCarousel("right");
                  }}
                  disabled={currentCarouselIndex === VENUE_PHOTOS.length - 1}
                  className="absolute right-1 top-[42%] -translate-y-1/2 z-20 p-1.5 rounded-full bg-white/95 hover:bg-white text-okinawa-deep shadow-md active:scale-90 transition-all disabled:opacity-0 disabled:cursor-not-allowed border border-okinawa-gold/20 flex items-center justify-center cursor-pointer"
                  title="下一張"
                >
                  <ChevronRight className="w-4 h-4 text-okinawa-deep" />
                </button>
              </div>

              {/* Indicator Dots to display positions */}
              <div className="flex justify-center items-center space-x-1.5 mt-1 pb-2">
                {VENUE_PHOTOS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToIndex(index)}
                    className={`h-1 rounded-full transition-all duration-300 origin-center cursor-pointer ${
                      index === currentCarouselIndex 
                        ? "w-4 bg-okinawa-gold" 
                        : "w-1 bg-okinawa-gold/30 hover:bg-okinawa-gold/50"
                    }`}
                    title={`第 ${index + 1} 張`}
                  />
                ))}
              </div>
            </div>

          </div>
        </motion.div>

        {/* DUAL CORE CALL TO ACTION INTERACTIVE BUTTONS SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="my-12 space-y-8"
          id="rsvp-cta-section"
        >
          <div className="text-center">
            <span className="inline-block text-[11px] text-okinawa-gold font-bold tracking-[0.3em] uppercase bg-okinawa-gold/10 px-3 py-1 rounded-full mb-1">
              Interactive RSVP • 出席與動態
            </span>
            <p className="text-[11px] text-okinawa-deep/60 tracking-widest mt-1">
              請新人誠摯的好友們點擊以下按鈕進行互動
            </p>
          </div>

          {/* BUTTON A: GOOGLE FORM出席表單 (金色高雅漸層，附帶漫長呼吸燈) */}
          <div className="relative group">
            {/* Glowing breathing ring backdrop */}
            <div 
              className="absolute -inset-1 bg-gradient-to-r from-okinawa-gold via-yellow-400 to-okinawa-sand rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 animate-glow" 
              style={{ backgroundImage: "linear-gradient(90deg, #C29A53, #facc15, #D9B782)" }}
            />
            
            <a
              href={formUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-full flex flex-col items-center justify-center py-5 px-6 bg-gradient-to-r from-okinawa-gold to-okinawa-sand hover:from-[#d1a85e] hover:to-[#e6c48e] text-white rounded-2xl shadow-xl transition-all duration-300 transform group-hover:-translate-y-0.5 active:scale-98 select-none"
              style={{ backgroundColor: "#C29A53", backgroundImage: "linear-gradient(90deg, #C29A53, #D9B782)" }}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-white animate-pulse" />
                <span className="font-serif text-base font-bold tracking-[0.25em]">
                  填寫出席回覆表單
                </span>
              </div>
              <span className="text-[10px] text-white/90 tracking-widest mt-1.5 font-light">
                CONFIRM YOUR ATTENDANCE • RSVP FORM
              </span>
            </a>
          </div>

          {/* ACCENT LINE DIVIDER */}
          <div className="relative py-4 flex items-center justify-center">
            <div className="w-24 h-[1px] bg-okinawa-clear/30" />
            <span className="mx-4 text-okinawa-clear font-serif text-sm">🏖️</span>
            <div className="w-24 h-[1px] bg-okinawa-clear/30" />
          </div>

          {/* BUTTON B: LINE OFFICIAL ACCOUNT */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-okinawa-clear/15 relative">
            {/* Warm text intro for LINE CTA */}
            <div className="relative z-10 space-y-3">
              <div className="flex justify-center">
                <span className="inline-block p-1 bg-emerald-50 rounded-full border border-emerald-100">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                </span>
              </div>
              
              <p className="text-[13px] text-slate-600 text-center leading-relaxed font-serif tracking-wide select-none px-2">
                「加入官方帳號，可即時掌握婚禮最新動態、並於婚禮前夕查詢您的
                <span className="text-emerald-700 font-bold bg-emerald-50/80 px-1 rounded mx-0.5">專屬報到 QR Code</span>與
                <span className="text-emerald-700 font-bold bg-emerald-50/80 px-1 rounded mx-0.5">座位席次</span>喔！」
              </p>

              <div className="pt-2">
                <a
                  href={lineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-semibold text-sm tracking-widest shadow-md transition-all duration-300 active:scale-98 group"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>加入婚禮 LINE 官方帳號</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
            
            {/* Soft backdrop wave */}
            <div className="absolute bottom-0 right-0 opacity-[0.03] select-none pointer-events-none">
              <svg className="w-24 h-24 fill-emerald-600" viewBox="0 0 100 100">
                <circle cx="80" cy="80" r="40" />
              </svg>
            </div>
          </div>

        </motion.div>

        {/* BOTTOM WISHES FOOTER & DESIGNER CREDIT */}
        <div className="text-center py-10 space-y-3 relative z-10 border-t border-okinawa-clear/10">
          <p className="font-serif text-lg tracking-[0.25em] text-okinawa-deep font-semibold">
            {groomName} & {brideName}
          </p>
          <div className="w-8 h-[1px] bg-okinawa-gold/40 mx-auto my-3" />
          <p className="text-[10px] tracking-widest text-slate-400">
            © 2026 E-Invitation. All Happiness Reserved.
          </p>
        </div>

      </div>

      {/* FIXED BOTTOM STICKY COMPACT BAR (Emerges on scroll for mobile-first comfort) */}
      <AnimatePresence>
        {stickyCtaVisible && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ ease: "easeOut", duration: 0.4 }}
            className="fixed bottom-0 left-0 w-full z-40 bg-white/95 backdrop-blur-md shadow-[0_-8px_30px_rgb(12,58,96,0.08)] border-t border-okinawa-clear/15 px-4 py-3 pb-safe"
          >
            <div className="max-w-md mx-auto flex items-center justify-between space-x-3">
              {/* Wedding quick link */}
              <div className="hidden xs:flex flex-col items-start pr-2">
                <span className="font-serif text-[11px] font-extrabold text-okinawa-deep tracking-wider truncate">
                  {groomName} & {brideName}
                </span>
                <span className="text-[9px] text-okinawa-gold font-bold tracking-wider">
                  喜帖回覆簿
                </span>
              </div>

              {/* Attendance Button Link */}
              <a
                href={formUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 bg-gradient-to-r from-okinawa-gold to-okinawa-sand text-white font-serif font-semibold text-xs tracking-widest rounded-xl text-center shadow-md active:scale-98 transition-all flex items-center justify-center space-x-1"
                style={{ backgroundColor: "#C29A53", backgroundImage: "linear-gradient(90deg, #C29A53, #D9B782)" }}
              >
                <span>出席填寫</span>
                <ExternalLink className="w-3 h-3 opacity-90" />
              </a>

              {/* LINE Official Link */}
              <a
                href={lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-widest rounded-xl text-center shadow-md active:scale-98 transition-all flex items-center justify-center space-x-1"
              >
                <span>加入官方 LINE</span>
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VENUE GALLERY FULL SCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {activeVenuePhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 select-none backdrop-blur-sm"
          >
            {/* Close button with high visible contrast */}
            <button
              onClick={() => setActiveVenuePhotoIndex(null)}
              className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Slider wrapper */}
            <div className="relative w-full max-w-4xl aspect-[4/3] flex items-center justify-center">
              {/* Previous Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveVenuePhotoIndex((prev) => 
                    prev !== null ? (prev - 1 + VENUE_PHOTOS.length) % VENUE_PHOTOS.length : null
                  );
                }}
                className="absolute left-2 sm:left-4 z-40 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 active:scale-95 transition-all"
                title="上一張"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Central Main image */}
              <motion.img
                key={activeVenuePhotoIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                src={VENUE_PHOTOS[activeVenuePhotoIndex]?.url}
                alt={VENUE_PHOTOS[activeVenuePhotoIndex]?.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain rounded-lg max-h-[75vh]"
              />

              {/* Next Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveVenuePhotoIndex((prev) => 
                    prev !== null ? (prev + 1) % VENUE_PHOTOS.length : null
                  );
                }}
                className="absolute right-2 sm:right-4 z-40 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 active:scale-95 transition-all"
                title="下一張"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Details panel below */}
            <div className="w-full max-w-xl text-center mt-4 sm:mt-6 px-4">
              <span className="text-[10px] text-okinawa-gold bg-okinawa-gold/20 border border-okinawa-gold/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest inline-block">
                照片 {activeVenuePhotoIndex + 1} / {VENUE_PHOTOS.length}
              </span>
              {VENUE_PHOTOS[activeVenuePhotoIndex]?.title && (
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white tracking-wider mt-2">
                  {VENUE_PHOTOS[activeVenuePhotoIndex]?.title}
                </h3>
              )}
              {VENUE_PHOTOS[activeVenuePhotoIndex]?.desc && (
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed tracking-wide mt-2 font-medium">
                  {VENUE_PHOTOS[activeVenuePhotoIndex]?.desc}
                </p>
              )}
            </div>

            {/* Tap backdrop to close */}
            <div 
              className="absolute inset-0 -z-10" 
              onClick={() => setActiveVenuePhotoIndex(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
