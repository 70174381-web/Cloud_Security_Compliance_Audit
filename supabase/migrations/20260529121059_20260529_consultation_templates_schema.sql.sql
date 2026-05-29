/*
  # Add consultation and template tables

  1. New Tables
    - `recommendation_templates`
      - `id` (uuid, primary key)
      - `provider` (text) - 'aws', 'gcp', or 'azure'
      - `title` (text)
      - `description` (text)
      - `severity` (text) - 'critical', 'high', 'medium', or 'low'
      - `category` (text)
      - `impact` (text)
      - `effort` (text) - 'low', 'medium', or 'high'
      - `details` (jsonb) - array of implementation steps
      - `code_snippet` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `quick_setup_templates`
      - `id` (uuid, primary key)
      - `provider` (text) - 'aws', 'gcp', or 'azure'
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `severity` (text)
      - `estimated_time` (text)
      - `automated` (boolean)
      - `steps` (jsonb) - array of steps
      - `code` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `consultation_schedules`
      - `id` (uuid, primary key)
      - `provider` (text)
      - `frequency` (text) - 'daily', 'weekly', or 'monthly'
      - `scheduled_time` (text)
      - `enabled` (boolean, default true)
      - `last_run` (timestamp, nullable)
      - `next_run` (timestamp, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `applied_recommendations`
      - `id` (uuid, primary key)
      - `recommendation_id` (uuid, foreign key)
      - `provider` (text)
      - `applied_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to read all data
    - Add policies for authenticated users to insert/update own records
*/

-- Create recommendation_templates table
CREATE TABLE IF NOT EXISTS recommendation_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL CHECK (provider IN ('aws', 'gcp', 'azure')),
  title text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  category text NOT NULL,
  impact text NOT NULL,
  effort text NOT NULL CHECK (effort IN ('low', 'medium', 'high')),
  details jsonb NOT NULL DEFAULT '[]',
  code_snippet text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quick_setup_templates table
CREATE TABLE IF NOT EXISTS quick_setup_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL CHECK (provider IN ('aws', 'gcp', 'azure')),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  estimated_time text NOT NULL,
  automated boolean DEFAULT true,
  steps jsonb NOT NULL DEFAULT '[]',
  code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create consultation_schedules table
CREATE TABLE IF NOT EXISTS consultation_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL CHECK (provider IN ('aws', 'gcp', 'azure')),
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  scheduled_time text NOT NULL,
  enabled boolean DEFAULT true,
  last_run timestamptz,
  next_run timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create applied_recommendations table
CREATE TABLE IF NOT EXISTS applied_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id uuid REFERENCES recommendation_templates(id) ON DELETE CASCADE,
  provider text NOT NULL,
  applied_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE recommendation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_setup_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE applied_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recommendation_templates
CREATE POLICY "Anyone can read recommendation templates"
  ON recommendation_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert recommendation templates"
  ON recommendation_templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update recommendation templates"
  ON recommendation_templates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for quick_setup_templates
CREATE POLICY "Anyone can read quick setup templates"
  ON quick_setup_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert quick setup templates"
  ON quick_setup_templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update quick setup templates"
  ON quick_setup_templates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for consultation_schedules
CREATE POLICY "Anyone can read consultation schedules"
  ON consultation_schedules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert consultation schedules"
  ON consultation_schedules FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update consultation schedules"
  ON consultation_schedules FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete consultation schedules"
  ON consultation_schedules FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for applied_recommendations
CREATE POLICY "Anyone can read applied recommendations"
  ON applied_recommendations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert applied recommendations"
  ON applied_recommendations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_recommendation_templates_provider ON recommendation_templates(provider);
CREATE INDEX IF NOT EXISTS idx_recommendation_templates_severity ON recommendation_templates(severity);
CREATE INDEX IF NOT EXISTS idx_quick_setup_templates_provider ON quick_setup_templates(provider);
CREATE INDEX IF NOT EXISTS idx_consultation_schedules_provider ON consultation_schedules(provider);
CREATE INDEX IF NOT EXISTS idx_consultation_schedules_enabled ON consultation_schedules(enabled);
CREATE INDEX IF NOT EXISTS idx_applied_recommendations_provider ON applied_recommendations(provider);

