import Link from "next/link";

export default function CookiePolicy() {
    return (
        <main className="app-page">
            <div className="w-full">
                <h1 className="text-[24px] font-semibold mb-8">Cookie Policy</h1>

                <section className="legal-content space-y-4">
                    <p>Last updated: 10 November 2026</p>

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
                    <p>We use device storage for the following features:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Your progress: guesses, results, streaks and reviews (local storage)</li>
                        <li>Keeping you logged in and protecting sign-in through Clerk (session and security cookies)</li>
                        <li>Remembering that this device has logged in before, so we can invite you to log in again (cookie)</li>
                        <li>Your settings, such as your reading preferences, and whether you&apos;ve seen the tutorial and tips (local storage)</li>
                    </ul>
                    <p>
                        We do not use advertising cookies. You can restrict or clear storage
                        through your browser, but this can affect sign-in and progress saved on
                        this device.
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <caption className="mb-3 text-left font-semibold text-ui-text">Storage used by Bible Game</caption>
                            <thead><tr className="border-b border-ui-line">
                                <th scope="col" className="py-2 pr-4">Item</th>
                                <th scope="col" className="py-2 pr-4">Purpose</th>
                                <th scope="col" className="py-2">Duration</th>
                            </tr></thead>
                            <tbody>
                                <tr className="border-b border-ui-line">
                                    <th scope="row" className="py-3 pr-4 font-normal">Clerk authentication cookies, including <code>__session</code>, <code>__client</code> and <code>__client_uat</code></th>
                                    <td className="py-3 pr-4">Maintain and check your sign-in and session</td>
                                    <td className="py-3">Cookies may be refreshed during use; duration depends on the cookie, Clerk session settings and your browser</td>
                                </tr>
                                <tr className="border-b border-ui-line">
                                    <th scope="row" className="py-3 pr-4 font-normal"><code>known_user</code></th>
                                    <td className="py-3 pr-4">Remember a previous login and help protect older saved progress during account changes</td>
                                    <td className="py-3">Up to one year</td>
                                </tr>
                                <tr className="border-b border-ui-line">
                                    <th scope="row" className="py-3 pr-4 font-normal"><code>tz</code></th>
                                    <td className="py-3 pr-4">Choose the daily game using your timezone</td>
                                    <td className="py-3">Up to one year; refreshed when recorded again</td>
                                </tr>
                                <tr>
                                    <th scope="row" className="py-3 pr-4 font-normal">Local storage</th>
                                    <td className="py-3 pr-4">Progress, reading preferences and tutorial state; guest and account progress are stored separately</td>
                                    <td className="py-3">Until cleared by you or removed by your browser; browser storage can also be evicted</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p>
                        Clerk also performs security and anti-bot checks during authentication.
                        If you choose Google sign-in, Google handles its own sign-in and consent
                        pages and may use cookies on its own domains. See{" "}
                        <a href="https://policies.google.com/technologies/cookies" className="account-link">Google&apos;s cookie information</a>
                        {" "}and our <Link href="/about/privacy" className="account-link">Privacy Policy</Link>.
                    </p>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        3. Technical Monitoring
                    </h2>
                    <p>
                        We use Sentry to find and fix errors and monitor performance, and
                        Vercel Speed Insights to measure page performance. Reports include
                        technical details such as your browser and the page being measured.
                    </p>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        4. Third-Party Services
                    </h2>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Hosting and page-performance services (AWS, Vercel)</li>
                        <li>Error monitoring (Sentry)</li>
                        <li>Authentication and account security (Clerk, and Google if you choose Google sign-in)</li>
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
                        <a href="mailto:hello@bible.game" className="account-link">hello@bible.game</a>
                    </p>
                </section>
            </div>
        </main>
    );
}
