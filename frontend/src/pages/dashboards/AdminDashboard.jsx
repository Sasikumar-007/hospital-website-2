import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import { useDataStore } from '../../hooks/useDataStore.js';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    Users, Calendar, Activity, ClipboardList, TrendingUp, TrendingDown,
    UserPlus, AlertCircle, CheckCircle, Clock, BarChart3, Search,
    Trash2, Edit2, Eye, RefreshCw, X, Plus, Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const MONTHLY_DATA = [
    { month: 'Oct', appointments: 45, therapies: 38, prescriptions: 40 },
    { month: 'Nov', appointments: 52, therapies: 44, prescriptions: 48 },
    { month: 'Dec', appointments: 48, therapies: 42, prescriptions: 45 },
    { month: 'Jan', appointments: 61, therapies: 55, prescriptions: 58 },
    { month: 'Feb', appointments: 72, therapies: 63, prescriptions: 68 },
    { month: 'Mar', appointments: 80, therapies: 71, prescriptions: 75 },
];

const DOSHA_DATA = [
    { name: 'Vata', value: 38, color: '#2563EB' },
    { name: 'Pitta', value: 35, color: '#16A34A' },
    { name: 'Kapha', value: 27, color: '#F59E0B' },
];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'doctor', specialization: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [addingUser, setAddingUser] = useState(false);
    const { appointments, therapies, prescriptions, users, DOCTORS, THERAPISTS, PATIENTS, addUser, reload } = useDataStore();

    const stats = [
        { label: 'Total Users', value: users.length, icon: Users, change: '+12%', up: true, color: 'blue' },
        { label: 'Total Appointments', value: appointments.length, icon: Calendar, change: '+8%', up: true, color: 'green' },
        { label: 'Active Therapies', value: therapies.filter(t => t.status === 'in-progress').length, icon: Activity, change: '+5%', up: true, color: 'purple' },
        { label: 'Prescriptions', value: prescriptions.length, icon: ClipboardList, change: '+15%', up: true, color: 'amber' },
    ];

    const colorMap = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
    };

    const handleAddUser = async () => {
        if (!newUser.name || !newUser.email) { toast.error('Name and email required'); return; }
        setAddingUser(true);
        await new Promise(r => setTimeout(r, 800));
        addUser({ ...newUser, avatar: newUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() });
        toast.success(`${newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)} added successfully!`);
        setNewUser({ name: '', email: '', role: 'doctor', specialization: '' });
        setShowAddUser(false);
        setAddingUser(false);
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} onRefresh={reload}>

            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((s, i) => (
                            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                className="stat-card">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-10 h-10 rounded-xl ${colorMap[s.color]} border flex items-center justify-center`}>
                                        <s.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`flex items-center gap-1 text-xs font-semibold ${s.up ? 'text-green-600' : 'text-red-500'}`}>
                                        {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {s.change}
                                    </span>
                                </div>
                                <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                                <p className="text-gray-500 text-sm mt-1">{s.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Charts Row */}
                    <div className="grid lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 card">
                            <h3 className="font-bold text-gray-900 mb-4">Monthly Activity</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={MONTHLY_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="appointments" fill="#2563EB" radius={[4, 4, 0, 0]} name="Appointments" />
                                    <Bar dataKey="therapies" fill="#16A34A" radius={[4, 4, 0, 0]} name="Therapies" />
                                    <Bar dataKey="prescriptions" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Prescriptions" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="card">
                            <h3 className="font-bold text-gray-900 mb-4">Dosha Distribution</h3>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={DOSHA_DATA} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({ name, value }) => `${name} ${value}%`} labelLine={false} fontSize={11}>
                                        {DOSHA_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-2">
                                {DOSHA_DATA.map(d => (
                                    <div key={d.name} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                                            <span className="text-gray-600">{d.name}</span>
                                        </div>
                                        <span className="font-semibold">{d.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="card">
                            <h3 className="font-semibold text-gray-900 mb-3">Doctors ({DOCTORS.length})</h3>
                            <div className="space-y-2">
                                {DOCTORS.slice(0, 3).map(d => (
                                    <div key={d.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">{d.avatar}</div>
                                        <div><p className="text-sm font-medium text-gray-800">{d.name}</p><p className="text-xs text-gray-400">{d.specialization}</p></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="card">
                            <h3 className="font-semibold text-gray-900 mb-3">Therapists ({THERAPISTS.length})</h3>
                            <div className="space-y-2">
                                {THERAPISTS.slice(0, 3).map(t => (
                                    <div key={t.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                                        <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs">{t.avatar}</div>
                                        <div><p className="text-sm font-medium text-gray-800">{t.name}</p><p className="text-xs text-gray-400">{t.specialization}</p></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="card">
                            <h3 className="font-semibold text-gray-900 mb-3">Recent Appointments</h3>
                            <div className="space-y-2">
                                {appointments.slice(0, 3).map(a => (
                                    <div key={a.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50">
                                        <div><p className="text-sm font-medium text-gray-800">{a.patient_name}</p><p className="text-xs text-gray-400">{a.date}</p></div>
                                        <span className={`status-${a.status}`}>{a.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── USER MANAGEMENT ── */}
            {activeTab === 'users' && (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search users..." className="input-field pl-9" />
                        </div>
                        <button onClick={() => setShowAddUser(true)} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
                            <UserPlus className="w-4 h-4" /> Add User
                        </button>
                    </div>

                    <div className="card p-0 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="table-header text-left">User</th>
                                    <th className="table-header text-left">Role</th>
                                    <th className="table-header text-left hidden md:table-cell">Email</th>
                                    <th className="table-header text-left hidden lg:table-cell">Specialization</th>
                                    <th className="table-header text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u, i) => (
                                    <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="table-cell">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs
                          ${u.role === 'admin' ? 'bg-red-100 text-red-700' :
                                                        u.role === 'doctor' ? 'bg-blue-100 text-blue-700' :
                                                            u.role === 'therapist' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                                                    {u.avatar || u.name?.slice(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <span className={`badge capitalize
                        ${u.role === 'admin' ? 'bg-red-100 text-red-700' :
                                                    u.role === 'doctor' ? 'bg-blue-100 text-blue-700' :
                                                        u.role === 'therapist' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="table-cell hidden md:table-cell text-gray-500">{u.email}</td>
                                        <td className="table-cell hidden lg:table-cell text-gray-500">{u.specialization || '—'}</td>
                                        <td className="table-cell"><span className="status-completed">{u.status || 'active'}</span></td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── ALL APPOINTMENTS ── */}
            {activeTab === 'appointments' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {['scheduled', 'completed', 'pending', 'cancelled'].map(s => (
                            <div key={s} className="card text-center py-4">
                                <p className="text-2xl font-extrabold text-gray-900">{appointments.filter(a => a.status === s).length}</p>
                                <p className="text-gray-500 text-sm capitalize">{s}</p>
                            </div>
                        ))}
                    </div>
                    <div className="card p-0 overflow-hidden">
                        <table className="w-full">
                            <thead><tr className="border-b border-gray-100">
                                <th className="table-header text-left">Patient</th>
                                <th className="table-header text-left">Doctor</th>
                                <th className="table-header text-left hidden md:table-cell">Date & Time</th>
                                <th className="table-header text-left hidden lg:table-cell">Reason</th>
                                <th className="table-header text-left">Status</th>
                            </tr></thead>
                            <tbody>{appointments.map((a, i) => (
                                <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="table-cell font-medium">{a.patient_name}</td>
                                    <td className="table-cell text-gray-500">{a.doctor_name}</td>
                                    <td className="table-cell hidden md:table-cell text-gray-500">{a.date} · {a.time}</td>
                                    <td className="table-cell hidden lg:table-cell text-gray-400 max-w-xs truncate">{a.reason}</td>
                                    <td className="table-cell"><span className={`status-${a.status}`}>{a.status}</span></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── ALL THERAPIES ── */}
            {activeTab === 'therapies' && (
                <div className="card p-0 overflow-hidden">
                    <table className="w-full">
                        <thead><tr className="border-b border-gray-100">
                            <th className="table-header text-left">Patient</th>
                            <th className="table-header text-left">Therapist</th>
                            <th className="table-header text-left hidden md:table-cell">Therapy Type</th>
                            <th className="table-header text-left">Progress</th>
                            <th className="table-header text-left">Status</th>
                        </tr></thead>
                        <tbody>{therapies.map((t, i) => (
                            <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                                <td className="table-cell font-medium">{t.patient_name}</td>
                                <td className="table-cell text-gray-500">{t.therapist_name}</td>
                                <td className="table-cell hidden md:table-cell text-gray-500">{t.therapy_type}</td>
                                <td className="table-cell">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-100 rounded-full h-2 min-w-[60px]">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(t.completed_sessions / t.total_sessions) * 100}%` }} />
                                        </div>
                                        <span className="text-xs text-gray-500">{t.completed_sessions}/{t.total_sessions}</span>
                                    </div>
                                </td>
                                <td className="table-cell"><span className={`status-${t.status}`}>{t.status}</span></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}

            {/* ── PRESCRIPTIONS ── */}
            {activeTab === 'prescriptions' && (
                <div className="space-y-3">
                    {prescriptions.map((rx) => (
                        <div key={rx.id} className="card">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-900">{rx.patient_name}</h3>
                                    <p className="text-gray-400 text-sm">by {rx.doctor_name} · {rx.date}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`badge bg-blue-100 text-blue-700`}>{rx.dosha} Dosha</span>
                                    <span className="status-active bg-green-100 text-green-700 badge">{rx.status}</span>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-3 gap-3 text-sm">
                                <div><p className="font-semibold text-gray-700 mb-1">Diagnosis</p><p className="text-gray-500">{rx.diagnosis}</p></div>
                                <div><p className="font-semibold text-gray-700 mb-1">Therapy</p><p className="text-gray-500">{rx.therapy}</p></div>
                                <div><p className="font-semibold text-gray-700 mb-1">Therapist</p><p className="text-gray-500">{rx.therapist_name || 'Not assigned'}</p></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── ANALYTICS ── */}
            {activeTab === 'analytics' && (
                <div className="space-y-6">
                    <div className="card">
                        <h3 className="font-bold text-gray-900 mb-4">6-Month Growth Trend</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={MONTHLY_DATA}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="appointments" stroke="#2563EB" strokeWidth={2} dot={{ r: 4 }} name="Appointments" />
                                <Line type="monotone" dataKey="therapies" stroke="#16A34A" strokeWidth={2} dot={{ r: 4 }} name="Therapies" />
                                <Line type="monotone" dataKey="prescriptions" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} name="Prescriptions" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="card">
                            <h3 className="font-bold text-gray-900 mb-3">Role Distribution</h3>
                            {['doctor', 'therapist', 'patient'].map(role => {
                                const count = users.filter(u => u.role === role).length;
                                const pct = Math.round((count / users.length) * 100);
                                return (
                                    <div key={role} className="mb-3">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="capitalize text-gray-700 font-medium">{role}s</span>
                                            <span className="text-gray-500">{count} ({pct}%)</span>
                                        </div>
                                        <div className="bg-gray-100 rounded-full h-2">
                                            <div className={`h-2 rounded-full ${role === 'doctor' ? 'bg-blue-500' : role === 'therapist' ? 'bg-green-500' : 'bg-purple-500'}`} style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="card">
                            <h3 className="font-bold text-gray-900 mb-3">Appointment Status</h3>
                            {['scheduled', 'completed', 'pending'].map(s => {
                                const count = appointments.filter(a => a.status === s).length;
                                const pct = appointments.length ? Math.round((count / appointments.length) * 100) : 0;
                                return (
                                    <div key={s} className="mb-3">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="capitalize text-gray-700 font-medium">{s}</span>
                                            <span className="text-gray-500">{count} ({pct}%)</span>
                                        </div>
                                        <div className="bg-gray-100 rounded-full h-2">
                                            <div className={`h-2 rounded-full ${s === 'scheduled' ? 'bg-blue-500' : s === 'completed' ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {showAddUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Add New User</h2>
                            <button onClick={() => setShowAddUser(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="space-y-3">
                            <div><label className="label">Full Name</label><input className="input-field" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="Dr. John Doe" /></div>
                            <div><label className="label">Email</label><input className="input-field" type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="user@clinic.com" /></div>
                            <div><label className="label">Role</label>
                                <select className="input-field" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                    <option value="doctor">Doctor</option>
                                    <option value="therapist">Therapist</option>
                                    <option value="patient">Patient</option>
                                </select>
                            </div>
                            <div><label className="label">Specialization</label><input className="input-field" value={newUser.specialization} onChange={e => setNewUser({ ...newUser, specialization: e.target.value })} placeholder="e.g. Panchakarma Specialist" /></div>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setShowAddUser(false)} className="flex-1 btn-ghost">Cancel</button>
                            <button onClick={handleAddUser} disabled={addingUser} className="flex-1 btn-primary flex items-center justify-center gap-2">
                                {addingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Add User
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </DashboardLayout>
    );
}
