import { Request, Response } from "express";
import Book from "../models/Book";
import Author from "../models/Author";
import Category from "../models/Category";

export const getAllBooks = async (req: Request, res: Response) => {
  if (req.query.author) {
    const authorId = req.query.author as string;
    const booksByAuthor = await Book.find({ author: authorId })
      .populate("author")
      .populate("categories");
    const availableBooks = booksByAuthor.filter((book) => book.isAvailable);
    return res.status(200).json({ data: availableBooks });
  }

  if (req.query.category) {
    const categoryId = req.query.category as string;
    const booksByCategory = await Book.find({ categories: categoryId })
      .populate("author")
      .populate("categories");
    const availableBooks = booksByCategory.filter((book) => book.isAvailable);
    return res.status(200).json({ data: availableBooks });
  }
  const books = await Book.find().populate("author").populate("categories");
  const availableBooks = books.filter((book) => book.isAvailable);
  res.status(200).json({ data: availableBooks });
};

export const getBookById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const book = await Book.findById(id)
    .populate("author")
    .populate("categories");
  if (!book || !book.isAvailable) {
    return res.status(404).json({ message: "Book not found" });
  }
  res.status(200).json({ data: book });
};

export const createBook = async (req: Request, res: Response) => {
  try {
    const { title, author, categories } = req.body;
    const parsedCategories = Array.isArray(categories)
      ? categories
      : categories
      ? [categories]
      : [];
    const imagePath = req.file ? req.file.path : undefined;

    const authorExists = await Author.findById(author);
    if (!authorExists) {
      return res.status(400).json({ message: "Invalid author ID" });
    }

    if (parsedCategories.length > 0) {
      const categoryDocs = await Category.find({
        _id: { $in: parsedCategories },
      });
      if (categoryDocs.length !== parsedCategories.length) {
        return res
          .status(400)
          .json({ message: "One or more invalid category IDs" });
      }
    }

    const createData: any = { title, author };
    if (parsedCategories.length > 0) createData.categories = parsedCategories;
    if (imagePath) createData.image = imagePath;

    const newBook = await Book.create(createData);

    await Author.findByIdAndUpdate(author, {
      $addToSet: { books: newBook._id },
    }).exec();

    if (parsedCategories.length > 0) {
      await Promise.all(
        parsedCategories.map((catId: string) =>
          Category.findByIdAndUpdate(catId, {
            $addToSet: { books: newBook._id },
          }).exec()
        )
      );
    }

    const populatedBook = await Book.findById(newBook._id)
      .populate("author")
      .populate("categories");

    res.status(201).json({ data: populatedBook });
  } catch (error) {
    res.status(500).json({ message: "Error creating book", error });
  }
};

export const updateBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, author, categories } = req.body;
    const parsedCategories = Array.isArray(categories)
      ? categories
      : categories
      ? [categories]
      : [];
    const imagePath = req.file ? req.file.path : undefined;

    if (author) {
      const authorExists = await Author.findById(author);
      if (!authorExists) {
        return res.status(400).json({ message: "Invalid author ID" });
      }
    }

    if (parsedCategories.length > 0) {
      const categoryDocs = await Category.find({
        _id: { $in: parsedCategories },
      });
      if (categoryDocs.length !== parsedCategories.length) {
        return res
          .status(400)
          .json({ message: "One or more invalid category IDs" });
      }
    }

    const oldBook = await Book.findById(id);
    if (!oldBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    // If author changed, remove from old author and add to new author
    if (author) {
      if (oldBook.author?.toString() !== author) {
        if (oldBook.author) {
          await Author.findByIdAndUpdate(oldBook.author, {
            $pull: { books: oldBook._id },
          }).exec();
        }
        await Author.findByIdAndUpdate(author, {
          $addToSet: { books: oldBook._id },
        }).exec();
      }
    }

    // Sync categories: remove from categories that were removed, add to newly added categories
    if (categories !== undefined) {
      const oldCatIds = (oldBook.categories || []).map((c: any) =>
        c.toString()
      );
      const newCatIds = parsedCategories.map((c: any) => c.toString());
      const toRemove = oldCatIds.filter((c: string) => !newCatIds.includes(c));
      const toAdd = newCatIds.filter((c: string) => !oldCatIds.includes(c));

      await Promise.all(
        toRemove.map((catId: string) =>
          Category.findByIdAndUpdate(catId, {
            $pull: { books: oldBook._id },
          }).exec()
        )
      );
      await Promise.all(
        toAdd.map((catId: string) =>
          Category.findByIdAndUpdate(catId, {
            $addToSet: { books: oldBook._id },
          }).exec()
        )
      );
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (author !== undefined) updateData.author = author;
    if (categories !== undefined) updateData.categories = parsedCategories;
    if (imagePath) updateData.image = imagePath;

    const updatedBook = await Book.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("author")
      .populate("categories");

    res.status(200).json({ data: updatedBook });
  } catch (error) {
    res.status(500).json({ message: "Error updating book", error });
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedBook = await Book.findByIdAndUpdate(
    id,
    { isAvailable: false },
    { new: true }
  );
  if (!deletedBook) {
    return res.status(404).json({ message: "Book not found" });
  }
  res.status(200).json({ message: "Book deleted successfully" });
};
