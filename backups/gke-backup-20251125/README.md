# GKE Backup - November 25, 2025

## ⚠️ URGENT: Account Closing

This backup was created before the GCP trial account closure. **Everything needed to rebuild MARCUS 3.0 is in this repository.**

## Quick Start for New Account

```bash
# 1. Clone this repo
git clone https://github.com/404GeneNotFound/ai_game_theory_simulation.git
cd ai_game_theory_simulation

# 2. Setup new GCP project
gcloud config set project YOUR_NEW_PROJECT_ID

# 3. Deploy everything automatically
./scripts/gcp/deploy-to-gke.sh
```

**That's it!** The script will build images, create cluster, and deploy everything.

## What's in This Backup

- ✅ **Complete K8s manifests** (304KB) - Every resource in the cluster
- ✅ **Database backup** (17KB) - PostgreSQL citation_integrity database
- ✅ **All Dockerfiles** - Source code to rebuild images
- ✅ **Secrets** - Passwords and API keys (base64 encoded)
- ✅ **Cluster config** - GKE settings for recreation
- ✅ **Migration guide** - Step-by-step rebuild instructions

## Key Files

1. **START HERE:** `MIGRATION_GUIDE.md` - Complete rebuild instructions
2. **INVENTORY:** `BACKUP_INVENTORY.md` - What's backed up and why
3. **DATABASE:** `citation_integrity.sql` - PostgreSQL dump
4. **SECRETS:** `secrets-export.yaml` - Encoded credentials
5. **CLUSTER:** `full-cluster-export.yaml` - All K8s resources

## Important: GitHub Has Everything

**You don't need the old GCP account to rebuild.** Everything is in this repository:

- Source code: `src/platform/`
- Dockerfiles: `docker/`
- K8s manifests: `k8s/`
- Deploy scripts: `scripts/gcp/`
- Documentation: `docs/`

The backup files are just for reference and restoring data.

## Rebuild Time

- **Setup new project:** 5 minutes
- **Build images:** 10 minutes
- **Deploy cluster:** 15 minutes
- **Verify deployment:** 5 minutes
- **Total:** ~35 minutes

## Cost on New Account

- **Full deployment:** ~$120/month
- **With spot nodes:** ~$45/month
- **Shutdown when idle:** ~$0/month (using cluster-power.sh)

## Need Help?

See comprehensive docs:
- `docs/MARCUS_MASTER_TABLE_OF_CONTENTS.md` - Complete doc index
- `docs/MARCUS_DEPLOYMENT_GUIDE.md` - Full deployment guide
- `docs/MARCUS_SETUP_GUIDE.md` - Setup instructions

---

**Status:** ✅ COMPLETE - Ready to migrate anytime
