import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/30 to-slate-100 flex">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-5 lg:p-10 pt-16 lg:pt-10 max-w-screen-xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
