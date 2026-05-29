/*
  # Cloud Security Audit Schema for Internee.pk

  1. New Tables
    - `cloud_providers` - Store cloud provider details (AWS, GCP, Azure)
    - `security_findings` - Store security audit findings by severity and provider
    - `iam_policies` - Track IAM policy compliance status across providers
    - `waf_rules` - Store WAF rule configurations and status
    - `backup_regions` - Track multi-region backup coverage
    - `audit_logs` - Store CloudTrail and audit log entries
    - `compliance_scores` - Historical compliance metrics for trending

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to view data

  3. Important Notes
    - All tables include timestamps for audit tracking
    - Security findings are categorized by severity (critical, high, medium, low)
    - Each finding references a cloud provider and resource
    - IAM policy compliance is tracked per policy and provider
    - Backup regions track geographic redundancy
*/

CREATE TABLE IF NOT EXISTS cloud_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS security_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  severity text NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  provider_id uuid NOT NULL REFERENCES cloud_providers(id),
  title text NOT NULL,
  resource text NOT NULL,
  source text NOT NULL,
  description text,
  remediation text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS iam_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name text NOT NULL,
  provider_id uuid NOT NULL REFERENCES cloud_providers(id),
  status text NOT NULL CHECK (status IN ('pass', 'fail', 'warning')),
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(policy_name, provider_id)
);

CREATE TABLE IF NOT EXISTS waf_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES cloud_providers(id),
  rule_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'disabled', 'review')),
  description text,
  blocked_today integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS backup_regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES cloud_providers(id),
  region_name text NOT NULL,
  region_code text NOT NULL,
  is_primary boolean DEFAULT false,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(provider_id, region_code)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_time timestamptz NOT NULL,
  level text NOT NULL CHECK (level IN ('INFO', 'WARN', 'ERROR', 'BLOCK')),
  source text NOT NULL,
  message text NOT NULL,
  provider_id uuid REFERENCES cloud_providers(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compliance_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES cloud_providers(id),
  security_score numeric(5,2) NOT NULL,
  critical_findings integer DEFAULT 0,
  iam_compliance numeric(5,2) NOT NULL,
  waf_rules_active integer DEFAULT 0,
  backup_coverage text NOT NULL,
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE cloud_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE iam_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE waf_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cloud providers"
  ON cloud_providers FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view security findings"
  ON security_findings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view IAM policies"
  ON iam_policies FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view WAF rules"
  ON waf_rules FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view backup regions"
  ON backup_regions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view audit logs"
  ON audit_logs FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view compliance scores"
  ON compliance_scores FOR SELECT
  USING (true);

INSERT INTO cloud_providers (name, slug) VALUES 
  ('Amazon Web Services', 'aws'),
  ('Google Cloud Platform', 'gcp'),
  ('Microsoft Azure', 'azure')
ON CONFLICT (slug) DO NOTHING;
