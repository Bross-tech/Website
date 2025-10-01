"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { RiDashboardLine } from "react-icons/ri";
import { FaHistory } from "react-icons/fa";
import { MdFamilyRestroom, MdManageAccounts } from "react-icons/md";

const CediIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className="inline-block"
  >
    <text
      x="50%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontSize={size * 0.9}
      fontWeight="bold"
    >
      ₵
    </text>
  </svg>
);

type BottomNavProps = {
  userId?: string;
  username?: string; // 👈 required username now
  wallet?: number;
  role?: string;
};

const BottomNav = ({ userId, username, wallet = 0, role }: BottomNavProps) => {
  const router = useRouter();
  const { pathname } = router;

  const navItems = {
    left: {
      name: "history",
      icon: <FaHistory size={24} />,
      label: "History",
      link: "/history",
    },
    middle: [
      {
        name: "transactions",
        icon: <CediIcon size={24} />,
        label: "Transactions",
        link: "/transactions",
      },
      {
        name: "dashboard",
        icon: <RiDashboardLine size={24} />,
        label: "Dashboard",
        link: "/dashboard",
      },
      {
        name: "afa",
        icon: <MdFamilyRestroom size={24} />,
        label: "AFA",
        link: "/afa-registration",
      },
    ],
    right: {
      name: "profile",
      icon: <MdManageAccounts size={24} />,
      label: "Profile",
      link: "/profile",
    },
  };

  const renderItem = (item: any) => {
    const isActive = pathname === item.link;
    return (
      <Link key={item.name} href={item.link} className="flex flex-col items-center">
        <div
          className={`transition-transform duration-200 ${
            isActive ? "text-yellow-400 scale-110" : "text-white hover:text-gray-300 scale-100"
          }`}
        >
          {item.icon}
          <span
            className={`block text-xs mt-1 transition-all duration-300 ease-in-out ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
          >
            {item.label}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <div>
      {/* Top section with wallet + role + username */}
      <div className="w-full bg-gray-900 text-white px-4 py-2 flex justify-between items-center shadow-md">
        <div className="flex flex-col">
          <span className="font-semibold">Wallet: ₵{wallet}</span>
          {username && (
            <span className="text-sm text-gray-300">👤 {username}</span>
          )}
        </div>
        {role && (
          <span className="text-sm bg-blue-600 px-2 py-1 rounded capitalize">
            {role}
          </span>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-gray-800 text-white shadow-md flex justify-between px-4 py-2 md:hidden">
        {/* Left pinned */}
        {renderItem(navItems.left)}

        {/* Middle evenly spaced */}
        <div className="flex gap-8">{navItems.middle.map(renderItem)}</div>

        {/* Right pinned */}
        {renderItem(navItems.right)}
      </nav>
    </div>
  );
};

export default BottomNav;
