import {
  Camera,
  RefreshCw,
  Trash2,
  Zap,
  AlertCircle,
  CheckCircle2,
  Video as VideoIcon,
  X,
} from "lucide-react";
const CameraDisplay = ({ videoRef, canvasRef, isStreaming, error }) => {
  return (
    // TỈ LỆ 3:4 CHO ĐIỆN THOẠI (Dọc)
    <div className="relative w-full aspect-[3/4] bg-black rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 mx-auto">
      {!isStreaming && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 z-10">
          <VideoIcon className="w-12 h-12 mb-2 opacity-50" />
          <p className="font-medium text-sm">Sẵn sàng quét</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 p-6 text-center z-20">
          <AlertCircle className="w-12 h-12 mb-3" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-0 left-0 w-full h-full object-cover"
      />

      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Hiệu ứng quét khi đang chạy */}
      {isStreaming && (
        <div className="absolute inset-0 pointer-events-none border-[3px] border-green-500/30 rounded-3xl z-10">
          <div className="w-full h-1 bg-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-[scan_2s_linear_infinite]" />
        </div>
      )}
      <style>{`@keyframes scan { 0% { top: 0; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }`}</style>
    </div>
  );
};

export default CameraDisplay;
