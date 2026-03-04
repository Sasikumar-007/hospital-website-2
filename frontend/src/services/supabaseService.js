import { supabase } from '../lib/supabase.js';

// ── PROFILES ──────────────────────────────────────────────
export const profilesService = {
    getAll: () =>
        supabase.from('profiles').select('*').order('created_at', { ascending: true }),

    getByEmail: (email) =>
        supabase.from('profiles').select('*').eq('email', email.toLowerCase()).maybeSingle(),

    insert: (profile) =>
        supabase.from('profiles').insert(profile).select().single(),

    update: (id, updates) =>
        supabase.from('profiles').update(updates).eq('id', id).select().single(),

    getByRole: (role) =>
        supabase.from('profiles').select('*').eq('role', role).order('name'),
};

// ── APPOINTMENTS ───────────────────────────────────────────
export const appointmentsService = {
    getAll: () =>
        supabase.from('appointments').select('*').order('created_at', { ascending: false }),

    getByPatient: (patientId) =>
        supabase.from('appointments').select('*').eq('patient_id', patientId).order('date', { ascending: false }),

    getByDoctor: (doctorId) =>
        supabase.from('appointments').select('*').eq('doctor_id', doctorId).order('date', { ascending: false }),

    insert: (apt) =>
        supabase.from('appointments').insert(apt).select().single(),

    update: (id, updates) =>
        supabase.from('appointments').update(updates).eq('id', id).select().single(),
};

// ── PRESCRIPTIONS ──────────────────────────────────────────
export const prescriptionsService = {
    getAll: () =>
        supabase.from('prescriptions').select('*').order('created_at', { ascending: false }),

    getByPatient: (patientId) =>
        supabase.from('prescriptions').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }),

    getByDoctor: (doctorId) =>
        supabase.from('prescriptions').select('*').eq('doctor_id', doctorId).order('created_at', { ascending: false }),

    insert: (rx) =>
        supabase.from('prescriptions').insert(rx).select().single(),

    update: (id, updates) =>
        supabase.from('prescriptions').update(updates).eq('id', id).select().single(),
};

// ── THERAPIES ──────────────────────────────────────────────
export const therapiesService = {
    getAll: () =>
        supabase.from('therapies').select('*').order('created_at', { ascending: false }),

    getByPatient: (patientId) =>
        supabase.from('therapies').select('*').eq('patient_id', patientId),

    getByTherapist: (therapistId) =>
        supabase.from('therapies').select('*').eq('therapist_id', therapistId),

    insert: (th) =>
        supabase.from('therapies').insert(th).select().single(),

    update: (id, updates) =>
        supabase.from('therapies').update(updates).eq('id', id).select().single(),
};
