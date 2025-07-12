import jwt from "jsonwebtoken";
import { JWT_SECRET } from "$env/static/private";

interface IUserPayload { username: string }

export const signToken = (payload: IUserPayload): string => { 
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "14d"});
}

export const verifyToken = (token: string): IUserPayload | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded as IUserPayload
    } catch (error) {
        console.error("Falha na verificação do JWT: ", error);
        return null;
    }
}