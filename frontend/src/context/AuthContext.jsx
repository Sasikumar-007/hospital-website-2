import React, { createContext, useContext, useState, useEffect } from 'react';
import { profilesService } from '../services/supabaseService.js';

const AuthContext = createContext(null);

// Demo users (ids match the seeded profiles in Supabase)
const DEMO_MAP = {
    'admin@panchakarma.com': { id: 'u-admin', name: 'Dr. Admin Kumar', role: 'admin', avatar: 'AK' },
    'doctor@panchakarma.com': { id: 'u-doc1', name: 'Dr. Priya Sharma', role: 'doctor', avatar: 'PS', specialization: 'Panchakarma Specialist' },
    'therapist@panchakarma.com': { id: 'u-ther1', name: 'Ravi Patel', role: 'therapist', avatar: 'RP', specialization: 'Ayurvedic Therapist' },
    'patient@panchakarma.com': { id: 'u-pat1', name: 'Arun Mehta', role: 'patient', avatar: 'AM' },
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('panchakarma_user');
        if (stored) { try { setUser(JSON.parse(stored)); } catch { } }
        setLoading(false);
    }, []);

    /**
     * login(email, password, customUser?)
     *  Order of lookup:
     *  1. customUser object passed directly (signup flow)
     *  2. Demo hardcoded accounts (any password)
     *  3. Supabase profiles table (for previously registered users)
     *  4. Auto-create patient profile (fallback)
     */
    const login = async (email, password, customUser = null) => {
        const emailLower = email.trim().toLowerCase();

        // 1. Direct user object (from signup page)
        if (customUser) {
            setUser(customUser);
            localStorage.setItem('panchakarma_user', JSON.stringify(customUser));
            return { success: true, user: customUser };
        }

        // 2. Demo accounts
        const demo = DEMO_MAP[emailLower];
        if (demo) {
            const user = { ...demo, email: emailLower };
            setUser(user);
            localStorage.setItem('panchakarma_user', JSON.stringify(user));
            return { success: true, user };
        }

        // 3. Look up in Supabase profiles
        try {
            const { data, error } = await profilesService.getByEmail(emailLower);
            if (!error && data) {
                const user = { ...data, avatar: data.avatar || emailLower.slice(0, 2).toUpperCase() };
                setUser(user);
                localStorage.setItem('panchakarma_user', JSON.stringify(user));
                return { success: true, user };
            }
        } catch (e) {
            console.warn('Supabase profile lookup failed:', e.message);
        }

        // 4. Fallback: auto-create patient
        const fallback = {
            id: 'u-' + Date.now(),
            name: emailLower.split('@')[0],
            role: 'patient',
            email: emailLower,
            avatar: emailLower.slice(0, 2).toUpperCase(),
        };
        setUser(fallback);
        localStorage.setItem('panchakarma_user', JSON.stringify(fallback));
        return { success: true, user: fallback };
    };

    /**
     * register — creates a profile in Supabase and auto-logs in
     */
    const register = async ({ name, email, password, role }) => {
        const emailLower = email.trim().toLowerCase();
        const id = 'u-' + Date.now();
        const avatar = name.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

        const newProfile = { id, name: name.trim(), email: emailLower, role, avatar, status: 'active' };

        // Insert to Supabase (best-effort)
        try {
            await profilesService.insert(newProfile);
        } catch (e) {
            console.warn('Could not save profile to Supabase:', e.message);
        }

        // Also save locally as backup
        const localUsers = JSON.parse(localStorage.getItem('pkms_users') || '[]');
        localUsers.push(newProfile);
        localStorage.setItem('pkms_users', JSON.stringify(localUsers));

        return login(emailLower, password, newProfile);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('panchakarma_user');
    };

    const updateUser = (updates) => {
        const updated = { ...user, ...updates };
        setUser(updated);
        localStorage.setItem('panchakarma_user', JSON.stringify(updated));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
