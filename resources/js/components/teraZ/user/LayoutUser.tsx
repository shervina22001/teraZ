import React, { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { Menu, Bell } from 'lucide-react'; // NEW

interface LayoutUserProps {
  user: {
    id: number;
    name: string;
    room?: string | null; // nomor kamar
  };
  title?: string;
  currentPath?: string;
  children: React.ReactNode;

  // jumlah tagihan yang belum dibayar
  unpaidCount?: number;
}

const LayoutUser: React.FC<LayoutUserProps> = ({
  user,
  title = 'Arzeta Cos - Living',
  currentPath = '',
  children,
  unpaidCount = 0, // NEW: default 0
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    router.post('/logout');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((s) => !s);
  };

  const menuItems = [
    { name: 'Profil', path: '/profile' },
    { name: 'Lapor Kerusakan', path: '/lapor-kerusakan' },
    { name: 'Pembayaran', path: '/pembayaran' },
  ];

  const isActive = (path: string) => currentPath === path;

  const NAVBAR_HEIGHT = '81px';

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav
        className="bg-[#F5F2EE] shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-[#CCB89D]"
        style={{ height: NAVBAR_HEIGHT }}
      >
        <div className="flex items-center justify-between px-6 h-full">
          {/* Left: Toggle + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="text-[#412E27] hover:text-[#765447] focus:outline-none flex-shrink-0"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-7 h-7" strokeWidth={2} />
            </button>

            <img
              src="/teraZ/logo.png"
              alt="Logo"
              className="h-14 w-14 rounded-full object-cover flex-shrink-0"
            />
          </div>

          {/* Center: Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-xl font-bold text-[#7A2B1E] whitespace-nowrap">
              {title}
            </h1>
          </div>

          {/* Right: Notif + User + Logout */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* ============ BAGIAN BARU: NOTIFIKASI ============ */}
            {unpaidCount > 0 && (
              <Link
                href="/pembayaran"
                className="relative flex items-center gap-2 px-3 py-1 rounded-full border border-[#E57373] bg-[#FBE9E7] hover:bg-[#FFCCBC] transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="text-sm text-[#7A2B1E] font-medium">
                  {unpaidCount} tagihan belum dibayar
                </span>
                {/* titik merah kecil */}
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500" />
              </Link>
            )}
            {/* ================================================= */}

            <span className="text-[#343434] text-base whitespace-nowrap">
              {user.name}
              {user.room && user.room.trim() !== ''
                ? ` (${user.room})`
                : ` (${user.id.toString().padStart(2, '0')})`}
            </span>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 border-3 border-[#CCB89D] rounded-md hover:bg-[#CCB89D] transition-colors text-[#343434] text-base whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 bg-[#F5F2EE] transition-transform duration-300 z-40 shadow-lg ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: '230px',
          top: NAVBAR_HEIGHT,
          height: `calc(100vh - ${NAVBAR_HEIGHT})`,
        }}
      >
        <div className="flex flex-col h-full">
          <nav className="flex-1 overflow-y-auto bg-[#F5F2EE]">
            <ul>
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`block px-8 py-6 text-lg border-b border-[#dfceb7] transition-colors relative ${
                      isActive(item.path)
                        ? 'text-[#412E27] font-semibold'
                        : 'text-[#412E27] hover:bg-[#CCB89D]'
                    }`}
                  >
                    {isActive(item.path) && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#412E27]" />
                    )}
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main */}
      <main
        className="transition-all duration-300"
        style={{ marginLeft: isSidebarOpen ? '228px' : '0', paddingTop: NAVBAR_HEIGHT }}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default LayoutUser;
