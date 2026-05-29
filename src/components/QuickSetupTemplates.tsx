import { useState } from 'react';
import { Cloud, Shield, CheckCircle, AlertTriangle, Copy, Download, Play, Clock } from 'lucide-react';

type CloudProvider = 'aws' | 'gcp' | 'azure';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'critical' | 'high' | 'medium';
  estimatedTime: string;
  automated: boolean;
  steps: string[];
  code?: string;
}

const templates: Record<CloudProvider, Template[]> = {
  aws: [
    {
      id: 'aws-iam-1',
      name: 'IAM Root Account Security',
      description: 'Secure your AWS root account with MFA and remove access keys',
      category: 'IAM Security',
      severity: 'critical',
      estimatedTime: '15 min',
      automated: true,
      steps: [
        'Enable MFA on root account',
        'Delete root access keys',
        'Create IAM admin user',
        'Enable AWS CloudTrail',
        'Set up billing alerts'
      ],
      code: `# AWS CLI Commands
aws iam enable-mfa-device --user-name root
aws iam delete-access-key --access-key-id AKIAXXXXX
aws iam create-user --user-name admin-user
aws cloudtrail create-trail --name security-trail`
    },
    {
      id: 'aws-s3-1',
      name: 'S3 Bucket Encryption',
      description: 'Enable server-side encryption for all S3 buckets',
      category: 'Data Protection',
      severity: 'high',
      estimatedTime: '10 min',
      automated: true,
      steps: [
        'Enable default encryption',
        'Block public access',
        'Enable versioning',
        'Setup lifecycle policies'
      ],
      code: `aws s3api put-bucket-encryption \\
  --bucket my-bucket \\
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'`
    },
    {
      id: 'aws-vpc-1',
      name: 'VPC Flow Logs',
      description: 'Enable VPC Flow Logs for network monitoring',
      category: 'Network Security',
      severity: 'high',
      estimatedTime: '20 min',
      automated: true,
      steps: [
        'Create IAM role for flow logs',
        'Create CloudWatch Log Group',
        'Enable flow logs on VPC',
        'Set up log analysis'
      ]
    },
    {
      id: 'aws-guardduty-1',
      name: 'GuardDuty Activation',
      description: 'Enable AWS GuardDuty for threat detection',
      category: 'Threat Detection',
      severity: 'medium',
      estimatedTime: '30 min',
      automated: true,
      steps: [
        'Enable GuardDuty',
        'Configure findings export',
        'Set up alerting',
        'Integrate with Security Hub'
      ]
    }
  ],
  gcp: [
    {
      id: 'gcp-iam-1',
      name: 'Organization Policy Constraints',
      description: 'Set up organization-level security constraints',
      category: 'IAM Security',
      severity: 'critical',
      estimatedTime: '20 min',
      automated: true,
      steps: [
        'Enable VPC Service Controls',
        'Set org policies for IAM',
        'Enforce MFA for all users',
        'Configure audit logging',
        'Set up resource hierarchy'
      ],
      code: `# gcloud commands
gcloud resource-manager org-policies enable-enforce \\
  --organization=ORGANIZATION_ID \\
  constraints/compute.requireOsLogin`
    },
    {
      id: 'gcp-bucket-1',
      name: 'Cloud Storage Security',
      description: 'Secure Cloud Storage buckets with IAM and encryption',
      category: 'Data Protection',
      severity: 'high',
      estimatedTime: '15 min',
      automated: true,
      steps: [
        'Enable uniform bucket-level access',
        'Disable public access',
        'Enable CMEK encryption',
        'Set up object versioning'
      ],
      code: `gsutil uniformbucketlevelaccess set on gs://my-bucket
gsutil encryption set -k projects/my-project/locations/global/keyRings/my-ring/cryptoKeys/my-key gs://my-bucket`
    },
    {
      id: 'gcp-scc-1',
      name: 'Security Command Center',
      description: 'Configure Security Command Center for continuous monitoring',
      category: 'Threat Detection',
      severity: 'high',
      estimatedTime: '45 min',
      automated: true,
      steps: [
        'Enable Security Command Center Premium',
        'Configure asset discovery',
        'Enable threat detection',
        'Set up alerting'
      ]
    }
  ],
  azure: [
    {
      id: 'azure-sub-1',
      name: 'Subscription Security',
      description: 'Secure Azure subscription with Microsoft Defender',
      category: 'Subscription Security',
      severity: 'critical',
      estimatedTime: '25 min',
      automated: true,
      steps: [
        'Enable Microsoft Defender for Cloud',
        'Configure security alerts',
        'Enable automatic provisioning',
        'Set up security contacts'
      ],
      code: `# Azure CLI
az security auto-provisioning-setting update \\
  --auto-provision On`
    },
    {
      id: 'azure-storage-1',
      name: 'Storage Account Encryption',
      description: 'Enable encryption and secure transfer for storage accounts',
      category: 'Data Protection',
      severity: 'high',
      estimatedTime: '15 min',
      automated: true,
      steps: [
        'Enable storage encryption',
        'Enforce HTTPS only',
        'Enable soft delete',
        'Configure firewall rules'
      ],
      code: `az storage account update \\
  --name mystorageaccount \\
  --https-only true \\
  --min-tls-version TLS1_2`
    },
    {
      id: 'azure-nsgr-1',
      name: 'NSG Flow Logs',
      description: 'Enable Network Security Group flow logs',
      category: 'Network Security',
      severity: 'high',
      estimatedTime: '20 min',
      automated: true,
      steps: [
        'Create Network Watcher',
        'Enable NSG flow logs',
        'Configure retention period',
        'Set up traffic analysis'
      ]
    }
  ]
};

