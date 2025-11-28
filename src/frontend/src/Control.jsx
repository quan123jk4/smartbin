import {
  Camera,
  RefreshCw,
  Trash2,
  Zap,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
const Controls = ({ isStreaming, onStart, onStop }) => (
  <div className="grid grid-cols-2 gap-3 w-full">
    {!isStreaming ? (
      <button
        onClick={onStart}
        className="col-span-2 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg shadow-green-200 dark:shadow-green-900/20 transition-all active:scale-[0.98]"
      >
        <Camera className="w-6 h-6" />
        Bắt đầu
      </button>
    ) : (
      <>
        <button
          onClick={onStop}
          className="flex flex-col items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-2xl font-semibold shadow-lg shadow-red-200 dark:shadow-red-900/20 transition-all active:scale-[0.98]"
        >
          <Zap className="w-6 h-6" />
          <span>Dừng</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-2xl font-semibold shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all active:scale-[0.98]">
          <RefreshCw className="w-6 h-6" />
          <span>Chụp lại</span>
        </button>
      </>
    )}
  </div>
);
export default Controls;
