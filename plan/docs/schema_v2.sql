-- ============================================
-- Schema Migration: v2.0 (Money Path Wizard)
-- Version: v2.0
-- Date: 2026-01-01
-- Purpose: Align database with Technical Design v2.0
-- ============================================

-- 1. Update paths table (L2)
ALTER TABLE paths 
ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS formula_config JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS duration_weeks INTEGER;

-- 2. Update projects table (L3 - Milestone)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS completion_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS acceptance_criteria TEXT,
ADD COLUMN IF NOT EXISTS income_contribution DECIMAL(12,2);

-- 3. Update tasks table (L4)
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS task_type TEXT DEFAULT 'core',
ADD COLUMN IF NOT EXISTS planned_date DATE,
ADD COLUMN IF NOT EXISTS sort_order INTEGER;

-- Rename estimated_hours to original_estimate if it exists (compatibility with schema_planning.sql)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'estimated_hours') THEN
        ALTER TABLE tasks RENAME COLUMN estimated_hours TO original_estimate;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'original_estimate') THEN
        ALTER TABLE tasks ADD COLUMN original_estimate DECIMAL(5,2);
    END IF;
END $$;

-- 4. Update user_profiles (L1 - Goal)
-- Create user_profiles if it doesn't exist (from schema_planning.sql)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can insert own profile') THEN
        CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add L1 Goal fields
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS income_goal DECIMAL(15, 2),
ADD COLUMN IF NOT EXISTS deadline DATE;

-- Add other useful profile fields from schema_planning.sql if missing
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS weekly_hours INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS work_days JSONB DEFAULT '[1,2,3,4,5]'::jsonb,
ADD COLUMN IF NOT EXISTS background TEXT DEFAULT 'other',
ADD COLUMN IF NOT EXISTS constraints JSONB DEFAULT '[]'::jsonb;

-- 5. Create task_templates table if not exists (Optional helper)
CREATE TABLE IF NOT EXISTS task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    phase TEXT NOT NULL,
    name TEXT NOT NULL,
    default_hours DECIMAL(5,2) DEFAULT 4.0,
    task_type TEXT DEFAULT 'core',
    output_artifact TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
