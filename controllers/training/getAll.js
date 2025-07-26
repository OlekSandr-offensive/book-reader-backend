const { Training } = require('../../models/training');
const moment = require('moment');

const getAll = async (req, res) => {
  const { _id: owner } = req.user;
  const result = await Training.findOne(
    { owner },
    '-createdAt -updatedAt',
  ).populate('owner');

  if (result) {
    const { finishDate } = result;
    if (finishDate) {
      const finishTrainingDate = moment(finishDate);
      const currentMomentStartOfDay = moment().startOf('day');
      const diff = currentMomentStartOfDay.diff(finishTrainingDate, 'days');

      if (diff > 0) {
        try {
          await Training.deleteOne({ _id: result._id });
          return res
            .status(200)
            .json({ message: 'Time is up, training is over' });
        } catch (error) {
          console.error('Error deleting expired training:', error);
          return res
            .status(500)
            .json({ message: 'Internal server error during training cleanup' });
        }
      } else {
        return res.status(200).json(result);
      }
    } else {
      return res.status(200).json(result);
    }
  } else {
    return res.status(404).json({ message: 'The user has no training yet ' });
  }
};

module.exports = getAll;
