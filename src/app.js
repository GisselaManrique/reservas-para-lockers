require('dotenv').config(); 

const express=require('express');
const path =require('path');
const morgan=require('morgan');

const mysql=require('mysql');
const myConnection=require('express-myconnection');
//esto agrega ahora 
const session = require('express-session');

const app=express();
//esto añadi el 06-08
app.use(express.urlencoded({ extended: true }));
// Configuración de session
app.use(session({
    secret: 'tu_secreto_aqui',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }  // `secure: true` sólo en HTTPS

}));

//imprtar 
const reservaRoutes=require('./routes/reserva');
app.set('port',process.env.PORT || 3001);

app.set('view engine','ejs');
//la ruta del archivo q lo ejecuta y se concaten con el views
//app.set('views',path.join(__dirname,'..','views'));//multiplataforma
app.set('views', path.join(__dirname,'views'));
//app.set('views', 'C:\sistema_reservas\src\views\reserva.ejs');


//middlewares
//antes de las peticiones de los usuarios-registrar las peticiones
app.use(morgan('dev'));
app.use(myConnection(mysql,{
    host:'localhost',
    user:'root',
    password:'Cafe16*DEli',
    port:3306,
    database:'reservaLocker'
 
},'single'));
app.use(express.urlencoded({
    extended:false
}));
//routes
app.use('/',reservaRoutes);
//static files

app.use(express.static(path.join(__dirname,'public')));

//starting
app.listen(app.get('port'),()=>{
    console.log('Servidor en puerto 3000', app.get('port'));

});