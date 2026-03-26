import React from 'react';
import { LogOut, Building2, Users, FileText, Settings, Image as ImageIcon, BookOpen, Activity, Lock } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import AssetsTab from './tabs/AssetsTab';
import DepartmentsTab from './tabs/DepartmentsTab';
import SectionsTab from './tabs/SectionsTab';
import StudentsTab from './tabs/StudentsTab';
import LabsTab from './tabs/LabsTab';
import TemplatesTab from './tabs/TemplatesTab';
import LogsTab from './tabs/LogsTab';
import FacultyTab from './tabs/FacultyTab';

const AdminDashboard = () => {
  const logout = useAuthStore(state => state.logout);
  const location = useLocation();

  const navigation = [
    { name: 'Accounts', href: '/admin/faculty', icon: Lock },
    { name: 'Departments', href: '/admin/departments', icon: Building2 },
    { name: 'Sections', href: '/admin/sections', icon: BookOpen },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Labs', href: '/admin/labs', icon: Settings },
    { name: 'Templates', href: '/admin/templates', icon: FileText },
    { name: 'College Assets', href: '/admin/assets', icon: ImageIcon },
    { name: 'Generation Logs', href: '/admin/logs', icon: Activity },
  ];

  return (
    <div className="flex h-screen bg-background">
      <div className="w-64 bg-surface border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-primary-600">GVPCDPGC(A)</h1>
          <p className="text-xs text-slate-500 mt-1">Admin Portal</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`mr-3 w-5 h-5 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="mr-3 w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50 relative">
        <div className="p-8 max-w-7xl mx-auto min-h-full">
          <Routes>
            <Route path="/" element={<Navigate to="/admin/departments" replace />} />
            <Route path="/faculty" element={<FacultyTab />} />
            <Route path="/departments" element={<DepartmentsTab />} />

            <Route path="/sections" element={<SectionsTab />} />
            <Route path="/students" element={<StudentsTab />} />
            <Route path="/labs" element={<LabsTab />} />
            <Route path="/templates" element={<TemplatesTab />} />
            <Route path="/assets" element={<AssetsTab />} />
            <Route path="/logs" element={<LogsTab />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
