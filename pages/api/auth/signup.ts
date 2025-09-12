import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { supabase } from "../../../lib/supabaseClient";

type ResponseData = { message: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, username, phone, password } = req.body;

  if (!email || !username || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const { error } = await supabase.from("users").insert([
      {
        email,
        username,
        phone,
        password: hashedPassword,
        role: "user",
      },
    ]);

    if (error) throw error;

    return res.status(200).json({ message: "Account created successfully" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Signup failed" });
  }
}
