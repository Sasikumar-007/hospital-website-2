import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HeartPulse, Leaf, Shield, Users, Calendar, ClipboardList,
    Brain, Star, ChevronRight, Menu, X, ArrowRight, CheckCircle,
    Sparkles, Activity, UserCheck, FlaskConical
} from 'lucide-react';

const features = [
    { icon: Calendar, title: 'Smart Appointment Booking', desc: 'Book consultations with Ayurvedic doctors in seconds. Choose your preferred time slot and specialist.', color: 'blue' },
    { icon: Brain, title: 'AI Dosha Analysis', desc: 'Advanced AI analyses your symptoms and identifies your dominant dosha — Vata, Pitta, or Kapha.', color: 'purple' },
    { icon: ClipboardList, title: 'Digital Prescriptions', desc: 'Doctors generate detailed digital prescriptions with medicines, diet advice, and therapy recommendations.', color: 'green' },
    { icon: Activity, title: 'Therapy Tracking', desc: 'Track your Panchakarma therapy progress in real-time. View session updates and therapist notes.', color: 'amber' },
    { icon: Shield, title: 'Secure & HIPAA Compliant', desc: 'Your health data is encrypted and protected. Role-based access ensures privacy at every level.', color: 'red' },
    { icon: UserCheck, title: 'Multi-Role Dashboards', desc: 'Dedicated dashboards for Admins, Doctors, Therapists, and Patients — each optimized for their workflow.', color: 'indigo' },
];

const testimonials = [
    { name: 'Dr. Priya Sharma', role: 'Panchakarma Specialist', text: 'This system has transformed how I manage patient consultations. The AI dosha analysis saves me 20 minutes per patient.', rating: 5 },
    { name: 'Arun Mehta', role: 'Patient', text: 'Booking appointments and tracking my Panchakarma therapy has never been easier. The prescription downloads are very helpful.', rating: 5 },
    { name: 'Ravi Patel', role: 'Ayurvedic Therapist', text: 'Managing therapy schedules and updating patient progress is seamless. The dashboard is intuitive and fast.', rating: 5 },
];

const stats = [
    { label: 'Patients Treated', value: '12,000+', icon: Users },
    { label: 'Therapies Completed', value: '45,000+', icon: Activity },
    { label: 'Expert Doctors', value: '200+', icon: HeartPulse },
    { label: 'Clinics Powered', value: '500+', icon: Leaf },
];

const colorMap = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-100' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100' },
    red: { bg: 'bg-red-50', icon: 'text-red-600', border: 'border-red-100' },
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', border: 'border-indigo-100' },
};

