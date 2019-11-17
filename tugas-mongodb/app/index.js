const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

const apiRoutes = require("./api-routes");

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

mongoose.connect('mongodb://mongo-admin:password@192.168.2.4:27017/forestfire?retryWrites=false&authSource=admin', { useNewUrlParser: true });
const db = mongoose.connection;

if(!db)
    console.log("Error connecting db")
else
    console.log("Db connected successfully")

const port = 8080;

app.get('/', (req, res) => res.send('Hello World with Express'));

app.use('/api', apiRoutes);

app.listen(port, () => {
    console.log("Running RestHub on port " + port);
});