Forest = require('./forestModel');

exports.index = (req, res) => {
    Forest.get((err, forest) => {
        if (err) {
            res.json({
                status: "error",
                message: err,
            });
        }
        
        res.json({
            status: "success",
            message: "Forest retrieved successfully",
            count: forest.length,
            data: forest
        });
    });
};

exports.new = (req, res) => {
    var forest = new Forest();
    forest.year = req.body.year;
    forest.state = req.body.state;
    forest.month = req.body.month;
    forest.number = req.body.number;
    forest.date = req.body.date;
// save the forest and check for errors
    forest.save((err) => {
        if (err)
            res.json(err);
        res.json({
            message: 'New forest created!',
            data: forest
        });
    });
};
// Handle view forest info
exports.view = (req, res) => {
    Forest.findById(req.params.forest_id, function (err, forest) {
        if (err)
            res.send(err);
        res.json({
            message: 'Forest details loading..',
            data: forest
        });
    });
};
// Handle update forest info
exports.update = (req, res) => {
    Forest.findById(req.params.forest_id, function (err, forest) {
        if (err)
            res.send(err);
        forest.year = req.body.year;
        forest.state = req.body.state;
        forest.month = req.body.month;
        forest.number = req.body.number;
        forest.date = req.body.date;
// save the forest and check for errors
        forest.save((err) => {
            if (err)
                res.json(err);
            res.json({
                message: 'Forest Info updated',
                data: forest
            });
        });
    });
};
// Handle delete forest
exports.delete = (req, res) => {
    Forest.remove({
        _id: req.params.forest_id
    }, (err, forest) => {
        if (err)
            res.send(err);
        res.json({
            status: "success",
            message: 'Forest deleted'
        });
    });
};

exports.countYear = (req, res) => {
    Forest.count({year: req.params.year}, (err, forest) => {
        if (err) {
            res.json({
                status: "error",
                message: err,
            });
        }
        res.json({
            status: "success",
            message: "Year counted successfully",
            data: forest
        });
    })
}

exports.distinctState = (req, res) => {
    Forest.distinct("state", (err, forest) => {
        if (err) {
            res.json({
                status: "error",
                message: err,
            });
        }
        res.json({
            status: "success",
            message: "Distinct state retrieved successfully",
            data: forest
        });
    })
}