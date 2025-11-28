import {
  Camera,
  RefreshCw,
  Trash2,
  Zap,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
const StatsBoard = ({ detections, isStreaming, fps }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
    <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
      <h3 className="font-semibold text-slate-700 flex items-center gap-2">
        <RefreshCw className={`w-4 h-4 ${isStreaming ? "animate-spin" : ""}`} />
        Kết quả nhận diện
      </h3>
      {isStreaming && (
        <span className="text-xs text-slate-400 font-mono">~{fps} FPS</span>
      )}
    </div>

    <div className="space-y-2 min-h-[100px]">
      {detections.length === 0 ? (
        <p className="text-center text-slate-400 text-sm py-4 italic">
          {isStreaming ? "Đang tìm kiếm rác..." : "Chưa có dữ liệu"}
        </p>
      ) : (
        detections.map((det, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100 animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-bold text-slate-800 capitalize">
                  {det.name}
                </p>
                <p className="text-xs text-slate-500">
                  Độ tin cậy: {(det.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-white border border-slate-200 rounded text-slate-600">
              ID: {idx + 1}
            </span>
          </div>
        ))
      )}
    </div>
  </div>
);
export default StatsBoard;
