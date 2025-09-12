import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabaseClient";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { email, username, phone, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: "Email, username, and password are required." });
  }

  // Check if user exists
  const { data: existingUser } = await supabase.from("users").select("*").eq("email", email).single();
  if (existingUser) return res.status(400).json({ message: "Email already registered." });

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user
  const { data, error } = await supabase.from("users").insert([
    { email, username, phone, password: hashedPassword, role: "user" },
  ]);

  if (error) return res.status(500).json({ message: error.message });

  return res.status(201).json({ message: "User registered successfully", user: data[0] });
    }
