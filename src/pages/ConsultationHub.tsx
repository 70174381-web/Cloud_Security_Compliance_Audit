import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar, Clock, Users, Zap, Shield, ArrowRight,
  CheckCircle, Bell, Settings, Play, Pause,
  AlertTriangle, TrendingUp, BookOpen, Target
} from 'lucide-react';
import QuickSetupTemplates from '../components/QuickSetupTemplates';
import CloudRecommendations from '../components/CloudRecommendations';

type CloudProvider = 'aws' | 'gcp' | 'azure';

interface ConsultationSchedule {
  id: string;
  provider: CloudProvider;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  enabled: boolean;
  lastRun: string | null;
  nextRun: string | null;
}

const defaultSchedules: ConsultationSchedule[] = [
  { id: '1', provider: 'aws', frequency: 'daily', time: '06:00', enabled: true, lastRun: '2026-05-29 06:00', nextRun: '2026-05-30 06:00' },
  { id: '2', provider: 'gcp', frequency: 'daily', time: '07:00', enabled: true, lastRun: '2026-05-29 07:00', nextRun: '2026-05-30 07:00' },
  { id: '3', provider: 'azure', frequency: 'daily', time: '08:00', enabled: true, lastRun: '2026-05-29 08:00', nextRun: '2026-05-30 08:00' },
  { id: '4', provider: 'aws', frequency: 'weekly', time: '09:00', enabled: true, lastRun: '2026-05-26 09:00', nextRun: '2026-06-02 09:00' },
];

export default function ConsultationHub() {
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'all';
  const [schedules, setSchedules] = useState<ConsultationSchedule[]>(defaultSchedules);
  const [activeView, setActiveView] = useState<'schedules' | 'templates' | 'recommendations'>('recommendations');

  const toggleSchedule = (id: string) => {
    setSchedules(schedules.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-600/30">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Cloud Security</p>
                <h1 className="text-2xl font-bold text-slate-900">Consultation Hub</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                3 Active Consultations
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                <Bell className="w-4 h-4" />
                2 Pending Reviews
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
                  <span className="text-xs font-semibold text-slate-500 uppercase">Critical Issues</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">3</div>
                <p className="text-xs text-slate-500 mt-1">Across all providers</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-xs font-semibold text-slate-500 uppercase">Recommendations Applied</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">12</div>
                <p className="text-xs text-slate-500 mt-1">This month</p>
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
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  <span className="text-xs font-semibold text-slate-500 uppercase">Compliance Score</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">+15%</div>
                <p className="text-xs text-emerald-600 mt-1">vs last month</p>
              </div>
            </div>

            {/* Recommendations Component */}
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
            <div className="grid grid-cols-3 gap-5 mb-5">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Daily Scans</span>
                </div>
                <div className="text-3xl font-bold mb-1">3</div>
                <p className="text-sm opacity-80">Automated security checks</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Weekly Reviews</span>
                </div>
                <div className="text-3xl font-bold mb-1">1</div>
                <p className="text-sm opacity-80">Comprehensive audit review</p>
              </div>
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl shadow-lg p-5 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Consultations</span>
                </div>
                <div className="text-3xl font-bold mb-1">2</div>
                <p className="text-sm opacity-80">Expert reviews scheduled</p>
              </div>
            </div>

            {/* Schedules List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Automated Schedules</h2>
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-sm transition-all flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Add Schedule
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <Shield className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-slate-900 capitalize">{schedule.provider} Security Scan</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              schedule.frequency === 'daily'
                                ? 'bg-emerald-100 text-emerald-700'
                                : schedule.frequency === 'weekly'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {schedule.frequency}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {schedule.time}
                            </span>
                            {schedule.nextRun && (
                              <span className="flex items-center gap-1">
                                <ArrowRight className="w-3.5 h-3.5" />
                                Next: {schedule.nextRun}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                          schedule.enabled
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-500'
                        }`}>
                          {schedule.enabled ? 'Active' : 'Paused'}
                        </div>
                        <button
                          onClick={() => toggleSchedule(schedule.id)}
                          className={`p-2 rounded-lg transition-all ${
                            schedule.enabled
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                          }`}
                        >
                          {schedule.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
      </div>
    </div>
  );
}
