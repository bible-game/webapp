"use server"

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logOut() {
    const cookieStore = await cookies();

    cookieStore.delete('token');
    cookieStore.delete('refresh');
    redirect("/stats"); // question :: best way?
}
