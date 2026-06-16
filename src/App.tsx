import { BrowserRouter, Routes, Route, useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { Shield, Activity, Calendar, LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';
import { AuthProvider, useAuth } from './lib/auth';
import MetricsGrid from './components/MetricsGrid';
import ComplianceTrend from './components/ComplianceTrend';
import FindingsSeverity from './components/FindingsSeverity';
import IAMComplianceTable from './components/IAMComplianceTable';
import WAFRuleStatus from './components/WAFRuleStatus';
import BackupRegions from './components/BackupRegions';
import SecurityFindings from './components/SecurityFindings';
import AuditLogs from './components/AuditLogs';

const AuthPage = lazy(() => import('./pages/AuthPage'));
const RemediationSteps = lazy(() => import('./pages/RemediationSteps'));
const ConfigureWAF = lazy(() => import('./pages/ConfigureWAF'));
const ExpandCoverage = lazy(() => import('./pages/ExpandCoverage'));
const AuditReport = lazy(() => import('./pages/AuditReport'));
const ConsultationHub = lazy(() => import('./pages/ConsultationHub'));

type Cloud = 'all' | 'aws' | 'gcp' | 'azure';
type Severity = '' | 'critical' | 'high' | 'medium' | 'low';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-slate-600">Loading...</div></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function Dashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const currentTab = (searchParams.get('tab') || 'all') as Cloud;
  const providerFilter = (searchParams.get('provider') || '') as Cloud;
  const severityFilter = (searchParams.get('severity') || '') as Severity;

  const [findings, setFindings] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [iamPolicies, setIamPolicies] = useState<any[]>([]);
  const [wafRules, setWafRules] = useState<any[]>([]);
  const [backupRegions, setBackupRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [metrics] = useState({
    all: { sc: 74, cr: 3, ia: 79, wf: 18, bk: '7/11' },
    aws: { sc: 74, cr: 2, ia: 82, wf: 12, bk: '3/5' },
    gcp: { sc: 68, cr: 1, ia: 71, wf: 4, bk: '1/3' },
    azure: { sc: 79, cr: 0, ia: 85, wf: 8, bk: '3/3' },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: findingsData } = await supabase
          .from('security_findings')
          .select('*, cloud_providers(slug)')
          .order('created_at', { ascending: false });
        setFindings(findingsData || []);

        const { data: iamData } = await supabase
          .from('iam_policies')
          .select('*, cloud_providers(slug)')
          .order('policy_name');
        setIamPolicies(iamData || []);

        const { data: wafData } = await supabase
          .from('waf_rules')
          .select('*, cloud_providers(slug)')
          .order('rule_name');
        setWafRules(wafData || []);

        const { data: backupData } = await supabase
          .from('backup_regions')
          .select('*, cloud_providers(slug)')
          .order('region_name');
        setBackupRegions(backupData || []);

        const { data: logsData } = await supabase
          .from('audit_logs')
          .select('*, cloud_providers(slug)')
          .order('log_time', { ascending: false })
          .limit(7);
        setLogs(logsData || []);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const setTab = (tab: Cloud) => {
    const params = new URLSearchParams(searchParams);
    if (tab === 'all') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    navigate(`/?${params.toString()}`);
  };

  const setFilters = (severity: string, provider: string) => {
    const params = new URLSearchParams(searchParams);
    if (severity) params.set('severity', severity);
    else params.delete('severity');
    if (provider) params.set('provider', provider);
    else params.delete('provider');
    navigate(`/?${params.toString()}`);
  };

  const currentMetrics = metrics[currentTab as keyof typeof metrics];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-600/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Cloud Security Audit</p>
              <h1 className="text-2xl font-bold text-slate-900">Internee.pk Security Compliance</h1>
            </div>
          </div>
          <div className="text-right flex items-center gap-3">
            <button
              onClick={() => navigate('/consultation')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-md shadow-sm shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              Consultation
            </button>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-semibold rounded-md shadow-sm shadow-emerald-500/30">
                <Activity className="w-3.5 h-3.5" />
                Live scan
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 truncate max-w-[160px]" title={user?.email}>{user?.email}</span>
              <button
                onClick={signOut}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-all"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg mb-6 w-fit">
          {(['all', 'aws', 'gcp', 'azure'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                currentTab === tab
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'all' ? 'All clouds' : tab.toUpperCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-slate-200">
            <div className="text-slate-500">Loading audit data...</div>
          </div>
        ) : (
          <>
            <MetricsGrid metrics={currentMetrics} />
            <div className="grid grid-cols-3 gap-5 mb-5">
              <div className="col-span-2">
                <ComplianceTrend />
              </div>
              <div>
                <FindingsSeverity findings={findings} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-5 mb-5">
              <IAMComplianceTable
                iamPolicies={iamPolicies}
                currentTab={currentTab}
                onRemediation={() => navigate(`/remediation?tab=${currentTab}`)}
              />
              <WAFRuleStatus
                wafRules={wafRules}
                currentTab={currentTab}
                onConfigure={() => navigate(`/waf?tab=${currentTab}`)}
              />
              <BackupRegions
                backupRegions={backupRegions}
                currentTab={currentTab}
                onExpand={() => navigate(`/coverage?tab=${currentTab}`)}
              />
            </div>
            <div className="mb-5">
              <SecurityFindings
                findings={findings}
                severityFilter={severityFilter}
                providerFilter={providerFilter}
                currentTab={currentTab}
                onFilter={setFilters}
                onGenerateReport={() => navigate(`/report?tab=${currentTab}`)}
              />
            </div>
            <div>
              <AuditLogs logs={logs} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-slate-600">Loading...</div></div>;
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    }>
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/remediation" element={<RequireAuth><RemediationSteps /></RequireAuth>} />
        <Route path="/waf" element={<RequireAuth><ConfigureWAF /></RequireAuth>} />
        <Route path="/coverage" element={<RequireAuth><ExpandCoverage /></RequireAuth>} />
        <Route path="/report" element={<RequireAuth><AuditReport /></RequireAuth>} />
        <Route path="/consultation" element={<RequireAuth><ConsultationHub /></RequireAuth>} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
