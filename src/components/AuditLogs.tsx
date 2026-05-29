import { Terminal } from 'lucide-react';

const levelConfig = {
  WARN: { color: 'text-amber-400', bg: 'bg-amber-500' },
  ERROR: { color: 'text-red-400', bg: 'bg-red-500' },
  BLOCK: { color: 'text-red-400', bg: 'bg-red-500' },
  INFO: { color: 'text-slate-400', bg: 'bg-slate-400' },
};

export default function AuditLogs({ logs }: { logs: any[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-600" />
          CloudTrail / Audit Log Feed
        </h3>
        <p className="text-xs text-slate-500 mt-1">Live audit events from all providers</p>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-4 font-mono text-xs max-h-48 overflow-y-auto">
        <div className="space-y-2">
          {logs.map((log, i) => {
            const time = new Date(log.log_time).toLocaleTimeString('en-US', { hour12: false });
            const config = levelConfig[log.level as keyof typeof levelConfig] || levelConfig.INFO;
            return (
              <div key={i} className="flex gap-3 items-start group">
                <span className="text-slate-500 flex-shrink-0 text-[11px]">2026-05-29 {time}</span>
                <span className={`font-semibold min-w-12 ${config.color}`}>
                  [{log.level}]
                </span>
                <span className="text-cyan-400 min-w-20 flex-shrink-0">{log.source}</span>
                <span className="text-slate-300 group-hover:text-white transition-colors">{log.message}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
