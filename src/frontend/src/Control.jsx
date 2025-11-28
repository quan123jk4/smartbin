import {
  Camera,
  RefreshCw,
  Trash2,
  Zap,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
const Controls = ({ isStreaming, onStart, onStop }) => (
  <div className="flex justify-center gap-4">
    {!isStreaming ? (
      <button
        onClick={onStart}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-green-200 transition-all active:scale-95"
      >
        <Camera className="w-5 h-5" />
        Bắt đầu Quét
      </button>
    ) : (
      <button
        onClick={onStop}
        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-red-200 transition-all active:scale-95"
      >
        <Zap className="w-5 h-5 fill-current" />
        Dừng lại
      </button>
    )}
  </div>
);
export default Controls;
