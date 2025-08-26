const { Training } = require('../../models/training');
const { Book } = require('../../models/book');
const { RequestError } = require('../../helpers');
const moment = require('moment');

const statistic = async (req, res) => {
  const { _id: owner } = req.user;
  const { id } = req.params;
  const { bookId, factDate, pages } = req.body;

  if (pages < 1) {
    throw RequestError(400, 'Pages must be greater than 0');
  }

  const time = moment().format('HH:mm:ss');
  const training = await Training.findOne({ _id: id, owner });
  if (!training) throw RequestError(404, `Training with id=${id} not found`);
  if (!training.inProgress) {
    throw RequestError(400, 'This training is already finished');
  }

  const lastEntry = training.dateNow[training.dateNow.length - 1];

  const isSameDayAndBook =
    lastEntry?.factDate === factDate &&
    String(lastEntry?.bookId) === String(bookId);

  if (isSameDayAndBook) {
    lastEntry.time = time;
    lastEntry.pages += pages;
  } else {
    training.dateNow.push({
      factDate: factDate,
      time: time,
      pages: pages,
      bookId: bookId,
    });
  }

  if (!training.books.includes(bookId)) {
    throw RequestError(
      400,
      `Book with id=${bookId} is not part of this training`,
    );
  }

  const thisBook = await Book.findById({ _id: bookId, owner });
  if (!thisBook) throw RequestError(404, `Book with id=${bookId} not found`);

  if (thisBook.readPages + pages > thisBook.totalPages) {
    throw RequestError(400, `Inserted pages cannot exceed total pages`);
  }

  thisBook.readPages += pages;
  if (thisBook.readPages >= thisBook.totalPages) {
    thisBook.status = 'done';
  }
  await thisBook.save();

  training.factPages += pages;
  const updatedTraining = await training.save();

  if (thisBook.readPages >= thisBook.totalPages) {
    updatedTraining.message = 'Congratulations! Another book finished.';
  }

  return res.status(201).json(updatedTraining);
};

module.exports = statistic;
