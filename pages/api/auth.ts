import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabaseClient";
import bcrypt from "bcryptjs"; // <-- changed from 'bcrypt'

const SALT_ROUNDS = 10;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, email, username, phone, password } = req.body;

  if (!type || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    if (type === "signup") {
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const { data, error } = await supabase.from("users").insert({
        email,
        username,
        phone,
        password: hashedPassword,
        role: "user",
      }).select().single();

      if (error) throw error;

      return res.status(200).json({ message: "Signup successful", user: data });
    }

    if (type === "login") {
      const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      return res.status(200).json({ message: "Login successful", user });
    }

    return res.status(400).json({ error: "Invalid type" });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
