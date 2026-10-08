export default function CookiePolicy() {
    return (
        <main className="app-page">
            <div className="w-full">
                <h1 className="text-[24px] font-semibold mb-8">Cookie Policy</h1>

                <section className="legal-content space-y-4">
                    <p>Last updated: {new Date().getFullYear()}</p>

                    <p>
                        Bible Game uses cookies and similar technologies to provide essential
                        gameplay features, save progress, and improve performance. This
                        policy explains what we use and why.
                    </p>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        1. What Are Cookies?
                    </h2>
                    <p>
                        Cookies are small files stored on your device. We also use local
                        storage for certain features such as progress tracking.
                    </p>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        2. Types of Cookies We Use
                    </h2>

                    <h3 className="font-semibold text-ui-text">A. Essential Cookies (Required)</h3>
                    <p>These enable core gameplay:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Saving progress</li>
                        <li>Account login features</li>
                        <li>Security & performance</li>
                    </ul>

                    <h3 className="font-semibold text-ui-text mt-4">B. Functional Cookies (Optional)</h3>
                    <p>Enhance the experience:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Remember settings</li>
                        <li>Improve load times</li>
                    </ul>

                    <h3 className="font-semibold text-ui-text mt-4">C. Analytics Cookies (Optional)</h3>
                    <p>
                        If enabled, we collect anonymous usage data to help improve the game.
                    </p>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        3. Local Storage
                    </h2>
                    <p>
                        Local storage is used for streaks, guesses, map state, hint
                        progression, and other gameplay features. It stays on your device.
                    </p>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        4. Third-Party Services
                    </h2>
                    <p>We may use:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Hosting providers (AWS, Vercel)</li>
                        <li>Optional analytics tools</li>
                    </ul>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
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

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        6. Clearing Cookies
                    </h2>
                    <p>You can clear cookies via your browser settings:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Chrome: Settings → Privacy → Cookies</li>
                        <li>Safari: Preferences → Privacy</li>
                        <li>Firefox: Settings → Privacy & Security</li>
                    </ul>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        7. Changes
                    </h2>
                    <p>This policy may be updated as the project evolves.</p>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
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
