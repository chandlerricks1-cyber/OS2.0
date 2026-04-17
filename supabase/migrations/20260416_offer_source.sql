-- Add source column to offers table to distinguish AI-generated "Crucible Approved" offers
ALTER TABLE offers ADD COLUMN source TEXT NOT NULL DEFAULT 'manual';
