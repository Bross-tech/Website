// components/BottomNav.tsx
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
    <div className="fixed bottom-0 left-0 w-full bg-gray-800 text-white shadow-md flex justify-between px-4 py-2 md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.link;
        return (
          <button
            key={item.name}
            onClick={() => router.push(item.link)}
            className={`flex flex-col items-center transition-colors duration-200 ${
              isActive ? "text-yellow-400" : "text-white hover:text-gray-300"
            }`}
          >
            {item.icon}
            <span className="text-xs">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
