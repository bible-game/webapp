export default function CookiePolicy() {
    return (
        <main className="app-page">
            <div className="w-full">
                <h1 className="text-[24px] font-semibold mb-8">Cookie Policy</h1>

                <section className="legal-content space-y-4">
                    <p>Last updated: November 2026</p>

                    <p>
                        Bible Game keeps a small amount of information on your device so the
                        game works: your progress, your settings and, if you have an account,
                        your sign-in. This policy explains what we keep and why.
                    </p>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        1. What Are Cookies?
                    </h2>
                    <p>
                        Cookies are small files stored on your device. We also use your
                        browser&apos;s local storage, which works in a similar way and stays on
                        your device.
                    </p>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        2. What We Keep
                    </h2>
                    <p>Everything we keep is needed for the game to work as you use it:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Your progress: guesses, results, streaks and reviews (local storage)</li>
                        <li>Keeping you logged in, for up to 90 days (cookies)</li>
                        <li>Remembering that this device has logged in before, so we can invite you to log in again (cookie)</li>
                        <li>Your settings, such as your reading preferences, and whether you&apos;ve seen the tutorial and tips (local storage)</li>
                    </ul>
                    <p>
                        Because all of this is essential, there&apos;s nothing to accept or turn
                        off. We don&apos;t use advertising or analytics cookies, and we don&apos;t
                        track you across other sites.
                    </p>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        3. Error Monitoring
                    </h2>
                    <p>
                        We use Sentry to find and fix errors. When something goes wrong, and
                        for a small sample of page loads, it reports technical details such as
                        your browser and what the page was doing. It sets no cookies and is
                        configured not to send your user details.
                    </p>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        4. Third-Party Services
                    </h2>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Hosting providers (AWS, Vercel)</li>
                        <li>Error monitoring (Sentry)</li>
                    </ul>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        5. Clearing What We Keep
                    </h2>
                    <p>
                        You can clear cookies and site data in your browser&apos;s settings. This
                        logs you out and, if you play without an account, removes your progress
                        on this device.
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Chrome: Settings → Privacy and security → Third-party cookies / Site data</li>
                        <li>Safari: Settings → Privacy → Manage Website Data</li>
                        <li>Firefox: Settings → Privacy &amp; Security → Cookies and Site Data</li>
                    </ul>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        6. Changes
                    </h2>
                    <p>
                        If we ever add anything optional, such as analytics, we&apos;ll update this
                        policy and ask you first.
                    </p>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        7. Contact
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
