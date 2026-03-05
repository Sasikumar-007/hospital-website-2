import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import { useDataStore } from '../../hooks/useDataStore.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import {
    Calendar, ClipboardList, Brain, Users, Clock, CheckCircle,
    Plus, X, Loader2, ChevronDown, ChevronUp, Pill, Utensils,
    Activity, FileText, Download, Sparkles
} from 'lucide-react';

// Simple AI Dosha Analysis Engine
function analyzeDoshaAI(symptoms) {
    const lower = symptoms.toLowerCase();
    let vata = 0, pitta = 0, kapha = 0;

    // Vata indicators
    if (lower.includes('dry') || lower.includes('anxiety') || lower.includes('insomnia')) vata += 30;
    if (lower.includes('joint') || lower.includes('constipation') || lower.includes('cold')) vata += 25;
    if (lower.includes('fatigue') || lower.includes('back pain') || lower.includes('restless')) vata += 20;
    if (lower.includes('weight loss') || lower.includes('thin')) vata += 15;

    // Pitta indicators
    if (lower.includes('acidity') || lower.includes('heartburn') || lower.includes('inflam')) pitta += 30;
    if (lower.includes('anger') || lower.includes('irritab') || lower.includes('rash')) pitta += 25;
    if (lower.includes('fever') || lower.includes('burning') || lower.includes('hot')) pitta += 20;
    if (lower.includes('diarrhea') || lower.includes('sweating') || lower.includes('sharp')) pitta += 15;

    // Kapha indicators
    if (lower.includes('congestion') || lower.includes('mucus') || lower.includes('sinus')) kapha += 30;
    if (lower.includes('weight gain') || lower.includes('sluggish') || lower.includes('depression')) kapha += 25;
    if (lower.includes('edema') || lower.includes('swelling') || lower.includes('lethargy')) kapha += 20;
    if (lower.includes('cold') || lower.includes('cough') || lower.includes('oily')) kapha += 15;

    // Add base values
    vata = Math.max(vata, 15); pitta = Math.max(pitta, 10); kapha = Math.max(kapha, 10);
    const total = vata + pitta + kapha;
    const vataP = Math.round((vata / total) * 100);
    const pittaP = Math.round((pitta / total) * 100);
    const kaphaP = 100 - vataP - pittaP;

    const dominant = vata > pitta && vata > kapha ? 'Vata' :
        pitta > vata && pitta > kapha ? 'Pitta' : 'Kapha';
    const confidence = Math.max(vataP, pittaP, kaphaP);

    const therapies = {
        Vata: ['Abhyanga (Oil Massage)', 'Shirodhara', 'Basti (Enema therapy)', 'Swedana (Steam therapy)'],
        Pitta: ['Virechana (Purgation)', 'Sheetali Pranayama', 'Cooling Abhyanga', 'Nasya therapy'],
        Kapha: ['Udvartana (Powder massage)', 'Vamana (Emesis therapy)', 'Nasya', 'Dry Sauna'],
    };
    const diets = {
        Vata: 'Warm, oily, sweet foods. Avoid cold, dry foods. Include sesame oil, ghee, warm milk.',
        Pitta: 'Cool, sweet, bitter foods. Avoid spicy, acidic, fermented foods. Include coconut, coriander.',
        Kapha: 'Light, dry, spicy foods. Avoid heavy, oily, sweet foods. Include ginger, honey, warm water.',
    };

    return { dominant, confidence, vata: vataP, pitta: pittaP, kapha: kaphaP, therapies: therapies[dominant], diet: diets[dominant] };
}

