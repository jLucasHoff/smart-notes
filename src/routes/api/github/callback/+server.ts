import { redirect } from "@sveltejs/kit";
import { 
    GITHUB_OAUTH_ID, 
    GITHUB_OAUTH_SECRET, 
    SMART_NOTES_PAT,
    PROCESS_ENV
} from "$env/static/private";
import { signToken } from "$lib/server/jwt";
import { initialFiles } from "$lib/models/repo.js";

const GITHUB_API_BASE = "https://api.github.com";

export const GET = async ({url, cookies}) => {
    const code = url.searchParams.get("code");
    if(!code) throw redirect(302, "/");

    try {
        const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json"
            },
            body: new URLSearchParams({
                client_id: GITHUB_OAUTH_ID,
                client_secret: GITHUB_OAUTH_SECRET,
                code
            })
        });

        const { access_token } = await tokenRes.json();
        if (!access_token) throw new Error("Token not received");

        const userRes = await fetch(`${GITHUB_API_BASE}/user`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
                Accept: "application/vnd.github.v3+json"
            }
        });

        const { login: username } = await userRes.json();
        if (!username) throw new Error("Username not found")

        const repoName = `${username}-smart-notes`
        const repoUrl = `${GITHUB_API_BASE}/repos/smart-notes-users/${repoName}`;

        const repoCheck = await fetch(repoUrl, {
            headers: {
                Authorization: `Bearer ${SMART_NOTES_PAT}`,
                Accept: "application/vnd.github.v3+json"
            }
        });

        if (repoCheck.status === 404) {
            const createRes = await fetch(`${GITHUB_API_BASE}/orgs/smart-notes-users/repos`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${SMART_NOTES_PAT}`,
                    Accept: 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: repoName,
                    private: true, 
                    description: `Smartnotes repo id #${crypto.randomUUID()}.`
                })
            });

            if (!createRes.ok) throw new Error("Something wrong happens while creates the repo")	;

            // invite
            await fetch(`${repoUrl}/collaborators/${username}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${SMART_NOTES_PAT}`,
                    Accept: 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ permission: 'push' })
            });

            //mockup
            for (const file of initialFiles(username)) {
                await fetch(`${repoUrl}/contents/${file.path}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${SMART_NOTES_PAT}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Adds ${file.path}`,
                        content: Buffer.from(file.content).toString('base64')
                    })
                });
            }
        }

        const token = signToken({ username })
        cookies.set("auth_token", token, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === PROCESS_ENV,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 14
        });

        throw redirect(302, "/galleries");
    } catch (error) {
		throw redirect(302, '/');
    }
}