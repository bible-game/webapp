'use client'

import { logOut } from "@/core/action/log-out";

export default function LogoutButton() {
    return (
        <form action={logOut}>
            <button type="submit" className="translate-y-2.5 text-sm relative bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white py-2 px-4 rounded-lg transition-all">Logout</button>
        </form>
    )
}
