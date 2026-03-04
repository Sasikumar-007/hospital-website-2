import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import { useDataStore } from '../../hooks/useDataStore.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    Activity, Users, Calendar, CheckCircle, Clock, Plus,
    X, Loader2, MessageSquare, Star, TrendingUp
} from 'lucide-react';

export default function TherapistDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const { user } = useAuth();
    const { therapies, updateTherapy, reload } = useDataStore();

    const myTherapies = therapies.filter(t => t.therapist_id === user?.id);
    const scheduled = myTherapies.filter(t => t.status === 'scheduled');
    const inProgress = myTherapies.filter(t => t.status === 'in-progress');
    const completed = myTherapies.filter(t => t.status === 'completed');

    const [selectedTherapy, setSelectedTherapy] = useState(null);
    const [noteText, setNoteText] = useState('');
    const [mood, setMood] = useState('good');
    const [savingNote, setSavingNote] = useState(false);

    const addNote = async () => {
        if (!noteText.trim() || !selectedTherapy) return;
        setSavingNote(true);
        await new Promise(r => setTimeout(r, 600));
        const newCompleted = selectedTherapy.completed_sessions + 1;
        const isFinished = newCompleted >= selectedTherapy.total_sessions;
        const newNote = {
            session: newCompleted,
            date: new Date().toISOString().split('T')[0],
            note: noteText,
            mood,
        };
        updateTherapy(selectedTherapy.id, {
            completed_sessions: newCompleted,
            status: isFinished ? 'completed' : 'in-progress',
            notes: [...(selectedTherapy.notes || []), newNote],
        });
        toast.success(isFinished ? 'Therapy course completed! 🎉' : `Session ${newCompleted} recorded!`);
        setSelectedTherapy(prev => ({
            ...prev,
            completed_sessions: newCompleted,
            status: isFinished ? 'completed' : 'in-progress',
            notes: [...(prev.notes || []), newNote],
        }));
        setNoteText('');
        setSavingNote(false);
    };

    const TherapyCard = ({ therapy }) => {
        const pct = Math.round((therapy.completed_sessions / therapy.total_sessions) * 100);
        return (
            <motion.div key={therapy.id} whileHover={{ y: -2 }}
                className={`card cursor-pointer border-2 transition-all ${selectedTherapy?.id === therapy.id ? 'border-green-500' : 'border-transparent'}`}
                onClick={() => setSelectedTherapy(therapy)}>
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="font-bold text-gray-900">{therapy.patient_name}</h3>
                        <p className="text-gray-400 text-xs">{therapy.therapy_type}</p>
                    </div>
                    <span className={`status-${therapy.status}`}>{therapy.status.replace('-', ' ')}</span>
                </div>
                <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{therapy.completed_sessions}/{therapy.total_sessions} sessions ({pct}%)</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2.5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: pct + '%' }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-2.5 rounded-full ${pct === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Start: {therapy.start_date}</span>
                    <span>End: {therapy.end_date}</span>
                </div>
            </motion.div>
        );
    };

    return (
        <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} onRefresh={reload}>

            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Patients', value: myTherapies.length, icon: Users, color: 'bg-blue-50 text-blue-600' },
                            { label: 'Scheduled', value: scheduled.length, icon: Calendar, color: 'bg-amber-50 text-amber-600' },
                            { label: 'In Progress', value: inProgress.length, icon: Activity, color: 'bg-purple-50 text-purple-600' },
                            { label: 'Completed', value: completed.length, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
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
                            <h3 className="font-bold text-gray-900 mb-3">Active Therapies</h3>
                            <div className="space-y-2">
                                {inProgress.map(t => (
                                    <div key={t.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                                        <div>
                                            <p className="font-semibold text-gray-900">{t.patient_name}</p>
                                            <p className="text-gray-500 text-xs">{t.therapy_type}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-purple-700">{t.completed_sessions}/{t.total_sessions}</p>
                                            <p className="text-xs text-gray-400">sessions</p>
                                        </div>
                                    </div>
                                ))}
                                {inProgress.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No active therapies</p>}
                            </div>
                        </div>
                        <div className="card">
                            <h3 className="font-bold text-gray-900 mb-3">Today's Schedule</h3>
                            <div className="space-y-2">
                                {myTherapies.filter(t => t.status !== 'completed').map((t, i) => (
                                    <div key={t.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                                        <div className={`w-2 h-2 rounded-full ${t.status === 'in-progress' ? 'bg-green-500' : 'bg-amber-500'}`} />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800 text-sm">{t.patient_name}</p>
                                            <p className="text-gray-400 text-xs">{t.therapy_type}</p>
                                        </div>
                                        <Clock className="w-4 h-4 text-gray-300" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MY PATIENTS ── */}
            {activeTab === 'patients' && (
                <div className="grid md:grid-cols-2 gap-4">
                    {myTherapies.map(t => <TherapyCard key={t.id} therapy={t} />)}
                    {myTherapies.length === 0 && (
                        <div className="col-span-2 card text-center py-12 text-gray-400">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No patients assigned yet</p>
                        </div>
                    )}
                </div>
            )}

            {/* ── THERAPY SESSIONS ── */}
            {activeTab === 'therapies' && (
                <div className="grid lg:grid-cols-2 gap-4">
                    {/* Therapy list */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-gray-900">My Therapies</h3>
                        {myTherapies.map(t => <TherapyCard key={t.id} therapy={t} />)}
                    </div>

                    {/* Session update panel */}
                    <div>
                        {selectedTherapy ? (
                            <div className="card space-y-4 sticky top-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900">Update Session</h3>
                                    <button onClick={() => setSelectedTherapy(null)} className="p-1 hover:bg-gray-100 rounded-xl"><X className="w-4 h-4" /></button>
                                </div>

                                <div className="bg-green-50 rounded-xl p-4">
                                    <p className="font-bold text-green-900">{selectedTherapy.patient_name}</p>
                                    <p className="text-green-600 text-sm">{selectedTherapy.therapy_type}</p>
                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs text-green-700 mb-1">
                                            <span>Progress</span>
                                            <span>{selectedTherapy.completed_sessions}/{selectedTherapy.total_sessions}</span>
                                        </div>
                                        <div className="bg-green-200 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(selectedTherapy.completed_sessions / selectedTherapy.total_sessions) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>

                                {selectedTherapy.status !== 'completed' && (
                                    <>
                                        <div>
                                            <label className="label">Session Notes</label>
                                            <textarea className="input-field min-h-[80px] resize-none" value={noteText}
                                                onChange={e => setNoteText(e.target.value)}
                                                placeholder="Describe today's session, patient response, observations..." />
                                        </div>
                                        <div>
                                            <label className="label">Patient Mood</label>
                                            <div className="flex gap-2">
                                                {['poor', 'okay', 'good', 'excellent'].map(m => (
                                                    <button key={m} onClick={() => setMood(m)}
                                                        className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all border ${mood === m ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-600 hover:border-green-300'}`}>
                                                        {m}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <button onClick={addNote} disabled={savingNote || !noteText.trim()}
                                            className="w-full btn-secondary flex items-center justify-center gap-2">
                                            {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                            {savingNote ? 'Recording...' : 'Record Session'}
                                        </button>
                                    </>
                                )}

                                {/* Session history */}
                                <div>
                                    <h4 className="font-semibold text-gray-700 text-sm mb-2">Session History</h4>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {(selectedTherapy.notes || []).map((n, i) => (
                                            <div key={i} className="bg-gray-50 rounded-xl p-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-bold text-gray-500">Session {n.session}</span>
                                                    <div className="flex items-center gap-1">
                                                        <span className={`text-xs font-medium ${n.mood === 'excellent' ? 'text-green-600' : n.mood === 'good' ? 'text-blue-600' : 'text-amber-600'}`}>
                                                            {n.mood}
                                                        </span>
                                                        <span className="text-gray-400 text-xs">· {n.date}</span>
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 text-xs">{n.note}</p>
                                            </div>
                                        ))}
                                        {(!selectedTherapy.notes || selectedTherapy.notes.length === 0) && (
                                            <p className="text-gray-400 text-xs text-center py-2">No sessions recorded yet</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="card text-center py-12 text-gray-400">
                                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                <p>Select a therapy to update sessions</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── SCHEDULE ── */}
            {activeTab === 'schedule' && (
                <div className="space-y-4">
                    <div className="card">
                        <h3 className="font-bold text-gray-900 mb-4">Weekly Schedule</h3>
                        <div className="grid grid-cols-7 gap-2 text-center text-xs mb-3">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                <div key={d} className="font-semibold text-gray-500 py-2">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: 7 }).map((_, i) => {
                                const day = new Date();
                                day.setDate(day.getDate() - day.getDay() + i + 1);
                                const therapiesOnDay = myTherapies.filter(t => t.status !== 'completed');
                                return (
                                    <div key={i} className={`min-h-[80px] rounded-xl p-2 text-center ${i === new Date().getDay() - 1 ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50 border border-gray-100'}`}>
                                        <p className={`text-xs font-bold mb-2 ${i === new Date().getDay() - 1 ? 'text-blue-700' : 'text-gray-400'}`}>
                                            {day.getDate()}
                                        </p>
                                        {therapiesOnDay.slice(0, i < 5 ? 2 : 0).map((t, ti) => (
                                            <div key={ti} className="bg-green-100 text-green-700 rounded text-xs p-1 mb-1 truncate">{t.patient_name.split(' ')[0]}</div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="card p-0 overflow-hidden">
                        <table className="w-full">
                            <thead><tr className="border-b border-gray-100">
                                <th className="table-header text-left">Patient</th>
                                <th className="table-header text-left">Therapy</th>
                                <th className="table-header text-left hidden md:table-cell">Period</th>
                                <th className="table-header text-left">Progress</th>
                                <th className="table-header text-left">Status</th>
                            </tr></thead>
                            <tbody>{myTherapies.map(t => (
                                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="table-cell font-medium">{t.patient_name}</td>
                                    <td className="table-cell text-gray-500">{t.therapy_type}</td>
                                    <td className="table-cell hidden md:table-cell text-gray-400">{t.start_date} → {t.end_date}</td>
                                    <td className="table-cell">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(t.completed_sessions / t.total_sessions) * 100}%` }} />
                                            </div>
                                            <span className="text-xs text-gray-500">{t.completed_sessions}/{t.total_sessions}</span>
                                        </div>
                                    </td>
                                    <td className="table-cell"><span className={`status-${t.status}`}>{t.status.replace('-', ' ')}</span></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
