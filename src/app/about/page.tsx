import Link from "next/link";
import {Github, Mail, Play} from "lucide-react";


export default function About() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-[#0b0f24] to-[#0f1533] text-[#e8ecff] px-6 py-12 md:px-10">
            {/* Header */}
            <header className="flex items-center gap-4 mb-10 justify-between">
                <div className="flex gap-4">
                    <div
                        className="w-12 h-12 rounded-xl border border-white/15 bg-gradient-to-b from-[#1a1f3f] to-[#0f1430] shadow-lg grid place-items-center overflow-hidden">
                        <img src="/icon-nobg.png" alt="Bible Game icon" className="w-8 h-8"/>
                    </div>
                    <div>
                        <div className="font-extrabold text-xl tracking-wide">Bible Game</div>
                        <div className="text-sm text-[#adb3d6]">A daily Bible passage guessing game</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/play/today"
                        className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium hover:bg-white/20 transition-colors">
                        <div className="flex gap-2"><Play size={16}/> Play</div>
                    </Link>
                    <a
                        href="https://github.com/bible-game"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium hover:bg-white/20 transition-colors">
                        <div className="flex gap-2"><Github size={16}/> GitHub</div>
                    </a>
                    <a
                        href="mailto:dev@jrsmth.io"
                        className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2">
                        <Mail size={16} aria-hidden/>
                        dev@jrsmth.io
                    </a>
                </div>
            </header>

            {/* Hero */}
            <div className="grid gap-7 md:grid-cols-[1.1fr,0.9fr]">
                {/* Left Card */}
                <div className="bg-white/5 border border-white/15 rounded-2xl shadow-lg p-7">
                    <h1 className="inline-block pb-1 relative font-bold text-lg md:text-xl">
                        Judgment, justice, and obligations in community
                        <span
                            className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-gradient-conic from-sky-400 via-green-300 via-yellow-300 via-red-400 to-sky-400 opacity-90"/>
                    </h1>
                    <p className="mt-4 text-[#adb3d6] leading-relaxed">
                        Bible Game sits in the family of Worldle-style games (think Versle, Lordle, Globle).
                        The twist—and the USP—is <em>how</em> the Bible is displayed: a star-map view
                        that helps you memorise where books and events live in relation to each other.
                        As you play, you build a durable mental map of Scripture and a simple, joyful daily practice.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {[
                            "Daily chapter",
                            "One-line summary",
                            "Five guesses",
                            "Guided hints",
                            "Share results",
                            "Learn the Bible’s shape"
                        ].map((pill) => (
                            <span
                                key={pill}
                                className="text-xs text-blue-100 px-3 py-1.5 rounded-full bg-blue-400/10 border border-blue-400/25 backdrop-blur-sm"
                            >
                {pill}
              </span>
                        ))}
                    </div>
                </div>

                {/* Right Card */}
                <div className="bg-white/5 border border-white/15 rounded-2xl shadow-lg p-2 flex items-center justify-center">
                    <img
                        src="/bible-game.gif"
                        alt="Bible Game gameplay GIF"
                        className="w-full h-auto rounded-lg"
                    />
                </div>
            </div>

            {/* Gameplay */}
            <section className="mt-10">
                <h2 className="text-lg font-bold tracking-wide mb-3">Gameplay</h2>
                <div className="bg-white/5 border border-white/15 rounded-2xl shadow-lg p-6">
                    <ul className="list-disc list-inside text-[#adb3d6] space-y-2">
                        <li>A random Bible chapter is chosen each day and summarised in a short prompt.</li>
                        <li>Guess by clicking the map <span className="text-sm">(book → chapter)</span> or using the dropdowns.</li>
                        <li>Each incorrect guess gives two nudges: a ▲/▼ before/after arrow and the number of verses away from the answer.</li>
                        <li>Parts of the map outside a correctly guessed section are gently greyed out to focus your search.</li>
                        <li>You have <strong>5 attempts</strong> before the answer is revealed.</li>
                    </ul>
                </div>
                <div className="mt-4 flex gap-3 p-4 border-l-4 border-blue-400 bg-blue-400/5 rounded-lg">
                    <div>⭐</div>
                    <div className="text-sm">
                        <strong>Scoring</strong><br />
                        Win sooner, earn more stars. Formula: <code>won ? 5 + 1 − guesses : 0</code>.
                        <br />1st guess = 5⭐ · 2nd = 4⭐ · 3rd = 3⭐ · 4th = 2⭐ · 5th = 1⭐ · else = 0⭐
                    </div>
                </div>
            </section>

            {/* Vision */}
            <section className="mt-10">
                <h2 className="text-lg font-bold tracking-wide mb-3">Vision</h2>
                <div className="bg-white/5 border border-white/15 rounded-2xl shadow-lg p-6 text-[#adb3d6] space-y-4">
                    <p>
                        Studying the Bible is central to Christian life, but it can be hard to see
                        the structure—how books relate, where stories sit, and how the grand narrative
                        unfolds. Bible Game helps you <em>visualise</em> that structure while you play:
                        a little learning each day, reinforced by repetition and discovery.
                    </p>
                    <p>
                        The long-term goal is to encourage reading the day’s passage,
                        track coverage across Scripture, and unlock gentle rounds that
                        deepen understanding. It’s social, encouraging collaboration and
                        soft competition with shared results.
                    </p>
                </div>
            </section>

            {/* Screenshot */}
            <section className="mt-10">
                <h2 className="text-lg font-bold tracking-wide mb-3">Interface sneak peek</h2>
                <div className="bg-white/5 border border-white/15 rounded-2xl shadow-lg p-4">
                    <img
                        src="/Skjermbilde 2025-08-15 kl. 08.53.09.png"
                        alt="Screenshot of Bible Game interface"
                        className="w-full rounded-lg border border-white/15 shadow-lg"
                    />
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-14 py-4 border-t border-dashed border-white/20 text-sm text-[#adb3d6] flex justify-between flex-wrap gap-2">
                <span>© {new Date().getFullYear()} Bible Game</span>
                <span>Made for curious readers and visual learners.</span>
            </footer>
        </main>
    );
}
