"use client";

import React from "react";
import { useRouter } from "next/router";
import { RiDashboardLine } from "react-icons/ri";
import { FaHistory, FaCediSign } from "react-icons/fa";
import { MdFamilyRestroom, MdManageAccounts } from "react-icons/md";

const BottomNav = () => {
  const router = useRouter();
  const { pathname } = router;

  const navItems = [
    { name: "history", icon: <FaHistory size={24} />, label: "History", link: "/history" },
    { name: "transactions", icon: <FaCediSign size={24} />, label: "Transactions", link: "/transactions" },
    { name: "dashboard", icon: <RiDashboardLine size={24} />, label: "Dashboard", link: "/dashboard" },
    { name: "afa", icon: <MdFamilyRestroom size={24} />, label: "AFA", link: "/afa-registration" },
    { name: "profile", icon: <MdManageAccounts size={24} />, label: "Profile", link: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-gray-800 text-white shadow-md flex justify-between px-4 py-2 md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.link;
        return (
          <button
            key={item.name}
            aria-label={item.label}
            onClick={() => router.push(item.link)}
            className={`flex flex-col items-center transition-transform duration-200 ${
              isActive ? "text-yellow-400 scale-110" : "text-white hover:text-gray-300 scale-100"
            }`}
          >
            {item.icon}
            <span
              className={`text-xs mt-1 transition-all duration-300 ease-in-out overflow-hidden ${
                isActive ? "opacity-100 max-h-6" : "opacity-0 max-h-0"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
