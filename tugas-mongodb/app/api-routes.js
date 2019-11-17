const router = require('express').Router();

router.get('/', (req, res) => {
    res.json({
        status: 'API Its Working',
        message: 'Welcome!',
    });
});

const forestController = require('./forestController');

router.route('/forests')
    .get(forestController.index)
    .post(forestController.new);
router.route('/forests/:forest_id')
    .get(forestController.view)
    .patch(forestController.update)
    .put(forestController.update)
    .delete(forestController.delete);
router.route('/count/:year')
    .get(forestController.countYear);
router.route('/state-distinct')
    .get(forestController.distinctState);

module.exports = router;