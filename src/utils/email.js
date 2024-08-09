require('dotenv').config();
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
   host:'smtp.office365.com',
    port:587,
    secure: false,
    //secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PWD 
    },
    logger: true,
    debug: true // para habilitar logs detallados
    ,
    tls:{//Seguridad de la Capa de Transporte
        //ciphers:'SSLv3'
        rejectUnauthorized: false
    }
});


function enviarEmail(to, subject, text) {
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: to,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log('Error al enviar el correo: ', error);
        } else {
            console.log('Correo enviado con éxito: ' + info.response);
        }
    });
}
module.exports = enviarEmail;