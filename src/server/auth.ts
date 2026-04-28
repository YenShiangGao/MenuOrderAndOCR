"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "請輸入有效的 Email 和密碼" };
  }

  const user = await prisma.adminUser.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user || !user.isActive) {
    return { error: "帳號或密碼錯誤" };
  }

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) {
    return { error: "帳號或密碼錯誤" };
  }

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.role = user.role;
  session.isLoggedIn = true;
  await session.save();

  redirect("/admin");
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