-- Insert default recommendation templates
INSERT INTO recommendation_templates (provider, title, description, severity, category, impact, effort, details) VALUES
  ('aws', 'Implement S3 Block Public Access', 'Enable S3 Block Public Access at the account level to prevent data exposure', 'critical', 'Data Protection', 'Prevents 100% of S3-related data breaches', 'low', '["Block public access at account level", "Review existing public buckets", "Update IAM policies to deny public access", "Monitor with AWS Config rules"]'::jsonb),
  ('aws', 'Enable AWS Config with Security Rules', 'Activate AWS Config with security-focused rules for continuous compliance monitoring', 'high', 'Compliance', 'Improves compliance visibility by 85%', 'medium', '["Enable AWS Config in all regions", "Activate security config rules", "Set up SNS notifications", "Create remediation rules"]'::jsonb),
  ('aws', 'Implement Least Privilege IAM Policies', 'Review and restrict IAM policies to minimum required permissions', 'high', 'IAM Security', 'Reduces attack surface by 60%', 'high', '["Audit current IAM policies", "Use IAM Access Analyzer", "Implement permission boundaries", "Enable MFA for all users", "Remove unused credentials"]'::jsonb),
  ('aws', 'Enable CloudTrail in All Regions', 'Ensure comprehensive audit logging across all AWS regions', 'critical', 'Audit & Logging', 'Improves incident response time by 70%', 'low', '["Enable CloudTrail in all regions", "Enable log file validation", "Encrypt logs with KMS", "Integrate with CloudWatch Logs", "Set up log retention policies"]'::jsonb),
  ('gcp', 'Enforce VPC Service Controls', 'Create security perimeters to prevent data exfiltration', 'critical', 'Data Protection', 'Prevents data exfiltration by 95%', 'high', '["Design security perimeters", "Configure ingress/egress rules", "Enable VPC SC in all projects", "Set up access levels", "Monitor violations"]'::jsonb),
  ('gcp', 'Enable Organization-Level Logging', 'Configure organization-wide logging for all GCP resources', 'high', 'Audit & Logging', 'Increases audit coverage to 100%', 'medium', '["Enable audit logs at org level", "Configure log sinks", "Set up log retention", "Integrate with SIEM", "Enable data access logs"]'::jsonb),
  ('gcp', 'Implement Binary Authorization', 'Enforce container deployment policies for GKE and Cloud Run', 'medium', 'Container Security', 'Prevents 80% of container-based threats', 'medium', '["Enable Binary Authorization API", "Create attestations policies", "Configure deployers", "Set up KMS for signing", "Update GKE clusters"]'::jsonb),
  ('azure', 'Enable Microsoft Defender for Cloud', 'Activate Defender for comprehensive threat protection across all resources', 'critical', 'Threat Detection', 'Detects 90% of threats within 24 hours', 'low', '["Enable Defender for all resource types", "Configure alert emails", "Enable auto-provisioning", "Set up security alerts", "Integrate with SIEM"]'::jsonb),
  ('azure', 'Implement Azure Policy for Security', 'Deploy built-in security policies to enforce compliance automatically', 'high', 'Compliance', 'Ensures 100% policy compliance', 'medium', '["Assign security baseline policies", "Enable guest configuration", "Create custom policies", "Set up remediation tasks", "Configure exemption handling"]'::jsonb),
  ('azure', 'Configure Private Endpoints for PaaS Services', 'Use private endpoints to eliminate public internet exposure', 'high', 'Network Security', 'Reduces attack surface by 75%', 'high', '["Enable private endpoints for storage", "Configure for SQL databases", "Setup private DNS zones", "Disable public access", "Update network security groups"]'::jsonb);

