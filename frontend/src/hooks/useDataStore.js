import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase.js';
import {
    profilesService,
    appointmentsService,
    prescriptionsService,
    therapiesService,
} from '../services/supabaseService.js';

// ── Fallback local data (shown while loading / if Supabase is unreachable) ──
const FALLBACK_USERS = [
    { id: 'u-doc1', name: 'Dr. Priya Sharma', role: 'doctor', email: 'doctor@panchakarma.com', avatar: 'PS', specialization: 'Panchakarma Specialist', status: 'active' },
    { id: 'u-doc2', name: 'Dr. Arjun Verma', role: 'doctor', email: 'arjun@panchakarma.com', avatar: 'AV', specialization: 'Ayurvedic Physician', status: 'active' },
    { id: 'u-ther1', name: 'Ravi Patel', role: 'therapist', email: 'therapist@panchakarma.com', avatar: 'RP', specialization: 'Ayurvedic Therapist', status: 'active' },
    { id: 'u-ther2', name: 'Meena Krishnan', role: 'therapist', email: 'meena@panchakarma.com', avatar: 'MK', specialization: 'Panchakarma Therapist', status: 'active' },
    { id: 'u-pat1', name: 'Arun Mehta', role: 'patient', email: 'patient@panchakarma.com', avatar: 'AM', status: 'active' },
    { id: 'u-pat2', name: 'Sunita Rao', role: 'patient', email: 'sunita@gmail.com', avatar: 'SR', status: 'active' },
    { id: 'u-pat3', name: 'Vikram Singh', role: 'patient', email: 'vikram@gmail.com', avatar: 'VS', status: 'active' },
];

function genId(prefix = '') {
    return prefix + Date.now() + Math.random().toString(36).slice(2, 6);
}

