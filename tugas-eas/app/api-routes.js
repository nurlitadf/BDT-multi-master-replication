const router = require('express').Router();

router.get('/', (req, res) => {
    res.json({
        status: 'API Its Working',
        message: 'Welcome!',
    });
});

const forestController = require('./forestController');

router.route('/forests')
    .get(forestController.forests)
    .post(forestController.createForests);
router.route('/forests/:forest_id')
    .get(forestController.findForests)
    .patch(forestController.updateForests)
    .delete(forestController.deleteForests);
// router.route('/count/:year')
//     .get(forestController.countYear);
// router.route('/state-distinct')
//     .get(forestController.distinctState);

module.exports = router;