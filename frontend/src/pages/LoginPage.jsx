import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import {
    Leaf, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2,
    User, Stethoscope, Activity, ShieldCheck, UserPlus, LogIn
} from 'lucide-react';

const DEMO_ACCOUNTS = [
    { role: 'Admin', email: 'admin@panchakarma.com', color: 'bg-red-100 text-red-700 border-red-200', desc: 'Full system control', icon: ShieldCheck },
    { role: 'Doctor', email: 'doctor@panchakarma.com', color: 'bg-blue-100 text-blue-700 border-blue-200', desc: 'Consultation & AI Dosha', icon: Stethoscope },
    { role: 'Therapist', email: 'therapist@panchakarma.com', color: 'bg-green-100 text-green-700 border-green-200', desc: 'Therapy management', icon: Activity },
    { role: 'Patient', email: 'patient@panchakarma.com', color: 'bg-purple-100 text-purple-700 border-purple-200', desc: 'Book & track treatments', icon: User },
];

const SIGNUP_ROLES = [
    { value: 'patient', label: 'Patient', desc: 'Book appointments & track therapy', icon: User, color: 'border-purple-300 bg-purple-50 text-purple-700' },
    { value: 'doctor', label: 'Doctor', desc: 'Manage consultations & prescriptions', icon: Stethoscope, color: 'border-blue-300 bg-blue-50 text-blue-700' },
    { value: 'therapist', label: 'Therapist', desc: 'Manage therapy sessions', icon: Activity, color: 'border-green-300 bg-green-50 text-green-700' },
    { value: 'admin', label: 'Admin', desc: 'Full system administration', icon: ShieldCheck, color: 'border-red-300 bg-red-50 text-red-700' },
];

