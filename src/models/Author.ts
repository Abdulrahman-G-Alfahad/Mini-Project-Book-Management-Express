import { Schema, model } from "mongoose";
import "./Book";
import "./Category";

const authorSchema = new Schema(
  {
    name: { type: String, required: true },
    country: { type: String, required: true },
    books: [{ type: Schema.Types.ObjectId, ref: "book" }],
  },
  { timestamps: true }
);

const Author = model("author", authorSchema);

export default Author;
