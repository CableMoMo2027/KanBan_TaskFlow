-- Phase 2 Migration: Add invitation status to board_members
-- Run this in Supabase SQL Editor

ALTER TABLE board_members
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted'));

-- Add a type column to notifications for different notification types
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'general' CHECK (type IN ('general', 'invitation', 'assignment'));
