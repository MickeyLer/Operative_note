-- ==============================================================================
-- HPB KKH WebApp Database Schema Setup
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Create table for Stapler Usage Records
CREATE TABLE IF NOT EXISTS public.stapler_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    op_date DATE NOT NULL,
    hn TEXT NOT NULL,
    procedure_name TEXT NOT NULL,
    surgeon TEXT NOT NULL,
    stapler_brand TEXT NOT NULL,
    reloads JSONB DEFAULT '[]'::jsonb,
    total_reloads INTEGER DEFAULT 0,
    complications TEXT DEFAULT 'Normal (ไม่มีปัญหา)',
    notes TEXT DEFAULT ''
);

-- 2. Create table for Operative Notes
CREATE TABLE IF NOT EXISTS public.operative_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    op_date DATE NOT NULL,
    surgeon TEXT NOT NULL,
    first_assistant TEXT DEFAULT '',
    second_assistant TEXT DEFAULT '',
    scrub_nurse TEXT DEFAULT '',
    circulating_nurse TEXT DEFAULT '',
    preoperative_dx TEXT DEFAULT '',
    postoperative_dx TEXT DEFAULT '',
    operative_procedure TEXT NOT NULL,
    anesthesia_type TEXT DEFAULT '',
    anesthesiologist TEXT DEFAULT '',
    patient_name TEXT NOT NULL,
    hn TEXT NOT NULL,
    an TEXT DEFAULT '',
    age TEXT DEFAULT '',
    gender TEXT DEFAULT '',
    op_type TEXT NOT NULL,
    ebl TEXT DEFAULT '',
    op_time TEXT DEFAULT '',
    findings TEXT DEFAULT '',
    procedure_details JSONB DEFAULT '[]'::jsonb,
    specimen TEXT DEFAULT '',
    complication TEXT DEFAULT '',
    postop_plan TEXT DEFAULT '',
    icg_flr JSONB DEFAULT '{}'::jsonb,
    pd_size TEXT DEFAULT '',
    lymph_nodes JSONB DEFAULT '[]'::jsonb,
    port_placements JSONB DEFAULT '[]'::jsonb,
    port_placement_image TEXT DEFAULT '',
    vascular_variations TEXT DEFAULT '',
    adhesions TEXT DEFAULT '',
    metastasis TEXT DEFAULT ''
);

-- 3. Create table for Operative Templates
CREATE TABLE IF NOT EXISTS public.operative_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    position TEXT DEFAULT '',
    incision TEXT DEFAULT '',
    icg_flr BOOLEAN DEFAULT false,
    pd_size BOOLEAN DEFAULT false,
    ln_options JSONB DEFAULT '[]'::jsonb,
    procedures JSONB DEFAULT '[]'::jsonb,
    is_laparoscopic BOOLEAN DEFAULT false
);

-- 4. Enable Row Level Security (RLS) and grant public permissions
ALTER TABLE public.stapler_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operative_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operative_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public full access on stapler_records" ON public.stapler_records;
DROP POLICY IF EXISTS "Allow public full access on operative_notes" ON public.operative_notes;
DROP POLICY IF EXISTS "Allow public full access on operative_templates" ON public.operative_templates;

-- Create Policies for anonymous public access
CREATE POLICY "Allow public full access on stapler_records" 
ON public.stapler_records FOR ALL 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow public full access on operative_notes" 
ON public.operative_notes FOR ALL 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow public full access on operative_templates" 
ON public.operative_templates FOR ALL 
USING (true) WITH CHECK (true);

-- 5. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_stapler_records_op_date ON public.stapler_records(op_date DESC);
CREATE INDEX IF NOT EXISTS idx_stapler_records_hn ON public.stapler_records(hn);
CREATE INDEX IF NOT EXISTS idx_stapler_records_surgeon ON public.stapler_records(surgeon);
CREATE INDEX IF NOT EXISTS idx_stapler_records_brand ON public.stapler_records(stapler_brand);

CREATE INDEX IF NOT EXISTS idx_operative_notes_op_date ON public.operative_notes(op_date DESC);
CREATE INDEX IF NOT EXISTS idx_operative_notes_hn ON public.operative_notes(hn);
