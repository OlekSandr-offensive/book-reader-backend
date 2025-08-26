const { Training } = require('../../models/training');
const { Book } = require('../../models/book');
const { RequestError } = require('../../helpers');
const moment = require('moment');

const completeTraining = async (req, res) => {
  const { _id: owner } = req.user;
  const { id } = req.params;

  const training = await Training.findOne({ _id: id, owner });
  if (!training) throw RequestError(404, `Training with id=${id} not found`);

  const { finishDate, books } = training;

  const finishTrainingDate = moment(finishDate);
  const currentDate = moment();
  const isExpired = currentDate.isAfter(finishTrainingDate.endOf('day'));

  const booksInTraining = await Book.find({
    _id: { $in: books },
  });
  const allBooksDone = booksInTraining.every(book => book.status === 'done');

  if (isExpired || allBooksDone) {
    if (isExpired) {
      await Promise.all(
        booksInTraining.map(async book => {
          if (book.status !== 'done') {
            book.status = 'done';
            await book.save();
          }
        }),
      );
    }
    training.inProgress = false;
    await training.save();

    await Training.deleteOne({ _id: id });
    return res.status(200).json({ message: 'Training completed' });
  } else {
    return res.status(200).json({ message: 'Training is still in progress' });
  }
};

module.exports = completeTraining;
