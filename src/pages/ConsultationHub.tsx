import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Users, Zap, Shield, ArrowRight, ArrowLeft,
  CheckCircle, Bell, Settings, Play, Pause, Trash2, Plus, X,
  AlertTriangle, TrendingUp, BookOpen, Target, Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import QuickSetupTemplates from '../components/QuickSetupTemplates';
import CloudRecommendations from '../components/CloudRecommendations';

type CloudProvider = 'aws' | 'gcp' | 'azure';
type Frequency = 'daily' | 'weekly' | 'monthly';

interface ConsultationSchedule {
  id: string;
  provider: CloudProvider;
  frequency: Frequency;
  scheduled_time: string;
  enabled: boolean;
  last_run: string | null;
  next_run: string | null;
}

interface AppliedCount {
  provider: string;
  count: number;
}

export default function ConsultationHub() {
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'all';
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<ConsultationSchedule[]>([]);
  const [activeView, setActiveView] = useState<'schedules' | 'templates' | 'recommendations'>('recommendations');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState<{ provider: CloudProvider; frequency: Frequency; time: string }>({
    provider: 'aws',
    frequency: 'daily',
    time: '09:00',
  });
  const [appliedCounts, setAppliedCounts] = useState<AppliedCount[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('consultation_schedules')
      .select('*')
      .order('provider', { ascending: true });
    if (data) setSchedules(data as ConsultationSchedule[]);
    setLoading(false);
  }, []);

  const fetchAppliedCounts = useCallback(async () => {
    const { data } = await supabase
      .from('applied_recommendations')
      .select('provider');
    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((d: any) => {
        counts[d.provider] = (counts[d.provider] || 0) + 1;
      });
      setAppliedCounts(Object.entries(counts).map(([provider, count]) => ({ provider, count })));
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
    fetchAppliedCounts();
  }, [fetchSchedules, fetchAppliedCounts]);

  const toggleSchedule = async (id: string, currentEnabled: boolean) => {
    setTogglingId(id);
    await supabase
      .from('consultation_schedules')
      .update({ enabled: !currentEnabled, updated_at: new Date().toISOString() })
      .eq('id', id);
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, enabled: !currentEnabled } : s));
    setTogglingId(null);
  };

  const deleteSchedule = async (id: string) => {
    setDeletingId(id);
    await supabase
      .from('consultation_schedules')
      .delete()
      .eq('id', id);
    setSchedules(prev => prev.filter(s => s.id !== id));
    setDeletingId(null);
  };

  const addSchedule = async () => {
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setDate(nextRun.getDate() + 1);

    await supabase
      .from('consultation_schedules')
      .insert({
        provider: newSchedule.provider,
        frequency: newSchedule.frequency,
        scheduled_time: newSchedule.time,
        enabled: true,
        next_run: nextRun.toISOString(),
      });

    setShowAddModal(false);
    fetchSchedules();
  };

  const totalApplied = appliedCounts.reduce((sum, a) => sum + a.count, 0);
  const enabledSchedules = schedules.filter(s => s.enabled).length;

  const freqLabel = (f: Frequency) => f.charAt(0).toUpperCase() + f.slice(1);

  const formatNextRun = (date: string | null) => {
    if (!date) return 'Not scheduled';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header with Back */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-600/30">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Cloud Security</p>
                  <h1 className="text-2xl font-bold text-slate-900">Consultation Hub</h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                {enabledSchedules} Active
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                <Bell className="w-4 h-4" />
                {totalApplied} Applied
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-6 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveView('recommendations')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeView === 'recommendations'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Recommendations
            </span>
          </button>
          <button
            onClick={() => setActiveView('templates')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeView === 'templates'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Quick Setup Templates
            </span>
          </button>
          <button
            onClick={() => setActiveView('schedules')}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeView === 'schedules'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Automated Schedules
            </span>
          </button>
        </div>

        {/* Content */}
        {activeView === 'recommendations' && (
          <div className="space-y-5">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-red-500" />
                  <span className="text-xs font-semibold text-slate-500 uppercase">Active Schedules</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">{enabledSchedules}</div>
                <p className="text-xs text-slate-500 mt-1">Running across providers</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-xs font-semibold text-slate-500 uppercase">Applied</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">{totalApplied}</div>
                <p className="text-xs text-slate-500 mt-1">Recommendations accepted</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <span className="text-xs font-semibold text-slate-500 uppercase">Quick Wins</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">8</div>
                <p className="text-xs text-slate-500 mt-1">Low effort, high impact</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-teal-500" />
                  <span className="text-xs font-semibold text-slate-500 uppercase">Coverage</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">3/3</div>
                <p className="text-xs text-emerald-600 mt-1">All providers monitored</p>
              </div>
            </div>

            <CloudRecommendations currentTab={currentTab} />
          </div>
        )}

        {activeView === 'templates' && (
          <div className="space-y-5">
            <QuickSetupTemplates currentTab={currentTab} />
          </div>
        )}

        {activeView === 'schedules' && (
          <div className="space-y-5">
            {/* Schedule Overview */}
            <div className="grid grid-cols-3 gap-5">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Daily Scans</span>
                </div>
                <div className="text-3xl font-bold mb-1">{schedules.filter(s => s.frequency === 'daily' && s.enabled).length}</div>
                <p className="text-sm opacity-80">Automated security checks</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Weekly Reviews</span>
                </div>
                <div className="text-3xl font-bold mb-1">{schedules.filter(s => s.frequency === 'weekly' && s.enabled).length}</div>
                <p className="text-sm opacity-80">Comprehensive audit review</p>
              </div>
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl shadow-lg p-5 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Monthly Audits</span>
                </div>
                <div className="text-3xl font-bold mb-1">{schedules.filter(s => s.frequency === 'monthly' && s.enabled).length}</div>
                <p className="text-sm opacity-80">Full compliance review</p>
              </div>
            </div>

            {/* Schedules List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Automated Schedules</h2>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-sm transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Schedule
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center h-32 text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Loading schedules...
                  </div>
                ) : schedules.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                    <Calendar className="w-8 h-8 mb-2" />
                    <p className="text-sm font-medium">No schedules configured</p>
                    <p className="text-xs mt-1">Add a schedule to start automated security scans</p>
                  </div>
                ) : (
                  schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className={`p-4 rounded-lg border transition-all ${
                        schedule.enabled
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-slate-50/50 border-slate-100 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg border ${
                            schedule.provider === 'aws' ? 'bg-orange-50 border-orange-200' :
                            schedule.provider === 'gcp' ? 'bg-blue-50 border-blue-200' :
                            'bg-sky-50 border-sky-200'
                          }`}>
                            <Shield className={`w-5 h-5 ${
                              schedule.provider === 'aws' ? 'text-orange-600' :
                              schedule.provider === 'gcp' ? 'text-blue-600' :
                              'text-sky-600'
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-slate-900 uppercase">{schedule.provider} Security Scan</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                schedule.frequency === 'daily'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : schedule.frequency === 'weekly'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {freqLabel(schedule.frequency)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {schedule.scheduled_time}
                              </span>
                              {schedule.next_run && (
                                <span className="flex items-center gap-1">
                                  <ArrowRight className="w-3.5 h-3.5" />
                                  Next: {formatNextRun(schedule.next_run)}
                                </span>
                              )}
                              {schedule.last_run && (
                                <span className="flex items-center gap-1 text-slate-400">
                                  Last: {formatNextRun(schedule.last_run)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                            schedule.enabled
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-200 text-slate-500'
                          }`}>
                            {schedule.enabled ? 'Active' : 'Paused'}
                          </div>
                          <button
                            onClick={() => toggleSchedule(schedule.id, schedule.enabled)}
                            disabled={togglingId === schedule.id}
                            className={`p-2 rounded-lg transition-all disabled:opacity-50 ${
                              schedule.enabled
                                ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                            }`}
                            title={schedule.enabled ? 'Pause schedule' : 'Resume schedule'}
                          >
                            {togglingId === schedule.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : schedule.enabled ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteSchedule(schedule.id)}
                            disabled={deletingId === schedule.id}
                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all disabled:opacity-50"
                            title="Delete schedule"
                          >
                            {deletingId === schedule.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Automation Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">About Automated Consultations</h3>
                  <p className="text-sm text-blue-700">
                    Automated schedules run security scans and provide recommendations based on your cloud configuration.
                    Enable daily scans for critical security checks and weekly comprehensive reviews for compliance audits.
                    Results are sent to your notification preferences and can be reviewed in the audit logs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Schedule Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-slate-900">Add Schedule</h2>
                <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cloud Provider</label>
                  <select
                    value={newSchedule.provider}
                    onChange={(e) => setNewSchedule({ ...newSchedule, provider: e.target.value as CloudProvider })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="aws">AWS</option>
                    <option value="gcp">GCP</option>
                    <option value="azure">Azure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                  <select
                    value={newSchedule.frequency}
                    onChange={(e) => setNewSchedule({ ...newSchedule, frequency: e.target.value as Frequency })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time (24h format)</label>
                  <input
                    type="time"
                    value={newSchedule.time}
                    onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={addSchedule}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-sm transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Schedule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
