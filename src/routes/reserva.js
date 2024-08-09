const express =require('express');
const router =express.Router();

const reservaController=require('../controllers/reservaController');

router.get('/', reservaController.list);
//router.get('/mostrar',reservaController.list2);
router.post('/anadir',reservaController.save);
router.get('/eliminar/:id',reservaController.delete) ;
router.get('/editar/:id',reservaController.edit);
router.post('/editar/:id',reservaController.update);
router.get('/api/getLockers', reservaController.getLockers);

// Ruta para mostrar la página de login
router.get('/login', (req, res) => {
    res.render('login');
});
// Ruta para procesar el formulario de login
router.post('/login', reservaController.user);
function checkAuthentication(req, res, next) {
    if (req.session.loggedin) {
        next();
    } else {
        res.redirect('/login');
    }
}
router.get('/mostrar', checkAuthentication, reservaController.list2);


module.exports=router;