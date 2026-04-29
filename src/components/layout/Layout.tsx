import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-app)',
      display: 'flex',
      transition: 'background-color 300ms ease',
    }}>
      <Sidebar />
      <main style={{
        flex: 1,
        minWidth: 0,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        /* Sutil patrón de puntos en el fondo */
        backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}>
        <div
          style={{
            flex: 1,
            width: '100%',
            padding: '28px 32px',
          }}
          className="pt-16 lg:pt-7"
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
};