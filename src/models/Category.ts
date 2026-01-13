import { Schema, model } from "mongoose";
import "./Book";

const categorySchema = new Schema(
  {
    name: { type: String, required: true },
    books: [{ type: Schema.Types.ObjectId, ref: "book" }],
  },
  { timestamps: true }
);
const Category = model("category", categorySchema);

export default Category;
