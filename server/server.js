require('./config/config');


const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const colors = require('colors');

const app = express();

const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json());

//Habilitar la carpeta públic.
app.use(express.static( path.resolve( __dirname , '../public') ));

//Configuración global de rutas.
app.use ( require('./routes/index') );


mongoose.connect(process.env.URL_DB,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    }, (err, res) => {
    if(err) throw new Error(err);
    console.log('Base de datos ONLINE'.green);
});



app.listen(process.env.PORT, ()=>{
    console.log('Escuchando el puerto', process.env.PORT);
});