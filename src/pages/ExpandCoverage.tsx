import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Database, MapPin, AlertTriangle, CheckCircle2, Clock, Globe, RefreshCw } from 'lucide-react';

const regionData = [
  {
    provider: 'aws',
    providerName: 'Amazon Web Services',
    regions: [
      { code: 'us-east-1', name: 'US East (N. Virginia)', active: true, primary: true, rto: '< 1 hour', rpo: '< 15 min' },
      { code: 'us-west-2', name: 'US West (Oregon)', active: true, primary: false, rto: '< 1 hour', rpo: '< 15 min' },
      { code: 'eu-west-1', name: 'EU (Ireland)', active: true, primary: false, rto: '< 2 hours', rpo: '< 30 min' },
      { code: 'ap-southeast-1', name: 'Asia Pacific (Singapore)', active: false, primary: false, rto: 'N/A', rpo: 'N/A' },
      { code: 'ap-northeast-1', name: 'Asia Pacific (Tokyo)', active: false, primary: false, rto: 'N/A', rpo: 'N/A' },
    ],
  },
  {
    provider: 'gcp',
    providerName: 'Google Cloud Platform',
    regions: [
      { code: 'us-central1', name: 'US Central (Iowa)', active: true, primary: false, rto: '< 1 hour', rpo: '< 15 min' },
      { code: 'europe-west1', name: 'Europe West (Belgium)', active: false, primary: false, rto: 'N/A', rpo: 'N/A' },
      { code: 'asia-southeast1', name: 'Asia Southeast (Taiwan)', active: false, primary: false, rto: 'N/A', rpo: 'N/A' },
    ],
  },
  {
    provider: 'azure',
    providerName: 'Microsoft Azure',
    regions: [
      { code: 'eastus', name: 'East US', active: true, primary: false, rto: '< 1 hour', rpo: '< 15 min' },
      { code: 'westeurope', name: 'West Europe', active: true, primary: false, rto: '< 1 hour', rpo: '< 15 min' },
      { code: 'southeastasia', name: 'Southeast Asia', active: true, primary: false, rto: '< 2 hours', rpo: '< 30 min' },
    ],
  },
];

export default function ExpandCoverage() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'all';
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  const toggleRegion = (code: string) => {
    setSelectedRegions(prev =>
      prev.includes(code) ? prev.filter(r => r !== code) : [...prev, code]
    );
  };

  const inactiveCount = regionData.reduce((sum, p) => sum + p.regions.filter(r => !r.active).length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={`/${tab !== 'all' ? `?tab=${tab}` : ''}`} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg shadow-cyan-500/30">
              <Database className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Multi-Region Backup Coverage</h1>
              <p className="text-slate-600">Design and implement geographic redundancy for disaster recovery</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-5 h-5 text-cyan-500" />
              <span className="text-sm text-slate-600">Total Regions</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">11</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-sm text-slate-600">Active</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">7</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-slate-600">Uncovered</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{inactiveCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-slate-500" />
              <span className="text-sm text-slate-600">Avg RTO</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">1.5 hrs</p>
          </div>
        </div>

        {/* Region Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {regionData.map(provider => (
            <div key={provider.provider} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
                <h3 className="text-lg font-bold text-white">{provider.providerName}</h3>
                <p className="text-xs text-slate-400">{provider.regions.filter(r => r.active).length}/{provider.regions.length} regions active</p>
              </div>
              <div className="p-4 space-y-3">
                {provider.regions.map(region => (
                  <div
                    key={region.code}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      region.active
                        ? 'border-emerald-200 bg-emerald-50'
                        : selectedRegions.includes(region.code)
                          ? 'border-cyan-300 bg-cyan-50'
                          : 'border-slate-200 hover:border-cyan-300'
                    }`}
                    onClick={() => !region.active && toggleRegion(region.code)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                          region.active ? 'bg-emerald-500' : 'bg-slate-300'
                        }`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-slate-900">{region.name}</p>
                            {region.primary && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                                PRIMARY
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{region.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">RTO</p>
                        <p className="text-sm font-semibold text-slate-900">{region.rto}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Activation Steps */}
        {selectedRegions.length > 0 && (
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-xl p-6 shadow-lg shadow-cyan-500/20 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Activate {selectedRegions.length} Region(s)</h3>
              <button onClick={() => setSelectedRegions([])} className="text-cyan-200 hover:text-white text-sm">
                Clear selection
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {selectedRegions.map(code => {
                const region = regionData.flatMap(p => p.regions).find(r => r.code === code);
                return (
                  <div key={code} className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                    <MapPin className="w-4 h-4 text-white" />
                    <span className="text-sm text-white font-medium">{region?.name}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button className="px-5 py-2.5 bg-white text-cyan-700 font-semibold rounded-lg hover:bg-cyan-50 transition-colors">
                Configure Replication
              </button>
              <button className="px-5 py-2.5 border border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                Estimate Costs
              </button>
            </div>
          </div>
        )}

        {/* Strategy Guide */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-slate-600" />
            Multi-Region Backup Strategy Guide
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">RTO (Recovery Time Objective)</h4>
              <p className="text-sm text-slate-600">Target maximum downtime. AWS Cross-Region Replication achieves RTO of &lt; 1 hour with automated failover.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">RPO (Recovery Point Objective)</h4>
              <p className="text-sm text-slate-600">Maximum data loss tolerance. Synchronous replication achieves RPO near zero; async achieves RPO of minutes.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Replication Types</h4>
              <p className="text-sm text-slate-600">AWS: S3 Cross-Region, DynamoDB Global Tables, RDS Read Replicas. GCP: Cross-Region Buckets. Azure: Geo-Redundant Storage.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Cost Considerations</h4>
              <p className="text-sm text-slate-600">Cross-region data transfer costs apply. Estimate $0.02/GB for inter-region transfer. Use lifecycle policies to minimize storage costs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
