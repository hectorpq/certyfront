import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-[#f4f6f9] flex">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8 max-w-screen-2xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
