import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, GraduationCap,
  Award, FileSpreadsheet, LogOut, Menu,
  LayoutTemplate, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const adminNavItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/certificates',  icon: Award,           label: 'Certificados'  },
  { to: '/templates',     icon: LayoutTemplate,  label: 'Plantillas'    },
  { to: '/bulk-generate', icon: FileSpreadsheet, label: 'Emisiones'     },
  { to: '/students',      icon: Users,           label: 'Participantes' },
  { to: '/events',        icon: Calendar,        label: 'Eventos'       },
  { to: '/instructors',   icon: GraduationCap,   label: 'Instructores'  },
];

const participanteNavItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'        },
  { to: '/certificates', icon: Award,           label: 'Mis Certificados' },
];

export const Sidebar = () => {
  const { logout, user, isAdmin } = useAuth();
  const [isCollapsed,  setIsCollapsed]  = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = isAdmin ? adminNavItems : participanteNavItems;

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const W = isCollapsed ? 80 : 320;

  const sidebarStyle: React.CSSProperties = {
    width: W, minWidth: W,
    display: 'flex', flexDirection: 'column', flexShrink: 0,
    transition: 'width 300ms cubic-bezier(0.4,0,0.2,1), min-width 300ms cubic-bezier(0.4,0,0.2,1)',
    position: 'relative',
  };

  /* ── Sidebar light: azul marino con degradado dorado sutil ── */
  const sidebarBgLight = 'linear-gradient(180deg, #1A2F52 0%, #1E3A5F 30%, #1A3370 65%, #1D3D8A 100%)';
  /* ── Sidebar dark: negro profundo con toque azul eléctrico ── */
  const sidebarBgDark  = 'linear-gradient(180deg, #080C14 0%, #0D1117 35%, #0F1729 70%, #111C38 100%)';

  /* Detectamos dark desde el documento */
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const NavContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Logo ── */}
      <div style={{
        padding: isCollapsed ? '24px 16px' : '24px 28px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        gap: 12,
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: 13, flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.20), rgba(255,255,255,0.10))',
          border: '1px solid rgba(255,255,255,0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        }}>
          <Award style={{ width: 22, height: 22, color: '#F4B400' }} />
        </div>
        {!isCollapsed && (
          <div style={{ overflow: 'hidden' }}>
            <h1 style={{
              fontFamily: 'Poppins, Inter, system-ui',
              fontWeight: 800, color: '#fff',
              fontSize: 18, lineHeight: 1, margin: 0,
              letterSpacing: '-0.3px',
            }}>
              CertyPro
            </h1>
            <p style={{ fontSize: 12, color: 'rgba(244,180,0,0.80)', margin: '4px 0 0', fontWeight: 500 }}>
              Sistema de Certificados
            </p>
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <nav style={{
        flex: 1, padding: '16px 14px',
        display: 'flex', flexDirection: 'column', gap: 5,
        overflowY: 'auto',
      }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setIsMobileOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center',
              gap: 14,
              padding: isCollapsed ? '0 14px' : '0 18px',
              height: 52,
              borderRadius: 14,
              textDecoration: 'none',
              transition: 'all 200ms cubic-bezier(0.4,0,0.2,1)',
              background: isActive
                ? 'linear-gradient(135deg, rgba(37,99,235,0.55), rgba(29,78,216,0.40))'
                : 'transparent',
              backdropFilter: isActive ? 'blur(8px)' : 'none',
              boxShadow: isActive ? '0 4px 16px rgba(37,99,235,0.25), inset 0 1px 0 rgba(255,255,255,0.12)' : 'none',
              border: isActive ? '1px solid rgba(255,255,255,0.18)' : '1px solid transparent',
              color: isActive ? '#fff' : 'rgba(147,197,253,0.75)',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              borderLeft: isActive && !isCollapsed ? '3px solid #F4B400' : isActive && isCollapsed ? 'none' : '1px solid transparent',
              paddingLeft: isActive && !isCollapsed ? 'calc(18px - 2px)' : isCollapsed ? '14px' : '18px',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon style={{
                  width: 20, height: 20, flexShrink: 0,
                  opacity: isActive ? 1 : 0.70,
                  color: isActive ? '#fff' : undefined,
                  filter: isActive ? 'drop-shadow(0 0 6px rgba(255,255,255,0.30))' : 'none',
                }} />
                {!isCollapsed && (
                  <span style={{
                    fontSize: 14, fontWeight: isActive ? 600 : 500,
                    fontFamily: 'Inter, system-ui',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User + logout ── */}
      <div style={{ padding: '10px 14px 22px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {user && !isCollapsed && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderRadius: 14,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.10)',
            marginBottom: 8,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(135deg, #1E40AF, #3B82F6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(37,99,235,0.40)',
            }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{initials}</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                {user.full_name}
              </p>
              <p style={{ fontSize: 12, color: 'rgba(147,197,253,0.70)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '3px 0 0' }}>
                {user.email}
              </p>
            </div>
          </div>
        )}
        {user && isCollapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'linear-gradient(135deg, #1E40AF, #3B82F6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(37,99,235,0.40)',
            }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{initials}</span>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          title="Cerrar Sesión"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%',
            padding: isCollapsed ? '0 14px' : '0 18px',
            height: 50, borderRadius: 13,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'rgba(147,197,253,0.70)',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
            e.currentTarget.style.color = '#FCA5A5';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgba(147,197,253,0.70)';
          }}
        >
          <LogOut style={{ width: 20, height: 20, flexShrink: 0 }} />
          {!isCollapsed && (
            <span style={{ fontSize: 15, fontWeight: 500, fontFamily: 'Inter, system-ui' }}>
              Cerrar Sesión
            </span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden"
        style={{
          position: 'fixed', top: 16, left: 16, zIndex: 50,
          padding: '10px',
          background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
          color: '#fff', borderRadius: 12, border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(37,99,235,0.45)',
        }}
      >
        <Menu style={{ width: 20, height: 20 }} />
      </button>

      {isMobileOpen && (
        <div
          className="lg:hidden"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.60)', backdropFilter: 'blur(4px)', zIndex: 40 }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        style={{
          ...sidebarStyle,
          background: isDark ? sidebarBgDark : sidebarBgLight,
          boxShadow: isDark
            ? '4px 0 30px rgba(0,0,0,0.60)'
            : '4px 0 30px rgba(37,99,235,0.25)',
          borderRight: isDark ? '1px solid rgba(41,98,255,0.12)' : '1px solid rgba(255,255,255,0.06)',
        }}
        className={`fixed lg:static inset-y-0 left-0 z-50 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex"
          style={{
            position: 'absolute', top: 30, right: -13, zIndex: 10,
            width: 26, height: 26, borderRadius: '50%',
            background: '#fff',
            border: '2px solid #DBEAFE',
            alignItems: 'center', justifyContent: 'center',
            color: '#2563EB', cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(37,99,235,0.28)',
            transition: 'all 150ms ease',
          }}
        >
          {isCollapsed
            ? <ChevronRight style={{ width: 13, height: 13 }} />
            : <ChevronLeft  style={{ width: 13, height: 13 }} />}
        </button>

        <NavContent />
      </aside>
    </>
  );
};