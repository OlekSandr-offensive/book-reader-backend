const express = require('express');

const ctrl = require('../../controllers/training');

const { ctrlWrapper } = require('../../helpers');

const {
  authenticate,
  validationBody,
  isValidId,
} = require('../../middlewares');

const { schemasTraining } = require('../../models/training');

const router = express.Router();

router.get('/', authenticate, ctrlWrapper(ctrl.getAll));

router.post('/', authenticate, ctrlWrapper(ctrl.create));

router.patch(
  '/:id/statistic',
  authenticate,
  isValidId,
  ctrlWrapper(ctrl.statistic),
);

router.post(
  '/:id/complete',
  authenticate,
  isValidId,
  validationBody(schemasTraining.statisticTrainingSchema),
  ctrlWrapper(ctrl.completeTraining),
);

module.exports = router;
