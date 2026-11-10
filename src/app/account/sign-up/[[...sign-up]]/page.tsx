import AuthEntry, { type AccountSearch } from "@/core/component/account/auth-entry";
import ClerkAccountScreen from "@/core/component/clerk-account-screen";

export default function Page({ searchParams }: { searchParams: AccountSearch }) {
    return <ClerkAccountScreen><AuthEntry kind="sign-up" searchParams={searchParams}/></ClerkAccountScreen>;
}
