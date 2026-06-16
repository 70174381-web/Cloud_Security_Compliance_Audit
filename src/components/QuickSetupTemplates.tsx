import { useState, useEffect, useCallback } from 'react';
import { Cloud, Shield, CheckCircle, AlertTriangle, Copy, Download, Play, Clock, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

type CloudProvider = 'aws' | 'gcp' | 'azure';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  estimated_time: string;
  automated: boolean;
  steps: string[];
  code?: string | null;
}

interface AppliedTemplate {
  template_id: string;
  provider: string;
  applied_at: string;
}

export default function QuickSetupTemplates({ currentTab }: { currentTab: string }) {
  const [selectedCloud, setSelectedCloud] = useState<CloudProvider>('aws');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [appliedTemplates, setAppliedTemplates] = useState<Set<string>>(new Set());
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('quick_setup_templates')
      .select('*')
      .eq('provider', selectedCloud)
      .order('severity', { ascending: true });
    if (data) {
      setTemplates(data.map((t: any) => ({
        ...t,
        steps: Array.isArray(t.steps) ? t.steps : JSON.parse(t.steps || '[]'),
      })));
    }
    setLoading(false);
  }, [selectedCloud]);

  const fetchApplied = useCallback(async () => {
    const { data } = await supabase
      .from('applied_recommendations')
      .select('recommendation_id, provider')
      .eq('provider', selectedCloud);
    if (data) {
      setAppliedTemplates(new Set(data.map((d: AppliedTemplate) => d.recommendation_id)));
    }
  }, [selectedCloud]);

  useEffect(() => {
    fetchTemplates();
    fetchApplied();
    setSelectedTemplate(null);
  }, [selectedCloud, fetchTemplates, fetchApplied]);

  const handleApply = async (template: Template) => {
    if (appliedTemplates.has(template.id)) return;
    setApplyingId(template.id);

    // Simulate progress for visual feedback
    await new Promise(r => setTimeout(r, 1200));

    await supabase
      .from('applied_recommendations')
      .insert({ recommendation_id: template.id, provider: selectedCloud });

    setAppliedTemplates(prev => new Set([...prev, template.id]));
    setApplyingId(null);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clouds: CloudProvider[] = ['aws', 'gcp', 'azure'];

  const cloudLogos: Record<CloudProvider, string> = {
    aws: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
    gcp: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg',
    azure: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Quick Setup Templates</h2>
              <p className="text-sm text-slate-500">Pre-configured security templates for rapid deployment</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>{templates.length} templates available</span>
            {appliedTemplates.size > 0 && (
              <span className="ml-2 text-emerald-600 font-medium">
                ({appliedTemplates.size} applied)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cloud Tabs */}
      <div className="px-6 pt-4 border-b border-slate-100">
        <div className="flex gap-2">
          {clouds.map((cloud) => (
            <button
              key={cloud}
              onClick={() => setSelectedCloud(cloud)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                selectedCloud === cloud
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cloud.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex h-[440px]">
        {/* Template List */}
        <div className="w-1/2 border-r border-slate-200 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400">
              <AlertTriangle className="w-6 h-6 mb-2" />
              <p className="text-sm">No templates found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => {
                const isApplied = appliedTemplates.has(template.id);
                const isApplying = applyingId === template.id;
                return (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    } ${isApplied ? 'opacity-70' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-slate-900">{template.name}</h3>
                          {isApplied && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                          {isApplying && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            template.severity === 'critical'
                              ? 'bg-red-100 text-red-700'
                              : template.severity === 'high'
                              ? 'bg-orange-100 text-orange-700'
                              : template.severity === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {template.severity}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {template.estimated_time}
                          </span>
                          {template.automated && (
                            <span className="text-xs text-emerald-600 flex items-center gap-1">
                              <Play className="w-3 h-3" />
                              Automated
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Template Details */}
        <div className="w-1/2 p-4 overflow-y-auto bg-slate-50">
          {selectedTemplate ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900">{selectedTemplate.name}</h3>
                </div>
                <p className="text-sm text-slate-600">{selectedTemplate.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">{selectedTemplate.category}</span>
                  <span className="text-xs text-slate-500">{selectedCloud.toUpperCase()}</span>
                </div>
              </div>

              {/* Progress Steps with checkmarks for applied */}
              <div className="bg-white rounded-lg border border-slate-200 p-3">
                <h4 className="text-xs font-semibold text-slate-700 uppercase mb-2">Implementation Steps</h4>
                <ol className="space-y-2">
                  {selectedTemplate.steps.map((step, idx) => {
                    const isApplied = appliedTemplates.has(selectedTemplate.id);
                    return (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                          isApplied
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isApplied ? <CheckCircle className="w-3 h-3" /> : idx + 1}
                        </span>
                        <span className={isApplied ? 'text-slate-400 line-through' : 'text-slate-700'}>{step}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>

              {selectedTemplate.code && (
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-800">
                    <span className="text-xs text-gray-400 font-mono">CLI Commands</span>
                    <button
                      onClick={() => copyCode(selectedTemplate.code!)}
                      className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="p-3 text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap">
                    {selectedTemplate.code}
                  </pre>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleApply(selectedTemplate)}
                  disabled={appliedTemplates.has(selectedTemplate.id) || applyingId === selectedTemplate.id}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    applyingId === selectedTemplate.id
                      ? 'bg-blue-100 text-blue-700 cursor-wait'
                      : appliedTemplates.has(selectedTemplate.id)
                      ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm'
                  }`}
                >
                  {applyingId === selectedTemplate.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Applying...
                    </>
                  ) : appliedTemplates.has(selectedTemplate.id) ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Applied
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Apply Template
                    </>
                  )}
                </button>
                {selectedTemplate.code && (
                  <button
                    onClick={() => {
                      const blob = new Blob([selectedTemplate.code!], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${selectedTemplate.name.replace(/\s+/g, '_').toLowerCase()}.sh`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="py-2 px-4 rounded-lg text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <div className="p-3 bg-slate-200 rounded-lg mb-3">
                <Shield className="w-6 h-6" />
              </div>
              <p className="text-sm">Select a template to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
