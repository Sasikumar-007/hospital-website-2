import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import {
    Leaf, LayoutDashboard, Calendar, ClipboardList, Activity, Users,
    Brain, LogOut, Bell, ChevronLeft, ChevronRight, Menu,
    UserCog, FileText, BarChart3, RefreshCw
} from 'lucide-react';

const NAV_ITEMS = {
    admin: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'appointments', label: 'All Appointments', icon: Calendar },
        { id: 'therapies', label: 'All Therapies', icon: Activity },
        { id: 'prescriptions', label: 'Prescriptions', icon: ClipboardList },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
    doctor: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'consultation', label: 'Consultations', icon: ClipboardList },
        { id: 'dosha', label: 'AI Dosha Analysis', icon: Brain },
        { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
    ],
    therapist: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'patients', label: 'My Patients', icon: Users },
        { id: 'therapies', label: 'Therapy Sessions', icon: Activity },
        { id: 'schedule', label: 'Schedule', icon: Calendar },
    ],
    patient: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'appointments', label: 'My Appointments', icon: Calendar },
        { id: 'prescriptions', label: 'My Prescriptions', icon: ClipboardList },
        { id: 'therapy', label: 'Therapy Progress', icon: Activity },
    ],
};

const ROLE_LABELS = {
    admin: { label: 'Admin Portal', color: 'from-red-500 to-orange-500' },
    doctor: { label: 'Doctor Portal', color: 'from-blue-600 to-blue-700' },
    therapist: { label: 'Therapist Portal', color: 'from-green-600 to-green-700' },
    patient: { label: 'Patient Portal', color: 'from-purple-600 to-purple-700' },
};

export default function DashboardLayout({ children, activeTab, onTabChange, onRefresh }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        if (!onRefresh) return;
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
        toast.success('Data refreshed from Supabase!');
    };

    const items = NAV_ITEMS[user?.role] || [];
    const roleInfo = ROLE_LABELS[user?.role] || ROLE_LABELS.patient;

    const handleLogout = () => {
        logout();
        toast.success('Signed out successfully');
        navigate('/login');
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`flex items-center gap-3 p-4 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-5 h-5 text-white" />
                </div>
                {!collapsed && (
                    <div>
                        <p className="text-white font-bold text-sm leading-tight">Panchakarma</p>
                        <p className="text-white/50 text-xs">{roleInfo.label}</p>
                    </div>
                )}
            </div>

            {/* Nav Items */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => { onTabChange(item.id); setMobileOpen(false); }}
                        className={`sidebar-item w-full ${activeTab === item.id ? 'sidebar-item-active' : 'sidebar-item-inactive'} ${collapsed ? 'justify-center px-3' : ''}`}
                        title={collapsed ? item.label : ''}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                    </button>
                ))}
            </nav>

            {/* User */}
            <div className={`p-3 border-t border-white/10`}>
                <div className={`flex items-center gap-3 mb-2 px-2 py-2 rounded-xl ${collapsed ? 'justify-center' : ''}`}>
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {user?.avatar || user?.name?.slice(0, 2).toUpperCase()}
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
                            <p className="text-white/50 text-xs capitalize">{user?.role}</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleLogout}
                    className={`sidebar-item w-full text-red-300 hover:bg-red-500/10 hover:text-red-200 ${collapsed ? 'justify-center px-3' : ''}`}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Sign Out</span>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Desktop Sidebar */}
            <motion.aside
                animate={{ width: collapsed ? 72 : 256 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className={`hidden md:flex flex-col bg-gradient-to-b ${roleInfo.color} relative flex-shrink-0 overflow-hidden`}
            >
                <SidebarContent />
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition z-50"
                >
                    {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                </button>
            </motion.aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        />
                        <motion.aside
                            initial={{ x: -256 }}
                            animate={{ x: 0 }}
                            exit={{ x: -256 }}
                            transition={{ duration: 0.25 }}
                            className={`fixed left-0 top-0 bottom-0 w-64 flex flex-col bg-gradient-to-b ${roleInfo.color} z-50 md:hidden`}
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 py-3 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="md:hidden p-2 rounded-xl hover:bg-gray-100"
                        >
                            <Menu className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h2 className="font-bold text-gray-900 text-lg">
                                {items.find(i => i.id === activeTab)?.label || 'Dashboard'}
                            </h2>
                            <p className="text-gray-400 text-xs hidden sm:block">
                                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Refresh button */}
                        {onRefresh && (
                            <button onClick={handleRefresh} disabled={refreshing}
                                title="Reload latest data from Supabase"
                                className="p-2 rounded-xl hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors" >
                                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin text-blue-500' : ''}`} />
                            </button>
                        )}
                        <button className="p-2 rounded-xl hover:bg-gray-100 relative">
                            <Bell className="w-5 h-5 text-gray-500" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                            {user?.avatar || user?.name?.slice(0, 2).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
