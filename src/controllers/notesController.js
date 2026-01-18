import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

export const getAllNotes = async (req, res, next) => {
  try {
    const { page = 1, perPage = 10, tag, search } = req.query;
    const skip = (page - 1) * perPage;
    const filter = {};
    if (tag) filter.tag = tag;
    if (search && search.trim() !== '') filter.$text = { $search: search };
    const notesQuery = Note.find({ userId: req.user._id, ...filter });
    const [totalNotes, notes] = await Promise.all([
      notesQuery.clone().countDocuments(),
      notesQuery.skip(skip).limit(perPage),
    ]);
    const totalPages = Math.ceil(totalNotes / perPage);
    res.status(200).json({
      page,
      perPage,
      totalNotes,
      totalPages,
      notes,
    });
  } catch (err) {
    next(err);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const note = await Note.create({ ...req.body, userId: req.user._id });
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
};

export const getNoteById = async (req, res, next) => {
  const { noteId } = req.params;
  const note = await Note.findOne({
    _id: noteId,
    userId: req.user._id,
  });

  if (!note) {
    return next(createHttpError(404, 'Note not found'));
  }

  res.status(200).json(note);
};

export const deleteNote = async (req, res, next) => {
  const { noteId } = req.params;
  const note = await Note.findOneAndDelete({
    _id: noteId,
    userId: req.user._id,
  });

  if (!note) {
    next(createHttpError(404, 'Note not found'));
    return;
  }

  res.status(200).send(note);
};

export const updateNote = async (req, res, next) => {
  const { noteId } = req.params;

  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId: req.user._id },
    req.body,
    { new: true },
  );

  if (!note) {
    next(createHttpError(404, 'Note not found'));
    return;
  }

  res.status(200).json(note);
};
