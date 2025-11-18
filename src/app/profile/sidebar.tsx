import Image from "next/image";

export default function ProfileSidebar({ info }: { info: any }) {
    const fallbackUrl =
        "https://raw.githubusercontent.com/bible-game/webapp/main/public/icon-nobg.png";

    return (
        <aside className="space-y-4">

            {/* Profile Photo */}
            <div className="flex justify-center">
                <Image
                    src={`data:image/png;base64,${info.userIcon}` || fallbackUrl}
                    width={260}
                    height={260}
                    alt="Profile"
                    className="rounded-full border"
                />
            </div>

            {/* Name */}
            <h2 className="text-2xl font-bold text-center">
                {info.firstname} {info.lastname}
            </h2>

            {/* Job Title */}
            <p className="text-center text-gray-400 text-sm">
                {info.role}
            </p>

            {/* Achievements */}
            <div className="space-y-2">
                <h3 className="font-semibold">Achievements</h3>
                <div className="flex gap-2">
                    {info.achievements?.map((ach: any, i: number) => (
                        <Image
                            key={i}
                            src={ach.icon}
                            alt={ach.name}
                            width={48}
                            height={48}
                        />
                    ))}
                </div>
            </div>

        </aside>
    );
}
