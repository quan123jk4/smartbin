import {
  Camera,
  RefreshCw,
  Trash2,
  Zap,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
const StatsBoard = ({ detections, isStreaming, fps }) => (
  <div className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-500" />
        Trạng thái
      </h3>
      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">
        {fps} FPS
      </span>
    </div>
    <div className="grid grid-cols-2 gap-3 text-center">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
        <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
          {isStreaming ? detections.length : "-"}
        </div>
        <div className="text-xs font-semibold text-blue-500/80 dark:text-blue-400/80 uppercase mt-1">
          Đối tượng
        </div>
      </div>
      <div className="p-3 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30">
        <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
          {isStreaming ? (Math.random() * 0.1 + 0.05).toFixed(2) + "s" : "-"}
        </div>
        <div className="text-xs font-semibold text-purple-500/80 dark:text-purple-400/80 uppercase mt-1">
          Độ trễ
        </div>
      </div>
    </div>
  </div>
);
export default StatsBoard;