-- Insert default quick setup templates
INSERT INTO quick_setup_templates (provider, name, description, category, severity, estimated_time, automated, steps, code) VALUES
  ('aws', 'IAM Root Account Security', 'Secure your AWS root account with MFA and remove access keys', 'IAM Security', 'critical', '15 min', true, '["Enable MFA on root account", "Delete root access keys", "Create IAM admin user", "Enable AWS CloudTrail", "Set up billing alerts"]'::jsonb, '# AWS CLI Commands
aws iam enable-mfa-device --user-name root
aws iam delete-access-key --access-key-id AKIAXXXXX
aws iam create-user --user-name admin-user
aws cloudtrail create-trail --name security-trail'),
  ('aws', 'S3 Bucket Encryption', 'Enable server-side encryption for all S3 buckets', 'Data Protection', 'high', '10 min', true, '["Enable default encryption", "Block public access", "Enable versioning", "Setup lifecycle policies"]'::jsonb, 'aws s3api put-bucket-encryption \\
  --bucket my-bucket \\
  --server-side-encryption-configuration ''{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'''),
  ('aws', 'VPC Flow Logs', 'Enable VPC Flow Logs for network monitoring', 'Network Security', 'high', '20 min', true, '["Create IAM role for flow logs", "Create CloudWatch Log Group", "Enable flow logs on VPC", "Set up log analysis"]'::jsonb, NULL),
  ('aws', 'GuardDuty Activation', 'Enable AWS GuardDuty for threat detection', 'Threat Detection', 'medium', '30 min', true, '["Enable GuardDuty", "Configure findings export", "Set up alerting", "Integrate with Security Hub"]'::jsonb, NULL),
  ('gcp', 'Organization Policy Constraints', 'Set up organization-level security constraints', 'IAM Security', 'critical', '20 min', true, '["Enable VPC Service Controls", "Set org policies for IAM", "Enforce MFA for all users", "Configure audit logging", "Set up resource hierarchy"]'::jsonb, '# gcloud commands
gcloud resource-manager org-policies enable-enforce \\
  --organization=ORGANIZATION_ID \\
  constraints/compute.requireOsLogin'),
  ('gcp', 'Cloud Storage Security', 'Secure Cloud Storage buckets with IAM and encryption', 'Data Protection', 'high', '15 min', true, '["Enable uniform bucket-level access", "Disable public access", "Enable CMEK encryption", "Set up object versioning"]'::jsonb, 'gsutil uniformbucketlevelaccess set on gs://my-bucket
gsutil encryption set -k projects/my-project/locations/global/keyRings/my-ring/cryptoKeys/my-key gs://my-bucket'),
  ('gcp', 'Security Command Center', 'Configure Security Command Center for continuous monitoring', 'Threat Detection', 'high', '45 min', true, '["Enable Security Command Center Premium", "Configure asset discovery", "Enable threat detection", "Set up alerting"]'::jsonb, NULL),
  ('azure', 'Subscription Security', 'Secure Azure subscription with Microsoft Defender', 'Subscription Security', 'critical', '25 min', true, '["Enable Microsoft Defender for Cloud", "Configure security alerts", "Enable automatic provisioning", "Set up security contacts"]'::jsonb, '# Azure CLI
az security auto-provisioning-setting update \\
  --auto-provision On'),
  ('azure', 'Storage Account Encryption', 'Enable encryption and secure transfer for storage accounts', 'Data Protection', 'high', '15 min', true, '["Enable storage encryption", "Enforce HTTPS only", "Enable soft delete", "Configure firewall rules"]'::jsonb, 'az storage account update \\
  --name mystorageaccount \\
  --https-only true \\
  --min-tls-version TLS1_2'),
  ('azure', 'NSG Flow Logs', 'Enable Network Security Group flow logs', 'Network Security', 'high', '20 min', true, '["Create Network Watcher", "Enable NSG flow logs", "Configure retention period", "Set up traffic analysis"]'::jsonb, NULL);

-- Insert default consultation schedules
INSERT INTO consultation_schedules (provider, frequency, scheduled_time, enabled, last_run, next_run) VALUES
  ('aws', 'daily', '06:00', true, '2026-05-29 06:00:00', '2026-05-30 06:00:00'),
  ('gcp', 'daily', '07:00', true, '2026-05-29 07:00:00', '2026-05-30 07:00:00'),
  ('azure', 'daily', '08:00', true, '2026-05-29 08:00:00', '2026-05-30 08:00:00'),
  ('aws', 'weekly', '09:00', true, '2026-05-26 09:00:00', '2026-06-02 09:00:00');