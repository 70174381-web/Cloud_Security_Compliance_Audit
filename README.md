# 🛡️ Cloud Security & Compliance Framework

> **internee.pk · cloud-security-audit**
>
> Industry-standard security hardening for cloud platforms — covering IAM policy enforcement,
> multi-region backup strategies, WAF configuration, and continuous compliance auditing across
> AWS, GCP, and Azure.

![AWS CloudTrail](https://img.shields.io/badge/AWS%20CloudTrail-✔-brightgreen)
![Azure Monitor](https://img.shields.io/badge/Azure%20Monitor-✔-blue)
![GCP Logging](https://img.shields.io/badge/GCP%20Logging-✔-yellow)
![WAF Enabled](https://img.shields.io/badge/WAF-Enabled-purple)
![License: MIT](https://img.shields.io/badge/License-MIT-green)
![Status: Active](https://img.shields.io/badge/Status-Active-blue)
🌐 **Live Demo:**[https://cloud-security-compliance-audit.bolt.host/](https://cloud-security-compliance-audit.bolt.host/)

---

## 📋 Table of Contents

- [Objective](#-objective)
- [Task Breakdown](#️-task-breakdown)
- [Architecture Overview](#️-architecture-overview)
- [IAM Policy Setup](#-iam-policy-setup-aws-example)
- [Data Sources](#-data-sources)
- [WAF Configuration](#️-waf-configuration)
- [Compliance Checklist](#-compliance-checklist)
- [Contributing](#-contributing)

---

## 🎯 Objective

Ensure **Internee.pk's** cloud-based platforms follow industry-standard security measures by
conducting structured audits of cloud infrastructure, enforcing least-privilege IAM policies,
enabling geo-redundant backups, and deploying Web Application Firewalls to filter and monitor
all external traffic.

---

## ⚙️ Task Breakdown

| Task | Description |
|------|-------------|
┌─────────────────────────────┐
│       🌐 Public Internet     │
└──────────────┬──────────────┘
│
┌──────────────▼──────────────┐
│  🛡️ AWS WAF / Azure Front Door │
└──────────────┬──────────────┘
│
┌──────────────▼──────────────┐   ┌─────────────────────┐
│     ⚖️ Load Balancer         │ + │   🔐 IAM Gateway     │
└──────────────┬──────────────┘   └─────────────────────┘
│
┌──────────────▼──────────────┐
│      ☁️ Cloud Workloads       │
└──────────────┬──────────────┘
│
┌──────────────▼──────────────┐   ┌──────────────────────┐
│ 📊 CloudTrail / GCP Logging  │ → │ 🗄️ Multi-Region Backup│
└─────────────────────────────┘   └──────────────────────┘

---

## 🔐 IAM Policy Setup (AWS Example)

```json
// Least-privilege IAM Policy for Internee.pk Cloud Ops
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAuditReadOnly",
      "Effect": "Allow",
      "Action": [
        "cloudtrail:LookupEvents",
        "cloudtrail:GetTrailStatus",
        "config:Describe*",
        "iam:GenerateCredentialReport"
      ],
      "Resource": "*"
    },
    {
      "Sid": "DenyDeleteBackups",
      "Effect": "Deny",
      "Action": [
        "s3:DeleteObject",
        "rds:DeleteDBSnapshot"
      ],
      "Resource": "arn:aws:s3:::internee-pk-backups/*"
    }
  ]
}
```

---

## 📂 Data Sources

| Source | Platform | Purpose | Status |
|--------|----------|---------|--------|
| AWS CloudTrail | AWS | API call audit logs, user activity, resource changes | ● Active |
| Azure Monitor | Azure | Metrics, diagnostics, activity logs for all Azure resources | ● Active |
| GCP Cloud Logging | GCP | Audit logs, VPC flow logs, system event logs | ◐ Partial |
| AWS Open Data | AWS | Public datasets for threat intelligence benchmarking | ● Active |

---

## 🛡️ WAF Configuration

```yaml
# AWS WAF WebACL — Internee.pk Production
WebACL:
  Name: InterneeWAFProd
  Scope: CLOUDFRONT
  DefaultAction: Allow
  Rules:
    - Name: BlockSQLInjection
      Priority: 1
      ManagedRuleGroup: AWSManagedRulesSQLiRuleSet

    - Name: BlockXSS
      Priority: 2
      ManagedRuleGroup: AWSManagedRulesKnownBadInputsRuleSet

    - Name: RateLimitAbuse
      Priority: 3
      RateLimit: 2000   # requests / 5 min per IP
      Action: Block
```

---

## ✅ Compliance Checklist

- [x] Enable MFA on all root and admin IAM accounts
- [x] Rotate IAM access keys every 90 days
- [x] Enable CloudTrail logging in all regions with log file validation
- [x] Configure S3 bucket policies to block public access
- [x] Enable encryption at rest for all RDS and S3 resources
- [x] Set up cross-region replication for critical S3 buckets
- [x] Deploy WAF in front of all public-facing endpoints
- [x] Enable VPC Flow Logs and GuardDuty threat detection
- [x] Schedule automated vulnerability scans (Inspector / Security Command Center)
- [x] Review and remediate findings in AWS Security Hub weekly

---

## 🤝 Contributing

1. Fork the repository and create a feature branch:
```bash
   git checkout -b feat/iam-hardening
```
2. Follow the security naming conventions in `CONTRIBUTING.md`
3. Submit a pull request with a clear description and reference to the related task
4. Ensure all Terraform / policy changes pass the `checkov` security scan before merging

---

© 2025 Internee.pk — Cloud Security Team · Built with ☁️ AWS · Azure · GCP
| 🔍 **Cloud Account Audit** | Audit AWS, GCP, and Azure accounts for security compliance using native tooling and open benchmarks (CIS, NIST). |
|
