"use server";

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { accountNext } from "@/core/auth/paths";
import { accountStatus } from "@/core/auth/account-service";

export interface ProfileResult { error: string; }
const field = z.string().trim().max(255);
const name = field.min(1);

export async function completeProfile(_previous: ProfileResult, form: FormData): Promise<ProfileResult> {
    const session = await auth();
    if (!session.isAuthenticated || session.userId !== form.get('owner')) return { error: 'Your account changed. Please sign in again before saving.' };
    const account = await accountStatus();
    if (account.status !== 'ready') return { error: 'We couldn’t open your account. Please try again.' };
    if (account.info.profileCompleted && account.info.firstname.trim() && account.info.lastname.trim()) redirect(accountNext(form.get('next')));
    const data = z.object({ firstname: name, lastname: name }).safeParse({
        firstname: account.info.firstname.trim() || form.get('firstname') || '',
        lastname: account.info.lastname.trim() || form.get('lastname') || '',
    });
    if (!data.success) return { error: 'Enter your first and last names, using no more than 255 characters per field.' };
    try {
        const user = await currentUser();
        if (!user || user.id !== session.userId) return { error: 'Please sign in again.' };
        const names = {
            ...(!user.firstName?.trim() ? { firstName: data.data.firstname } : {}),
            ...(!user.lastName?.trim() ? { lastName: data.data.lastname } : {}),
        };
        if (Object.keys(names).length) await (await clerkClient()).users.updateUser(user.id, names);
        const token = await session.getToken();
        if (!token) return { error: 'Please sign in again.' };
        const response = await fetch(`${process.env.SVC_USER}/info/profile`, {
            method: 'PUT', headers: { authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(data.data), cache: 'no-store',
        });
        if (!response.ok) return { error: 'We couldn’t save that just now. Please try again.' };
        const result = await response.json();
        if (result.profileCompleted !== true) return { error: 'We couldn’t confirm your profile was saved. Please try again.' };
    } catch { return { error: 'We couldn’t save that just now. Please try again.' }; }
    redirect(accountNext(form.get('next')));
}
