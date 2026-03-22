-- Add description and color columns to boards table
ALTER TABLE boards
  ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS color TEXT DEFAULT NULL;
