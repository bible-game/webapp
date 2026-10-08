import { uiTheme } from "@/core/style/ui-theme";

export const inputClassNames = {
    base: "text-ui-text",
    label: "!text-ui-muted",
    input: "!text-ui-text text-[16px] placeholder:text-ui-faint",
    inputWrapper: "!bg-ui-surface data-[hover=true]:!bg-ui-raised border border-ui-line group-data-[focus=true]:border-ui-muted rounded-lg min-h-14 transition-colors",
    helperWrapper: "pt-1",
    errorMessage: "text-ui-lost text-xs",
    description: "!text-ui-muted text-xs",
};

export const alertClassNames = {
    base: "border-ui-lost/40 bg-ui-lost/10 text-ui-lost rounded-lg px-3 py-2",
    content: "text-sm",
};

export const cardClassName = "w-full text-ui-text";
export const submitButtonClassName = "ui-button ui-primary w-full";
export const submitButtonStyle = { background: uiTheme.text, color: uiTheme.bg };
