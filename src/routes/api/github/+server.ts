import { redirect } from "@sveltejs/kit";
import { GITHUB_OAUTH_ID } from "$env/static/private";

export const GET = async () => {
    const githubAuthURL = new URL("https://github.com/login/oauth/authorize");

    githubAuthURL.searchParams.append("client_id", GITHUB_OAUTH_ID);
    githubAuthURL.searchParams.append("scope", "read:user read:org");

    throw redirect(302, githubAuthURL.toString())
}