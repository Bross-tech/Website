"use client";

import { useState } from "react";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true); // toggle between login & signup

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isLogin ? "Login to your account" : "Create a new account"}
        </h1>

        {/* Toggle buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`px-4 py-2 rounded ${
              isLogin ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`px-4 py-2 rounded ${
              !isLogin ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Forms */}
        {isLogin ? <LoginForm /> : <SignupForm />}

        {/* Small note */}
        <p className="text-sm text-center text-gray-500 mt-4">
          {isLogin
            ? "Don't have an account? Click Sign Up above."
            : "Already have an account? Click Login above."}
        </p>
      </div>
    </div>
  );
}