export default function DoctorDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const { user } = useAuth();
    const { appointments, prescriptions, THERAPISTS, addPrescription, addTherapy, updateAppointment, reload } = useDataStore();

    // Match by doctor_id OR doctor_name OR doctor_email
    // (robust fallback for ID mismatches when doctor was added via admin)
    const matchesMe = (record) =>
        record.doctor_id === user?.id ||
        (user?.email && record.doctor_email === user?.email) ||
        (user?.name && record.doctor_name === user?.name);

    const myAppointments = appointments.filter(matchesMe);
    const myPrescriptions = prescriptions.filter(matchesMe);

    // Consultation state
    const [selectedApt, setSelectedApt] = useState(null);
    const [consult, setConsult] = useState({
        symptoms: '', diagnosis: '', diet: '', medicines: [{ name: '', dose: '', frequency: '', duration: '' }],
        therapy: '', therapist_id: '',
    });
    const [savingRx, setSavingRx] = useState(false);

    // AI Analysis state
    const [doshaInput, setDoshaInput] = useState('');
    const [doshaResult, setDoshaResult] = useState(null);
    const [analyzingDosha, setAnalyzingDosha] = useState(false);

    const runDoshaAnalysis = async () => {
        if (!doshaInput.trim()) { toast.error('Enter symptoms first'); return; }
        setAnalyzingDosha(true);
        await new Promise(r => setTimeout(r, 1500));
        const result = analyzeDoshaAI(doshaInput);
        setDoshaResult(result);
        setAnalyzingDosha(false);
        toast.success(`Analysis complete — ${result.dominant} dominant (${result.confidence}% confidence)`);
        if (consult.symptoms !== doshaInput) {
            setConsult(c => ({ ...c, symptoms: doshaInput, diagnosis: `${result.dominant} imbalance — ${result.confidence}% confidence`, therapy: result.therapies[0], diet: result.diet }));
        }
    };

    const applyDoshaToConsult = () => {
        if (!doshaResult) return;
        setConsult(c => ({ ...c, symptoms: doshaInput, diagnosis: `${doshaResult.dominant} imbalance — ${doshaResult.confidence}% confidence`, therapy: doshaResult.therapies[0], diet: doshaResult.diet }));
        setActiveTab('consultation');
        toast.success('Dosha analysis applied to consultation!');
    };

    const savePrescription = async () => {
        if (!selectedApt) { toast.error('Select an appointment first'); return; }
        if (!consult.symptoms || !consult.diagnosis) { toast.error('Enter symptoms and diagnosis'); return; }
        setSavingRx(true);
        try {
            const therapist = THERAPISTS.find(t => t.id === consult.therapist_id);

            // ✅ FIX: await addPrescription so we get the real saved ID
            const rx = await addPrescription({
                patient_id: selectedApt.patient_id,
                patient_name: selectedApt.patient_name,
                patient_email: selectedApt.patient_email || '',
                doctor_id: user.id,
                doctor_name: user.name,
                doctor_email: user.email || '',
                appointment_id: selectedApt.id,
                symptoms: consult.symptoms,
                diagnosis: consult.diagnosis,
                dosha: doshaResult?.dominant || 'Vata',
                dosha_confidence: doshaResult?.confidence || 70,
                medicines: consult.medicines.filter(m => m.name),
                therapy: consult.therapy,
                therapist_id: consult.therapist_id,
                therapist_name: therapist?.name || '',
                diet: consult.diet,
                status: 'active',
            });

            // ✅ FIX: await addTherapy with correct prescription_id
            if (consult.therapist_id && consult.therapy) {
                await addTherapy({
                    prescription_id: rx.id,
                    patient_id: selectedApt.patient_id,
                    patient_name: selectedApt.patient_name,
                    patient_email: selectedApt.patient_email || '',
                    therapist_id: consult.therapist_id,
                    therapist_name: therapist?.name || '',
                    therapy_type: consult.therapy,
                    total_sessions: 21,
                    completed_sessions: 0,
                    start_date: new Date().toISOString().split('T')[0],
                    end_date: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
                    status: 'scheduled',
                });
            }

            // ✅ FIX: mark appointment completed so it moves out of 'pending'
            await updateAppointment(selectedApt.id, { status: 'completed' });

            toast.success('✅ Prescription saved to Supabase & therapy assigned to therapist!');
            setSelectedApt(null);
            setConsult({ symptoms: '', diagnosis: '', diet: '', medicines: [{ name: '', dose: '', frequency: '', duration: '' }], therapy: '', therapist_id: '' });
            setDoshaResult(null);
            setActiveTab('prescriptions');
        } catch (err) {
            console.error('Failed to save prescription:', err);
            toast.error('Error saving prescription. Check console.');
        } finally {
            setSavingRx(false);
        }
    };

    const addMedicine = () => setConsult(c => ({ ...c, medicines: [...c.medicines, { name: '', dose: '', frequency: '', duration: '' }] }));
    const updateMedicine = (idx, field, val) => setConsult(c => ({
        ...c, medicines: c.medicines.map((m, i) => i === idx ? { ...m, [field]: val } : m)
    }));
    const removeMedicine = (idx) => setConsult(c => ({ ...c, medicines: c.medicines.filter((_, i) => i !== idx) }));

    const downloadPrescription = (rx) => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const W = 210; // A4 width mm
        const margin = 18;
        let y = 0;

        // ── Header band ──────────────────────────────────────
        doc.setFillColor(22, 78, 99);           // dark teal
        doc.rect(0, 0, W, 38, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('PANCHAKARMA PATIENT MANAGEMENT SYSTEM', W / 2, 14, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Ayurvedic Healthcare  |  Digital Prescription', W / 2, 22, { align: 'center' });
        doc.setFontSize(9);
        doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, W / 2, 30, { align: 'center' });

        y = 46;
        doc.setTextColor(30, 30, 30);

        // ── Patient / Doctor info box ─────────────────────────
        doc.setFillColor(245, 248, 250);
        doc.roundedRect(margin, y, W - margin * 2, 34, 3, 3, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(80, 80, 80);
        doc.text('PATIENT', margin + 4, y + 8);
        doc.text('DOCTOR', W / 2 + 4, y + 8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(20, 20, 20);
        doc.setFontSize(11);
        doc.text(rx.patient_name || '—', margin + 4, y + 17);
        doc.text(rx.doctor_name || '—', W / 2 + 4, y + 17);
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Date: ${rx.date || '—'}`, margin + 4, y + 26);
        doc.text(`Appointment: ${rx.appointment_id || '—'}`, W / 2 + 4, y + 26);

        y += 42;

        // helper: section title bar
        const sectionTitle = (title, r, g, b) => {
            doc.setFillColor(r, g, b);
            doc.rect(margin, y, W - margin * 2, 7, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(title, margin + 3, y + 5);
            doc.setTextColor(30, 30, 30);
            doc.setFont('helvetica', 'normal');
            y += 10;
        };

        // helper: wrapped text block
        const wrappedText = (text, indent = 0) => {
            const lines = doc.splitTextToSize(text || '—', W - margin * 2 - indent - 2);
            doc.setFontSize(10);
            lines.forEach(line => {
                doc.text(line, margin + indent, y);
                y += 5.5;
            });
            y += 1;
        };

        // ── Dosha badge ──────────────────────────────────────
        const doshaColors = { Vata: [37, 99, 235], Pitta: [234, 88, 12], Kapha: [22, 163, 74] };
        const dc = doshaColors[rx.dosha] || [80, 80, 80];
        doc.setFillColor(...dc);
        doc.roundedRect(margin, y, 60, 12, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Dosha: ${rx.dosha || '—'}  (${rx.dosha_confidence || 0}%)`, margin + 4, y + 8);
        doc.setTextColor(30, 30, 30);
        y += 18;

        // ── Symptoms ─────────────────────────────────────────
        sectionTitle('SYMPTOMS', 101, 60, 196);   // purple
        wrappedText(rx.symptoms);

        // ── Diagnosis ────────────────────────────────────────
        sectionTitle('DIAGNOSIS', 37, 99, 235);   // blue
        wrappedText(rx.diagnosis);

        // ── Medicines ────────────────────────────────────────
        sectionTitle('MEDICINES', 16, 78, 99);    // teal
        const meds = Array.isArray(rx.medicines) ? rx.medicines.filter(m => m.name) : [];
        if (meds.length === 0) {
            doc.setFontSize(9);
            doc.setTextColor(130, 130, 130);
            doc.text('No medicines prescribed.', margin + 2, y);
            y += 6;
        } else {
            // Table header
            doc.setFillColor(230, 240, 245);
            doc.rect(margin, y, W - margin * 2, 7, 'F');
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(60, 60, 60);
            const cols = [margin + 2, margin + 60, margin + 95, margin + 135];
            ['Medicine Name', 'Dose', 'Frequency', 'Duration'].forEach((h, i) => doc.text(h, cols[i], y + 5));
            y += 9;
            doc.setFont('helvetica', 'normal');
            meds.forEach((m, idx) => {
                doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
                doc.rect(margin, y - 1, W - margin * 2, 7, 'F');
                doc.setFontSize(9);
                doc.setTextColor(20, 20, 20);
                doc.text(`${idx + 1}. ${m.name}`, cols[0], y + 4);
                doc.text(m.dose || '', cols[1], y + 4);
                doc.text(m.frequency || '', cols[2], y + 4);
                doc.text(m.duration || '', cols[3], y + 4);
                y += 8;
                if (y > 260) { doc.addPage(); y = 20; }  // page break
            });
        }
        y += 3;

        // ── Therapy ──────────────────────────────────────────
        sectionTitle('THERAPY & THERAPIST', 22, 163, 74);  // green
        doc.setFontSize(10);
        doc.text(`Therapy: ${rx.therapy || '—'}`, margin + 2, y);
        y += 6;
        doc.text(`Therapist: ${rx.therapist_name || 'TBD'}`, margin + 2, y);
        y += 8;

        // ── Diet ─────────────────────────────────────────────
        sectionTitle('DIET ADVICE', 180, 83, 9);  // amber
        wrappedText(rx.diet);

        // ── Footer ───────────────────────────────────────────
        const footerY = 285;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, footerY - 4, W - margin, footerY - 4);
        doc.setFontSize(8);
        doc.setTextColor(130, 130, 130);
        doc.text('This is a digitally generated prescription from Panchakarma PMS. Valid with doctor signature.', W / 2, footerY, { align: 'center' });
        doc.text(`Dr. ${rx.doctor_name || ''}`, W - margin, footerY - 8, { align: 'right' });
        doc.setFont('helvetica', 'italic');
        doc.text('Authorised Signature', W - margin, footerY - 3, { align: 'right' });

        // ── Save ─────────────────────────────────────────────
        const filename = `Prescription_${(rx.patient_name || 'Patient').replace(/\s+/g, '_')}_${rx.date || 'NA'}.pdf`;
        doc.save(filename);
        toast.success('📄 PDF prescription downloaded!');
    };


    return (
        <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} onRefresh={reload}>

            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Appointments', value: myAppointments.length, icon: Calendar, color: 'bg-blue-50 text-blue-600' },
                            { label: 'Scheduled', value: myAppointments.filter(a => a.status === 'scheduled').length, icon: Clock, color: 'bg-amber-50 text-amber-600' },
                            { label: 'Completed', value: myAppointments.filter(a => a.status === 'completed').length, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
                            { label: 'Prescriptions', value: myPrescriptions.length, icon: ClipboardList, color: 'bg-purple-50 text-purple-600' },
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

                    <div className="grid lg:grid-cols-2 gap-4">
                        <div className="card">
                            <h3 className="font-bold text-gray-900 mb-3">Upcoming Appointments</h3>
                            <div className="space-y-2">
                                {myAppointments.filter(a => a.status === 'scheduled').map(a => (
                                    <div key={a.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                                        <div>
                                            <p className="font-semibold text-gray-900">{a.patient_name}</p>
                                            <p className="text-gray-500 text-xs">{a.date} · {a.time} · {a.reason}</p>
                                        </div>
                                        <button onClick={() => { setSelectedApt(a); setActiveTab('consultation'); }}
                                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-100 px-3 py-1.5 rounded-lg">
                                            Consult
                                        </button>
                                    </div>
                                ))}
                                {myAppointments.filter(a => a.status === 'scheduled').length === 0 && (
                                    <p className="text-gray-400 text-sm text-center py-4">No upcoming appointments</p>
                                )}
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="font-bold text-gray-900 mb-3">Recent Prescriptions</h3>
                            <div className="space-y-2">
                                {myPrescriptions.slice(0, 4).map(rx => (
                                    <div key={rx.id} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                                        <div>
                                            <p className="font-semibold text-gray-900">{rx.patient_name}</p>
                                            <p className="text-gray-500 text-xs">{rx.date} · {rx.dosha} Dosha</p>
                                        </div>
                                        <span className="badge bg-green-100 text-green-700">{rx.status}</span>
                                    </div>
                                ))}
                                {myPrescriptions.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No prescriptions yet</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── APPOINTMENTS ── */}
            {activeTab === 'appointments' && (
                <div className="card p-0 overflow-hidden">
                    <table className="w-full">
                        <thead><tr className="border-b border-gray-100">
                            <th className="table-header text-left">Patient</th>
                            <th className="table-header text-left hidden md:table-cell">Date & Time</th>
                            <th className="table-header text-left hidden lg:table-cell">Reason</th>
                            <th className="table-header text-left">Status</th>
                            <th className="table-header text-left">Action</th>
                        </tr></thead>
                        <tbody>{myAppointments.map((a, i) => (
                            <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                                <td className="table-cell font-medium">{a.patient_name}</td>
                                <td className="table-cell hidden md:table-cell text-gray-500">{a.date} · {a.time}</td>
                                <td className="table-cell hidden lg:table-cell text-gray-400 max-w-xs truncate">{a.reason}</td>
                                <td className="table-cell"><span className={`status-${a.status}`}>{a.status}</span></td>
                                <td className="table-cell">
                                    {a.status === 'scheduled' && (
                                        <button onClick={() => { setSelectedApt(a); setActiveTab('consultation'); }}
                                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg">
                                            Open Consult
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}

            {/* ── CONSULTATION ── */}
            {activeTab === 'consultation' && (
                <div className="max-w-3xl mx-auto space-y-4">
                    {/* Select appointment */}
                    <div className="card">
                        <h3 className="font-bold text-gray-900 mb-3">Select Patient Appointment</h3>
                        <div className="grid gap-2">
                            {myAppointments.filter(a => a.status === 'scheduled').map(a => (
                                <div key={a.id} onClick={() => setSelectedApt(a)}
                                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedApt?.id === a.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-gray-900">{a.patient_name}</p>
                                        <span className="text-xs text-gray-400">{a.date} · {a.time}</span>
                                    </div>
                                    <p className="text-gray-500 text-xs mt-1">{a.reason}</p>
                                </div>
                            ))}
                            {myAppointments.filter(a => a.status === 'scheduled').length === 0 && (
                                <p className="text-gray-400 text-sm text-center py-4">No scheduled appointments</p>
                            )}
                        </div>
                    </div>

                    {selectedApt && (
                        <>
                            {/* Patient selected banner */}
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-200 text-blue-800 flex items-center justify-center font-bold text-sm">
                                    {selectedApt.patient_name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <p className="font-bold text-blue-900">{selectedApt.patient_name}</p>
                                    <p className="text-blue-600 text-xs">{selectedApt.date} · Reason: {selectedApt.reason}</p>
                                </div>
                            </div>

                            {/* ── Symptoms Checkbox Grid ── */}
                            <div className="card">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="font-bold text-gray-900 text-base">🩺 Symptoms</label>
                                    {consult.symptoms && (
                                        <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-1 rounded-full">
                                            {consult.symptoms.split(',').filter(s => s.trim()).length} selected
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5 max-h-64 overflow-y-auto border border-gray-100 rounded-xl p-3 bg-gray-50 mb-3">
                                    {[
                                        'Dry skin', 'Joint pain', 'Anxiety', 'Insomnia', 'Constipation',
                                        'Bloating', 'Irregular digestion', 'Cold hands and feet', 'Restlessness',
                                        'Muscle stiffness', 'Weight loss', 'Fatigue', 'Cracking joints',
                                        'Acid reflux', 'Heartburn', 'Skin rashes', 'Excessive sweating',
                                        'Irritability', 'Anger', 'Burning sensation in stomach', 'Inflammation',
                                        'Loose stools', 'Red eyes', 'Excess thirst', 'Headache',
                                        'Weight gain', 'Slow digestion', 'Excess mucus', 'Cold and cough',
                                        'Water retention', 'Sleepiness', 'Sluggish metabolism', 'Nasal congestion',
                                        'Depression', 'Heavy body feeling', 'Low appetite', 'Stomach pain',
                                        'Vomiting', 'Diarrhea', 'Fever', 'Weakness', 'Body pain',
                                        'Loss of appetite', 'Nausea', 'Dizziness',
                                    ].map((symptom) => {
                                        const currentList = consult.symptoms.split(',').map(s => s.trim()).filter(Boolean);
                                        const isChecked = currentList.includes(symptom);
                                        return (
                                            <label key={symptom}
                                                className={`flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5 transition-all select-none
                                                    ${isChecked ? 'bg-purple-50 text-purple-800' : 'hover:bg-white text-gray-700'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => {
                                                        const updated = isChecked
                                                            ? currentList.filter(s => s !== symptom)
                                                            : [...currentList, symptom];
                                                        setConsult(c => ({ ...c, symptoms: updated.join(', ') }));
                                                    }}
                                                    className="accent-purple-600 w-4 h-4 flex-shrink-0"
                                                />
                                                <span className="text-xs font-medium leading-tight">{symptom}</span>
                                            </label>
                                        );
                                    })}
                                </div>

                                {consult.symptoms.trim() && (
                                    <div className="flex items-start gap-2 mb-3 p-2.5 bg-purple-50 border border-purple-100 rounded-xl">
                                        <p className="text-xs text-purple-700 flex-1 leading-relaxed">
                                            <span className="font-semibold">Selected: </span>{consult.symptoms}
                                        </p>
                                        <button onClick={() => setConsult(c => ({ ...c, symptoms: '' }))}
                                            className="text-xs text-red-400 hover:text-red-600 font-semibold flex-shrink-0 mt-0.5">
                                            Clear all
                                        </button>
                                    </div>
                                )}

                                <textarea className="input-field text-sm resize-none" rows={2}
                                    value={consult.symptoms}
                                    onChange={e => setConsult(c => ({ ...c, symptoms: e.target.value }))}
                                    placeholder="Or type additional symptoms manually..." />

                                <button onClick={() => { setDoshaInput(consult.symptoms); setActiveTab('dosha'); }}
                                    disabled={!consult.symptoms.trim()}
                                    className="mt-3 btn-primary text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                                    <Sparkles className="w-4 h-4" /> Run AI Dosha Analysis
                                </button>
                            </div>

                            {/* Diagnosis */}
                            <div className="card">
                                <label className="label">Diagnosis</label>
                                <textarea className="input-field min-h-[60px] resize-none" value={consult.diagnosis}
                                    onChange={e => setConsult(c => ({ ...c, diagnosis: e.target.value }))}
                                    placeholder="Enter your diagnosis..." />
                            </div>

                            {/* Medicines */}
                            <div className="card">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="label mb-0 flex items-center gap-2">
                                        <Pill className="w-4 h-4" /> Medicines
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {consult.medicines.filter(m => m.name).length > 0 && (
                                            <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded-full">
                                                {consult.medicines.filter(m => m.name).length} added
                                            </span>
                                        )}
                                        <button onClick={addMedicine} className="text-xs text-blue-600 flex items-center gap-1 font-semibold hover:text-blue-800">
                                            <Plus className="w-3 h-3" /> Add custom
                                        </button>
                                    </div>
                                </div>

                                {/* ── Quick-select grouped by Dosha ── */}
                                <div className="mb-4 space-y-3">
                                    {[
                                        {
                                            label: 'Vata Treatment', color: 'blue',
                                            medicines: [
                                                { name: 'Ashwagandha', dose: '5g', frequency: 'Twice daily', duration: '30 days' },
                                                { name: 'Dashmoola', dose: '3g', frequency: 'Twice daily', duration: '21 days' },
                                                { name: 'Bala', dose: '5g', frequency: 'Once daily', duration: '30 days' },
                                                { name: 'Shatavari', dose: '5g', frequency: 'Twice daily', duration: '30 days' },
                                                { name: 'Hingvastak Churna', dose: '3g', frequency: 'Before meals', duration: '21 days' },
                                                { name: 'Mahanarayan Oil', dose: 'External', frequency: 'Daily massage', duration: '21 days' },
                                                { name: 'Saraswatarishta', dose: '15ml', frequency: 'Twice daily', duration: '30 days' },
                                                { name: 'Brahmi Tablets', dose: '2 tabs', frequency: 'Twice daily', duration: '30 days' },
                                                { name: 'Yogaraj Guggulu', dose: '2 tabs', frequency: 'Twice daily', duration: '30 days' },
                                                { name: 'Vata Chintamani Ras', dose: '125mg', frequency: 'Once daily', duration: '15 days' },
                                            ],
                                        },
                                        {
                                            label: 'Pitta Treatment', color: 'orange',
                                            medicines: [
                                                { name: 'Amla Capsules', dose: '500mg', frequency: 'Twice daily', duration: '30 days' },
                                                { name: 'Avipattikar Churna', dose: '3g', frequency: 'Before meals', duration: '21 days' },
                                                { name: 'Guduchi', dose: '3g', frequency: 'Twice daily', duration: '30 days' },
                                                { name: 'Neem Tablets', dose: '2 tabs', frequency: 'Twice daily', duration: '21 days' },
                                                { name: 'Praval Pishti', dose: '250mg', frequency: 'Twice daily', duration: '15 days' },
                                                { name: 'Kamdudha Ras', dose: '125mg', frequency: 'Twice daily', duration: '15 days' },
                                                { name: 'Shatavari Tablets', dose: '2 tabs', frequency: 'Twice daily', duration: '30 days' },
                                                { name: 'Chandanasava', dose: '15ml', frequency: 'Twice daily', duration: '21 days' },
                                                { name: 'Usheerasava', dose: '15ml', frequency: 'Twice daily', duration: '21 days' },
                                                { name: 'Mahatiktaka Ghrita', dose: '10ml', frequency: 'Once daily', duration: '21 days' },
                                            ],
                                        },
                                        {
                                            label: 'Kapha Treatment', color: 'green',
                                            medicines: [
                                                { name: 'Trikatu Churna', dose: '3g', frequency: 'Before meals', duration: '21 days' },
                                                { name: 'Sitopaladi Churna', dose: '3g', frequency: 'Twice daily', duration: '21 days' },
                                                { name: 'Talisadi Churna', dose: '3g', frequency: 'Twice daily', duration: '21 days' },
                                                { name: 'Pushkarmool', dose: '3g', frequency: 'Twice daily', duration: '21 days' },
                                                { name: 'Vyoshadi Vati', dose: '2 tabs', frequency: 'Twice daily', duration: '21 days' },
                                                { name: 'Guggulu Tablets', dose: '2 tabs', frequency: 'Twice daily', duration: '30 days' },
                                                { name: 'Punarnava Tablets', dose: '2 tabs', frequency: 'Twice daily', duration: '30 days' },
                                                { name: 'Kanakasava', dose: '15ml', frequency: 'Twice daily', duration: '21 days' },
                                                { name: 'Pippali Tablets', dose: '2 tabs', frequency: 'Once daily', duration: '21 days' },
                                                { name: 'Talisa Patra', dose: '3g', frequency: 'Twice daily', duration: '21 days' },
                                            ],
                                        },
                                        {
                                            label: 'General Ayurvedic', color: 'purple',
                                            medicines: [
                                                { name: 'Triphala Churna', dose: '3g', frequency: 'At bedtime', duration: '30 days' },
                                                { name: 'Chyawanprash', dose: '10g', frequency: 'Once daily', duration: '30 days' },
                                                { name: 'Liv-52', dose: '2 tabs', frequency: 'Twice daily', duration: '30 days' },
                                                { name: 'Brahmi Syrup', dose: '10ml', frequency: 'Twice daily', duration: '30 days' },
                                                { name: 'Ashwagandha Capsules', dose: '1 cap', frequency: 'Twice daily', duration: '30 days' },
                                                { name: 'Tulsi Tablets', dose: '2 tabs', frequency: 'Twice daily', duration: '21 days' },
                                                { name: 'Giloy Juice', dose: '30ml', frequency: 'Once daily', duration: '30 days' },
                                                { name: 'Amalaki Rasayana', dose: '5g', frequency: 'Once daily', duration: '30 days' },
                                                { name: 'Arjuna Tablets', dose: '2 tabs', frequency: 'Twice daily', duration: '30 days' },
                                                { name: 'Haritaki Powder', dose: '3g', frequency: 'At bedtime', duration: '21 days' },
                                            ],
                                        },
                                    ].map(({ label, color, medicines: mList }) => {
                                        const colorMap = {
                                            blue: 'bg-blue-50 text-blue-800 border-blue-200',
                                            orange: 'bg-orange-50 text-orange-800 border-orange-200',
                                            green: 'bg-green-50 text-green-800 border-green-200',
                                            purple: 'bg-purple-50 text-purple-800 border-purple-200',
                                        };
                                        const accentMap = {
                                            blue: 'accent-blue-600', orange: 'accent-orange-500',
                                            green: 'accent-green-600', purple: 'accent-purple-600',
                                        };
                                        const selectedNames = consult.medicines.map(m => m.name);
                                        return (
                                            <div key={label} className={`rounded-xl border p-3 ${colorMap[color]}`}>
                                                <p className="text-xs font-bold mb-2 uppercase tracking-wide opacity-70">{label}</p>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-1.5">
                                                    {mList.map((med) => {
                                                        const isChecked = selectedNames.includes(med.name);
                                                        return (
                                                            <label key={med.name}
                                                                className="flex items-center gap-1.5 cursor-pointer select-none group">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    className={`${accentMap[color]} w-3.5 h-3.5 flex-shrink-0`}
                                                                    onChange={() => {
                                                                        if (isChecked) {
                                                                            // Remove this medicine from the list
                                                                            setConsult(c => ({
                                                                                ...c,
                                                                                medicines: c.medicines.filter(m => m.name !== med.name),
                                                                            }));
                                                                        } else {
                                                                            // Add with defaults; remove any blank placeholder rows first
                                                                            setConsult(c => {
                                                                                const withoutBlanks = c.medicines.filter(m => m.name.trim());
                                                                                return {
                                                                                    ...c,
                                                                                    medicines: [...withoutBlanks, { ...med }],
                                                                                };
                                                                            });
                                                                        }
                                                                    }}
                                                                />
                                                                <span className="text-xs font-medium leading-tight group-hover:opacity-80">
                                                                    {med.name}
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* ── Manual Entry Rows (editable after checkbox selection) ── */}
                                {consult.medicines.length === 0 && (
                                    <p className="text-xs text-gray-400 text-center py-2 italic">
                                        Select medicines above or click "Add custom" to enter manually
                                    </p>
                                )}
                                {consult.medicines.map((m, idx) => (
                                    <div key={idx} className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2 items-end">
                                        <input className="input-field text-sm py-2" placeholder="Medicine name" value={m.name} onChange={e => updateMedicine(idx, 'name', e.target.value)} />
                                        <input className="input-field text-sm py-2" placeholder="Dose (e.g. 5g)" value={m.dose} onChange={e => updateMedicine(idx, 'dose', e.target.value)} />
                                        <input className="input-field text-sm py-2" placeholder="Frequency" value={m.frequency} onChange={e => updateMedicine(idx, 'frequency', e.target.value)} />
                                        <div className="flex gap-2">
                                            <input className="input-field text-sm py-2 flex-1" placeholder="Duration" value={m.duration} onChange={e => updateMedicine(idx, 'duration', e.target.value)} />
                                            <button onClick={() => removeMedicine(idx)} className="text-red-400 hover:text-red-600 p-2"><X className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>


                            {/* Therapy & Diet */}
                            <div className="card">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label flex items-center gap-2"><Activity className="w-4 h-4" /> Therapy</label>
                                        <input className="input-field" value={consult.therapy} onChange={e => setConsult(c => ({ ...c, therapy: e.target.value }))} placeholder="e.g. Abhyanga + Shirodhara (21 days)" />
                                    </div>
                                    <div>
                                        <label className="label">Assign Therapist</label>
                                        <select className="input-field" value={consult.therapist_id} onChange={e => setConsult(c => ({ ...c, therapist_id: e.target.value }))}>
                                            <option value="">Select Therapist</option>
                                            {THERAPISTS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="label flex items-center gap-2"><Utensils className="w-4 h-4" /> Diet Advice</label>
                                    <textarea className="input-field min-h-[60px] resize-none" value={consult.diet}
                                        onChange={e => setConsult(c => ({ ...c, diet: e.target.value }))}
                                        placeholder="Enter dietary recommendations..." />
                                </div>
                            </div>

                            <button onClick={savePrescription} disabled={savingRx}
                                className="w-full btn-primary flex items-center justify-center gap-2">
                                {savingRx ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                {savingRx ? 'Saving Prescription...' : 'Generate & Save Prescription'}
                            </button>
                        </>
                    )}
                </div>
            )}


            {/* ── AI DOSHA ANALYSIS ── */}
            {activeTab === 'dosha' && (
                <div className="max-w-2xl mx-auto space-y-4">
                    <div className="card">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                <Brain className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900 text-lg">AI Dosha Analysis</h2>
                                <p className="text-gray-500 text-sm">Enter symptoms to identify the dominant dosha</p>
                            </div>
                        </div>
                        <label className="label">Patient Symptoms</label>
                        <textarea className="input-field min-h-[100px] resize-none" value={doshaInput}
                            onChange={e => setDoshaInput(e.target.value)}
                            placeholder="Describe patient symptoms in detail (e.g. dry skin, anxiety, joint pain, constipation, insomnia, weight loss...)&#10;&#10;More detail = better accuracy" />
                        <button onClick={runDoshaAnalysis} disabled={analyzingDosha}
                            className="mt-3 w-full btn-primary flex items-center justify-center gap-2">
                            {analyzingDosha ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing...</> : <><Sparkles className="w-4 h-4" />Run AI Analysis</>}
                        </button>
                    </div>

                    {doshaResult && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                            {/* Result Header */}
                            <div className={`rounded-2xl p-6 text-white ${doshaResult.dominant === 'Vata' ? 'bg-gradient-to-r from-blue-600 to-blue-700' :
                                doshaResult.dominant === 'Pitta' ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-gradient-to-r from-green-600 to-emerald-700'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-white/70 text-sm">Dominant Dosha</p>
                                        <h2 className="text-4xl font-extrabold">{doshaResult.dominant}</h2>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white/70 text-sm">Confidence</p>
                                        <p className="text-3xl font-extrabold">{doshaResult.confidence}%</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {[{ d: 'Vata', v: doshaResult.vata }, { d: 'Pitta', v: doshaResult.pitta }, { d: 'Kapha', v: doshaResult.kapha }].map(item => (
                                        <div key={item.d} className="bg-white/15 rounded-xl p-3 text-center">
                                            <p className="text-sm font-semibold">{item.d}</p>
                                            <p className="text-2xl font-bold">{item.v}%</p>
                                            <div className="mt-2 bg-white/20 rounded-full h-1.5">
                                                <div className="bg-white rounded-full h-1.5" style={{ width: item.v + '%' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recommended Therapies */}
                            <div className="card">
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-green-600" /> Recommended Therapies
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {doshaResult.therapies.map((t, i) => (
                                        <div key={i} className="bg-green-50 border border-green-100 rounded-xl p-3 text-sm font-medium text-green-800">
                                            {t}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Diet */}
                            <div className="card">
                                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <Utensils className="w-5 h-5 text-amber-600" /> Diet Recommendation
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{doshaResult.diet}</p>
                            </div>

                            <button onClick={applyDoshaToConsult} className="w-full btn-secondary flex items-center justify-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Apply to Consultation
                            </button>
                        </motion.div>
                    )}
                </div>
            )}

            {/* ── PRESCRIPTIONS ── */}
            {activeTab === 'prescriptions' && (
                <div className="space-y-4">
                    {myPrescriptions.length === 0 && (
                        <div className="card text-center py-12 text-gray-400">
                            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No prescriptions generated yet</p>
                            <p className="text-xs mt-1">Go to Consultations to create one</p>
                        </div>
                    )}
                    {myPrescriptions.map((rx) => (
                        <motion.div key={rx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{rx.patient_name}</h3>
                                    <p className="text-gray-400 text-sm">{rx.date} · via {rx.doctor_name}</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="badge bg-blue-100 text-blue-700">{rx.dosha} — {rx.dosha_confidence}%</span>
                                    <button onClick={() => downloadPrescription(rx)}
                                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg font-semibold">
                                        <Download className="w-3 h-3" /> Download
                                    </button>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-semibold text-gray-700 mb-1">Symptoms</p>
                                    <p className="text-gray-500">{rx.symptoms}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-700 mb-1">Diagnosis</p>
                                    <p className="text-gray-500">{rx.diagnosis}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-700 mb-2">Medicines ({rx.medicines?.length || 0})</p>
                                    <div className="space-y-1">
                                        {rx.medicines?.map((m, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs bg-blue-50 rounded-lg px-3 py-1.5">
                                                <Pill className="w-3 h-3 text-blue-500" />
                                                <span className="font-medium text-blue-800">{m.name}</span>
                                                <span className="text-blue-500">· {m.dose} · {m.frequency}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-700 mb-1">Therapy</p>
                                    <p className="text-gray-500">{rx.therapy}</p>
                                    <p className="font-semibold text-gray-700 mt-2 mb-1">Diet</p>
                                    <p className="text-gray-500">{rx.diet}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
