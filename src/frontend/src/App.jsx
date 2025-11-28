import { useState, useRef, useEffect } from "react";
import Header from "./Header";
import CameraDisplay from "./CameraDisplay";
import Controls from "./Control";
import StatsBoard from "./StatsBoard";
import { wasteInfo } from "./wasteData";
function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [displayDetections, setDisplayDetections] = useState([]);
  const [fps, setFps] = useState(0);
  const [error, setError] = useState(null);

  // State cho Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Xử lý Dark Mode Effect
  useEffect(() => {
    // Kiểm tra localStorage hoặc system preference
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

  const handleStartCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
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
    }
  };

  // Giả lập gửi frame lên server (Mocking API call)
  const sendFrameToServer = async (blob) => {
    if (!blob) return;

    // --- MOCK DETECTIONS (Xóa phần này khi kết nối API thật) ---
    // Vì không có backend thật, tôi giả lập detection ngẫu nhiên để bạn test UI
    if (Math.random() > 0.95) {
      const mockItems = Object.keys(wasteInfo);
      const randomItem =
        mockItems[Math.floor(Math.random() * mockItems.length)];

      const mockData = [
        {
          name: randomItem,
          confidence: 0.85 + Math.random() * 0.1,
          box: [50, 50, 200, 200], // x1, y1, x2, y2 giả định
        },
      ];

      setDisplayDetections(mockData);
      if (clearDetectionTimeoutRef.current)
        clearTimeout(clearDetectionTimeoutRef.current);
      clearDetectionTimeoutRef.current = setTimeout(() => {
        setDisplayDetections([]);
      }, DETECTION_TTL);
      return;
    }
    // -----------------------------------------------------------

    const formData = new FormData();
    formData.append("file", blob, "frame.jpg");

    try {
      // Thay URL này bằng địa chỉ API Backend của bạn
      const res = await fetch("http://127.0.0.1:8000/detect/", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const raw = await res.json();
        let data = [];

        try {
          if (typeof raw === "string") {
            const parsed = JSON.parse(raw);
            data = typeof parsed === "string" ? JSON.parse(parsed) : parsed;
          } else {
            data = raw;
          }
        } catch (e) {
          console.log("Lỗi parse JSON:", e);
        }

        if (!Array.isArray(data)) {
          data = data && data.box ? [data] : [];
        }

        if (data.length > 0) {
          setDisplayDetections(data);

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

    tempCanvas.toBlob(
      (blob) => {
        sendFrameToServer(blob);
      },
      "image/jpeg",
      0.6
    );
  };

  useEffect(() => {
    let interval;
    if (isStreaming) interval = setInterval(detectFrame, 500);
    return () => clearInterval(interval);
  }, [isStreaming]);

  // Vẽ bounding box lên canvas
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // SỬA LỖI: Đặt kích thước canvas khớp video nếu cần
    if (video.readyState === 4 && video.videoWidth > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // SỬA LỖI: Chỉ xóa canvas (để video nền tự chạy) và vẽ lại box
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // KHÔNG gọi ctx.drawImage(video...) ở đây nữa để tránh lag

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

      // Vẽ Box
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.strokeRect(x1, y1, width, height);
      ctx.shadowBlur = 0;

      // Vẽ Label
      ctx.fillStyle = color;
      ctx.font = 'bold 18px "Segoe UI", sans-serif';
      const labelText = info ? info.name : det.name;
      const label = `${labelText} ${(det.confidence * 100).toFixed(0)}%`;

      ctx.beginPath();
      ctx.roundRect(
        x1,
        y1 - 30,
        ctx.measureText(label).width + 12,
        30,
        [5, 5, 0, 0]
      );
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, x1 + 6, y1 - 8);
    });
  }, [displayDetections, isStreaming]); // Thêm dependency

  const getUniqueDetections = () => {
    if (!displayDetections || displayDetections.length === 0) return [];
    const labels = displayDetections.map((d) => d.name);
    return [...new Set(labels)];
  };

  return (
    <div
      className={`min-h-screen font-sans flex flex-col items-center transition-colors duration-300 ${
        isDarkMode
          ? "bg-slate-900 text-slate-100"
          : "bg-slate-50 text-slate-800"
      }`}
    >
      <Header
        isStreaming={isStreaming}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="flex-1 w-full max-w-md p-4 flex flex-col gap-4 relative z-10">
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

      {/* --- Panel Hướng dẫn Xử lý Rác (Sidebar bên phải) --- */}
      {displayDetections.length > 0 && (
        <div className="fixed top-0 right-0 h-full w-80 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-5 shadow-[-5px_0_20px_rgba(0,0,0,0.1)] dark:shadow-none overflow-y-auto transition-transform duration-300 ease-in-out z-40 border-l border-slate-200 dark:border-slate-700 mt-[73px]">
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
              <span className="text-2xl">💡</span>
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                Hướng Dẫn Xử Lý
              </h3>
            </div>

            <div className="flex flex-col gap-4">
              {getUniqueDetections().map((label) => {
                const info = wasteInfo[label];

                if (!info) return null;

                // Logic màu sắc cho Card (Dark mode compatible)
                let cardStyle =
                  "bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600";
                let badgeColor = "bg-gray-500";
                let icon = "🗑️";

                if (info.type === "recycle") {
                  cardStyle =
                    "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
                  badgeColor = "bg-green-600";
                  icon = "♻️";
                } else if (info.type === "organic") {
                  cardStyle =
                    "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
                  badgeColor = "bg-yellow-600";
                  icon = "🍂";
                } else if (info.type === "hazard") {
                  cardStyle =
                    "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
                  badgeColor = "bg-red-600";
                  icon = "☣️";
                }

                return (
                  <div
                    key={label}
                    className={`p-4 rounded-xl border shadow-sm ${cardStyle} transition-all hover:scale-105`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{icon}</span>
                        <span className="font-bold text-md text-slate-800 dark:text-slate-200">
                          {info.name}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${badgeColor}`}
                      >
                        {info.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
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
