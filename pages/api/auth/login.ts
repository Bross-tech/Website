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

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find user by email
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // TODO: Create session or JWT (for now, simple response)
    return res.status(200).json({ message: "Login successful" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Login failed" });
  }
}
