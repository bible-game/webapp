export default function PrivacyPolicy() {
    return (
        <main className="app-page">
            <div className="w-full">
                <h1 className="text-[24px] font-semibold mb-8">Privacy Policy</h1>

                <section className="legal-content space-y-4">
                    <p>Last updated: {new Date().getFullYear()}</p>

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
                        <li>Username or display name</li>
                    </ul>

                    <h3 className="font-semibold text-ui-text mt-4">B. Information collected automatically</h3>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Essential cookies / local storage for game progress</li>
                        <li>Device & browser information</li>
                        <li>IP address (security only)</li>
                    </ul>

                    <h3 className="font-semibold text-ui-text mt-4">C. Optional analytics</h3>
                    <p>
                        With your consent, we may use anonymous aggregated analytics to
                        improve gameplay and performance.
                    </p>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        2. How We Use Your Information
                    </h2>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Run and maintain the game</li>
                        <li>Save and restore progress</li>
                        <li>Enable leaderboards and account features</li>
                        <li>Improve gameplay and fix issues</li>
                        <li>Protect the platform from security threats</li>
                    </ul>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        3. Legal Basis
                    </h2>
                    <ul className="list-disc list-inside space-y-1">
                        <li><strong>Consent</strong> — analytics and non-essential cookies</li>
                        <li><strong>Legitimate Interest</strong> — basic functionality and security</li>
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
                        <li>Optional analytics providers (with consent)</li>
                    </ul>

                    <h2 className="text-lg font-bold tracking-normal mt-6 mb-2 text-ui-text">
                        6. International Transfers
                    </h2>
                    <p>
                        Some providers may process data outside your region. We require them
                        to meet GDPR-equivalent safeguards.
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
                        <span className="font-semibold text-white">hello@bible.game</span>
                    </p>
                </section>
            </div>
        </main>
    );
}
