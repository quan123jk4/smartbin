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
} from "lucide-react";
const Header = ({ isStreaming, isDarkMode, toggleDarkMode }) => (
  <header className="w-full bg-white dark:bg-slate-800 shadow-sm border-b dark:border-slate-700 p-4 sticky top-0 z-50 transition-colors duration-300">
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
        {/* Trạng thái Live */}
        <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full transition-colors">
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

        {/* Nút Toggle Dark Mode */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  </header>
);
export default Header;
