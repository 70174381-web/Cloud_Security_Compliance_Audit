import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, FileText, AlertCircle, TrendingUp, Shield, Download, Calendar, Clock, ChevronDown, ChevronRight, BarChart2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProviderScore {
  provider: string;
  score: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export default function AuditReport() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'all';
  const [expandedSection, setExpandedSection] = useState<string | null>('executive');
  const [providers, setProviders] = useState<ProviderScore[]>([]);
  const [totalFindings, setTotalFindings] = useState({ critical: 0, high: 0, medium: 0, low: 0, total: 0 });
  const [overallScore, setOverallScore] = useState(74);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);

      const { data: scoresData } = await supabase
        .from('compliance_scores')
        .select('*, cloud_providers(slug)');

      const { data: findingsData } = await supabase
        .from('security_findings')
        .select('severity, cloud_providers(slug)');

      if (scoresData && findingsData) {
        const providerScores: ProviderScore[] = scoresData.map((s: any) => {
          const slug = s.cloud_providers?.slug || 'unknown';
          const providerFindings = findingsData.filter((f: any) => f.cloud_providers?.slug === slug);
          return {
            provider: slug,
            score: Number(s.security_score) || 0,
            critical: providerFindings.filter((f: any) => f.severity === 'critical').length,
            high: providerFindings.filter((f: any) => f.severity === 'high').length,
            medium: providerFindings.filter((f: any) => f.severity === 'medium').length,
            low: providerFindings.filter((f: any) => f.severity === 'low').length,
          };
        });
        setProviders(providerScores);

        const totals = {
          critical: findingsData.filter((f: any) => f.severity === 'critical').length,
          high: findingsData.filter((f: any) => f.severity === 'high').length,
          medium: findingsData.filter((f: any) => f.severity === 'medium').length,
          low: findingsData.filter((f: any) => f.severity === 'low').length,
          total: findingsData.length,
        };
        setTotalFindings(totals);

        if (scoresData.length > 0) {
          const avg = Math.round(scoresData.reduce((sum: number, s: any) => sum + Number(s.security_score), 0) / scoresData.length);
          setOverallScore(avg);
        }
      }

      setLoading(false);
    };
    fetchReportData();
  }, []);

  const roadmaps = [
    {
      phase: 'Phase 1: Immediate (0-30 Days)',
      color: 'red',
      items: [
        `Resolve ${totalFindings.critical} critical findings - MFA enforcement, S3 bucket exposure, service account permissions`,
        'Enable MFA for all root/admin accounts across all providers',
        'Implement emergency access key rotation procedure',
        'Block public write access on S3 buckets - internee-uploads',
        'Reduce service account permissions from Owner to scoped custom roles',
      ],
    },
    {
      phase: 'Phase 2: Short-term (30-60 Days)',
      color: 'orange',
      items: [
        `Address all ${totalFindings.high} high severity findings`,
        'Implement centralized IAM policy management',
        'Enable CloudTrail log validation across all regions',
        'Configure firewall rules to restrict SSH access',
        'Address Azure Defender recommendations',
      ],
    },
    {
      phase: 'Phase 3: Long-term (60-90 Days)',
      color: 'blue',
      items: [
        `Remediate remaining ${totalFindings.medium + totalFindings.low} medium and low severity findings`,
        'Achieve 90%+ IAM compliance score',
        'Complete multi-region backup coverage (target: 4 additional regions)',
        'Enable custom WAF ruleset for application-specific threats',
        'Conduct comprehensive penetration testing',
        'Implement continuous compliance monitoring dashboard',
      ],
    },
  ];

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const providerLabel = (slug: string) => slug.toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={`/${tab !== 'all' ? `?tab=${tab}` : ''}`} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl shadow-lg shadow-slate-600/30">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">Cloud Security Audit Report</h1>
                <p className="text-slate-600">Comprehensive security assessment for Internee.pk</p>
              </div>
            </div>
            <button
              onClick={() => {
                const content = document.getElementById('report-content')?.innerHTML || '';
                const blob = new Blob([`<html><head><title>Audit Report</title><style>body{font-family:sans-serif;padding:40px;color:#1e293b;}</style></head><body>${content}</body></html>`], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'audit-report.html';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>

          {/* Report Meta */}
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Report Date: June 16, 2026
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Audit Period: May 16 - June 16, 2026
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">Loading report data...</div>
        ) : (
          <div id="report-content">
            {/* Executive Summary */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
              <button
                onClick={() => toggleSection('executive')}
                className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Executive Summary
                </h2>
                {expandedSection === 'executive' ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
              </button>
              {expandedSection === 'executive' && (
                <div className="px-5 pb-5 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-6 mt-5">
                    <div className="col-span-2">
                      <p className="text-sm text-slate-700 leading-relaxed mb-4">
                        This audit report identifies {totalFindings.total} security findings across AWS, GCP, and Azure infrastructure for Internee.pk.
                        The overall security posture score is {overallScore}%, with {totalFindings.critical} critical findings requiring immediate attention.
                        Key areas of concern include IAM policy violations, incomplete backup coverage, and misconfigured
                        storage bucket permissions.
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed mb-4">
                        Immediate remediation is recommended for critical findings to prevent potential data breaches and
                        maintain compliance with security best practices. The 30/60/90-day roadmap provides a structured
                        approach to achieving a security score of 90%+ within three months.
                      </p>
                      <div className="flex gap-3 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-800 text-sm font-semibold rounded-lg">
                          <AlertCircle className="w-4 h-4" />
                          {totalFindings.critical} Critical
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-800 text-sm font-semibold rounded-lg">
                          {totalFindings.high} High
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-semibold rounded-lg">
                          {totalFindings.medium} Medium
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg">
                          {totalFindings.low} Low
                        </span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white">
                      <p className="text-xs text-slate-400 mb-2">Overall Security Score</p>
                      <p className="text-4xl font-bold mb-4">{overallScore}%</p>
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${overallScore}%` }} />
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Target: 90%+</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Provider Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
              <button
                onClick={() => toggleSection('providers')}
                className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  Provider Security Breakdown
                </h2>
                {expandedSection === 'providers' ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
              </button>
              {expandedSection === 'providers' && (
                <div className="px-5 pb-5 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-6 mt-5">
                    {providers.map(p => (
                      <div key={p.provider} className="border border-slate-200 rounded-lg p-4">
                        <h3 className="text-sm font-bold text-slate-900 mb-3">{providerLabel(p.provider)}</h3>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="relative w-16 h-16">
                            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                              <circle
                                cx="18" cy="18" r="14"
                                fill="none"
                                stroke={p.score >= 80 ? '#10b981' : p.score >= 70 ? '#3b82f6' : '#f97316'}
                                strokeWidth="4"
                                strokeDasharray={`${p.score}, 100`}
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{p.score}%</span>
                          </div>
                          <div className="text-xs text-slate-600">
                            <p><span className="font-semibold text-red-600">{p.critical}</span> critical</p>
                            <p><span className="font-semibold text-orange-600">{p.high}</span> high</p>
                            <p><span className="font-semibold text-blue-600">{p.medium}</span> medium</p>
                            <p><span className="font-semibold text-slate-600">{p.low}</span> low</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Remediation Roadmap */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('roadmap')}
                className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-orange-600" />
                  30/60/90-Day Remediation Roadmap
                </h2>
                {expandedSection === 'roadmap' ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
              </button>
              {expandedSection === 'roadmap' && (
                <div className="px-5 pb-5 border-t border-slate-100">
                  <div className="space-y-6 mt-5">
                    {roadmaps.map((phase, idx) => (
                      <div key={idx} className={`border-l-4 pl-4 ${
                        phase.color === 'red' ? 'border-red-500 bg-red-50' :
                        phase.color === 'orange' ? 'border-orange-500 bg-orange-50' : 'border-blue-500 bg-blue-50'
                      } rounded-r-lg p-4`}>
                        <h3 className="text-sm font-bold text-slate-900 mb-3">{phase.phase}</h3>
                        <ul className="space-y-2">
                          {phase.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                                phase.color === 'red' ? 'bg-red-200 text-red-800' :
                                phase.color === 'orange' ? 'bg-orange-200 text-orange-800' : 'bg-blue-200 text-blue-800'
                              }`}>
                                {i + 1}
                              </span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>This report was automatically generated from live audit data.</p>
          <p>Document ID: AUDIT-2026-06-001 - Classification: Internal Use Only</p>
        </div>
      </div>
    </div>
  );
}
