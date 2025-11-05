#!/bin/bash
# Auto-Resize VM Disk: Fully automated VM disk resize with filesystem expansion
# This handles everything including the filesystem resize via SSH

set -e

# Configuration
VM_NAME="claude-workspace"
ZONE="europe-west10-a"
DISK_NAME="claude-workspace"
CURRENT_SIZE=50
NEW_SIZE="${1:-100}"  # Default to 100GB, or use first argument

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 Automated VM Disk Resize"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "VM:           $VM_NAME"
echo "Zone:         $ZONE"
echo "Disk:         $DISK_NAME"
echo "Current size: ${CURRENT_SIZE}GB"
echo "New size:     ${NEW_SIZE}GB"
echo "Increase:     $((NEW_SIZE - CURRENT_SIZE))GB"
echo ""

if [ "$NEW_SIZE" -le "$CURRENT_SIZE" ]; then
  echo "❌ ERROR: New size must be larger than current size (${CURRENT_SIZE}GB)"
  echo "Usage: $0 [new_size_in_gb]"
  echo "Example: $0 100"
  exit 1
fi

echo "⚠️  WARNING: This will stop the VM briefly!"
echo "⚠️  Autonomous workers will be interrupted!"
echo ""
echo "Process:"
echo "  1. Stop VM"
echo "  2. Resize disk to ${NEW_SIZE}GB"
echo "  3. Start VM"
echo "  4. Auto-expand filesystem via SSH"
echo "  5. Restart cron jobs"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled"
  exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 1: Stopping VM"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

gcloud compute instances stop "$VM_NAME" --zone="$ZONE" --quiet

echo "✅ VM stopped"
sleep 5
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 Step 2: Resizing disk to ${NEW_SIZE}GB"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

gcloud compute disks resize "$DISK_NAME" \
  --size="${NEW_SIZE}GB" \
  --zone="$ZONE" \
  --quiet

echo "✅ Disk resized to ${NEW_SIZE}GB"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Step 3: Starting VM"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

gcloud compute instances start "$VM_NAME" --zone="$ZONE" --quiet

echo "✅ VM starting..."
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏳ Step 4: Waiting for VM to boot (45 seconds)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for i in {45..1}; do
  echo -ne "\rWaiting... $i seconds remaining "
  sleep 1
done
echo ""
echo "✅ VM should be ready"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Step 5: Expanding filesystem (automated via SSH)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create expansion script
cat > /tmp/expand_filesystem.sh << 'EXPAND_EOF'
#!/bin/bash
set -e

echo "Current disk usage:"
df -h /

echo ""
echo "Detecting partition..."
DEVICE=$(lsblk -no NAME,TYPE | grep disk | head -1 | awk '{print $1}')
PARTITION=$(lsblk -no NAME,TYPE | grep part | head -1 | awk '{print $1}')
PART_NUM=$(echo $PARTITION | sed "s/${DEVICE}//")

echo "Device: /dev/$DEVICE"
echo "Partition: /dev/$PARTITION"
echo "Partition number: $PART_NUM"
echo ""

# Install cloud-guest-utils if needed (for growpart)
if ! command -v growpart &> /dev/null; then
  echo "Installing cloud-guest-utils..."
  sudo apt-get update -qq
  sudo apt-get install -y cloud-guest-utils
fi

echo "Growing partition..."
sudo growpart /dev/$DEVICE $PART_NUM || echo "Partition already at max size"

echo ""
echo "Detecting filesystem type..."
FS_TYPE=$(lsblk -no FSTYPE /dev/$PARTITION)
echo "Filesystem: $FS_TYPE"

echo ""
echo "Resizing filesystem..."
if [ "$FS_TYPE" = "ext4" ] || [ "$FS_TYPE" = "ext3" ] || [ "$FS_TYPE" = "ext2" ]; then
  sudo resize2fs /dev/$PARTITION
elif [ "$FS_TYPE" = "xfs" ]; then
  sudo xfs_growfs /
else
  echo "⚠️  Unknown filesystem type: $FS_TYPE"
  exit 1
fi

echo ""
echo "✅ Filesystem expanded!"
echo ""
echo "New disk usage:"
df -h /
EXPAND_EOF

# Copy script to VM and execute
echo "Uploading expansion script..."
gcloud compute scp /tmp/expand_filesystem.sh \
  ${VM_NAME}:/tmp/expand_filesystem.sh \
  --zone="$ZONE" \
  --quiet

echo "Executing expansion script..."
gcloud compute ssh "$VM_NAME" \
  --zone="$ZONE" \
  --command="chmod +x /tmp/expand_filesystem.sh && /tmp/expand_filesystem.sh" \
  --quiet

rm /tmp/expand_filesystem.sh

echo "✅ Filesystem expanded"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 Step 6: Verifying services"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check cron status
gcloud compute ssh "$VM_NAME" \
  --zone="$ZONE" \
  --command="sudo service cron status || sudo service cron start" \
  --quiet

echo "✅ Cron service verified"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Step 7: Final verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

gcloud compute ssh "$VM_NAME" \
  --zone="$ZONE" \
  --command="echo '=== Disk Usage ===' && df -h / && echo '' && echo '=== Cron Status ===' && crontab -l | grep autonomous || echo 'No autonomous cron jobs found'" \
  --quiet

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Resize Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Summary:"
echo "  ✅ VM stopped"
echo "  ✅ Disk resized: ${CURRENT_SIZE}GB → ${NEW_SIZE}GB"
echo "  ✅ VM restarted"
echo "  ✅ Filesystem expanded automatically"
echo "  ✅ Services verified"
echo ""
echo "The VM is now ready with ${NEW_SIZE}GB of storage!"
echo ""
echo "Next steps:"
echo "  1. Monitor logs: gcloud compute ssh $VM_NAME --zone=$ZONE --command='tail -f /home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/cron_worker.log'"
echo "  2. Setup new cron: cd /home/lizthedeveloper_gmail_com/ai_game_theory_simulation && ./scripts/setup-vm-cron.sh"
echo ""
