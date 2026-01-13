import { Router } from "express";
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/books.controller";
import upload from "../middleware/multer";

const router = Router();

router.get("/", getAllBooks);
router.get("/:id", getBookById);
router.post("/", upload.single("image"), createBook);
router.put("/:id", upload.single("image"), updateBook);
router.delete("/:id", deleteBook);

export default router;
