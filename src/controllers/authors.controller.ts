import { Request, Response } from "express";
import Author from "../models/Author";

export const getAllAuthors = async (req: Request, res: Response) => {
  const authors = await Author.find().populate("books");
  res.status(200).json({ data: authors });
};

export const getAuthorById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const author = await Author.findById(id).populate("books");
  if (!author) {
    return res.status(404).json({ message: "Author not found" });
  }
  res.status(200).json({ data: author });
};

export const createAuthor = async (req: Request, res: Response) => {
  const { name, country } = req.body;
  const newAuthor = await Author.create({ name, country });
  res.status(201).json({ data: newAuthor });
};

export const updateAuthor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, country } = req.body;
  const updatedAuthor = await Author.findByIdAndUpdate(
    id,
    { name, country },
    { new: true }
  );
  if (!updatedAuthor) {
    return res.status(404).json({ message: "Author not found" });
  }
  res.status(200).json({ data: updatedAuthor });
};

export const deleteAuthor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedAuthor = await Author.findByIdAndDelete(id);
  if (!deletedAuthor) {
    return res.status(404).json({ message: "Author not found" });
  }
  res.status(200).json({ message: "Author deleted successfully" });
};
