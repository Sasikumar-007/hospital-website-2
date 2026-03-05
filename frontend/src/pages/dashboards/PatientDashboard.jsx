import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import { useDataStore } from '../../hooks/useDataStore.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import {
    Calendar, ClipboardList, Activity, Clock, CheckCircle,
    Plus, X, Loader2, Download, Pill, Utensils, ChevronRight,
    AlertCircle, User
} from 'lucide-react';

export default function PatientDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const { user } = useAuth();
    const { appointments, prescriptions, therapies, DOCTORS, addAppointment, reload } = useDataStore();

    // Robust matching: check ID, email, name (case-insensitive), and email username prefix
    // This handles ALL edge cases: old appointments, ID mismatches, Supabase vs local profile
    const myEmail = user?.email?.toLowerCase() || '';
    const myName = user?.name?.toLowerCase() || '';
    const myEmailPrefix = myEmail.split('@')[0]; // e.g. "sasikumarblogger" from "sasikumarblogger@gmail.com"

    const matchesMe = (record) => {
        if (!record) return false;
        // 1. ID match (most reliable)
        if (user?.id && record.patient_id === user.id) return true;
        // 2. Email match (reliable for records saved with patient_email)
        if (myEmail && record.patient_email?.toLowerCase() === myEmail) return true;
        // 3. Name match — case-insensitive (works for records without email)
        if (myName && record.patient_name?.toLowerCase() === myName) return true;
        // 4. Email-prefix match — handles "sasikumarblogger" name ↔ email login
        if (myEmailPrefix && record.patient_name?.toLowerCase() === myEmailPrefix) return true;
        if (myEmailPrefix && record.patient_email?.toLowerCase().split('@')[0] === myEmailPrefix) return true;
        return false;
    };

    const myAppts = appointments.filter(matchesMe);
    const myRxs = prescriptions.filter(matchesMe);
    const myTherapies = therapies.filter(matchesMe);

    const [showBooking, setShowBooking] = useState(false);
    const [booking, setBooking] = useState({ doctor_id: '', date: '', time: '', reason: '' });
    const [bookingLoading, setBookingLoading] = useState(false);

    const TIME_SLOTS = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'];

    const submitBooking = async () => {
        if (!booking.doctor_id || !booking.date || !booking.time || !booking.reason) {
            toast.error('Please fill all fields'); return;
        }
        setBookingLoading(true);
        try {
            const doctor = DOCTORS.find(d => d.id === booking.doctor_id);
            // ✅ FIX: await so data is confirmed saved to Supabase
            await addAppointment({
                patient_id: user.id,
                patient_name: user.name,
                patient_email: user.email,
                doctor_id: booking.doctor_id,
                doctor_name: doctor?.name || 'Dr. Unknown',
                doctor_email: doctor?.email || '',
                date: booking.date,
                time: booking.time,
                reason: booking.reason,
                status: 'scheduled',
            });
            toast.success('✅ Appointment booked & saved to Supabase!');
            setBooking({ doctor_id: '', date: '', time: '', reason: '' });
            setShowBooking(false);
        } catch (err) {
            toast.error('Booking failed. Please try again.');
        } finally {
            setBookingLoading(false);
        }
    };

    const downloadPrescription = (rx) => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const W = 210, margin = 18;
        let y = 0;
        // Header
        doc.setFillColor(22, 78, 99); doc.rect(0, 0, W, 38, 'F');
        doc.setTextColor(255, 255, 255); doc.setFontSize(16); doc.setFont('helvetica', 'bold');
        doc.text('PANCHAKARMA PATIENT MANAGEMENT SYSTEM', W / 2, 13, { align: 'center' });
        doc.setFontSize(9); doc.setFont('helvetica', 'normal');
        doc.text('Ayurvedic Healthcare  |  Digital Prescription', W / 2, 21, { align: 'center' });
        doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, W / 2, 29, { align: 'center' });
        y = 46; doc.setTextColor(30, 30, 30);
        // Info box
        doc.setFillColor(245, 248, 250); doc.roundedRect(margin, y, W - margin * 2, 34, 3, 3, 'F');
        doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(80, 80, 80);
        doc.text('PATIENT', margin + 4, y + 8); doc.text('DOCTOR', W / 2 + 4, y + 8);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(20, 20, 20); doc.setFontSize(11);
        doc.text(rx.patient_name || '—', margin + 4, y + 17); doc.text(rx.doctor_name || '—', W / 2 + 4, y + 17);
        doc.setFontSize(9); doc.setTextColor(100, 100, 100);
        doc.text(`Date: ${rx.date || '—'}`, margin + 4, y + 26);
        y += 42;
        // Helpers
        const bar = (title, r, g, b) => { doc.setFillColor(r, g, b); doc.rect(margin, y, W - margin * 2, 7, 'F'); doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.text(title, margin + 3, y + 5); doc.setTextColor(30, 30, 30); doc.setFont('helvetica', 'normal'); y += 10; };
        const wrap = (text) => { const lines = doc.splitTextToSize(text || '—', W - margin * 2 - 2); doc.setFontSize(10); lines.forEach(l => { doc.text(l, margin, y); y += 5.5; }); y += 1; };
        // Dosha
        const dc = { Vata: [37, 99, 235], Pitta: [234, 88, 12], Kapha: [22, 163, 74] }[rx.dosha] || [80, 80, 80];
        doc.setFillColor(...dc); doc.roundedRect(margin, y, 60, 12, 3, 3, 'F'); doc.setTextColor(255, 255, 255); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
        doc.text(`Dosha: ${rx.dosha || '—'}  (${rx.dosha_confidence || 0}%)`, margin + 4, y + 8); doc.setTextColor(30, 30, 30); y += 18;
        // Sections
        bar('SYMPTOMS', 101, 60, 196); wrap(rx.symptoms);
        bar('DIAGNOSIS', 37, 99, 235); wrap(rx.diagnosis);
        bar('MEDICINES', 16, 78, 99);
        const meds = (Array.isArray(rx.medicines) ? rx.medicines : []).filter(m => m.name);
        if (!meds.length) { doc.setFontSize(9); doc.setTextColor(130, 130, 130); doc.text('None prescribed.', margin + 2, y); y += 6; }
        else {
            doc.setFillColor(230, 240, 245); doc.rect(margin, y, W - margin * 2, 7, 'F'); doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(60, 60, 60);
            const cols = [margin + 2, margin + 60, margin + 95, margin + 135];
            ['Medicine', 'Dose', 'Frequency', 'Duration'].forEach((h, i) => doc.text(h, cols[i], y + 5)); y += 9; doc.setFont('helvetica', 'normal');
            meds.forEach((m, idx) => {
                doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252); doc.rect(margin, y - 1, W - margin * 2, 7, 'F'); doc.setFontSize(9); doc.setTextColor(20, 20, 20);
                doc.text(`${idx + 1}. ${m.name}`, cols[0], y + 4); doc.text(m.dose || '', cols[1], y + 4); doc.text(m.frequency || '', cols[2], y + 4); doc.text(m.duration || '', cols[3], y + 4);
                y += 8; if (y > 260) { doc.addPage(); y = 20; }
            });
        }
        y += 3;
        bar('THERAPY & THERAPIST', 22, 163, 74);
        doc.setFontSize(10); doc.text(`Therapy: ${rx.therapy || '—'}`, margin + 2, y); y += 6;
        doc.text(`Therapist: ${rx.therapist_name || 'TBD'}`, margin + 2, y); y += 8;
        bar('DIET ADVICE', 180, 83, 9); wrap(rx.diet);
        // Footer
        doc.setDrawColor(200, 200, 200); doc.line(margin, 285 - 4, W - margin, 285 - 4);
        doc.setFontSize(8); doc.setTextColor(130, 130, 130);
        doc.text('Digitally generated by Panchakarma PMS. Valid with doctor signature.', W / 2, 285, { align: 'center' });
        doc.text(`Dr. ${rx.doctor_name || ''}`, W - margin, 277, { align: 'right' }); doc.setFont('helvetica', 'italic'); doc.text('Authorised Signature', W - margin, 282, { align: 'right' });
        doc.save(`My_Prescription_${(rx.patient_name || 'Patient').replace(/\s+/g, '_')}_${rx.date || 'NA'}.pdf`);
        toast.success('📄 PDF prescription downloaded!');
    };

    const upcomingAppt = myAppts.find(a => a.status === 'scheduled');
    const activeTherapy = myTherapies.find(t => t.status === 'in-progress');

    return (
        <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} onRefresh={reload}>

            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Welcome Banner */}
                    <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
                        <p className="text-white/70 text-sm mb-1">Welcome back,</p>
                        <h2 className="text-2xl font-extrabold mb-3">{user?.name} 👋</h2>
                        <div className="flex flex-col sm:flex-row gap-3">
                            {upcomingAppt ? (
                                <div className="bg-white/15 border border-white/20 rounded-xl p-3 flex-1">
                                    <p className="text-white/70 text-xs mb-1">Next Appointment</p>
                                    <p className="font-bold">{upcomingAppt.date} · {upcomingAppt.time}</p>
                                    <p className="text-white/80 text-sm">{upcomingAppt.doctor_name}</p>
                                </div>
                            ) : (
                                <div className="bg-white/15 border border-white/20 rounded-xl p-3 flex-1">
                                    <p className="text-white/70 text-xs mb-1">No upcoming appointments</p>
                                    <button onClick={() => setShowBooking(true)} className="text-amber-300 font-semibold text-sm">
                                        Book one now →
                                    </button>
                                </div>
                            )}
                            {activeTherapy && (
                                <div className="bg-white/15 border border-white/20 rounded-xl p-3 flex-1">
                                    <p className="text-white/70 text-xs mb-1">Active Therapy</p>
                                    <p className="font-bold">{activeTherapy.therapy_type}</p>
                                    <p className="text-white/80 text-sm">{activeTherapy.completed_sessions}/{activeTherapy.total_sessions} sessions done</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Appointments', value: myAppts.length, icon: Calendar, color: 'bg-blue-50 text-blue-600' },
                            { label: 'Prescriptions', value: myRxs.length, icon: ClipboardList, color: 'bg-green-50 text-green-600' },
                            { label: 'Therapy Sessions', value: myTherapies.reduce((s, t) => s + t.completed_sessions, 0), icon: Activity, color: 'bg-purple-50 text-purple-600' },
                            { label: 'Completed', value: myAppts.filter(a => a.status === 'completed').length, icon: CheckCircle, color: 'bg-amber-50 text-amber-600' },
                        ].map((s, i) => (
                            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                className="stat-card">
                                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                                    <s.icon className="w-5 h-5" />
                                </div>
                                <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                                <p className="text-gray-500 text-sm mt-1">{s.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex justify-center">
                        <button onClick={() => setShowBooking(true)}
                            className="btn-primary flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Book New Appointment
                        </button>
                    </div>
                </div>
            )}

            {/* ── MY APPOINTMENTS ── */}
            {activeTab === 'appointments' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button onClick={() => setShowBooking(true)} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
                            <Plus className="w-4 h-4" /> Book Appointment
                        </button>
                    </div>
                    {myAppts.length === 0 && (
                        <div className="card text-center py-12 text-gray-400">
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No appointments yet</p>
                            <button onClick={() => setShowBooking(true)} className="text-blue-600 font-medium text-sm mt-2 hover:text-blue-800">
                                Book your first appointment →
                            </button>
                        </div>
                    )}
                    <div className="space-y-3">
                        {myAppts.map((a) => (
                            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                                            {a.doctor_name?.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{a.doctor_name}</p>
                                            <p className="text-gray-400 text-sm">{a.date} · {a.time}</p>
                                            <p className="text-gray-500 text-xs mt-1">Reason: {a.reason}</p>
                                        </div>
                                    </div>
                                    <span className={`status-${a.status} self-start sm:self-center`}>{a.status}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── MY PRESCRIPTIONS ── */}
            {activeTab === 'prescriptions' && (
                <div className="space-y-4">
                    {myRxs.length === 0 && (
                        <div className="card text-center py-12 text-gray-400">
                            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No prescriptions yet. Book an appointment to get started.</p>
                        </div>
                    )}
                    {myRxs.map((rx) => (
                        <motion.div key={rx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900">{rx.diagnosis}</h3>
                                    <p className="text-gray-400 text-sm">by {rx.doctor_name} · {rx.date}</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="badge bg-blue-100 text-blue-700">{rx.dosha} ({rx.dosha_confidence}%)</span>
                                    <button onClick={() => downloadPrescription(rx)}
                                        className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold transition-colors">
                                        <Download className="w-3 h-3" /> Download
                                    </button>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
                                <div>
                                    <p className="font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                        <Pill className="w-4 h-4" /> Medicines
                                    </p>
                                    <div className="space-y-1">
                                        {rx.medicines?.map((m, i) => (
                                            <div key={i} className="bg-blue-50 rounded-lg px-3 py-1.5 text-xs">
                                                <span className="font-semibold text-blue-800">{m.name}</span>
                                                <span className="text-blue-500"> · {m.dose} · {m.frequency}</span>
                                                <span className="text-blue-400"> for {m.duration}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                        <Utensils className="w-4 h-4" /> Diet Advice
                                    </p>
                                    <p className="text-gray-500 text-xs leading-relaxed">{rx.diet}</p>
                                </div>
                            </div>

                            <div className="bg-green-50 rounded-xl p-3 text-sm">
                                <p className="font-semibold text-green-700">Therapy Prescribed</p>
                                <p className="text-green-600 mt-1">{rx.therapy}</p>
                                {rx.therapist_name && <p className="text-green-500 text-xs mt-1">Therapist: {rx.therapist_name}</p>}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* ── THERAPY SCHEDULE ── */}
            {activeTab === 'therapy' && (
                <div className="space-y-5">

                    {/* Summary header */}
                    {myTherapies.length > 0 && (
                        <div className="rounded-2xl bg-gradient-to-r from-green-600 to-teal-600 p-5 text-white">
                            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">Your Therapy Programme</p>
                            <h2 className="text-xl font-extrabold mb-3">
                                {myTherapies.filter(t => t.status === 'in-progress').length} Active · {myTherapies.filter(t => t.status === 'completed').length} Completed
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {myTherapies.slice(0, 3).map(t => (
                                    <span key={t.id}
                                        className="bg-white/20 border border-white/30 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                        {t.therapy_type}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {myTherapies.length === 0 && (
                        <div className="card text-center py-12 text-gray-400">
                            <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium text-gray-500">No therapy assigned yet</p>
                            <p className="text-sm mt-1">Your doctor will assign therapy after your consultation.</p>
                        </div>
                    )}

                    {myTherapies.map((t) => {
                        const pct = t.total_sessions > 0
                            ? Math.round((t.completed_sessions / t.total_sessions) * 100)
                            : 0;
                        const statusColor = {
                            'in-progress': 'from-blue-500 to-blue-600',
                            'completed': 'from-green-500 to-green-600',
                            'scheduled': 'from-amber-500 to-amber-600',
                        }[t.status] || 'from-gray-400 to-gray-500';

                        return (
                            <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="card overflow-hidden p-0">

                                {/* Card Header strip */}
                                <div className={`bg-gradient-to-r ${statusColor} p-4 text-white`}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">Therapy Schedule</p>
                                            <h3 className="text-lg font-extrabold mt-0.5">{t.therapy_type}</h3>
                                        </div>
                                        <span className="bg-white/25 border border-white/40 text-white text-xs font-bold px-3 py-1 rounded-full capitalize">
                                            {t.status.replace('-', ' ')}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 space-y-4">

                                    {/* Info grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                                        <div className="bg-gray-50 rounded-xl p-3">
                                            <p className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                                                <User className="w-3 h-3" /> Therapist
                                            </p>
                                            <p className="font-bold text-gray-800">{t.therapist_name || 'TBD'}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3">
                                            <p className="text-gray-400 text-xs mb-1">📅 Start Date</p>
                                            <p className="font-bold text-gray-800">{t.start_date || '—'}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3">
                                            <p className="text-gray-400 text-xs mb-1">🏁 End Date</p>
                                            <p className="font-bold text-gray-800">{t.end_date || '—'}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3">
                                            <p className="text-gray-400 text-xs mb-1">⏰ Session Time</p>
                                            <p className="font-bold text-gray-800">{t.session_time || '09:00 AM'}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3">
                                            <p className="text-gray-400 text-xs mb-1">✅ Sessions Done</p>
                                            <p className="font-bold text-gray-800">{t.completed_sessions} / {t.total_sessions}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3">
                                            <p className="text-gray-400 text-xs mb-1">📊 Progress</p>
                                            <p className="font-bold text-gray-800">{pct}%</p>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                                            <span>Therapy Progress</span>
                                            <span className="font-bold text-gray-700">{pct}% complete</span>
                                        </div>
                                        <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: pct + '%' }}
                                                transition={{ duration: 1.2, ease: 'easeOut' }}
                                                className={`h-4 rounded-full flex items-center justify-end pr-2
                                                    ${pct === 100 ? 'bg-green-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-400'}`}
                                            >
                                                {pct > 15 && <span className="text-white text-xs font-bold">{pct}%</span>}
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Session notes from therapist */}
                                    {t.notes && t.notes.length > 0 && (
                                        <div>
                                            <p className="font-semibold text-gray-700 text-sm mb-2">📝 Session Notes from Therapist</p>
                                            <div className="space-y-2 max-h-52 overflow-y-auto">
                                                {t.notes.slice().reverse().map((n, i) => (
                                                    <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs font-bold text-gray-500">Session {n.session}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full
                                                                    ${n.mood === 'excellent' ? 'bg-green-100 text-green-700' :
                                                                        n.mood === 'good' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                    {n.mood}
                                                                </span>
                                                                <span className="text-gray-400 text-xs">{n.date}</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-600 text-sm">{n.note}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* ── BOOK APPOINTMENT MODAL ── */}
            {showBooking && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Book Appointment</h2>
                                <p className="text-gray-400 text-xs">Schedule a consultation with a doctor</p>
                            </div>
                            <button onClick={() => setShowBooking(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-4 h-4" /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="label">Select Doctor</label>
                                <select className="input-field" value={booking.doctor_id} onChange={e => setBooking({ ...booking, doctor_id: e.target.value })}>
                                    <option value="">Choose a doctor...</option>
                                    {DOCTORS.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">Preferred Date</label>
                                <input type="date" className="input-field" value={booking.date}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={e => setBooking({ ...booking, date: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">Time Slot</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {TIME_SLOTS.map(slot => (
                                        <button key={slot} type="button" onClick={() => setBooking({ ...booking, time: slot })}
                                            className={`py-2 rounded-xl text-xs font-semibold border transition-all ${booking.time === slot ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="label">Reason for Visit</label>
                                <textarea className="input-field min-h-[70px] resize-none" value={booking.reason}
                                    onChange={e => setBooking({ ...booking, reason: e.target.value })}
                                    placeholder="Describe your symptoms or reason for consultation..." />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setShowBooking(false)} className="flex-1 btn-ghost">Cancel</button>
                            <button onClick={submitBooking} disabled={bookingLoading}
                                className="flex-1 btn-primary flex items-center justify-center gap-2">
                                {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                                {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </DashboardLayout>
    );
}