export default function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                                <Leaf className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gradient">Panchakarma</span>
                        </div>

                        {/* Desktop nav */}
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Features</a>
                            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">How it Works</a>
                            <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Testimonials</a>
                            <Link to="/login" className="btn-ghost text-sm py-2 px-4">Login</Link>
                            <Link to="/login" className="btn-primary text-sm py-2 px-4">Get Started</Link>
                        </div>

                        {/* Mobile menu button */}
                        <button className="md:hidden p-2 rounded-xl hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
                            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-gray-100 bg-white"
                        >
                            <div className="px-4 py-4 space-y-3">
                                <a href="#features" className="block text-sm font-medium text-gray-600 py-2">Features</a>
                                <a href="#how-it-works" className="block text-sm font-medium text-gray-600 py-2">How it Works</a>
                                <a href="#testimonials" className="block text-sm font-medium text-gray-600 py-2">Testimonials</a>
                                <Link to="/login" className="block btn-primary text-center text-sm py-2">Get Started</Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 gradient-hero opacity-95" />
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full bg-white opacity-5 animate-pulse-slow"
                            style={{
                                width: Math.random() * 300 + 50 + 'px',
                                height: Math.random() * 300 + 50 + 'px',
                                left: Math.random() * 100 + '%',
                                top: Math.random() * 100 + '%',
                                animationDelay: Math.random() * 3 + 's',
                                animationDuration: (Math.random() * 4 + 3) + 's',
                            }}
                        />
                    ))}
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left */}
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                            className="text-white"
                        >
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                                <Sparkles className="w-4 h-4 text-amber-300" />
                                <span className="text-sm font-medium">SIH 2025 — Smart India Hackathon</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                                Modern Ayurveda
                                <br />
                                <span className="text-amber-300">Patient Management</span>
                            </h1>

                            <p className="text-lg text-blue-100 mb-8 leading-relaxed max-w-lg">
                                A complete Panchakarma clinic management system with AI-powered dosha analysis,
                                digital prescriptions, therapy tracking, and role-based dashboards.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => navigate('/login')}
                                    className="flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl 
                             hover:bg-blue-50 transition-all shadow-2xl"
                                >
                                    Get Started Free <ArrowRight className="w-5 h-5" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                                    className="flex items-center justify-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-xl 
                             hover:bg-white/10 transition-all"
                                >
                                    Explore Features
                                </motion.button>
                            </div>

                            {/* Demo credentials */}
                            <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                                <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-3">Quick Demo Login</p>
                                <div className="grid grid-cols-2 gap-2 text-xs text-blue-100">
                                    {[
                                        { role: 'Admin', email: 'admin@panchakarma.com' },
                                        { role: 'Doctor', email: 'doctor@panchakarma.com' },
                                        { role: 'Therapist', email: 'therapist@panchakarma.com' },
                                        { role: 'Patient', email: 'patient@panchakarma.com' },
                                    ].map(c => (
                                        <div key={c.role} className="bg-white/10 rounded-lg p-2">
                                            <p className="font-semibold text-white">{c.role}</p>
                                            <p className="opacity-80 text-xs truncate">{c.email}</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-blue-200 mt-2">Password: any text works for demo</p>
                            </div>
                        </motion.div>

                        {/* Right — Dashboard Preview Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="hidden lg:block"
                        >
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                                        <div className="w-3 h-3 rounded-full bg-green-400" />
                                    </div>
                                    <span className="text-white/60 text-xs font-mono">panchakarma-dashboard</span>
                                </div>

                                {/* Mini dashboard preview */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {[
                                        { label: 'Patients Today', value: '24', color: 'bg-blue-500/20 border-blue-400/30', text: 'text-blue-200' },
                                        { label: 'Therapies Active', value: '18', color: 'bg-green-500/20 border-green-400/30', text: 'text-green-200' },
                                        { label: 'Prescriptions', value: '156', color: 'bg-purple-500/20 border-purple-400/30', text: 'text-purple-200' },
                                        { label: 'AI Analyses', value: '89', color: 'bg-amber-500/20 border-amber-400/30', text: 'text-amber-200' },
                                    ].map(s => (
                                        <div key={s.label} className={`${s.color} border rounded-xl p-3`}>
                                            <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
                                            <p className="text-white/60 text-xs mt-1">{s.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Mini patient list */}
                                <div className="space-y-2">
                                    {['Dosha Analysis', 'Appointment Booked', 'Prescription Generated', 'Therapy Assigned'].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2">
                                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                            <span className="text-white/80 text-xs font-medium">{item}</span>
                                            <span className="ml-auto text-white/40 text-xs">{i + 1}m ago</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center text-white"
                            >
                                <stat.icon className="w-8 h-8 mx-auto mb-3 opacity-80" />
                                <p className="text-3xl font-extrabold">{stat.value}</p>
                                <p className="text-blue-100 text-sm mt-1">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
                            Everything You Need
                        </span>
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                            Powerful Features for Modern Ayurveda
                        </h2>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            From AI-powered diagnosis to therapy tracking, everything your clinic needs in one platform.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, i) => {
                            const colors = colorMap[feature.color];
                            return (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -4 }}
                                    className={`bg-white rounded-2xl p-6 border ${colors.border} shadow-sm hover:shadow-lg transition-all cursor-default`}
                                >
                                    <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}>
                                        <feature.icon className={`w-6 h-6 ${colors.icon}`} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="inline-block bg-green-100 text-green-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
                            Simple Workflow
                        </span>
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-gray-500 text-lg">From registration to recovery — a seamless journey.</p>
                    </motion.div>

                    <div className="relative">
                        <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-green-200 to-amber-200 hidden lg:block" />
                        <div className="grid lg:grid-cols-5 gap-8">
                            {[
                                { step: '01', title: 'Register', desc: 'Patient signs up and creates their health profile', icon: Users, color: 'blue' },
                                { step: '02', title: 'Book Appointment', desc: 'Select doctor, date, and time slot', icon: Calendar, color: 'green' },
                                { step: '03', title: 'AI Analysis', desc: 'Doctor uses AI to analyze dosha and symptoms', icon: Brain, color: 'purple' },
                                { step: '04', title: 'Prescription', desc: 'Digital prescription with therapy plan generated', icon: ClipboardList, color: 'amber' },
                                { step: '05', title: 'Therapy & Recovery', desc: 'Therapist tracks sessions, patient monitors progress', icon: Activity, color: 'red' },
                            ].map((step, i) => {
                                const colors = colorMap[step.color] || colorMap.blue;
                                return (
                                    <motion.div
                                        key={step.step}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.15 }}
                                        className="relative text-center"
                                    >
                                        <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 relative z-10 border-2 ${colors.border}`}>
                                            <step.icon className={`w-8 h-8 ${colors.icon}`} />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 tracking-wider">{step.step}</span>
                                        <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2">{step.title}</h3>
                                        <p className="text-gray-500 text-sm">{step.desc}</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="inline-block bg-amber-100 text-amber-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
                            Testimonials
                        </span>
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Loved by Clinics & Patients</h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={t.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                            >
                                <div className="flex gap-1 mb-4">
                                    {[...Array(t.rating)].map((_, j) => (
                                        <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-6">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
                                        {t.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                                        <p className="text-gray-400 text-xs">{t.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 gradient-hero">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-extrabold text-white mb-6">
                            Ready to Modernize Your Ayurvedic Clinic?
                        </h2>
                        <p className="text-blue-100 text-lg mb-8">
                            Join thousands of practitioners using Panchakarma PMS to deliver better patient care.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate('/login')}
                            className="bg-white text-blue-700 font-bold px-10 py-4 rounded-2xl shadow-2xl hover:bg-blue-50 transition-all inline-flex items-center gap-2"
                        >
                            Start for Free Today <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                                <Leaf className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-white font-bold">Panchakarma PMS</span>
                        </div>
                        <p className="text-sm">© 2025 Panchakarma PMS — SIH25023. Built for Smart India Hackathon 2025.</p>
                        <div className="flex items-center gap-6 text-sm">
                            <a href="#features" className="hover:text-white transition-colors">Features</a>
                            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
