import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, AlertTriangle, CheckCircle2, Clock, ArrowRight, Shield } from 'lucide-react';

interface Remediation {
  id: string;
  category: string;
  title: string;
  priority: 'critical' | 'high' | 'medium';
  provider: string;
  description: string;
  steps: string[];
  estimatedTime: string;
  impact: string;
}

const remediations: Remediation[] = [
  {
    id: '1',
    category: 'IAM',
    title: 'Fix least privilege access on AWS',
    priority: 'high',
    provider: 'aws',
    description: 'Multiple IAM users have overly permissive policies that violate the principle of least privilege.',
    steps: [
      'Run IAM Access Analyzer to identify unused permissions',
      'Review IAM policies attached to users and roles',
      'Create new inline policies with minimal required permissions',
      'Apply new policies and monitor for access issues',
      'Remove old overly permissive policies',
      'Document policy changes for audit trail'
    ],
    estimatedTime: '4-6 hours',
    impact: 'Reduces attack surface by limiting potential damage from compromised credentials'
  },
  {
    id: '2',
    category: 'IAM',
    title: 'Enable password rotation policy on GCP',
    priority: 'high',
    provider: 'gcp',
    description: 'Password rotation policy is not enforced, creating compliance risk.',
    steps: [
      'Navigate to GCP Console > IAM & Admin > Settings',
      'Enable password policy enforcement',
      'Set rotation period to 90 days maximum',
      'Configure notification for expiring passwords',
      'Force immediate rotation for all admin accounts',
      'Update service account key management procedures'
    ],
    estimatedTime: '2-3 hours',
    impact: 'Ensures compliance with security best practices and reduces credential theft risk'
  },
  {
    id: '3',
    category: 'IAM',
    title: 'Rotate AWS access keys exceeding 90 days',
    priority: 'critical',
    provider: 'aws',
    description: 'Access keys have not been rotated, violating security policy.',
    steps: [
      'List all access keys older than 90 days via AWS CLI',
      'Generate new access keys for each affected user',
      'Update application configurations with new keys',
      'Test application functionality with new credentials',
      'Disable old access keys after validation',
      'Delete old keys after 24-hour monitoring period'
    ],
    estimatedTime: '3-4 hours',
    impact: 'Prevents long-term credential exposure and limits impact of potential key leaks'
  },
  {
    id: '4',
    category: 'IAM',
    title: 'Configure GCP cross-account boundaries',
    priority: 'medium',
    provider: 'gcp',
    description: 'Service accounts lack proper project-scoped permissions.',
    steps: [
      'Audit current service account permissions across projects',
      'Define organization policy constraints',
      'Create custom roles with project-scoped access',
      'Apply IAM deny policies for cross-project access',
      'Update service account bindings',
      'Test and validate boundary enforcement'
    ],
    estimatedTime: '5-7 hours',
    impact: 'Prevents lateral movement between projects and data exfiltration'
  },
  {
    id: '5',
    category: 'IAM',
    title: 'Scope service account permissions on GCP',
    priority: 'high',
    provider: 'gcp',
    description: 'Service accounts have owner-level permissions, violating least privilege.',
    steps: [
      'Identify all service accounts with Owner role',
      'Create custom roles with specific required permissions',
      'Remove Owner role from service accounts',
      'Assign new scoped custom roles',
      'Monitor application logs for permission errors',
      'Fine-tune permissions based on actual usage'
    ],
    estimatedTime: '4-5 hours',
    impact: 'Critical - reduces blast radius of compromised service accounts'
  },
  {
    id: '6',
    category: 'IAM',
    title: 'Address Azure service account scoping warnings',
    priority: 'medium',
    provider: 'azure',
    description: 'Service principals have broad subscription-level access.',
    steps: [
      'Review Azure RBAC assignments for service principals',
      'Create custom Azure roles with limited scope',
      'Assign roles at resource group level instead of subscription',
      'Implement Azure Policy for service principal governance',
      'Update authentication flows with new scopes',
      'Document service principal usage and access patterns'
    ],
    estimatedTime: '3-4 hours',
    impact: 'Improves resource isolation and compliance posture'
  }
];

const priorityConfig: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  high: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  medium: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
};

export default function RemediationSteps() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'all';

  const filtered = tab === 'all' ? remediations : remediations.filter(r => r.provider === tab);

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
              <h1 className="text-3xl font-bold text-slate-900 mb-2">IAM Remediation Steps</h1>
              <p className="text-slate-600">Step-by-step guidance to resolve IAM compliance issues across your cloud infrastructure</p>
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
            <p className="text-2xl font-bold text-slate-900">1</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-slate-500" />
              <span className="text-sm text-slate-600">Est. Total Time</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">21-29 hrs</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm text-slate-600">Recommended Order</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">6 steps</p>
          </div>
        </div>

        {/* Remediation Cards */}
        <div className="space-y-4">
          {filtered.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${priorityConfig[item.priority].bg} ${priorityConfig[item.priority].text}`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${priorityConfig[item.priority].bg} ${priorityConfig[item.priority].text}`}>
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

        {/* Footer CTA */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Need hands-on assistance?</h3>
              <p className="text-blue-100">Our cloud security experts can help implement these remediations for you.</p>
            </div>
            <button className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-md">
              Schedule Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