export default function QuickSetupTemplates({ currentTab }: { currentTab: string }) {
  const [selectedCloud, setSelectedCloud] = useState<CloudProvider>('aws');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [appliedTemplates, setAppliedTemplates] = useState<string[]>([]);

  const clouds: CloudProvider[] = ['aws', 'gcp', 'azure'];

  const currentTemplates = templates[selectedCloud];

  const handleApply = (templateId: string) => {
    setAppliedTemplates([...appliedTemplates, templateId]);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
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
            <span>{currentTemplates.length} templates</span>
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
                setSelectedTemplate(null);
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

      {/* Content */}
      <div className="flex h-[420px]">
        {/* Template List */}
        <div className="w-1/2 border-r border-slate-200 overflow-y-auto p-4">
          <div className="space-y-2">
            {currentTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                } ${appliedTemplates.includes(template.id) ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-slate-900">{template.name}</h3>
                      {appliedTemplates.includes(template.id) && (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        template.severity === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : template.severity === 'high'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {template.severity}
                      </span>
                      <span className="text-xs text-slate-500">{template.estimatedTime}</span>
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
            ))}
          </div>
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
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-3">
                <h4 className="text-xs font-semibold text-slate-700 uppercase mb-2">Implementation Steps</h4>
                <ol className="space-y-2">
                  {selectedTemplate.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-slate-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {selectedTemplate.code && (
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-800">
                    <span className="text-xs text-gray-400 font-mono">CLI Commands</span>
                    <button
                      onClick={() => copyCode(selectedTemplate.code!)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <pre className="p-3 text-xs text-gray-300 font-mono overflow-x-auto">
                    {selectedTemplate.code}
                  </pre>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleApply(selectedTemplate.id)}
                  disabled={appliedTemplates.includes(selectedTemplate.id)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    appliedTemplates.includes(selectedTemplate.id)
                      ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm'
                  }`}
                >
                  {appliedTemplates.includes(selectedTemplate.id) ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Applied
                    </span>
                  ) : (
                    'Apply Template'
                  )}
                </button>
                <button className="py-2 px-4 rounded-lg text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all">
                  <Download className="w-4 h-4" />
                </button>
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
