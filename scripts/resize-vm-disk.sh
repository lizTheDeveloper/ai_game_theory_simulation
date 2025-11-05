#!/bin/bash
# Resize VM Disk: Safely resize the claude-workspace VM disk
# This will expand the disk from 50GB to a larger size

set -e

# Configuration
VM_NAME="claude-workspace"
ZONE="europe-west10-a"
DISK_NAME="claude-workspace"
CURRENT_SIZE=50
NEW_SIZE="${1:-100}"  # Default to 100GB, or use first argument

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 VM Disk Resize Plan"
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

echo "⚠️  WARNING: This will require stopping the VM briefly!"
echo ""
echo "Steps:"
echo "  1. Stop VM ($VM_NAME)"
echo "  2. Resize disk to ${NEW_SIZE}GB"
echo "  3. Start VM"
echo "  4. SSH in and expand filesystem"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled"
  exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Stopping VM"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

gcloud compute instances stop "$VM_NAME" --zone="$ZONE"

echo "✅ VM stopped"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Resizing disk to ${NEW_SIZE}GB"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

gcloud compute disks resize "$DISK_NAME" --size="${NEW_SIZE}GB" --zone="$ZONE"

echo "✅ Disk resized"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Starting VM"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

gcloud compute instances start "$VM_NAME" --zone="$ZONE"

echo "✅ VM started"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Waiting for VM to boot..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

sleep 30
echo "✅ VM should be ready"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Expanding filesystem (requires SSH)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "The disk has been resized, but the filesystem needs to be expanded."
echo ""
echo "SSH into the VM and run these commands:"
echo ""
echo "  # Check current filesystem size"
echo "  df -h"
echo ""
echo "  # Find the partition (usually /dev/sda1 or /dev/sda2)"
echo "  lsblk"
echo ""
echo "  # Grow the partition (interactive, answer prompts)"
echo "  sudo growpart /dev/sda 1  # Replace '1' with your partition number"
echo ""
echo "  # Resize the filesystem (ext4)"
echo "  sudo resize2fs /dev/sda1  # Replace with your partition"
echo ""
echo "  # OR if using xfs:"
echo "  # sudo xfs_growfs /"
echo ""
echo "  # Verify new size"
echo "  df -h"
echo ""
echo "Would you like to SSH in now? (y/n)"
read -p "> " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  gcloud compute ssh "$VM_NAME" --zone="$ZONE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Resize Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Summary:"
echo "  ✅ VM stopped"
echo "  ✅ Disk resized: ${CURRENT_SIZE}GB → ${NEW_SIZE}GB"
echo "  ✅ VM restarted"
echo "  ⚠️  Filesystem expansion: Manual (see instructions above)"
echo ""
echo "Next steps:"
echo "  1. SSH in: gcloud compute ssh $VM_NAME --zone=$ZONE"
echo "  2. Expand filesystem (see commands above)"
echo "  3. Verify: df -h"
echo ""
