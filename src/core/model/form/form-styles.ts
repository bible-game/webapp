export const inputClassNames = {
    base: "text-indigo-300",
    label: "",
    input: "!text-indigo-300 placeholder:text-indigo-400/50",
    inputWrapper:
        "bg-white/10 data-[hover=true]:bg-white/15 " +
        "group-data-[focus=true]:bg-white/20 border border-white/20 " +
        "group-data-[focus=true]:border-indigo-500 " +
        "group-data-[focus=true]:shadow-[0_0_12px_-3px_rgba(99,102,241,0.4)] " +
        "rounded-lg transition-all duration-200",
    helperWrapper: "pt-1",
    errorMessage: "text-red-400 text-xs",
    description: "!text-indigo-300/70 text-xs",
}

export const alertClassNames = {
    base: "border-red-400/40 bg-red-500/10 text-red-300 rounded-lg px-3 py-2",
    content: "text-sm",
}

export const cardClassName =
    "w-full bg-white/5 border border-white/10 backdrop-blur-xl " +
    "rounded-2xl px-5 py-6 sm:px-6 sm:py-8 shadow-2xl text-indigo-300 " +
    "shadow-[0_0_60px_-15px_rgba(99,102,241,0.3)]"

export const submitButtonClassName =
    "w-full " +
    "!text-white font-medium py-2 rounded-lg transition-all " +
    "hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.5)] " +
    "hover:scale-[1.01] active:scale-[0.99]"

export const submitButtonStyle = {
    background: "linear-gradient(to right, #6366f1, #4338ca)",
}
