import { useState } from 'react';
import { Shield, ArrowRight, CheckCircle, AlertTriangle, Info, ChevronDown, ChevronUp, Zap, Clock, TrendingUp } from 'lucide-react';

type CloudProvider = 'aws' | 'gcp' | 'azure';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
  effort: 'low' | 'medium' | 'high';
  category: string;
  related_findings: number;
  details: string[];
}

const recommendations: Record<CloudProvider, Recommendation[]> = {
  aws: [
    {
      id: 'rec-aws-1',
      title: 'Implement S3 Block Public Access',
      description: 'Enable S3 Block Public Access at the account level to prevent data exposure',
      severity: 'critical',
      impact: 'Prevents 100% of S3-related data breaches',
      effort: 'low',
      category: 'Data Protection',
      related_findings: 3,
      details: [
        'Block public access at account level',
        'Review existing public buckets',
        'Update IAM policies to deny public access',
        'Monitor with AWS Config rules'
      ]
    },
    {
      id: 'rec-aws-2',
      title: 'Enable AWS Config with Security Rules',
      description: 'Activate AWS Config with security-focused rules for continuous compliance monitoring',
      severity: 'high',
      impact: 'Improves compliance visibility by 85%',
      effort: 'medium',
      category: 'Compliance',
      related_findings: 2,
      details: [
        'Enable AWS Config in all regions',
        'Activate security config rules',
        'Set up SNS notifications',
        'Create remediation rules'
      ]
    },
    {
      id: 'rec-aws-3',
      title: 'Implement Least Privilege IAM Policies',
      description: 'Review and restrict IAM policies to minimum required permissions',
      severity: 'high',
      impact: 'Reduces attack surface by 60%',
      effort: 'high',
      category: 'IAM Security',
      related_findings: 5,
      details: [
        'Audit current IAM policies',
        'Use IAM Access Analyzer',
        'Implement permission boundaries',
        'Enable MFA for all users',
        'Remove unused credentials'
      ]
    },
    {
      id: 'rec-aws-4',
      title: 'Enable CloudTrail in All Regions',
      description: 'Ensure comprehensive audit logging across all AWS regions',
      severity: 'critical',
      impact: 'Improves incident response time by 70%',
      effort: 'low',
      category: 'Audit & Logging',
      related_findings: 1,
      details: [
        'Enable CloudTrail in all regions',
        'Enable log file validation',
        'Encrypt logs with KMS',
        'Integrate with CloudWatch Logs',
        'Set up log retention policies'
      ]
    }
  ],
  gcp: [
    {
      id: 'rec-gcp-1',
      title: 'Enforce VPC Service Controls',
      description: 'Create security perimeters to prevent data exfiltration',
      severity: 'critical',
      impact: 'Prevents data exfiltration by 95%',
      effort: 'high',
      category: 'Data Protection',
      related_findings: 4,
      details: [
        'Design security perimeters',
        'Configure ingress/egress rules',
        'Enable VPC SC in all projects',
        'Set up access levels',
        'Monitor violations'
      ]
    },
    {
      id: 'rec-gcp-2',
      title: 'Enable Organization-Level Logging',
      description: 'Configure organization-wide logging for all GCP resources',
      severity: 'high',
      impact: 'Increases audit coverage to 100%',
      effort: 'medium',
      category: 'Audit & Logging',
      related_findings: 2,
      details: [
        'Enable audit logs at org level',
        'Configure log sinks',
        'Set up log retention',
        'Integrate with SIEM',
        'Enable data access logs'
      ]
    },
    {
      id: 'rec-gcp-3',
      title: 'Implement Binary Authorization',
      description: 'Enforce container deployment policies for GKE and Cloud Run',
      severity: 'medium',
      impact: 'Prevents 80% of container-based threats',
      effort: 'medium',
      category: 'Container Security',
      related_findings: 1,
      details: [
        'Enable Binary Authorization API',
        'Create attestations policies',
        'Configure deployers',
        'Set up KMS for signing',
        'Update GKE clusters'
      ]
    }
  ],
  azure: [
    {
      id: 'rec-azure-1',
      title: 'Enable Microsoft Defender for Cloud',
      description: 'Activate Defender for comprehensive threat protection across all resources',
      severity: 'critical',
      impact: 'Detects 90% of threats within 24 hours',
      effort: 'low',
      category: 'Threat Detection',
      related_findings: 3,
      details: [
        'Enable Defender for all resource types',
        'Configure alert emails',
        'Enable auto-provisioning',
        'Set up security alerts',
        'Integrate with SIEM'
      ]
    },
    {
      id: 'rec-azure-2',
      title: 'Implement Azure Policy for Security',
      description: 'Deploy built-in security policies to enforce compliance automatically',
      severity: 'high',
      impact: 'Ensures 100% policy compliance',
      effort: 'medium',
      category: 'Compliance',
      related_findings: 2,
      details: [
        'Assign security baseline policies',
        'Enable guest configuration',
        'Create custom policies',
        'Set up remediation tasks',
        'Configure exemption handling'
      ]
    },
    {
      id: 'rec-azure-3',
      title: 'Configure Private Endpoints for PaaS Services',
      description: 'Use private endpoints to eliminate public internet exposure',
      severity: 'high',
      impact: 'Reduces attack surface by 75%',
      effort: 'high',
      category: 'Network Security',
      related_findings: 4,
      details: [
        'Enable private endpoints for storage',
        'Configure for SQL databases',
        'Setup private DNS zones',
        'Disable public access',
        'Update network security groups'
      ]
    }
  ]
};

