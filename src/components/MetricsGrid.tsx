import { Shield, AlertTriangle, Users, Globe, Database, TrendingUp } from 'lucide-react';

interface Metrics {
  sc: number;
  cr: number;
  ia: number;
  wf: number;
  bk: string;
}

const metricConfig = [
  {
    key: 'sc',
    label: 'Security Score',
    icon: Shield,
    iconBg: 'from-blue-500 to-blue-600',
    suffix: '%',
    trend: '+3%',
    trendType: 'up' as const,
    trendLabel: 'this week',
  },
  {
    key: 'cr',
    label: 'Critical Findings',
    icon: AlertTriangle,
    iconBg: 'from-red-500 to-red-600',
    isDanger: true,
    subLabel: 'Immediate action',
  },
  {
    key: 'ia',
    label: 'IAM Compliance',
    icon: Users,
    iconBg: 'from-emerald-500 to-emerald-600',
    suffix: '%',
    subLabel: '6 of 9 pass',
  },
  {
    key: 'wf',
    label: 'WAF Rules Active',
    icon: Globe,
    iconBg: 'from-purple-500 to-purple-600',
    trend: 'Monitoring on',
    trendType: 'good' as const,
  },
  {
    key: 'bk',
    label: 'Backup Regions',
    icon: Database,
    iconBg: 'from-cyan-500 to-cyan-600',
    trend: '4 uncovered',
    trendType: 'warning' as const,
  },
];

export default function MetricsGrid({ metrics }: { metrics: Metrics }) {
  return (
    <div className="grid grid-cols-5 gap-4 mb-5">
      {metricConfig.map((config) => {
        const value = metrics[config.key as keyof Metrics];
        const Icon = config.icon;

        return (
          <div
            key={config.key}
            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 bg-gradient-to-br ${config.iconBg} rounded-lg shadow-sm`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-medium text-slate-600">{config.label}</span>
              </div>

              <div className="flex items-end gap-2">
                <p className={`text-2xl font-bold ${
                  config.isDanger && Number(value) > 0 ? 'text-red-600' : 'text-slate-900'
                }`}>
                  {value}{config.suffix || ''}
                </p>
              </div>

              {config.trend && (
                <div className="mt-2 flex items-center gap-1">
                  {config.trendType === 'up' && (
                    <>
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      <span className="text-xs text-emerald-600 font-medium">{config.trend}</span>
                      <span className="text-xs text-slate-500">{config.trendLabel}</span>
                    </>
                  )}
                  {config.trendType === 'good' && (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {config.trend}
                    </span>
                  )}
                  {config.trendType === 'warning' && (
                    <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      {config.trend}
                    </span>
                  )}
                </div>
              )}

              {config.subLabel && (
                <p className="text-xs text-slate-500 mt-1.5">{config.subLabel}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
