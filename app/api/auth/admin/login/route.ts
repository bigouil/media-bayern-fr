import { NextResponse } from "next/server";
import {
  createSessionToken,
  hasAdminUsers,
  validateAdminCredentials,
} from "@/lib/auth/admin";

export async function POST(request: Request) {
  if (!hasAdminUsers()) {
    return NextResponse.json(
      { success: false, error: "Aucun compte admin n'est configuré." },
      { status: 500 }
    );
  }

  const { email, password } = await request.json().catch(() => ({}));

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: "Email et mot de passe requis." },
      { status: 400 }
    );
  }

  const isValid = validateAdminCredentials(email, password);
  if (!isValid) {
    return NextResponse.json(
      { success: false, error: "Identifiants invalides." },
      { status: 401 }
    );
  }

  const token = createSessionToken(email);
  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return response;
}
