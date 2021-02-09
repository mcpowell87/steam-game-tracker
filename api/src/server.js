const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();

app.use(bodyParser.json());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

//db stuff goes here

app.use('/api', routes)

const PORT = process.env.PORT || 30000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});