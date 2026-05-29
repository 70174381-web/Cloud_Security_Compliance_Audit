import { Key, ChevronRight } from 'lucide-react';

const statusConfig = {
  pass: { icon: '✓', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  fail: { icon: '✕', color: 'text-red-600', bg: 'bg-red-100' },
  warning: { icon: '!', color: 'text-amber-600', bg: 'bg-amber-100' },
};

interface IAMComplianceTableProps {
  iamPolicies: any[];
  currentTab: string;
  onRemediation?: () => void;
}

export default function IAMComplianceTable({ iamPolicies, currentTab, onRemediation }: IAMComplianceTableProps) {
  const policies = ['Root / admin MFA', 'Least privilege access', 'Password rotation (90d)', 'Access key rotation', 'Cross-account boundaries', 'Service account scoping'];
  const providers = currentTab === 'all' ? ['aws', 'gcp', 'azure'] : [currentTab];

  const getPolicyStatus = (policy: string, provider: string) => {
    return iamPolicies.find(p => p.policy_name === policy && p.cloud_providers.slug === provider)?.status || 'unknown';
  };

  const totalPolicies = policies.length * providers.length;
  const passingPolicies = policies.reduce((sum, policy) => {
    return sum + providers.filter(p => getPolicyStatus(policy, p) === 'pass').length;
  }, 0);
  const complianceRate = Math.round((passingPolicies / totalPolicies) * 100);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600" />
              IAM Policy Compliance
            </h3>
            <p className="text-xs text-slate-500 mt-1">{passingPolicies}/{totalPolicies} policies pass ({complianceRate}%)</p>
          </div>
        </div>
      </div>

      <div className="p-3 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 px-3 font-medium text-slate-600 bg-slate-50">Policy</th>
              {providers.map(p => (
                <th key={p} className="text-center py-2 px-3 font-medium text-slate-600 bg-slate-50">{p.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {policies.map((policy, idx) => (
              <tr key={policy} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                <td className="py-2.5 px-3 text-slate-900 font-medium">{policy}</td>
                {providers.map(provider => {
                  const status = getPolicyStatus(policy, provider);
                  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.warning;
                  return (
                    <td key={provider} className="text-center py-2.5 px-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${config.bg} ${config.color} text-xs font-bold`}>
                        {config.icon}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 pb-4 border-t border-slate-100 bg-slate-50">
        <button
          onClick={onRemediation}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-white rounded-lg border border-blue-200 transition-all"
        >
          View Remediation Steps
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
