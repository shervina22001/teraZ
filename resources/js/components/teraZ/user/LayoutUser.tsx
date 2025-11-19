import React, { useState, useRef } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { Menu, Bell } from "lucide-react";

interface UnpaidMonth {
  month: string;
  monthName: string;
  total: number;
}

interface RejectedPayment {
  month: string;
  monthName: string;
  reason: string;
}

interface UserProps {
  id: number;
  name: string;
  room?: string | null;
}

interface LayoutUserProps {
  user: UserProps;
  title?: string;
  currentPath?: string;
  children: React.ReactNode;

  unpaidCount?: number;
  unpaidMonths?: UnpaidMonth[];
  rejectedPayments?: RejectedPayment[];
}

const NAVBAR_HEIGHT = "81px";

const LayoutUser: React.FC<LayoutUserProps> = ({
  user,
  title = "Arzeta Cos - Living",
  currentPath = "",
  children,
  unpaidCount,
  unpaidMonths,
  rejectedPayments,
}) => {
  // GET GLOBAL SHARED PROPS
  const page = usePage();

  const globalUnpaidCount = (page.props.unpaidCount as number) ?? 0;
  const globalUnpaidMonths =
    (page.props.unpaidMonths as UnpaidMonth[]) ?? [];
  const globalRejected =
    (page.props.rejectedPayments as RejectedPayment[]) ?? [];

  // FINAL MERGE
  const finalUnpaidCount = unpaidCount ?? globalUnpaidCount;

  const finalUnpaidMonths =
    unpaidMonths && unpaidMonths.length > 0
      ? unpaidMonths
      : globalUnpaidMonths;

  const finalRejectedPayments =
    rejectedPayments && rejectedPayments.length > 0
      ? rejectedPayments
      : globalRejected;

  // TOTAL NOTIF (pending + rejected)
  const totalNotif = finalUnpaidCount + finalRejectedPayments.length;

  // STATE
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLButtonElement | null>(null);

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);
  const handleLogout = () => router.post("/logout");

  const menuItems = [
    { name: "Profil", path: "/profile" },
    { name: "Lapor Kerusakan", path: "/lapor-kerusakan" },
    { name: "Pembayaran", path: "/pembayaran" },
  ];

  const isActive = (path: string) => currentPath === path;

  const limitedUnpaidMonths = finalUnpaidMonths.slice(0, 5);

  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <nav
        className="bg-[#F5F2EE] shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-[#CCB89D]"
        style={{ height: NAVBAR_HEIGHT }}
      >
        <div className="flex items-center justify-between px-6 h-full">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="text-[#412E27] hover:text-[#765447]"
            >
              <Menu className="w-7 h-7" />
            </button>

            <img
              src="/teraZ/logo.png"
              className="h-14 w-14 rounded-full object-cover"
            />
          </div>

          {/* TITLE */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <h1 className="text-xl font-bold text-[#7A2B1E]">
              {title}
            </h1>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            {/* NOTIFICATION BUTTON */}
            {totalNotif > 0 && (
              <button
                ref={notifRef}
                onClick={() => setIsNotifOpen(true)}
                className="relative flex items-center gap-2 px-3 py-1 rounded-full border border-[#E57373] bg-[#FBE9E7] hover:bg-[#FFCCBC]"
              >
                <Bell className="w-4 h-4" />
                <span className="text-sm text-[#7A2B1E] font-medium">
                  {totalNotif} Notifikasi
                </span>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
              </button>
            )}

            <span className="text-[#343434] whitespace-nowrap">
              {user.name} ({user.room || user.id.toString().padStart(2, "0")})
            </span>

            <button
              onClick={handleLogout}
              className="px-6 py-2.5 border-3 border-[#CCB89D] rounded-md hover:bg-[#CCB89D]"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* SIDEBAR */}
      <aside
        className={`fixed bg-[#F5F2EE] transition-transform duration-300 z-40 shadow-lg ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          width: "230px",
          top: NAVBAR_HEIGHT,
          height: `calc(100vh - ${NAVBAR_HEIGHT})`,
        }}
      >
        <nav>
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`block px-8 py-6 text-lg border-b border-[#dfceb7] relative ${
                    isActive(item.path)
                      ? "text-[#412E27] font-semibold"
                      : "text-[#412E27] hover:bg-[#CCB89D]"
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
      </aside>

      {/* NOTIFICATION POPOVER */}
      {isNotifOpen && totalNotif > 0 && (
        <div
          className="fixed inset-0 z-[9999]"
          onClick={() => setIsNotifOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bg-white w-[310px] rounded-xl shadow-lg border border-[#E0D5C0] py-3"
            style={{
              top:
                notifRef.current?.getBoundingClientRect().bottom ?? 90,
              right: "135px",
            }}
          >
            {/* UNPAID */}
            {finalUnpaidMonths.length > 0 && (
              <>
                <div className="px-4 pb-2 font-semibold text-[#7A2B1E]">
                  Tagihan Belum Dibayar
                </div>

                <div className="max-h-[200px] overflow-y-auto">
                  {limitedUnpaidMonths.map((item) => (
                    <button
                      key={item.month}
                      onClick={() =>
                        router.visit(`/pembayaran?bulan=${item.month}`)
                      }
                      className="w-full text-left px-4 py-3 hover:bg-[#F5F2EE] border-b border-[#EEE4D3] text-[#412E27]"
                    >
                      <div className="font-medium">{item.monthName}</div>
                      <div className="text-sm text-gray-600">
                        Total: Rp {item.total.toLocaleString("id-ID")}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* REJECTED */}
            {finalRejectedPayments.length > 0 && (
              <div className="px-4 py-3 border-t border-red-300 bg-red-50">
                <div className="font-semibold text-red-700 mb-2">
                  Pembayaran Ditolak
                </div>

                {finalRejectedPayments.map((item, idx) => (
                  <button
                    key={`reject-${idx}`}
                    onClick={() =>
                      router.visit(`/pembayaran?bulan=${item.month}`)
                    }
                    className="w-full text-left px-3 py-2 mb-1 rounded-md hover:bg-red-100 text-red-700"
                  >
                    <div className="font-medium">{item.monthName}</div>
                    <div className="text-xs">Alasan: {item.reason}</div>
                  </button>
                ))}
              </div>
            )}

            {/* SEE ALL */}
            <button
              onClick={() => router.visit("/pembayaran")}
              className="w-full mt-2 px-4 py-2 text-center text-sm text-[#7A2B1E] hover:bg-[#F5F2EE]"
            >
              Lihat Semua Tagihan
            </button>
          </div>
        </div>
      )}

      {/* MAIN */}
      <main
        className="transition-all duration-300"
        style={{
          marginLeft: isSidebarOpen ? "228px" : "0",
          paddingTop: NAVBAR_HEIGHT,
        }}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default LayoutUser;
