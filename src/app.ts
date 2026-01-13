import express from "express";
import connectDB from "./database/database";
import { errorHandlerMiddleware } from "./middleware/errorHandler";
import { notFoundMiddleware } from "./middleware/notFound";
import cors from "cors";
import morgan from "morgan";
import authorRoutes from "./routes/author.routes";
import categoryRoutes from "./routes/category.routes";
import bookRoutes from "./routes/book.routes";
import path from "path";

const app = express();
const PORT = process.env.PORT;
connectDB();

app.use(express.json());

app.use(cors());
app.use(morgan("dev"));

app.use("/api/authors", authorRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/books", bookRoutes);

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use(errorHandlerMiddleware);
app.use(notFoundMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
