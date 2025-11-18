export default function ProfileMain({ info }: { info: any }) {
    return (
        <section className="space-y-6">

            {/* Welcome / Title */}
            <h1 className="text-3xl font-bold">
                Hello {info.firstname} 👋
            </h1>

            {/* Pinned Progress */}
            <div>
                <h2 className="text-xl font-semibold mb-3">Pinned</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {info.pinned?.map((project: any, i: number) => (
                        <div key={i} className="border rounded-lg p-4 bg-black/20">
                            <h3 className="font-semibold">{project.name}</h3>
                            <p className="text-sm text-gray-400">{project.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Daily Learning */}
            <div>
                <h2 className="text-xl font-semibold mb-3">Daily Learning</h2>
                <div className="text-gray-500 text-sm">
                    Coming soon...
                </div>
            </div>

        </section>
    );
}