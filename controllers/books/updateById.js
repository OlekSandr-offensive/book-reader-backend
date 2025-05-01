const { Book } = require('../../models/book');

const { RequestError } = require('../../helpers');

const updateById = async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;
  const { resume: review, rating } = req.body;

  const result = await Book.findById({ _id: id, owner });

  if (!result) {
    throw RequestError(404, 'Not found');
  }

  if (result.status === 'done') {
    result.resume = review;
    result.rating = rating;
    await result.save();
    res.json(result);
  } else {
    res.json({ message: 'This book has not been read yet' });
  }
};

module.exports = updateById;
