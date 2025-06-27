import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./src/routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", router);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
	console.error(err.stack);
	res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`✅ Server is running on http:/localhost:${PORT}`);
});

export default app;
