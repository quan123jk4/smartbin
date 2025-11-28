import {
  Trash2,
  Moon,
  Sun,
  Camera,
  RefreshCw,
  Zap,
  AlertCircle,
  CheckCircle2,
  Video,
  X,
} from "lucide-react";
const Header = ({ isStreaming, isDarkMode, toggleDarkMode }) => (
  <header className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border-b dark:border-slate-800 p-4 sticky top-0 z-40 transition-colors duration-300">
    <div className="max-w-md mx-auto flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
          <Trash2 className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
          SmartBin
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
          {isStreaming ? (
            <>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Live</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
              <span>Off</span>
            </>
          )}
        </div>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 transition-all active:scale-95"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  </header>
);

export default Header;
