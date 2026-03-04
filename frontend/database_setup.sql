-- ============================================================
-- 🌿 PANCHAKARMA PMS — SUPABASE DATABASE SETUP
-- Project: vomjdsvgvrpsjaharfom
-- Run this entire script in:
--   Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- ── DROP (clean start) ──────────────────────────────────────
DROP TABLE IF EXISTS public.therapies     CASCADE;
DROP TABLE IF EXISTS public.prescriptions CASCADE;
DROP TABLE IF EXISTS public.appointments  CASCADE;
DROP TABLE IF EXISTS public.profiles      CASCADE;

-- ── PROFILES ────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE,
  role           TEXT NOT NULL CHECK (role IN ('admin','doctor','therapist','patient')),
  avatar         TEXT,
  specialization TEXT,
  age            INTEGER,
  status         TEXT DEFAULT 'active',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── APPOINTMENTS ────────────────────────────────────────────
CREATE TABLE public.appointments (
  id           TEXT PRIMARY KEY,
  patient_id   TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  doctor_id    TEXT NOT NULL,
  doctor_name  TEXT NOT NULL,
  date         TEXT NOT NULL,
  time         TEXT NOT NULL,
  reason       TEXT,
  status       TEXT DEFAULT 'scheduled',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── PRESCRIPTIONS ───────────────────────────────────────────
CREATE TABLE public.prescriptions (
  id                TEXT PRIMARY KEY,
  patient_id        TEXT NOT NULL,
  patient_name      TEXT NOT NULL,
  doctor_id         TEXT NOT NULL,
  doctor_name       TEXT NOT NULL,
  appointment_id    TEXT,
  symptoms          TEXT,
  diagnosis         TEXT,
  dosha             TEXT,
  dosha_confidence  INTEGER,
  medicines         JSONB DEFAULT '[]'::JSONB,
  therapy           TEXT,
  therapist_id      TEXT,
  therapist_name    TEXT,
  diet              TEXT,
  status            TEXT DEFAULT 'active',
  date              TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── THERAPIES ───────────────────────────────────────────────
CREATE TABLE public.therapies (
  id                 TEXT PRIMARY KEY,
  prescription_id    TEXT,
  patient_id         TEXT NOT NULL,
  patient_name       TEXT NOT NULL,
  therapist_id       TEXT,
  therapist_name     TEXT,
  therapy_type       TEXT NOT NULL,
  total_sessions     INTEGER DEFAULT 21,
  completed_sessions INTEGER DEFAULT 0,
  start_date         TEXT,
  end_date           TEXT,
  status             TEXT DEFAULT 'scheduled',
  notes              JSONB DEFAULT '[]'::JSONB,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ── ROW LEVEL SECURITY (permissive for prototype) ────────────
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapies     ENABLE ROW LEVEL SECURITY;

-- Allow full access for anon key (demo / prototype mode)
CREATE POLICY "anon_all_profiles"      ON public.profiles      FOR ALL TO anon        USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_appointments"  ON public.appointments  FOR ALL TO anon        USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_prescriptions" ON public.prescriptions FOR ALL TO anon        USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_therapies"     ON public.therapies     FOR ALL TO anon        USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_profiles"      ON public.profiles      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_appointments"  ON public.appointments  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_prescriptions" ON public.prescriptions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_therapies"     ON public.therapies     FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── SEED: Demo Profiles ──────────────────────────────────────
INSERT INTO public.profiles (id, name, email, role, avatar, specialization, status) VALUES
  ('u-admin', 'Dr. Admin Kumar',   'admin@panchakarma.com',     'admin',     'AK', NULL,                     'active'),
  ('u-doc1',  'Dr. Priya Sharma',  'doctor@panchakarma.com',    'doctor',    'PS', 'Panchakarma Specialist',  'active'),
  ('u-doc2',  'Dr. Arjun Verma',   'arjun@panchakarma.com',     'doctor',    'AV', 'Ayurvedic Physician',     'active'),
  ('u-ther1', 'Ravi Patel',        'therapist@panchakarma.com', 'therapist', 'RP', 'Ayurvedic Therapist',     'active'),
  ('u-ther2', 'Meena Krishnan',    'meena@panchakarma.com',     'therapist', 'MK', 'Panchakarma Therapist',   'active'),
  ('u-pat1',  'Arun Mehta',        'patient@panchakarma.com',   'patient',   'AM', NULL,                     'active'),
  ('u-pat2',  'Sunita Rao',        'sunita@gmail.com',          'patient',   'SR', NULL,                     'active'),
  ('u-pat3',  'Vikram Singh',      'vikram@gmail.com',          'patient',   'VS', NULL,                     'active')
ON CONFLICT (id) DO NOTHING;

-- ── SEED: Demo Appointments ──────────────────────────────────
INSERT INTO public.appointments (id, patient_id, patient_name, doctor_id, doctor_name, date, time, reason, status) VALUES
  ('apt1', 'u-pat1', 'Arun Mehta',  'u-doc1', 'Dr. Priya Sharma', '2025-03-05', '10:00 AM', 'Chronic back pain and fatigue',       'scheduled'),
  ('apt2', 'u-pat1', 'Arun Mehta',  'u-doc1', 'Dr. Priya Sharma', '2025-02-20', '11:30 AM', 'Follow-up consultation',              'completed'),
  ('apt3', 'u-pat2', 'Sunita Rao',  'u-doc1', 'Dr. Priya Sharma', '2025-03-06', '02:00 PM', 'Digestive issues and acidity',        'scheduled'),
  ('apt4', 'u-pat3', 'Vikram Singh','u-doc1', 'Dr. Priya Sharma', '2025-03-04', '09:00 AM', 'Stress and insomnia',                 'completed')
ON CONFLICT (id) DO NOTHING;

-- ── SEED: Demo Prescription ──────────────────────────────────
INSERT INTO public.prescriptions
  (id, patient_id, patient_name, doctor_id, doctor_name, appointment_id,
   symptoms, diagnosis, dosha, dosha_confidence, medicines,
   therapy, therapist_id, therapist_name, diet, status, date)
VALUES (
  'rx1', 'u-pat1', 'Arun Mehta', 'u-doc1', 'Dr. Priya Sharma', 'apt2',
  'Chronic lower back pain, fatigue, dry skin, anxiety',
  'Vata imbalance with secondary Pitta disturbance',
  'Vata', 78,
  '[
    {"name":"Ashwagandha Churna","dose":"5g","frequency":"Twice daily","duration":"30 days"},
    {"name":"Triphala Churna","dose":"3g","frequency":"Once at bedtime","duration":"30 days"},
    {"name":"Bala Taila (External)","dose":"As required","frequency":"Daily massage","duration":"21 days"}
  ]'::JSONB,
  'Abhyanga + Shirodhara (21 days)',
  'u-ther1', 'Ravi Patel',
  'Warm, oily foods. Avoid cold drinks. Include sesame oil, ghee. Rest well.',
  'active', '2025-02-20'
) ON CONFLICT (id) DO NOTHING;

-- ── SEED: Demo Therapies ─────────────────────────────────────
INSERT INTO public.therapies
  (id, prescription_id, patient_id, patient_name, therapist_id, therapist_name,
   therapy_type, total_sessions, completed_sessions, start_date, end_date, status, notes)
VALUES
(
  'th1', 'rx1', 'u-pat1', 'Arun Mehta', 'u-ther1', 'Ravi Patel',
  'Abhyanga + Shirodhara', 21, 8, '2025-02-22', '2025-03-14', 'in-progress',
  '[
    {"session":1,"date":"2025-02-22","note":"Patient comfortable. Initial assessment done.","mood":"good"},
    {"session":2,"date":"2025-02-23","note":"Good response to Abhyanga. Reduced pain reported.","mood":"good"},
    {"session":8,"date":"2025-03-02","note":"Significant improvement in flexibility and sleep quality.","mood":"excellent"}
  ]'::JSONB
),
(
  'th2', NULL, 'u-pat3', 'Vikram Singh', 'u-ther1', 'Ravi Patel',
  'Shirodhara', 14, 14, '2025-02-10', '2025-02-24', 'completed',
  '[{"session":14,"date":"2025-02-24","note":"Course completed. Stress levels normalized.","mood":"excellent"}]'::JSONB
)
ON CONFLICT (id) DO NOTHING;

-- ── VERIFY ───────────────────────────────────────────────────
SELECT 'profiles'      AS tbl, COUNT(*) AS rows FROM public.profiles      UNION ALL
SELECT 'appointments'  AS tbl, COUNT(*) AS rows FROM public.appointments  UNION ALL
SELECT 'prescriptions' AS tbl, COUNT(*) AS rows FROM public.prescriptions UNION ALL
SELECT 'therapies'     AS tbl, COUNT(*) AS rows FROM public.therapies;
