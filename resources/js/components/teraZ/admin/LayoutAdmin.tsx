import React, { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { Menu } from 'lucide-react';

interface LayoutAdminProps {
    user: {
        name: string;
        id: number;
    };
    title?: string;
    currentPath?: string;
    children: React.ReactNode;
}

const LayoutAdmin: React.FC<LayoutAdminProps> = ({ 
    title = 'Arzeta Co - Living', 
    currentPath = '',
    children 
}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        router.post('/logout');
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const menuItems = [
        { name: 'Dashboard', path: '/admin/dashboard' },
        { name: 'Kelola Kamar', path: '/admin/rooms' },
        { name: 'Penghuni', path: '/admin/tenants' },
        { name: 'Keuangan', path: '/admin/keuangan' },
        { name: 'Maintenance', path: '/admin/maintenance' },
    ];

    const isActive = (path: string) => currentPath === path;

    // Konstanta untuk tinggi navbar
    const NAVBAR_HEIGHT = '81px';

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav 
                className="bg-[#F5F2EE] shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-[#CCB89D]"
                style={{ height: NAVBAR_HEIGHT }}
            >
                <div className="flex items-center justify-between px-6 h-full">
                    {/* Left Section - Menu Toggle & Logo */}
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

                    {/* Center Section - Title */}
                    <div className="absolute left-1/2 transform -translate-x-1/2">
                        <h1 className="text-xl font-bold text-[#7A2B1E] whitespace-nowrap">
                            {title}
                        </h1>
                    </div>

                    {/* Right Section - User Info & Logout */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="text-[#343434] text-base whitespace-nowrap">
                            Admin
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
                    height: `calc(100vh - ${NAVBAR_HEIGHT})` 
                }}
            >
                <div className="flex flex-col h-full">
                    {/* Menu Items */}
                    <nav className="flex-1 overflow-y-auto bg-[#F5F2EE]">
                        <ul>
                            {menuItems.map((item, index) => (
                                <li key={index}>
                                    <Link
                                        href={item.path}
                                        className={`block px-8 py-6 text-lg border-b border-[#dfceb7] transition-colors relative ${
                                            isActive(item.path) 
                                                ? 'text-[#412E27] font-semibold' 
                                                : 'text-[#412E27] hover:bg-[#CCB89D]'
                                        }`}
                                    >
                                        {isActive(item.path) && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#412E27]"></div>
                                        )}
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main 
                className="transition-all duration-300 bg-[#E5E0D8] min-h-screen"
                style={{ 
                    marginLeft: isSidebarOpen ? '228px' : '0',
                    paddingTop: NAVBAR_HEIGHT
                }}
            >
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default LayoutAdmin;