export default function CloudRecommendations({ currentTab }: { currentTab: string }) {
  const [selectedCloud, setSelectedCloud] = useState<CloudProvider>('aws');
  const [expandedRec, setExpandedRec] = useState<string | null>(null);
  const [acceptedRecs, setAcceptedRecs] = useState<string[]>([]);

  const clouds: CloudProvider[] = ['aws', 'gcp', 'azure'];

  const currentRecs = recommendations[selectedCloud];

  const handleAccept = (recId: string) => {
    setAcceptedRecs([...acceptedRecs, recId]);
  };

  const severityColors = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-blue-100 text-blue-700 border-blue-200'
  };

  const effortColors = {
    low: 'text-emerald-600 bg-emerald-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-red-600 bg-red-50'
  };

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
            <div className="text-sm">
              <span className="text-emerald-600 font-semibold">{acceptedRecs.length}</span>
              <span className="text-slate-500 ml-1">accepted</span>
            </div>
            <div className="text-sm">
              <span className="text-blue-600 font-semibold">{currentRecs.length}</span>
              <span className="text-slate-500 ml-1">recommendations</span>
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
              onClick={() => {
                setSelectedCloud(cloud);
                setExpandedRec(null);
              }}
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
        {currentRecs.map((rec) => (
          <div
            key={rec.id}
            className={`rounded-lg border transition-all ${
              expandedRec === rec.id
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-200 hover:border-slate-300'
            } ${acceptedRecs.includes(rec.id) ? 'opacity-60' : ''}`}
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
                    {acceptedRecs.includes(rec.id) && (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{rec.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${severityColors[rec.severity]}`}>
                      {rec.severity}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${effortColors[rec.effort]}`}>
                      {rec.effort} effort
                    </span>
                    <span className="text-xs text-slate-500">{rec.related_findings} related findings</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {expandedRec !== rec.id && !acceptedRecs.includes(rec.id) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAccept(rec.id);
                      }}
                      className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-medium rounded-md hover:from-emerald-600 hover:to-emerald-700 shadow-sm transition-all"
                    >
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
                      <span className="text-xs font-semibold text-slate-700">IMPACT</span>
                    </div>
                    <p className="text-sm text-slate-600 pl-6">{rec.impact}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-semibold text-slate-700">IMPLEMENTATION STEPS</span>
                    </div>
                    <ul className="space-y-1 pl-6">
                      {rec.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="w-4 h-4 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleAccept(rec.id)}
                      disabled={acceptedRecs.includes(rec.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                        acceptedRecs.includes(rec.id)
                          ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm'
                      }`}
                    >
                      {acceptedRecs.includes(rec.id) ? (
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
        ))}
      </div>
    </div>
  );
}
