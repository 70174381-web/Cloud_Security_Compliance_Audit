import { AlertOctagon, AlertCircle, AlertTriangle, Info, Server, FileText, Filter, ChevronRight } from 'lucide-react';

const severityConfig = {
  critical: {
    icon: AlertOctagon,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800',
    dot: 'bg-red-500',
  },
  high: {
    icon: AlertCircle,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-800',
    dot: 'bg-orange-500',
  },
  medium: {
    icon: AlertTriangle,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    dot: 'bg-blue-500',
  },
  low: {
    icon: Info,
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-800',
    dot: 'bg-slate-400',
  },
};

interface SecurityFindingsProps {
  findings: any[];
  severityFilter: string;
  providerFilter: string;
  currentTab: string;
  onFilter: (severity: string, provider: string) => void;
  onGenerateReport?: () => void;
}

export default function SecurityFindings({
  findings,
  severityFilter,
  providerFilter,
  currentTab,
  onFilter,
  onGenerateReport,
}: SecurityFindingsProps) {
  const activeProvider = currentTab !== 'all' ? currentTab : providerFilter;
  const filtered = findings.filter((f: any) => {
    const matchSeverity = !severityFilter || f.severity === severityFilter;
    const matchProvider = !activeProvider || f.cloud_providers?.slug === activeProvider;
    return matchSeverity && matchProvider;
  });

  const sortedByOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  filtered.sort((a: any, b: any) => sortedByOrder[a.severity as keyof typeof sortedByOrder] - sortedByOrder[b.severity as keyof typeof sortedByOrder]);

  const handleSeverityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilter(e.target.value, providerFilter);
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilter(severityFilter, e.target.value);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              Recent Security Findings
            </h3>
            <p className="text-xs text-slate-500 mt-1">{filtered.length} findings displayed</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={severityFilter}
                onChange={handleSeverityChange}
                className="text-xs pl-8 pr-8 py-2 border border-slate-200 rounded-lg bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="">All severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={providerFilter}
                onChange={handleProviderChange}
                disabled={currentTab !== 'all'}
                className="text-xs pl-8 pr-8 py-2 border border-slate-200 rounded-lg bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">All clouds</option>
                <option value="aws">AWS</option>
                <option value="gcp">GCP</option>
                <option value="azure">Azure</option>
              </select>
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 max-h-80 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-lg">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No findings match the selected filters.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((f: any) => {
              const config = severityConfig[f.severity as keyof typeof severityConfig];
              const Icon = config.icon;
              return (
                <div
                  key={f.id}
                  className={`flex gap-3 p-3 rounded-lg border ${config.border} ${config.bg} hover:shadow-sm transition-all`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-slate-900">{f.title}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${config.badge}`}>
                        {f.severity}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {f.cloud_providers?.slug?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Server className="w-3 h-3" />
                        {f.resource}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {f.source}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-5 pb-4 border-t border-slate-100 bg-slate-50">
        <button
          onClick={onGenerateReport}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-white rounded-lg border border-blue-200 transition-all"
        >
          Generate Full Audit Report
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
