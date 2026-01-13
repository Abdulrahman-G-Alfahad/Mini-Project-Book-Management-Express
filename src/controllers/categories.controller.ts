import { Request, Response } from "express";
import Category from "../models/Category";

export const getAllCategories = async (req: Request, res: Response) => {
  const categories = await Category.find().populate("books");
  res.status(200).json({ data: categories });
};

export const getCategoryById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await Category.findById(id).populate("books");
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.status(200).json({ data: category });
};

export const createCategory = async (req: Request, res: Response) => {
  const { name } = req.body;
  const newCategory = await Category.create({ name });
  res.status(201).json({ data: newCategory });
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  const updatedCategory = await Category.findByIdAndUpdate(
    id,
    { name },
    { new: true }
  );
  if (!updatedCategory) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.status(200).json({ data: updatedCategory });
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedCategory = await Category.findByIdAndDelete(id);
  if (!deletedCategory) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.status(200).json({ message: "Category deleted successfully" });
};