export default function LoginPage() {
    const [tab, setTab] = useState('login'); // 'login' | 'signup'

    // Login state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    // Signup state
    const [signup, setSignup] = useState({
        name: '', email: '', password: '', confirmPassword: '', role: 'patient',
    });
    const [showSignupPass, setShowSignupPass] = useState(false);
    const [signupLoading, setSignupLoading] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    /* ── LOGIN ── */
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) { toast.error('Please enter email and password'); return; }
        setLoading(true);
        try {
            const { success, user } = await login(email, password);
            if (success) {
                toast.success(`Welcome back, ${user.name}! 👋`);
                navigate(`/dashboard/${user.role}`);
            }
        } catch { toast.error('Login failed. Please try again.'); }
        finally { setLoading(false); }
    };

    const quickLogin = async (demoEmail) => {
        setLoading(true);
        try {
            const { success, user } = await login(demoEmail, 'demo123');
            if (success) {
                toast.success(`Welcome, ${user.name}!`);
                navigate(`/dashboard/${user.role}`);
            }
        } catch { toast.error('Quick login failed.'); }
        finally { setLoading(false); }
    };

    /* ── SIGN UP (saves to Supabase profiles table) ── */
    const handleSignup = async (e) => {
        e.preventDefault();
        if (!signup.name.trim()) { toast.error('Please enter your full name'); return; }
        if (!signup.email.trim()) { toast.error('Please enter your email'); return; }
        if (signup.password.length < 4) { toast.error('Password must be at least 4 chars'); return; }
        if (signup.password !== signup.confirmPassword) { toast.error('Passwords do not match'); return; }

        setSignupLoading(true);
        try {
            const { success, user } = await register({
                name: signup.name,
                email: signup.email,
                password: signup.password,
                role: signup.role,
            });
            if (success) {
                toast.success(`Account created & saved to Supabase! Welcome, ${user.name}! 🎉`);
                navigate(`/dashboard/${user.role}`);
            }
        } catch (err) {
            toast.error('Signup failed. Please try again.');
            console.error(err);
        } finally {
            setSignupLoading(false);
        }
    };


    /* ── SIDE PANEL ── */
    const LeftPanel = () => (
        <div className="hidden lg:flex lg:w-1/2 gradient-hero flex-col justify-between p-12 relative overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="absolute rounded-full bg-white"
                        style={{
                            opacity: 0.05,
                            width: Math.random() * 300 + 80 + 'px',
                            height: Math.random() * 300 + 80 + 'px',
                            left: Math.random() * 110 - 10 + '%',
                            top: Math.random() * 110 - 10 + '%',
                        }}
                    />
                ))}
            </div>

            {/* Logo */}
            <Link to="/" className="relative z-10 flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Panchakarma PMS</span>
            </Link>

            {/* Tagline */}
            <div className="relative z-10 text-white">
                <h2 className="text-4xl font-extrabold mb-4 leading-tight">
                    Ancient Wisdom,<br />
                    <span className="text-amber-300">Modern Technology</span>
                </h2>
                <p className="text-blue-100 text-lg leading-relaxed mb-8">
                    Complete Ayurvedic clinic management — appointments, AI dosha analysis,
                    digital prescriptions, and therapy tracking in one place.
                </p>
                <div className="flex flex-wrap gap-2">
                    {['AI Dosha Analysis', 'Digital Prescriptions', 'Therapy Tracking', 'Role-Based Access'].map(f => (
                        <span key={f} className="bg-white/15 border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                            ✓ {f}
                        </span>
                    ))}
                </div>
            </div>

            <p className="relative z-10 text-blue-200 text-sm">© 2025 Panchakarma PMS · SIH25023</p>
        </div>
    );

    return (
        <div className="min-h-screen flex">
            <LeftPanel />

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md py-6"
                >
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                            <Leaf className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gradient">Panchakarma PMS</span>
                    </div>

                    {/* Tab switcher */}
                    <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
                        <button
                            onClick={() => setTab('login')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 'login' ? 'bg-white text-blue-700 shadow' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <LogIn className="w-4 h-4" /> Sign In
                        </button>
                        <button
                            onClick={() => setTab('signup')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 'signup' ? 'bg-white text-blue-700 shadow' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <UserPlus className="w-4 h-4" /> Sign Up
                        </button>
                    </div>

                    <AnimatePresence mode="wait">

                        {/* ════════════ LOGIN TAB ════════════ */}
                        {tab === 'login' && (
                            <motion.div key="login"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="card mb-4">
                                    <div className="mb-5">
                                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back 👋</h1>
                                        <p className="text-gray-500 text-sm">Sign in to your account</p>
                                    </div>

                                    <form onSubmit={handleLogin} className="space-y-4">
                                        <div>
                                            <label className="label">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                                    placeholder="you@example.com" className="input-field" style={{ paddingLeft: '2.5rem' }} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="label">Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input type={showPass ? 'text' : 'password'} value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    placeholder="Any password for demo"
                                                    className="input-field"
                                                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} />
                                                <button type="button" onClick={() => setShowPass(!showPass)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                            {loading ? 'Signing in…' : 'Sign In'}
                                        </button>
                                    </form>
                                </div>

                                {/* Quick Demo */}
                                <div className="card">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 text-center">
                                        ⚡ Quick Demo Login
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {DEMO_ACCOUNTS.map(acc => {
                                            const Icon = acc.icon;
                                            return (
                                                <motion.button key={acc.role}
                                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                                    onClick={() => quickLogin(acc.email)}
                                                    disabled={loading}
                                                    className={`p-3 rounded-xl border-2 ${acc.color} text-left transition-all hover:shadow-sm`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Icon className="w-4 h-4" />
                                                        <span className="font-bold text-sm">{acc.role}</span>
                                                    </div>
                                                    <p className="text-xs opacity-75 leading-snug">{acc.email}</p>
                                                    <p className="text-xs opacity-60 mt-0.5">{acc.desc}</p>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-center text-xs text-gray-400 mt-3">
                                        Click any role to instantly log in · password not needed
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* ════════════ SIGNUP TAB ════════════ */}
                        {tab === 'signup' && (
                            <motion.div key="signup"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="card"
                            >
                                <div className="mb-5">
                                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Account 🌿</h1>
                                    <p className="text-gray-500 text-sm">Join Panchakarma PMS — choose your role below</p>
                                </div>

                                <form onSubmit={handleSignup} className="space-y-4">
                                    {/* Full Name */}
                                    <div>
                                        <label className="label">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input className="input-field" style={{ paddingLeft: '2.5rem' }}
                                                placeholder="Dr. Priya Sharma / Ravi Patel / Arun Mehta"
                                                value={signup.name} onChange={e => setSignup({ ...signup, name: e.target.value })} />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="label">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input type="email" className="input-field" style={{ paddingLeft: '2.5rem' }}
                                                placeholder="your@email.com"
                                                value={signup.email} onChange={e => setSignup({ ...signup, email: e.target.value })} />
                                        </div>
                                    </div>

                                    {/* Role Selection */}
                                    <div>
                                        <label className="label">Select Your Role</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {SIGNUP_ROLES.map(r => {
                                                const Icon = r.icon;
                                                const isSelected = signup.role === r.value;
                                                return (
                                                    <button key={r.value} type="button"
                                                        onClick={() => setSignup({ ...signup, role: r.value })}
                                                        className={`p-3 rounded-xl border-2 text-left transition-all ${isSelected ? r.color + ' shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Icon className="w-4 h-4" />
                                                            <span className="font-bold text-sm">{r.label}</span>
                                                            {isSelected && <span className="ml-auto text-xs">✓</span>}
                                                        </div>
                                                        <p className="text-xs opacity-70 leading-snug">{r.desc}</p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="label">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input type={showSignupPass ? 'text' : 'password'}
                                                className="input-field" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                                                placeholder="Min 4 characters"
                                                value={signup.password} onChange={e => setSignup({ ...signup, password: e.target.value })} />
                                            <button type="button" onClick={() => setShowSignupPass(!showSignupPass)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                {showSignupPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="label">Confirm Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input type="password"
                                                className="input-field"
                                                style={{
                                                    paddingLeft: '2.5rem',
                                                    borderColor: signup.confirmPassword && signup.confirmPassword !== signup.password ? '#ef4444' : '',
                                                }}
                                                placeholder="Re-enter your password"
                                                value={signup.confirmPassword}
                                                onChange={e => setSignup({ ...signup, confirmPassword: e.target.value })} />
                                        </div>
                                        {signup.confirmPassword && signup.confirmPassword !== signup.password && (
                                            <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                                        )}
                                    </div>

                                    {/* Role Summary */}
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm">
                                        <p className="text-blue-700 font-semibold">
                                            You're signing up as a <span className="capitalize underline">{signup.role}</span>
                                        </p>
                                        <p className="text-blue-500 text-xs mt-0.5">
                                            {SIGNUP_ROLES.find(r => r.value === signup.role)?.desc}
                                        </p>
                                    </div>

                                    <button type="submit" disabled={signupLoading} className="btn-primary w-full justify-center">
                                        {signupLoading
                                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
                                            : <><UserPlus className="w-4 h-4" /> Create Account</>
                                        }
                                    </button>
                                </form>

                                <p className="text-center text-xs text-gray-400 mt-4">
                                    Already have an account?{' '}
                                    <button onClick={() => setTab('login')} className="text-blue-600 font-semibold hover:underline">
                                        Sign in
                                    </button>
                                </p>
                            </motion.div>
                        )}

                    </AnimatePresence>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        Demo application · SIH 2025 Prototype · All data is illustrative
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
