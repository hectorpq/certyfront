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
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const adminNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/students', icon: Users, label: 'Estudiantes' },
  { to: '/events', icon: Calendar, label: 'Eventos' },
  { to: '/instructors', icon: GraduationCap, label: 'Instructores' },
  { to: '/certificates', icon: Award, label: 'Certificados' },
  { to: '/templates', icon: LayoutTemplate, label: 'Plantillas' },
  { to: '/bulk-generate', icon: FileSpreadsheet, label: 'Generar en Masa' },
];

const participanteNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/certificates', icon: Award, label: 'Mis Certificados' },
];

export const Sidebar = () => {
  const { logout, user, isAdmin } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = isAdmin ? adminNavItems : participanteNavItems;

  const NavContent = () => (
    <>
      <div className="p-4 border-b border-secondary-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-primary-900">CertyPro</h1>
              <p className="text-xs text-secondary-500">Sistema de Certificados</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-500 text-white'
                  : 'text-secondary-600 hover:bg-secondary-100'
              }`
            }
            onClick={() => setIsMobileOpen(false)}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-secondary-200">
        {user && !isCollapsed && (
          <div className="mb-3 px-3">
            <p className="font-medium text-secondary-900 truncate">{user.full_name}</p>
            <p className="text-xs text-secondary-500 truncate">{user.email}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
              isAdmin ? 'bg-primary-100 text-primary-700' : 'bg-secondary-100 text-secondary-600'
            }`}>
              {isAdmin ? 'Administrador' : 'Participante'}
            </span>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium">Cerrar Sesión</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary-500 text-white rounded-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-white border-r border-secondary-200
          transition-all duration-300 flex flex-col
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 bg-white border border-secondary-200 rounded-full items-center justify-center text-secondary-500 hover:text-secondary-700"
        >
          {isCollapsed ? '›' : '‹'}
        </button>
        <NavContent />
      </aside>
    </>
  );
};