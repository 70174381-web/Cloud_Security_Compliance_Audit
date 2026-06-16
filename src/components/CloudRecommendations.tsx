import { useState, useEffect, useCallback } from 'react';
import { Shield, ArrowRight, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Zap, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

type CloudProvider = 'aws' | 'gcp' | 'azure';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
  effort: 'low' | 'medium' | 'high';
  category: string;
  details: string[];
  code_snippet?: string | null;
}

export default function CloudRecommendations({ currentTab }: { currentTab: string }) {
  const [selectedCloud, setSelectedCloud] = useState<CloudProvider>('aws');
  const [expandedRec, setExpandedRec] = useState<string | null>(null);
  const [acceptedRecs, setAcceptedRecs] = useState<Set<string>>(new Set());
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('recommendation_templates')
      .select('*')
      .eq('provider', selectedCloud)
      .order('severity', { ascending: true });
    if (data) {
      setRecommendations(data.map((r: any) => ({
        ...r,
        details: Array.isArray(r.details) ? r.details : JSON.parse(r.details || '[]'),
      })));
    }
    setLoading(false);
  }, [selectedCloud]);

  const fetchAccepted = useCallback(async () => {
    const { data } = await supabase
      .from('applied_recommendations')
      .select('recommendation_id')
      .eq('provider', selectedCloud);
    if (data) {
      setAcceptedRecs(new Set(data.map((d: any) => d.recommendation_id)));
    }
  }, [selectedCloud]);

  useEffect(() => {
    fetchRecommendations();
    fetchAccepted();
    setExpandedRec(null);
  }, [selectedCloud, fetchRecommendations, fetchAccepted]);

  const handleAccept = async (recId: string) => {
    if (acceptedRecs.has(recId)) return;
    setAcceptingId(recId);
    await new Promise(r => setTimeout(r, 800));
    await supabase
      .from('applied_recommendations')
      .insert({ recommendation_id: recId, provider: selectedCloud });
    setAcceptedRecs(prev => new Set([...prev, recId]));
    setAcceptingId(null);
  };

  const severityColors = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-blue-100 text-blue-700 border-blue-200'
  };

  const severityIcons = {
    critical: <AlertTriangle className="w-3.5 h-3.5" />,
    high: <Shield className="w-3.5 h-3.5" />,
    medium: <Zap className="w-3.5 h-3.5" />,
    low: <CheckCircle className="w-3.5 h-3.5" />
  };

  const effortColors = {
    low: 'text-emerald-600 bg-emerald-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-red-600 bg-red-50'
  };

  const clouds: CloudProvider[] = ['aws', 'gcp', 'azure'];

  // Summary stats
  const criticalCount = recommendations.filter(r => r.severity === 'critical' && !acceptedRecs.has(r.id)).length;
  const quickWins = recommendations.filter(r => r.effort === 'low' && !acceptedRecs.has(r.id)).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Security Recommendations</h2>
              <p className="text-sm text-slate-500">Cloud-specific security improvements based on audit findings</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {criticalCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                {criticalCount} critical
              </div>
            )}
            {quickWins > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-medium">
                <Zap className="w-3.5 h-3.5" />
                {quickWins} quick wins
              </div>
            )}
            <div className="text-sm">
              <span className="text-emerald-600 font-semibold">{acceptedRecs.size}</span>
              <span className="text-slate-500 ml-1">of {recommendations.length} accepted</span>
            </div>
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
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
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

      {/* Recommendations List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading recommendations...
          </div>
        ) : recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <CheckCircle className="w-8 h-8 mb-2 text-emerald-500" />
            <p className="text-sm font-medium">All recommendations addressed</p>
          </div>
        ) : (
          recommendations.map((rec) => {
            const isAccepted = acceptedRecs.has(rec.id);
            const isAccepting = acceptingId === rec.id;
            return (
              <div
                key={rec.id}
                className={`rounded-lg border transition-all ${
                  expandedRec === rec.id
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                } ${isAccepted ? 'opacity-60' : ''}`}
              >
                {/* Header Row */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-slate-900">{rec.title}</h3>
                        {isAccepted && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        {isAccepting && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                      </div>
                      <p className="text-sm text-slate-600">{rec.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full border font-medium flex items-center gap-1 ${severityColors[rec.severity]}`}>
                          {severityIcons[rec.severity]}
                          {rec.severity}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${effortColors[rec.effort]}`}>
                          {rec.effort} effort
                        </span>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{rec.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isAccepted && expandedRec !== rec.id && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAccept(rec.id); }}
                          disabled={isAccepting}
                          className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-medium rounded-md hover:from-emerald-600 hover:to-emerald-700 shadow-sm transition-all flex items-center gap-1 disabled:opacity-50"
                        >
                          {isAccepting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                          Accept
                        </button>
                      )}
                      <div className="p-1 text-slate-400">
                        {expandedRec === rec.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedRec === rec.id && (
                  <div className="px-4 pb-4 border-t border-slate-200">
                    <div className="pt-3 space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span className="text-xs font-semibold text-slate-700 uppercase">Impact</span>
                        </div>
                        <p className="text-sm text-slate-600 pl-6">{rec.impact}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-semibold text-slate-700 uppercase">Implementation Steps</span>
                        </div>
                        <ul className="space-y-1.5 pl-6">
                          {rec.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 ${
                                isAccepted ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {isAccepted ? <CheckCircle className="w-3 h-3" /> : idx + 1}
                              </span>
                              <span className={isAccepted ? 'line-through text-slate-400' : ''}>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => handleAccept(rec.id)}
                          disabled={isAccepted || isAccepting}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                            isAccepting
                              ? 'bg-blue-100 text-blue-700 cursor-wait'
                              : isAccepted
                              ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm'
                          }`}
                        >
                          {isAccepting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Applying...
                            </>
                          ) : isAccepted ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Accepted
                            </>
                          ) : (
                            <>
                              Accept Recommendation
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
