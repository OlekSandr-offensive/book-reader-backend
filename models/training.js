const { Schema, model } = require('mongoose');
const Joi = require('joi');

const { handleSchemaValidationErrors } = require('../helpers');

const dateNowSubSchema = new Schema(
  {
    factDate: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    pages: {
      type: Number,
      required: true,
    },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: 'book',
      required: true,
    },
  },
  { _id: false },
);

const trainingSchema = new Schema(
  {
    startDate: {
      type: String,
      required: [true, 'Set start date for training'],
    },
    finishDate: {
      type: String,
      required: [true, 'Set end date for training'],
    },
    inProgress: {
      type: Boolean,
      default: true,
    },
    books: [
      {
        type: Schema.Types.ObjectId,
        ref: 'book',
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    plannedPages: {
      type: Number,
      default: 0,
    },
    factPages: {
      type: Number,
      default: 0,
    },
    dateNow: {
      type: [dateNowSubSchema],
      default: [],
    },
    totalPages: {
      type: Number,
    },
  },
  { versionKey: false, timestamps: true },
);

trainingSchema.post('save', handleSchemaValidationErrors);

const addSchema = Joi.object({
  startDate: Joi.string().required(),
  finishDate: Joi.string().required(),
  inProgress: Joi.bool(),
  books: Joi.array().items(Joi.string().hex().length(24)),
  plannedPages: Joi.number(),
});

const statisticTrainingSchema = Joi.object({
  factDate: Joi.string().required(),
  pages: Joi.number().required(),
  time: Joi.string().required(),
  bookId: Joi.string().hex().length(24).required(),
});

const schemasTraining = {
  addSchema,
  statisticTrainingSchema,
};

const Training = model('training', trainingSchema);

module.exports = {
  Training,
  schemasTraining,
};
