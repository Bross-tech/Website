import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user in Supabase
    const { data, error } = await supabase
      .from("users")
      .insert([{ email, password: hashedPassword }])
      .select();

    if (error) throw error;

    // Do not return password in response
    const { password: _, ...userWithoutPassword } = data[0];

    return res.status(201).json({ user: userWithoutPassword });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
