import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertTriangle, CheckCircle2, Clock, ArrowRight, Shield, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Remediation {
  id: string;
  category: string;
  title: string;
  priority: string;
  provider: string;
  description: string;
  steps: string[];
  estimatedTime: string;
  impact: string;
}

const priorityConfig: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  high: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  medium: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  low: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200' },
};

export default function RemediationSteps() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'all';
  const navigate = useNavigate();
  const [remediations, setRemediations] = useState<Remediation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRemediations = async () => {
      setLoading(true);
      const { data: findingsData } = await supabase
        .from('security_findings')
        .select('*, cloud_providers(slug)')
        .order('severity', { ascending: true });

      if (findingsData) {
        const mapped: Remediation[] = findingsData.map((f: any) => ({
          id: f.id,
          category: f.source || 'Security',
          title: f.title,
          priority: f.severity,
          provider: f.cloud_providers?.slug || 'aws',
          description: f.description || f.title,
          steps: f.remediation ? f.remediation.split('. ').filter((s: string) => s.trim()) : ['Review and address the finding'],
          estimatedTime: f.severity === 'critical' ? '1-2 hours' : f.severity === 'high' ? '2-4 hours' : '4-8 hours',
          impact: `Resolves ${f.severity} severity finding on ${f.resource}`,
        }));
        setRemediations(mapped);
      }
      setLoading(false);
    };
    fetchRemediations();
  }, []);

  const filtered = tab === 'all' ? remediations : remediations.filter(r => r.provider === tab);

  const criticalCount = filtered.filter(r => r.priority === 'critical').length;
  const highCount = filtered.filter(r => r.priority === 'high').length;

  const sorted = [...filtered].sort((a, b) => {
    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.priority] || 4) - (order[b.priority] || 4);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={`/${tab !== 'all' ? `?tab=${tab}` : ''}`} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Security Remediation Steps</h1>
              <p className="text-slate-600">Step-by-step guidance to resolve findings across your cloud infrastructure</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-slate-600">Critical Issues</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{criticalCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-slate-600">High Priority</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{highCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm text-slate-600">Total Findings</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{filtered.length}</p>
          </div>
        </div>

        {/* Remediation Cards */}
        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-400">
            Loading remediation data...
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <CheckCircle2 className="w-8 h-8 mb-2 text-emerald-500" />
            <p className="text-sm font-medium">No findings for this provider</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden"
              >
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${priorityConfig[item.priority]?.bg || 'bg-slate-100'} ${priorityConfig[item.priority]?.text || 'text-slate-800'}`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${priorityConfig[item.priority]?.bg || 'bg-slate-100'} ${priorityConfig[item.priority]?.text || 'text-slate-800'}`}>
                            {item.priority.toUpperCase()}
                          </span>
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700">
                            {item.provider.toUpperCase()}
                          </span>
                          <span className="text-xs font-medium text-slate-500">{item.category}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-slate-600">{item.description}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-slate-500 mb-1">Estimated Time</p>
                      <p className="text-sm font-semibold text-slate-900">{item.estimatedTime}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-slate-50">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Implementation Steps
                  </h4>
                  <ol className="space-y-2">
                    {item.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center text-xs font-medium text-slate-600">
                          {stepIndex + 1}
                        </span>
                        <span className="text-sm text-slate-700">{step}</span>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">Impact: </span>
                      {item.impact}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Need hands-on assistance?</h3>
              <p className="text-blue-100">Our cloud security experts can help implement these remediations for you.</p>
            </div>
            <button
              onClick={() => navigate('/consultation')}
              className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-md flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Schedule Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
