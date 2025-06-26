import { Request, Response, NextFunction } from "express";
import { supabase } from "../supabase";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ error: "No token provided" });
	}

	const token = authHeader.split(" ")[1];

	const { data, error } = await supabase.auth.getUser(token);

	if (error || !data?.user) {
		return res.status(401).json({ error: error?.message || "Invalid token" });
	}

	(req as any).user = data.user;
	next();
};
