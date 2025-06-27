import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabaseClient";

export async function authenticate(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization;
	if (!authHeader?.startsWith("Bearer ")) {
		return res.status(401).json({ error: "Unauthorized: No token provided" });
	}

	const token = authHeader.split(" ")[1];
	const { data, error } = await supabase.auth.getUser(token);

	if (error || !data.user) {
		return res.status(401).json({ error: error?.message || "Invali token" });
	}

	(req as any).user = { ...data.user };
	next();
}
