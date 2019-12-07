const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const apiRoutes = require("./api-routes");

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

const port = 8080;

app.get('/', (req, res) => res.send('Hello World with Express'));

app.use('/api', apiRoutes);

app.listen(port, () => {
    console.log("Running RestHub on port " + port);
});