import { Schema, model } from "mongoose";
import "./Author";
import "./Category";

const bookSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "author", required: true },
    categories: [{ type: Schema.Types.ObjectId, ref: "category" }],
    isAvailable: { type: Boolean, default: true },
    image: { type: String },
  },
  { timestamps: true }
);

const Book = model("book", bookSchema);

export default Book;
