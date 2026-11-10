import type { ComponentProps } from "react";
import type { ClerkProvider, UserProfile } from "@clerk/nextjs";
import { uiTheme } from "@/core/style/ui-theme";

/** Supported Clerk element hooks reuse the same controls as the application's account forms. */
export const clerkAppearance = {
    variables: {
        colorPrimary: uiTheme.text,
        colorPrimaryForeground: uiTheme.bg,
        colorBackground: uiTheme.sheet,
        colorForeground: uiTheme.text,
        colorMuted: uiTheme.raised,
        colorMutedForeground: uiTheme.muted,
        colorInput: uiTheme.surface,
        colorInputForeground: uiTheme.text,
        colorDanger: uiTheme.error,
        colorSuccess: uiTheme.success,
        colorWarning: uiTheme.warning,
        colorBorder: uiTheme.line,
        colorRing: uiTheme.text,
        fontFamily: "var(--font-sans), sans-serif",
        fontSize: "16px",
        borderRadius: "8px",
    },
    elements: {
        rootBox: 'account-clerk',
        cardBox: 'account-clerk-box',
        card: 'account-clerk-card',
        header: 'account-heading',
        headerTitle: 'account-title',
        headerSubtitle: 'account-description',
        main: 'account-clerk-main',
        footer: 'account-clerk-footer',
        footerAction: 'account-clerk-footer-action',
        footerItem: 'account-clerk-footer-item',
        footerActionText: 'account-description',
        footerActionLink: 'account-link',
        footerPagesLink: 'account-link',
        form: 'account-clerk-form',
        formFieldLabel: 'account-label',
        formFieldInput: 'ui-field account-input',
        formFieldHintText: 'account-hint',
        formFieldErrorText: 'account-field-error',
        formFieldWarningText: 'account-field-warning',
        formButtonPrimary: 'ui-button ui-primary account-primary',
        formFieldAction: 'account-link',
        formResendCodeLink: 'account-text-action',
        socialButtonsBlockButton: 'ui-button account-social',
        socialButtonsBlockButtonText: 'account-social-label',
        alternativeMethodsBlockButton: 'ui-button account-social',
        alternativeMethodsBlockButtonText: 'account-social-label',
        dividerLine: 'account-divider',
        dividerText: 'account-hint',
        identityPreviewText: 'account-description',
        identityPreviewEditButton: 'account-text-action',
        otpCodeFieldInput: 'account-code-input',
        alert: 'account-alert',
        alertText: 'account-field-error',
    },
} satisfies ComponentProps<typeof ClerkProvider>["appearance"];

/** Match the app's account vocabulary while leaving Clerk's errors and verification instructions intact. */
export const clerkLocalization = {
    signIn: { start: { title: 'Log in', titleCombined: 'Log in', subtitle: '', subtitleCombined: '', actionLink: 'Sign up' } },
    signUp: { start: { title: 'Sign up', titleCombined: 'Sign up', subtitle: '', subtitleCombined: '', actionLink: 'Log in' } },
} satisfies NonNullable<ComponentProps<typeof ClerkProvider>["localization"]>;

/** Account settings keep Clerk's wider navigation layout; login-only card/footer CSS must not apply. */
export const clerkProfileAppearance = {
    elements: {
        rootBox: 'account-profile',
        cardBox: 'account-profile-box',
        card: 'account-profile-card',
        footer: 'account-profile-footer',
        footerItem: 'account-profile-footer-item',
    },
} satisfies ComponentProps<typeof UserProfile>["appearance"];
