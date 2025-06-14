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

  const finish = training.finishDate;
  const currentDate = moment().format('yyyy.MM.DD');

  const start = moment(currentDate.replace(/[.]/g, ''));

  const diff = start.diff(finish, 'days');

  let date;

  if (training.dateNow.length !== 0) {
    date = training.dateNow[training.dateNow.length - 1];
    if (factDate === date.factDate && String(date.bookId) === String(bookId)) {
      date.factDate = factDate;
      date.time = time;
      date.pages += pages;
    } else {
      training.dateNow.push({
        factDate: factDate,
        time: time,
        pages: pages,
        bookId: bookId,
      });
    }
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
  thisBook.readPages += pages;
  const diffPages = thisBook.totalPages - thisBook.readPages;
  if (pages > thisBook.totalPages || diffPages < 0) {
    throw RequestError(400, `Inserted pages can't be more than pages in book`);
  }
  if (thisBook.readPages >= thisBook.totalPages) {
    thisBook.status = 'done';
  }
  await thisBook.save();

  training.factPages += pages;
  const updatedTraining = await training.save();

  const booksInTraining = await Book.find({
    _id: { $in: updatedTraining.books },
  });
  const allBooksDone = booksInTraining.every(book => book.status === 'done');

  if (diff > 0) {
    return res.json(diffPages);
  }

  if (allBooksDone) {
    await Training.deleteOne({ _id: id });
    return res.status(200).json({ message: 'Training completed' });
  }

  return res.status(201).json(updatedTraining);
};

module.exports = statistic;
