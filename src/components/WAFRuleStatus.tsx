import { Shield, ChevronRight } from 'lucide-react';

const statusConfig = {
  active: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  disabled: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  review: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
};

interface WAFRuleStatusProps {
  wafRules: any[];
  currentTab: string;
  onConfigure?: () => void;
}

export default function WAFRuleStatus({ wafRules, currentTab, onConfigure }: WAFRuleStatusProps) {
  const rules = wafRules.filter(r => currentTab === 'all' || r.cloud_providers?.slug === currentTab);
  const activeRules = rules.filter(r => r.status === 'active').length;
  const totalBlocked = rules.reduce((sum, r) => sum + (r.blocked_today || 0), 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              WAF Rule Status
            </h3>
            <p className="text-xs text-slate-500 mt-1">{activeRules}/{rules.length} rules active</p>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-1.5">
        {rules.slice(0, 6).map(rule => {
          const config = statusConfig[rule.status as keyof typeof statusConfig] || statusConfig.disabled;
          return (
            <div
              key={rule.id}
              className="flex items-center justify-between py-2 px-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
                <span className="text-xs text-slate-700">{rule.rule_name}</span>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${config.bg} ${config.text}`}>
                {rule.status.charAt(0).toUpperCase() + rule.status.slice(1)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mx-5 mb-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-600 font-medium">Requests blocked today</p>
            <p className="text-lg font-bold text-blue-900">{totalBlocked.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="px-5 pb-4 border-t border-slate-100 bg-slate-50">
        <button
          onClick={onConfigure}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-white rounded-lg border border-purple-200 transition-all"
        >
          Configure WAF
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
