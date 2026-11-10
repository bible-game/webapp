export default function PrivacyPolicy() {
    return (
        <main className="app-page">
            <div className="w-full">
                <h1 className="text-[24px] font-semibold mb-8">Privacy Policy</h1>

                <section className="legal-content space-y-4">
                    <p>Last updated: 10 November 2026</p>

                    <p>
                        Bible Game (“we”, “us”, “our”) is a free, non-commercial educational
                        project designed to help users explore Scripture through interactive
                        daily challenges. This Privacy Policy explains how we collect, use,
                        store, and protect your information.
                    </p>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        1. Information We Collect
                    </h2>

                    <h3 className="font-semibold text-ui-text">A. Information you provide</h3>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Email address (if you create an account)</li>
                        <li>First and last names, required when completing your account profile</li>
                        <li>Your saved game results, reading progress and study reviews</li>
                        <li>Account identifiers and sign-in details managed through Clerk, including a linked Google account if you choose Google sign-in</li>
                    </ul>

                    <p>
                        We use Clerk to handle account registration, sign-in, email verification,
                        password recovery and account security. Clerk processes account information,
                        credentials and session information to provide those services. Your game,
                        reading and study progress is stored separately by Bible Game.
                    </p>
                    <p>
                        Google sign-in is optional. If you choose it, Google shares identity details
                        with Clerk, such as your Google account identifier, email address, name and
                        profile image where provided, according to the permissions shown on
                        Google&apos;s consent screen. We use your name, email address and Clerk account
                        identifier to connect you to your Bible Game account. You can use email and
                        password instead of linking a Google account.
                    </p>

                    <h3 className="font-semibold text-ui-text mt-4">B. Information collected automatically</h3>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Essential cookies / local storage for game progress</li>
                        <li>Device & browser information</li>
                        <li>IP address (security only)</li>
                    </ul>

                    <h3 className="font-semibold text-ui-text mt-4">C. Technical monitoring</h3>
                    <p>
                        When something goes wrong, and for a small sample of page loads, we
                        collect technical details (such as your browser and what the page was
                        doing) to find and fix errors. We use Sentry for error and performance
                        monitoring, and Vercel Speed Insights for page-performance measurements.
                    </p>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        2. How We Use Your Information
                    </h2>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Run and maintain the game</li>
                        <li>Save and restore progress</li>
                        <li>Enable leaderboards and account features; your name and scores can appear on public leaderboards</li>
                        <li>Improve gameplay and fix issues</li>
                        <li>Protect the platform from security threats</li>
                    </ul>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        3. Legal Basis
                    </h2>
                    <ul className="list-disc list-inside space-y-1">
                        <li><strong>Legitimate Interest</strong> — basic functionality, error monitoring and security</li>
                        <li><strong>Contract</strong> — when creating an account</li>
                    </ul>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        4. Storage & Protection
                    </h2>
                    <p>
                        Data is stored using modern security practices and encrypted
                        connections. We never sell or share personal information for
                        advertising.
                    </p>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        5. Sharing
                    </h2>
                    <p>We only share data with:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Hosting providers (e.g. AWS, Vercel)</li>
                        <li>Error and performance monitoring (Sentry and Vercel Speed Insights)</li>
                        <li>Authentication and account security (Clerk, and Google if you choose Google sign-in)</li>
                    </ul>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        6. International Transfers
                    </h2>
                    <p>
                        Our service providers may process account and technical information
                        outside the UK, including in the United States. Clerk describes its
                        processing and transfer arrangements in its{" "}
                        <a href="https://clerk.com/legal/dpa" className="account-link">Data Processing Addendum</a>
                        {" "}and maintains its current{" "}
                        <a href="https://clerk.com/legal/subprocessors" className="account-link">subprocessor information</a>.
                        {" "}Contact us for information about the providers and safeguards that
                        apply to your data.
                    </p>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        7. Your Rights
                    </h2>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Access your data</li>
                        <li>Request deletion</li>
                        <li>Correct inaccurate information</li>
                        <li>Withdraw consent at any time</li>
                    </ul>

                    <p>
                        You can change your profile and security settings or delete your account
                        through Manage account in the menu. Deletion removes your Clerk account
                        and is then processed by Bible Game to remove your account and saved progress.
                        We retain a minimal deleted-account identifier to prevent delayed updates
                        from recreating the account. Browser storage on your other devices is not
                        cleared remotely; you can remove it in your browser settings.
                    </p>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        8. Children’s Privacy
                    </h2>
                    <p>Bible Game is not designed for children under 13.</p>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        9. Changes to This Policy
                    </h2>
                    <p>We may update this policy as the project develops.</p>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        10. Contact
                    </h2>
                    <p>
                        Questions? Email us at{" "}
                        <a href="mailto:hello@bible.game" className="account-link">hello@bible.game</a>
                    </p>
                </section>
            </div>
        </main>
    );
}
