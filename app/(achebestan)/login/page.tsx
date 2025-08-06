import { LoginForm } from "@/components/forms/user/login-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage() {
    // check if a session exists and redirect them to home page
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session?.session.id) {
        redirect("/");
    } else {
        return <LoginForm />;
    }
}
