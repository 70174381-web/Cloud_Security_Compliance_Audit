import { Database, ChevronRight } from 'lucide-react';

interface BackupRegionsProps {
  backupRegions: any[];
  currentTab: string;
  onExpand?: () => void;
}

export default function BackupRegions({ backupRegions, currentTab, onExpand }: BackupRegionsProps) {
  const regions = backupRegions.filter(r => currentTab === 'all' || r.cloud_providers?.slug === currentTab);
  const activeRegions = regions.filter(r => r.is_active).length;
  const totalRegions = regions.length;

  const providerRegions = new Map<string, any[]>();
  regions.forEach(r => {
    const provider = r.cloud_providers?.slug?.toUpperCase() || 'UNKNOWN';
    if (!providerRegions.has(provider)) {
      providerRegions.set(provider, []);
    }
    providerRegions.get(provider)!.push(r);
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-600" />
              Backup Regions
            </h3>
            <p className="text-xs text-slate-500 mt-1">{activeRegions}/{totalRegions} regions covered</p>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-4 max-h-64 overflow-y-auto">
        {Array.from(providerRegions.entries()).map(([provider, regs]) => (
          <div key={provider}>
            <p className="text-xs font-semibold text-slate-600 mb-2 px-1">{provider}</p>
            <div className="space-y-1.5">
              {regs.map((r: any) => (
                <div
                  key={r.id}
                  className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${r.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 truncate">{r.region_name}</p>
                  </div>
                  {r.is_primary && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">PRIMARY</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 pb-4 border-t border-slate-100 bg-slate-50">
        <button
          onClick={onExpand}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-cyan-600 hover:text-cyan-700 hover:bg-white rounded-lg border border-cyan-200 transition-all"
        >
          Expand Coverage
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