// ── Hook ────────────────────────────────────────────────────────────────────
export function useDataStore() {
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [therapies, setTherapies] = useState([]);
    const [users, setUsers] = useState(FALLBACK_USERS);
    const [loading, setLoading] = useState(true);
    const [dbConnected, setDbConnected] = useState(false);

    // ── Load everything from Supabase ─────────────────────────────────────────
    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [aptsRes, rxsRes, thsRes, usersRes] = await Promise.all([
                appointmentsService.getAll(),
                prescriptionsService.getAll(),
                therapiesService.getAll(),
                profilesService.getAll(),
            ]);

            if (!aptsRes.error) { setAppointments(aptsRes.data || []); setDbConnected(true); }
            if (!rxsRes.error) { setPrescriptions(rxsRes.data || []); }
            if (!thsRes.error) { setTherapies(thsRes.data || []); }
            if (!usersRes.error) { setUsers(usersRes.data || FALLBACK_USERS); }

            if (aptsRes.error) {
                console.warn('Supabase not reachable — using local data. Run database_setup.sql first.');
            }
        } catch (e) {
            console.error('Supabase load error:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Initial load ──────────────────────────────────────────────────────────
    useEffect(() => { loadAll(); }, [loadAll]);

    // ── Real-time subscriptions (instant updates across all users) ────────────
    useEffect(() => {
        // Subscribe to appointments table changes
        const aptChannel = supabase
            .channel('appointments-realtime')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'appointments' },
                (payload) => {
                    // Add new appointment instantly — avoid duplicates
                    setAppointments(prev => {
                        if (prev.some(a => a.id === payload.new.id)) return prev;
                        return [payload.new, ...prev];
                    });
                }
            )
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'appointments' },
                (payload) => {
                    setAppointments(prev =>
                        prev.map(a => a.id === payload.new.id ? payload.new : a)
                    );
                }
            )
            .on('postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'appointments' },
                (payload) => {
                    setAppointments(prev => prev.filter(a => a.id !== payload.old.id));
                }
            )
            .subscribe();

        // Subscribe to prescriptions table changes
        const rxChannel = supabase
            .channel('prescriptions-realtime')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'prescriptions' },
                (payload) => {
                    setPrescriptions(prev => {
                        if (prev.some(r => r.id === payload.new.id)) return prev;
                        return [payload.new, ...prev];
                    });
                }
            )
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'prescriptions' },
                (payload) => {
                    setPrescriptions(prev =>
                        prev.map(r => r.id === payload.new.id ? payload.new : r)
                    );
                }
            )
            .subscribe();

        // Subscribe to therapies table changes
        const thChannel = supabase
            .channel('therapies-realtime')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'therapies' },
                (payload) => {
                    setTherapies(prev => {
                        if (prev.some(t => t.id === payload.new.id)) return prev;
                        return [payload.new, ...prev];
                    });
                }
            )
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'therapies' },
                (payload) => {
                    setTherapies(prev =>
                        prev.map(t => t.id === payload.new.id ? payload.new : t)
                    );
                }
            )
            .subscribe();

        // Cleanup subscriptions on unmount
        return () => {
            supabase.removeChannel(aptChannel);
            supabase.removeChannel(rxChannel);
            supabase.removeChannel(thChannel);
        };
    }, []);

    // ── Auto-poll every 30 seconds as fallback (if real-time isn't available) ─
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const [aptsRes, rxsRes, thsRes] = await Promise.all([
                    appointmentsService.getAll(),
                    prescriptionsService.getAll(),
                    therapiesService.getAll(),
                ]);
                if (!aptsRes.error && aptsRes.data) setAppointments(aptsRes.data);
                if (!rxsRes.error && rxsRes.data) setPrescriptions(rxsRes.data);
                if (!thsRes.error && thsRes.data) setTherapies(thsRes.data);
            } catch (e) {
                // Silent — auto-poll failure shouldn't interrupt UX
            }
        }, 30000); // every 30 seconds

        return () => clearInterval(interval);
    }, []);

    // ── APPOINTMENTS ──────────────────────────────────────────────────────────
    const addAppointment = async (apt) => {
        const id = genId('apt-');
        const newApt = { id, ...apt, created_at: new Date().toISOString() };

        // Optimistic update (immediately visible to the booking user)
        setAppointments(prev => [newApt, ...prev]);

        // 🔄 Try full insert (with email fields)
        let { data, error } = await appointmentsService.insert(newApt);

        // If column doesn't exist yet → retry with only core fields (schema migration not run)
        if (error && error.message?.includes('column')) {
            console.warn('Retrying appointment insert without email fields (run ALTER TABLE migration)');
            const coreApt = {
                id: newApt.id,
                patient_id: newApt.patient_id,
                patient_name: newApt.patient_name,
                doctor_id: newApt.doctor_id,
                doctor_name: newApt.doctor_name,
                date: newApt.date,
                time: newApt.time,
                reason: newApt.reason,
                status: newApt.status,
                created_at: newApt.created_at,
            };
            ({ data, error } = await appointmentsService.insert(coreApt));
        }

        if (error) {
            console.error('❌ Supabase insert appointment failed:', error.message);
        } else if (data) {
            // Replace optimistic item with server-confirmed record
            setAppointments(prev => prev.map(a => a.id === id ? { ...data, ...newApt } : a));
        }
        return newApt;
    };

    const updateAppointment = async (id, updates) => {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
        const { error } = await appointmentsService.update(id, updates);
        if (error) console.error('Supabase update appointment error:', error.message);
    };

    // ── PRESCRIPTIONS ─────────────────────────────────────────────────────────
    const addPrescription = async (rx) => {
        const id = genId('rx-');
        const newRx = { id, ...rx, date: new Date().toISOString().split('T')[0], created_at: new Date().toISOString() };

        setPrescriptions(prev => [newRx, ...prev]);

        // 🔄 Try full insert first, fallback without email fields
        let { data, error } = await prescriptionsService.insert(newRx);
        if (error && error.message?.includes('column')) {
            const { patient_email, doctor_email, ...coreRx } = newRx;
            ({ data, error } = await prescriptionsService.insert(coreRx));
        }
        if (error) {
            console.error('❌ Supabase insert prescription failed:', error.message);
        } else if (data) {
            setPrescriptions(prev => prev.map(r => r.id === id ? { ...data, ...newRx } : r));
        }
        return newRx;
    };

    // ── THERAPIES ─────────────────────────────────────────────────────────────
    const addTherapy = async (th) => {
        const id = genId('th-');
        const newTh = { id, ...th, notes: [], created_at: new Date().toISOString() };

        setTherapies(prev => [newTh, ...prev]);

        // 🔄 Try full insert first, fallback without email fields
        let { data, error } = await therapiesService.insert(newTh);
        if (error && error.message?.includes('column')) {
            const { patient_email, ...coreTh } = newTh;
            ({ data, error } = await therapiesService.insert(coreTh));
        }
        if (error) {
            console.error('❌ Supabase insert therapy failed:', error.message);
        } else if (data) {
            setTherapies(prev => prev.map(t => t.id === id ? { ...data, ...newTh } : t));
        }
        return newTh;
    };

    const updateTherapy = async (id, updates) => {
        setTherapies(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        const { error } = await therapiesService.update(id, updates);
        if (error) console.error('Supabase update therapy error:', error.message);
    };

    // ── USERS ─────────────────────────────────────────────────────────────────
    const addUser = async (user) => {
        const id = genId('u-');
        const newUser = { id, ...user, status: 'active', created_at: new Date().toISOString() };

        setUsers(prev => [...prev, newUser]);

        const { data, error } = await profilesService.insert(newUser);
        if (error) {
            console.error('Supabase insert profile error:', error.message);
        } else if (data) {
            setUsers(prev => prev.map(u => u.id === id ? data : u));
        }
        return newUser;
    };

    // ── Derived lists ─────────────────────────────────────────────────────────
    const DOCTORS = users.filter(u => u.role === 'doctor');
    const THERAPISTS = users.filter(u => u.role === 'therapist');
    const PATIENTS = users.filter(u => u.role === 'patient');

    return {
        // State
        appointments, prescriptions, therapies, users,
        loading, dbConnected,
        // Derived
        DOCTORS, THERAPISTS, PATIENTS,
        // Actions
        addAppointment, updateAppointment,
        addPrescription,
        addTherapy, updateTherapy,
        addUser,
        // Reload
        reload: loadAll,
    };
}
