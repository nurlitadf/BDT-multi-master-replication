const connection = require('./conn');
const response = require('./response');

exports.forests = (req, res) => {
    connection.query('SELECT * FROM amazon', function (error, rows, fields){
        if(error){
            console.log(error)
        } else{
            response.ok(rows, res)
        }
    });
};

exports.findForests = (req, res) => {
    
    const forest_id = req.params.forest_id;

    connection.query('SELECT * FROM amazon where id = ?',
    [ forest_id ], 
    (error, rows) => {
        if(error){
            console.log(error)
        } else{
            response.ok(rows, res)
        }
    });
};

exports.createForests = (req, res) => {
    
    const year = req.body.year;
    const state = req.body.state;
    const month = req.body.month;
    const number = req.body.number;
    const date = req.body.date;

    connection.query('INSERT INTO amazon (year, state, month, number, date) values (?,?,?,?,?)',
    [ year, state, month, number, date ], 
    (error, rows, fields) => {
        if(error){
            console.log(error)
        } else{
            response.ok(rows, res)
        }
    });
};

exports.updateForests = (req, res) => {
    const year = req.body.year;
    const state = req.body.state;
    const month = req.body.month;
    const number = req.body.number;
    const date = req.body.date;

    const id = req.params.forest_id

    connection.query('UPDATE amazon SET year = ?, state = ?, month = ?, number = ?, date = ? WHERE id = ?',
    [ year, state, month, number, date, id ], 
    (error, rows, fields) => {
        if(error){
            console.log(error)
        } else{
            response.ok("Berhasil merubah forest!", res)
        }
    });
};

exports.deleteForests = (req, res) => {
    
    const forest_id = req.params.forest_id;

    connection.query('DELETE FROM amazon WHERE id = ?',
    [ forest_id ], 
    function (error, rows, fields){
        if(error){
            console.log(error)
        } else{
            response.ok("Berhasil menghapus forest!", res)
        }
    });
};

exports.index = function(req, res) {
    response.ok("Hello from the Node JS RESTful side!", res)
};