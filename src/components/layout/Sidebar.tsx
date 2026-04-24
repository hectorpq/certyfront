import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  GraduationCap,
  Award,
  FileSpreadsheet,
  LogOut,
  Menu,
  LayoutTemplate,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const adminNavItems = [
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/students',       icon: Users,           label: 'Estudiantes' },
  { to: '/events',         icon: Calendar,        label: 'Eventos' },
  { to: '/instructors',    icon: GraduationCap,   label: 'Instructores' },
  { to: '/certificates',   icon: Award,           label: 'Certificados' },
  { to: '/templates',      icon: LayoutTemplate,  label: 'Plantillas' },
  { to: '/bulk-generate',  icon: FileSpreadsheet, label: 'Generar en Masa' },
];

const participanteNavItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/certificates', icon: Award,           label: 'Mis Certificados' },
];

export const Sidebar = () => {
  const { logout, user, isAdmin } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = isAdmin ? adminNavItems : participanteNavItems;

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.20)]">
            <Award className="w-5 h-5 text-white drop-shadow" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-black text-white text-base tracking-wide leading-none">CertyPro</h1>
              <p className="text-xs text-blue-200/80 mt-0.5 font-medium">Sistema de Certificados</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'bg-white/25 text-white shadow-[0_2px_12px_rgba(0,0,0,0.20)] border border-white/20'
                  : 'text-blue-100 hover:bg-white/15 hover:text-white'
              }`
            }
            onClick={() => setIsMobileOpen(false)}
          >
            <Icon className="w-5 h-5 flex-shrink-0 drop-shadow-sm" />
            {!isCollapsed && (
              <span className="text-sm font-semibold tracking-tight">{label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-white/10">
        {user && !isCollapsed && (
          <div className="mb-3 flex items-center gap-3 px-3 py-3 rounded-xl bg-white/15 border border-white/10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center flex-shrink-0 shadow-inner">
              <span className="text-xs font-black text-white">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">{user.full_name}</p>
              <p className="text-xs text-blue-200/80 truncate font-medium">{user.email}</p>
            </div>
          </div>
        )}
        {user && isCollapsed && (
          <div className="mb-3 flex justify-center">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="text-xs font-black text-white">{initials}</span>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-blue-100 hover:bg-white/15 hover:text-white transition-all duration-150"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-semibold">Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl shadow-[0_4px_12px_rgba(59,130,246,0.45)]"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-gradient-to-b from-primary-500 via-primary-700 to-primary-900
          shadow-[4px_0_24px_rgba(37,99,235,0.25)]
          transition-all duration-300 flex flex-col
          ${isCollapsed ? 'w-[72px]' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3.5 top-8 w-7 h-7 bg-white border-2 border-primary-100 rounded-full items-center justify-center text-primary-500 hover:text-primary-700 shadow-[0_2px_8px_rgba(37,99,235,0.25)] transition-all duration-150 z-10"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>

        <NavContent />
      </aside>
    </>
  );
};
