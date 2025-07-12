import { redirect } from "@sveltejs/kit";
import { 
    GITHUB_OAUTH_ID, 
    GITHUB_OAUTH_SECRET, 
    SMART_NOTES_PAT,
    PROCESS_ENV
} from "$env/static/private";
import { signToken } from "$lib/server/jwt";

export const GET = async ({url, cookies}) => {
    const githubCallbackCode = url.searchParams.get("code");
    if(!githubCallbackCode) throw redirect(302, "/");

    try {
        const responseURLParams = new URLSearchParams();
        responseURLParams.append('client_id', GITHUB_OAUTH_ID);
		responseURLParams.append('client_secret', GITHUB_OAUTH_SECRET);
		responseURLParams.append('code', githubCallbackCode);

        const githubTokenResponse = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json"
            },
            body: responseURLParams
        });

        const githubTokenData = await githubTokenResponse.json();
        const githubAcessToken = githubTokenData.access_token;
        const githubUserResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${githubAcessToken}`,
                Accept: "application/vnd.github.v3+json"
            }
        });

        const githubUserData = await githubUserResponse.json();
        const userUsername = githubUserData.login
        const repoName = `${userUsername}-smart-notes`

        const repoExistance = await fetch(`https://api.github.com/repos/smart-notes-users/${repoName}`, {
            headers: {
                Authorization: `Bearer ${SMART_NOTES_PAT}`,
                Accept: "application/vnd.github.v3+json"
            }
        });

        switch (repoExistance.status) {
            case 404:
                const repoCreationResponse = await fetch("https://api.github.com/orgs/smart-notes-users/repos", {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${SMART_NOTES_PAT}`,
                        Accept: 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: repoName,
                        private: true, 
                        description: `Repositório de Smartnotes para o usuário ${userUsername}.`
                    })
                });

                if (repoCreationResponse.ok) {		
                    await fetch(`https://api.github.com/repos/smart-notes-users/${repoName}/collaborators/${userUsername}`, {
                        method: 'PUT',
                        headers: {
                            Authorization: `Bearer ${SMART_NOTES_PAT}`,
                            Accept: 'application/vnd.github.v3+json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ permission: 'push' })
                    });
                }
                break;
        
            default:
                throw redirect(302, `/`);
        }

        const JWT_TOKEN = signToken({ username: userUsername })
        cookies.set("auth_token", JWT_TOKEN, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === PROCESS_ENV,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 14
        });
    } catch (error) {
		throw redirect(302, '/');
    }

    throw redirect(302, "/galleries");
}