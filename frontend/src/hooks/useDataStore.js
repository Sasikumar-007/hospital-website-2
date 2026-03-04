import { useState, useEffect, useCallback } from 'react';
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

    useEffect(() => { loadAll(); }, [loadAll]);

    // ── APPOINTMENTS ──────────────────────────────────────────────────────────
    const addAppointment = async (apt) => {
        const id = genId('apt-');
        const newApt = { id, ...apt, created_at: new Date().toISOString() };

        // Optimistic update
        setAppointments(prev => [newApt, ...prev]);

        const { data, error } = await appointmentsService.insert(newApt);
        if (error) {
            console.error('Supabase insert appointment error:', error.message);
            // Keep optimistic state anyway
        } else if (data) {
            // Replace optimistic item with server-confirmed one
            setAppointments(prev => prev.map(a => a.id === id ? data : a));
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

        const { data, error } = await prescriptionsService.insert(newRx);
        if (error) {
            console.error('Supabase insert prescription error:', error.message);
        } else if (data) {
            setPrescriptions(prev => prev.map(r => r.id === id ? data : r));
        }
        return newRx;
    };

    // ── THERAPIES ─────────────────────────────────────────────────────────────
    const addTherapy = async (th) => {
        const id = genId('th-');
        const newTh = { id, ...th, notes: [], created_at: new Date().toISOString() };

        setTherapies(prev => [newTh, ...prev]);

        const { data, error } = await therapiesService.insert(newTh);
        if (error) {
            console.error('Supabase insert therapy error:', error.message);
        } else if (data) {
            setTherapies(prev => prev.map(t => t.id === id ? data : t));
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
