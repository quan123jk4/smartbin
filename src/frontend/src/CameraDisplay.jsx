import {
  Camera,
  RefreshCw,
  Trash2,
  Zap,
  AlertCircle,
  CheckCircle2,
  Video as VideoIcon,
} from "lucide-react";
const CameraDisplay = ({ videoRef, canvasRef, isStreaming, error }) => {
  return (
    <div className="relative w-full aspect-[3/4] bg-black rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
      {!isStreaming && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 z-10">
          <VideoIcon className="w-16 h-16 mb-2 opacity-50" />
          <p>Camera chưa hoạt động</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 text-center z-20">
          <AlertCircle className="w-12 h-12 mb-2" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Video element HIỂN THỊ (bỏ opacity-0) để đảm bảo mượt mà */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-0 left-0 w-full h-full object-cover"
      />

      {/* Canvas LỚP PHỦ trong suốt + bounding boxes */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
      />
    </div>
  );
};

export default CameraDisplay;
