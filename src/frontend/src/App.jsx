import { useState, useRef, useEffect } from "react";
import Header from "./Header";
import CameraDisplay from "./CameraDisplay";
import Controls from "./Control";
import StatsBoard from "./StatsBoard";
import { wasteInfo } from "./wasteData";
import {
  Camera,
  RefreshCw,
  Trash2,
  Zap,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [displayDetections, setDisplayDetections] = useState([]);
  const [fps, setFps] = useState(0);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showGuide, setShowGuide] = useState(false); // State hiển thị Panel

  const lastFrameTime = useRef(Date.now());
  const clearDetectionTimeoutRef = useRef(null);
  const DETECTION_TTL = 2000;

  const CLASS_COLORS = {
    mac_dinh: "#22c55e",
    recycle: "#2ecc71",
    organic: "#f1c40f",
    hazard: "#e74c3c",
    other: "#95a5a6",
  };

  useEffect(() => {
    const savedMode = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (savedMode === "dark" || (!savedMode && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newMode;
    });
  };

  const handleStartCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Camera sau
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setIsStreaming(true);
      }
    } catch (err) {
      console.error(err);
      setError("Không thể truy cập Camera. Vui lòng cấp quyền!");
      setIsStreaming(false);
    }
  };

  const handleStopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
      setDisplayDetections([]);
      setShowGuide(false);
    }
  };

  const sendFrameToServer = async (blob) => {
    if (!blob) return;

    // --- MOCK DATA ĐỂ TEST ---
    if (Math.random() > 0.95) {
      const mockItems = Object.keys(wasteInfo);
      const randomItem =
        mockItems[Math.floor(Math.random() * mockItems.length)];
      const mockData = [
        {
          name: randomItem,
          confidence: 0.85 + Math.random() * 0.1,
          box: [50, 50, 200, 200],
        },
      ];

      setDisplayDetections(mockData);
      setShowGuide(true); // Hiện panel khi có rác

      if (clearDetectionTimeoutRef.current)
        clearTimeout(clearDetectionTimeoutRef.current);
      clearDetectionTimeoutRef.current = setTimeout(() => {
        setDisplayDetections([]);
      }, DETECTION_TTL);
      return;
    }
    // -------------------------

    const formData = new FormData();
    formData.append("file", blob, "frame.jpg");

    try {
      // Thay URL backend thật của bạn vào đây
      const res = await fetch("https://smartbin-1-nqfn.onrender.com/detect/", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const raw = await res.json();
        let data = [];
        try {
          data = typeof raw === "string" ? JSON.parse(raw) : raw;
        } catch (e) {}

        if (!Array.isArray(data)) data = data && data.box ? [data] : [];

        if (data.length > 0) {
          setDisplayDetections(data);
          setShowGuide(true);

          if (clearDetectionTimeoutRef.current)
            clearTimeout(clearDetectionTimeoutRef.current);
          clearDetectionTimeoutRef.current = setTimeout(() => {
            setDisplayDetections([]);
          }, DETECTION_TTL);
        }
        setError(null);
      }
    } catch (e) {}
  };

  const detectFrame = () => {
    if (!videoRef.current || videoRef.current.readyState !== 4) return;
    const video = videoRef.current;

    const now = Date.now();
    const delta = now - lastFrameTime.current;
    if (delta > 0) setFps(Math.round(1000 / delta));
    lastFrameTime.current = now;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    tempCanvas.getContext("2d").drawImage(video, 0, 0);
    tempCanvas.toBlob((blob) => sendFrameToServer(blob), "image/jpeg", 0.6);
  };

  useEffect(() => {
    let interval;
    if (isStreaming) interval = setInterval(detectFrame, 500);
    return () => clearInterval(interval);
  }, [isStreaming]);

  // VẼ BOUNDING BOX LÊN CANVAS
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (video.readyState === 4 && video.videoWidth > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    displayDetections.forEach((det) => {
      if (!det.box) return;

      let x1, y1, x2, y2;
      if (det.box.x1 !== undefined) {
        x1 = det.box.x1;
        y1 = det.box.y1;
        x2 = det.box.x2;
        y2 = det.box.y2;
      } else if (Array.isArray(det.box)) {
        [x1, y1, x2, y2] = det.box;
      } else return;

      const width = x2 - x1;
      const height = y2 - y1;
      const info = wasteInfo[det.name];
      const color = info ? CLASS_COLORS[info.type] : CLASS_COLORS.mac_dinh;

      // Vẽ Box phong cách hiện đại (Chỉ vẽ 4 góc)
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      const cornerLen = 20;
      ctx.beginPath();
      // Top Left
      ctx.moveTo(x1, y1 + cornerLen);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x1 + cornerLen, y1);
      // Top Right
      ctx.moveTo(x2 - cornerLen, y1);
      ctx.lineTo(x2, y1);
      ctx.lineTo(x2, y1 + cornerLen);
      // Bottom Right
      ctx.moveTo(x2, y2 - cornerLen);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x2 - cornerLen, y2);
      // Bottom Left
      ctx.moveTo(x1 + cornerLen, y2);
      ctx.lineTo(x1, y2);
      ctx.lineTo(x1, y2 - cornerLen);
      ctx.stroke();

      // Vẽ Label
      const labelText = info ? info.name : det.name;
      const confidence = (det.confidence * 100).toFixed(0) + "%";

      ctx.font = "bold 16px sans-serif";
      const textWidth = ctx.measureText(labelText).width;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x1, y1 - 35, textWidth + 60, 30, 8);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.fillText(labelText, x1 + 10, y1 - 14);

      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = "12px sans-serif";
      ctx.fillText(confidence, x1 + textWidth + 20, y1 - 14);
    });
  }, [displayDetections, isStreaming]);

  const getUniqueDetections = () => {
    if (!displayDetections || displayDetections.length === 0) return [];
    const labels = displayDetections.map((d) => d.name);
    return [...new Set(labels)];
  };

  return (
    <div
      className={`min-h-screen font-sans flex flex-col items-center transition-colors duration-300 ${
        isDarkMode
          ? "bg-slate-950 text-slate-100"
          : "bg-slate-50 text-slate-800"
      }`}
    >
      <Header
        isStreaming={isStreaming}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="flex-1 w-full max-w-md p-5 pb-32 flex flex-col gap-6 relative z-10 mx-auto">
        <CameraDisplay
          videoRef={videoRef}
          canvasRef={canvasRef}
          isStreaming={isStreaming}
          error={error}
        />

        <Controls
          isStreaming={isStreaming}
          onStart={handleStartCamera}
          onStop={handleStopCamera}
        />

        <StatsBoard
          detections={displayDetections}
          isStreaming={isStreaming}
          fps={fps}
        />
      </main>

      {/* --- MOBILE BOTTOM SHEET / DESKTOP SIDEBAR --- */}
      {displayDetections.length > 0 && showGuide && (
        <div
          className="
            fixed z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-[0_-5px_30px_rgba(0,0,0,0.15)] dark:shadow-none transition-all duration-300 ease-out
            
            /* Mobile: Trượt từ dưới lên */
            bottom-0 left-0 w-full max-h-[60vh] rounded-t-[30px] border-t border-slate-200 dark:border-slate-700 flex flex-col
            animate-in slide-in-from-bottom duration-300
            
            /* Desktop: Sidebar bên phải */
            md:top-0 md:right-0 md:h-full md:w-80 md:max-h-full md:rounded-none md:border-l md:border-t-0 md:pt-[72px] md:animate-in md:slide-in-from-right
        "
        >
          {/* Handle bar cho mobile */}
          <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
          </div>

          <div className="p-5 overflow-y-auto flex-1">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-bounce">💡</span>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                  Phát hiện rác!
                </h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {getUniqueDetections().map((label) => {
                const info = wasteInfo[label];
                if (!info) return null;

                let cardStyle =
                  "bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700";
                let badgeColor = "bg-gray-500";
                let icon = "🗑️";

                if (info.type === "recycle") {
                  cardStyle =
                    "bg-green-50/80 dark:bg-green-900/10 border-green-200 dark:border-green-800/50";
                  badgeColor = "bg-green-600";
                  icon = "♻️";
                } else if (info.type === "organic") {
                  cardStyle =
                    "bg-yellow-50/80 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800/50";
                  badgeColor = "bg-yellow-600";
                  icon = "🍂";
                } else if (info.type === "hazard") {
                  cardStyle =
                    "bg-red-50/80 dark:bg-red-900/10 border-red-200 dark:border-red-800/50";
                  badgeColor = "bg-red-600";
                  icon = "☣️";
                }

                return (
                  <div
                    key={label}
                    className={`p-4 rounded-2xl border shadow-sm ${cardStyle} transition-all`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{icon}</span>
                        <span className="font-bold text-base text-slate-800 dark:text-slate-100">
                          {info.name}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${badgeColor}`}
                      >
                        {info.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {info.guide}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
