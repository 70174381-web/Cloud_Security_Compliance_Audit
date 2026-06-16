import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Shield, Settings, Code, Zap, AlertTriangle, Plus, Copy, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface WAFRule {
  id: string;
  rule_name: string;
  status: string;
  description: string | null;
  blocked_today: number;
  cloud_providers: { slug: string } | null;
}

const codeExamples: Record<string, string> = {
  aws: `# AWS WAF CLI Example

aws wafv2 update-web-acl \\
  --name internee-production-waf \\
  --scope REGIONAL \\
  --rules file://rules.json \\
  --default-action Allow \\
  --region us-east-1

# rules.json:
[
  {
    "Name": "BlockMaliciousIPs",
    "Priority": 1,
    "Statement": {
      "IPSetReferenceStatement": {
        "ARN": "arn:aws:wafv2:us-east-1:123456789:ipset/malicious-ips"
      }
    },
    "Action": { "Block": {} }
  }
]`,
  gcp: `# GCP Cloud Armor CLI

gcloud compute security-policies rules create 1000 \\
  --security-policy=internee-policy \\
  --expression="evaluatePreconfiguredExpr('sql-injection-v33-stable')" \\
  --action=deny-403 \\
  --description="Block SQL injection"

gcloud compute security-policies rules create 1001 \\
  --security-policy=internee-policy \\
  --expression="evaluatePreconfiguredExpr('xss-v33-stable')" \\
  --action=deny-403 \\
  --description="Block XSS"`,
  azure: `# Azure WAF CLI

az network application-gateway waf-policy custom-rule create \\
  --name BlockMaliciousIPs \\
  --policy-name internee-waf-policy \\
  --resource-group security-rg \\
  --action Block \\
  --priority 100

az network application-gateway waf-policy custom-rule match-condition add \\
  --name BlockMaliciousIPs \\
  --policy-name internee-waf-policy \\
  --resource-group security-rg \\
  --match-variable RemoteAddr \\
  --operator IPMatch \\
  --values "10.0.0.1" "10.0.0.2"`,
};

export default function ConfigureWAF() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'all';
  const [activeProvider, setActiveProvider] = useState(tab === 'all' ? 'aws' : tab);
  const [rules, setRules] = useState<WAFRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('waf_rules')
        .select('*, cloud_providers(slug)')
        .eq('cloud_providers.slug', activeProvider)
        .order('rule_name');
      if (data) setRules(data as WAFRule[]);
      setLoading(false);
    };
    fetchRules();
  }, [activeProvider]);

  const toggleRule = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    await supabase
      .from('waf_rules')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);
    setRules(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(codeExamples[activeProvider] || codeExamples.aws);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeRules = rules.filter(r => r.status === 'active').length;
  const totalBlocked = rules.reduce((sum, r) => sum + (r.blocked_today || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={`/${tab !== 'all' ? `?tab=${tab}` : ''}`} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Configure WAF Rules</h1>
              <p className="text-slate-600">Set up Web Application Firewall protection for Internee.pk infrastructure</p>
            </div>
          </div>
        </div>

        {/* Provider Tabs */}
        <div className="flex gap-2 mb-6">
          {['aws', 'gcp', 'azure'].map(p => (
            <button
              key={p}
              onClick={() => setActiveProvider(p)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                activeProvider === p
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Rule Configuration */}
          <div className="col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Active Rules</h3>
                  <p className="text-xs text-slate-500 mt-1">{activeRules}/{rules.length} rules active - {totalBlocked} blocked today</p>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-32 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Loading rules...
                </div>
              ) : (
                <div className="space-y-3">
                  {rules.map(rule => (
                    <div
                      key={rule.id}
                      className={`p-4 rounded-lg border transition-all ${
                        rule.status === 'active'
                          ? 'border-emerald-200 bg-emerald-50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              rule.status === 'active' ? 'bg-emerald-200 text-emerald-800' :
                              rule.status === 'review' ? 'bg-amber-200 text-amber-800' :
                              'bg-slate-200 text-slate-700'
                            }`}>
                              {rule.status.toUpperCase()}
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-slate-900">{rule.rule_name}</h4>
                          <p className="text-xs text-slate-600 mt-1">{rule.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span>Blocked today: {rule.blocked_today || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleRule(rule.id, rule.status)}
                            className={`relative w-11 h-6 rounded-full transition-colors ${
                              rule.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                                rule.status === 'active' ? 'left-5' : 'left-0.5'
                              }`}
                            />
                          </button>
                          <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                            <Settings className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CLI Example */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Code className="w-5 h-5 text-slate-600" />
                  CLI Implementation - {activeProvider.toUpperCase()}
                </h3>
                <button
                  onClick={copyCode}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="bg-slate-900 text-emerald-400 text-xs p-4 rounded-lg overflow-x-auto font-mono whitespace-pre-wrap">
                {codeExamples[activeProvider] || codeExamples.aws}
              </pre>
            </div>
          </div>

          {/* Quick Setup */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Quick Setup Templates
              </h3>
              <div className="space-y-3">
                <Link to="/consultation" className="block w-full p-3 text-left rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all">
                  <p className="text-sm font-medium text-slate-900">OWASP Core Ruleset</p>
                  <p className="text-xs text-slate-600">6 essential protection rules</p>
                </Link>
                <Link to="/consultation" className="block w-full p-3 text-left rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all">
                  <p className="text-sm font-medium text-slate-900">API Protection Pack</p>
                  <p className="text-xs text-slate-600">Rate limiting + bot detection</p>
                </Link>
                <Link to="/consultation" className="block w-full p-3 text-left rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all">
                  <p className="text-sm font-medium text-slate-900">Geo-Compliance Rules</p>
                  <p className="text-xs text-slate-600">GDPR + regional blocking</p>
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-5 shadow-lg shadow-emerald-500/20">
              <h3 className="text-lg font-bold text-white mb-3">Recommended</h3>
              <p className="text-sm text-emerald-100 mb-4">
                Enable the OWASP Core Ruleset for immediate protection against common web attacks.
              </p>
              <Link
                to="/consultation"
                className="block w-full py-2.5 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-colors text-center"
              >
                Apply Recommended
              </Link>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Note</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Rules will be deployed in monitoring mode first. Review logs before enabling blocking actions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
