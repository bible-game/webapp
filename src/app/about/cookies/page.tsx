export default function CookiePolicy() {
    return (
        <main className="min-h-screen text-[#e8ecff] sm:mx-[5%] md:mx-[15%]">
            <div className="w-full mx-auto px-6 md:px-12 py-12">
                <h1 className="text-2xl font-extrabold tracking-wide mb-8">Cookie Policy</h1>

                <section className="bg-white/5 border border-white/15 rounded-2xl shadow-lg p-7 text-[#adb3d6] space-y-4">
                    <p>Last updated: {new Date().getFullYear()}</p>

                    <p>
                        Bible Game uses cookies and similar technologies to provide essential
                        gameplay features, save progress, and improve performance. This
                        policy explains what we use and why.
                    </p>

                    <h2 className="text-lg font-bold tracking-wide mt-6 mb-2 text-[#e8ecff]">
                        1. What Are Cookies?
                    </h2>
                    <p>
                        Cookies are small files stored on your device. We also use local
                        storage for certain features such as progress tracking.
                    </p>

                    <h2 className="text-lg font-bold tracking-wide mt-6 mb-2 text-[#e8ecff]">
                        2. Types of Cookies We Use
                    </h2>

                    <h3 className="font-semibold text-[#e8ecff]">A. Essential Cookies (Required)</h3>
                    <p>These enable core gameplay:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Saving progress</li>
                        <li>Account login features</li>
                        <li>Security & performance</li>
                    </ul>

                    <h3 className="font-semibold text-[#e8ecff] mt-4">B. Functional Cookies (Optional)</h3>
                    <p>Enhance the experience:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Remember settings</li>
                        <li>Improve load times</li>
                    </ul>

                    <h3 className="font-semibold text-[#e8ecff] mt-4">C. Analytics Cookies (Optional)</h3>
                    <p>
                        If enabled, we collect anonymous usage data to help improve the game.
                    </p>

                    <h2 className="text-lg font-bold tracking-wide mt-6 mb-2 text-[#e8ecff]">
                        3. Local Storage
                    </h2>
                    <p>
                        Local storage is used for streaks, guesses, map state, hint
                        progression, and other gameplay features. It stays on your device.
                    </p>

                    <h2 className="text-lg font-bold tracking-wide mt-6 mb-2 text-[#e8ecff]">
                        4. Third-Party Services
                    </h2>
                    <p>We may use:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Hosting providers (AWS, Vercel)</li>
                        <li>Optional analytics tools</li>
                    </ul>

                    <h2 className="text-lg font-bold tracking-wide mt-6 mb-2 text-[#e8ecff]">
                        5. Managing Your Preferences
                    </h2>
                    <ul className="list-disc list-inside space-y-1">
                        <li>
                            <strong>Accept</strong> — enables all cookies & enhances gameplay
                        </li>
                        <li>
                            <strong>Reject</strong> — essential cookies only (reduced
                            functionality)
                        </li>
                    </ul>

                    <h2 className="text-lg font-bold tracking-wide mt-6 mb-2 text-[#e8ecff]">
                        6. Clearing Cookies
                    </h2>
                    <p>You can clear cookies via your browser settings:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Chrome: Settings → Privacy → Cookies</li>
                        <li>Safari: Preferences → Privacy</li>
                        <li>Firefox: Settings → Privacy & Security</li>
                    </ul>

                    <h2 className="text-lg font-bold tracking-wide mt-6 mb-2 text-[#e8ecff]">
                        7. Changes
                    </h2>
                    <p>This policy may be updated as the project evolves.</p>

                    <h2 className="text-lg font-bold tracking-wide mt-6 mb-2 text-[#e8ecff]">
                        8. Contact
                    </h2>
                    <p>
                        Questions? Email{" "}
                        <span className="font-semibold text-white">hello@bible.game</span>
                    </p>
                </section>
            </div>
        </main>
    );
}
