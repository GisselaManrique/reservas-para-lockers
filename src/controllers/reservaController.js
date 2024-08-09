const controller = {};

controller.list = (req, res) => {
    req.getConnection((err, conn) => {
        if (err) {
            console.log("Error de conexión:", err);
            return res.json(err);
        }
        conn.query('SELECT * FROM reserva', (err, reservas) => {
            if (err) {
                console.log("Error SQL:", err);
                return res.json(err);
            }
            res.render('reserva.ejs', { 
                data: reservas }); // Aquí se pasa 'reservas' a la vista correctamente
        });
    });
};

controller.delete= (req,res)=>{
    const {id}=req.params;
    req.getConnection((err,conn) =>{
      conn.query('DELETE FROM reserva WHERE id= ?',[id],(err,rows)=>{
         res.redirect('/mostrar');
      }
    );
    })

};

controller.edit=(req,res)=>{
const {id}=req.params;
req.getConnection((err,conn)=>{
    conn.query('SELECT*FROM reserva WHERE id= ?',[id],(err,reservas)=>{
        res.render('editarReserva.ejs',{
            data: reservas[0]
        })
    })
})
};
///ACA HAY OTRA FNCION PREUBA UPDATE

controller.update = (req, res) => {
    const { id } = req.params;
    const newReserva = req.body;

    // Calcular la nueva fecha de finalización
    const fechaInicio = new Date(newReserva.diaIni);
    const numDias = parseInt(newReserva.numDia);
    fechaInicio.setDate(fechaInicio.getDate() + numDias-1);
    newReserva.diaFin = fechaInicio.toISOString().slice(0, 10); // Asegúrate de que el nombre de campo en la base de datos es diaFin

    req.getConnection((err, conn) => {
        if (err) {
            console.log("Error de conexión:", err);
            return res.status(500).json(err);
        }
        conn.query('UPDATE reserva SET ? WHERE id=?', [newReserva, id], (err, rows) => {
            if (err) {
                console.log("Error SQL:", err);
                return res.status(500).json(err);
            }
            res.redirect('/mostrar');
        });
    });
};

controller.getLockers = (req, res) => {
    const selectedDate = req.query.date; // Obtener la fecha del parámetro de la consulta

    req.getConnection((err, conn) => {
        if (err) {
            console.error("Error de conexión:", err);
            res.status(500).json({ message: 'Error conectando a la base de datos', error: err });
            return;
        }

        // Ajustar la consulta para considerar la fecha seleccionada
        const query = `
            SELECT numLocker, diaIni, diaFin 
            FROM reserva 
            WHERE ? BETWEEN diaIni AND diaFin
        `;

        conn.query(query, [selectedDate], (err, results) => {
            if (err) {
                console.error("Error en la consulta SQL:", err);
                res.status(500).json({ message: 'Error ejecutando la consulta SQL', error: err });
                return;
            }
            
            // Suponiendo que los casilleros son del 1 al 72, puedes comprobar cada uno
            const lockers = [];
            for (let i = 1; i <= 72; i++) {
                const encontrar = results.find(locker => locker.numLocker === i);
                if (encontrar) {
                    lockers.push({
                        numLocker: i,
                        isReserved: true,
                        diaIni: encontrar.diaIni,
                        diaFin: encontrar.diaFin
                    });
                } else {
                    lockers.push({
                        numLocker: i,
                        isReserved: false,
                        diaIni: null,
                        diaFin: null
                    });
                }
            }
           res.json(lockers);

        });
    });
};

controller.list2 = (req, res) => {
    const { page = 1, limit = 100 } = req.query;
    let { fechaInicio, fechaFin } = req.query;

    const offset = (page - 1) * limit;

    req.getConnection((err, conn) => {
        if (err) {
            console.log("Error de conexión:", err);
            return res.status(500).json(err);
        }

        let query = 'SELECT * FROM reserva';
        let countQuery = 'SELECT COUNT(*) AS count FROM reserva';
        let parameters = [];

        // Aplicar filtro de fechas solo si ambas fechas están presentes
        if (fechaInicio && fechaFin) {
            let adjustedFechaFin = new Date(fechaFin);
            adjustedFechaFin.setDate(adjustedFechaFin.getDate() + 1);
            adjustedFechaFin = adjustedFechaFin.toISOString().split('T')[0];

            query += ' WHERE diaReg BETWEEN ? AND ?';
            countQuery += ' WHERE diaReg BETWEEN ? AND ?';
            parameters = [fechaInicio, adjustedFechaFin];
        }

        query += ' LIMIT ? OFFSET ?';
        parameters.push(parseInt(limit), offset);

        // Primero contar los registros totales
        conn.query(countQuery, parameters.slice(0, -2), (err, countResult) => {
            if (err) {
                console.log("Error SQL:", err);
                return res.json(err);
            }
            const totalRecords = countResult[0].count;

            // Luego obtener los resultados paginados
            conn.query(query, parameters, (err, reservas) => {
                if (err) {
                    console.log("Error SQL:", err);
                    return res.json(err);
                }
                res.render('mostrarReserva.ejs', {
                    data: reservas,
                    totalRecords,
                    totalPages: Math.ceil(totalRecords / limit),
                    currentPage: parseInt(page),
                    fechaInicio: fechaInicio || '',  // Enviar fechas vacías si no están definidas
                    fechaFin: fechaFin || ''
                });
            });
        });
    });
};

controller.user =(req, res) => {
    const { username, password } = req.body;

    // Aquí deberías implementar la lógica para verificar las credenciales en la base de datos
    if (username === "admin" && password === "@dmin") {  
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect('/mostrar');
    } else {
        res.render('validarLogin', { mensaje: 'El nombre de usuario o la contraseña son incorrectos.' });

    }
};

///agregar la parte de prueba para correo
const enviarEmail = require('../utils/email'); // Asegúrate de usar la ruta correcta
const { obtenerSemana } = require('../utils/semana');
/*
controller.save = (req, res) => {
    const data = req.body;
    const userEmail = data.correo;
    const semana = obtenerSemana(new Date()); // Obtiene el inicio y fin de la semana actual

    const diaIni = new Date(data.diaIni); // Fecha de inicio
    const numDia = parseInt(data.numDia); // Número de días a añadir

    // Calcular fecha fin
    const diaFin = new Date(diaIni);
    diaFin.setDate(diaIni.getDate() + numDia - 1); // Configura 'diaFin' basado en 'diaIni' y 'numDia'
    data.diaFin = diaFin.toISOString().slice(0, 10);

    req.getConnection((err, conn) => {
        if (err) {
            console.error("Error de conexión:", err);
            return res.status(500).json(err);
        }

        const queryCheck = `
    SELECT * FROM reserva 
    WHERE (correo = ? AND diaIni >= ? AND diaIni <= ?)
    OR (numLocker = ? AND ((? BETWEEN diaIni AND diaFin) OR (? BETWEEN diaIni AND diaFin) OR (diaIni BETWEEN ? AND ?)))
    LIMIT 1;
`;

conn.query(queryCheck, [userEmail, semana.start, semana.end, data.numLocker, data.diaIni, data.diaFin, data.diaIni, data.diaFin], (err, results) => {
    if (err) {
        console.error("Error SQL:", err);
        return res.status(500).json({ message: "Error en la base de datos", error: err });
    }
    if (results.length > 0) {
        // Lógica para determinar el tipo de error basado en los resultados
        console.log("Hay un conflicto encontrado.");
        res.render('confirmacion', { mensaje: 'No se puede realizar la reserva. Ya existe una reserva en los dias seleccionados o ya registro con su usuario esta semana.', tipo: 'danger' });
    } else {
        console.log("No se encontraron conflictos!!");
        const insertQuery = 'INSERT INTO reserva SET ?';
        conn.query(insertQuery, [data], (err) => {
            if (err) {
                console.error("Error SQL al insertar:", err);
                return res.status(500).json({ message: "Error al insertar reserva", error: err });
            }
            enviarEmail(userEmail, 
                'Confirmación de Reserva de lockers',
                 `
Hola,  ${data.nombre} ${data.apellido}
Su reserva para el locker número ${data.numLocker} para ${data.numDia} dias ha sido confirmada.
Fecha de Inicio: ${data.diaIni}
Fecha de Fin: ${data.diaFin}


Este correo es para notificación por favor no responder a este correo.Cualquier consulta contactarse al siguiente correo reservatulocker@expertiatravel.com.

Por favor, al culminar la reservar colocar la llave en el locker correspondiente para evitar incovenientes.
                  `); 

            res.render('confirmacion', { mensaje: 'Reserva realizada con éxito!', tipo: 'success' });
        });
    }
});
    });
};*/

/*
controller.save = (req, res) => {
    const data = req.body;
    const userEmail = data.correo;
    const semana = obtenerSemana(new Date());

    const diaIni = new Date(data.diaIni);
    const numDia = parseInt(data.numDia);
    const diaFin = new Date(diaIni);
    diaFin.setDate(diaIni.getDate() + numDia - 1);
    data.diaFin = diaFin.toISOString().slice(0, 10);

    req.getConnection((err, conn) => {
        if (err) {
            console.error("Error de conexión:", err);
            return res.status(500).json(err);
        }

        conn.beginTransaction(err => {
            if (err) {
                console.error("Error iniciando la transacción:", err);
                return res.status(500).json({ message: "Error iniciando la transacción", error: err });
            }

            const queryCheck = `
                SELECT * FROM reserva 
                WHERE (correo = ? AND diaIni >= ? AND diaIni <= ?)
                OR (numLocker = ? AND ((? BETWEEN diaIni AND diaFin) OR (? BETWEEN diaIni AND diaFin) OR (diaIni BETWEEN ? AND ?)))
                LIMIT 1;
            `;

            conn.query(queryCheck, [userEmail, semana.start, semana.end, data.numLocker, data.diaIni, data.diaFin, data.diaIni, data.diaFin], (err, results) => {
                if (err) {
                    console.error("Error SQL:", err);
                    return conn.rollback(() => {
                        res.status(500).json({ message: "Error en la base de datos", error: err });
                    });
                }

                if (results.length > 0) {
                    console.log("Hay un conflicto encontrado.");
                    return conn.rollback(() => {
                        res.render('confirmacion',
                             { mensaje: 
                                'No se puede realizar la reserva. Ya existe una reserva en los días seleccionados o ya registró con su usuario esta semana.', tipo: 'danger' });
                    });
                } else {
                    console.log("No se encontraron conflictos.");
                    const insertQuery = 'INSERT INTO reserva SET ?';
                    conn.query(insertQuery, [data], (err) => {
                        if (err) {
                            console.error("Error SQL al insertar:", err);
                            return conn.rollback(() => {
                                res.status(500).json({ message: "Error al insertar reserva", error: err });
                            });
                        }

                        enviarEmail(userEmail, 
                            'Confirmación de Reserva de lockers',
                             `
Hola,  ${data.nombre} ${data.apellido}
Su reserva para el locker número ${data.numLocker} para ${data.numDia} dias ha sido confirmada.
Fecha de Inicio: ${data.diaIni}
Fecha de Fin: ${data.diaFin}
            
            
Este correo es para notificación, por favor no responder a este correo.Cualquier consulta contactarse al siguiente correo reservatulocker@expertiatravel.com.
            
Por favor, al culminar la reservar colocar la llave en el locker correspondiente para evitar incovenientes.
                              `); 

                        conn.commit(err => {
                            if (err) {
                                console.error("Error al hacer commit:", err);
                                return conn.rollback(() => {
                                    res.status(500).json({ message: "Error al hacer commit", error: err });
                                });
                            }
                            res.render('confirmacion', { mensaje: 'Reserva realizada con éxito!', tipo: 'success' });
                        });
                    });
                }
            });
        });
    });
};*/

controller.save = (req, res) => {
    const data = req.body;
    const userEmail = data.correo;
    const semana = obtenerSemana(new Date());

    const diaIni = new Date(data.diaIni);
    const numDia = parseInt(data.numDia);
    const diaFin = new Date(diaIni);
    diaFin.setDate(diaIni.getDate() + numDia - 1);
    data.diaFin = diaFin.toISOString().slice(0, 10);

    // Validación para no permitir reservas en días anteriores
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Establece la hora a 00:00:00 para comparar solo la fecha

    if (diaIni < hoy) {
        return res.render('confirmacion', { mensaje: 'No se pueden hacer reservas para días anteriores.', tipo: 'danger' });
    }

    req.getConnection((err, conn) => {
        if (err) {
            console.error("Error de conexión:", err);
            return res.status(500).json(err);
        }

        conn.beginTransaction(err => {
            if (err) {
                console.error("Error iniciando la transacción:", err);
                return res.status(500).json({ message: "Error iniciando la transacción", error: err });
            }

            const queryCheck = `
                SELECT * FROM reserva 
                WHERE (correo = ? AND diaIni >= ? AND diaIni <= ?)
                OR (numLocker = ? AND ((? BETWEEN diaIni AND diaFin) OR (? BETWEEN diaIni AND diaFin) OR (diaIni BETWEEN ? AND ?)))
                LIMIT 1;
            `;

            conn.query(queryCheck, [userEmail, semana.start, semana.end, data.numLocker, data.diaIni, data.diaFin, data.diaIni, data.diaFin], (err, results) => {
                if (err) {
                    console.error("Error SQL:", err);
                    return conn.rollback(() => {
                        res.status(500).json({ message: "Error en la base de datos", error: err });
                    });
                }

                if (results.length > 0) {
                    console.log("Hay un conflicto encontrado.");
                    return conn.rollback(() => {
                        res.render('confirmacion', { mensaje: 'No se puede realizar la reserva. Ya existe una reserva en los días seleccionados o ya registró con su usuario esta semana.', tipo: 'danger' });
                    });
                } else {
                    console.log("No se encontraron conflictos.");
                    const insertQuery = 'INSERT INTO reserva SET ?';
                    conn.query(insertQuery, [data], (err) => {
                        if (err) {
                            console.error("Error SQL al insertar:", err);
                            return conn.rollback(() => {
                                res.status(500).json({ message: "Error al insertar reserva", error: err });
                            });
                        }

                        enviarEmail(userEmail, 
                            'Confirmación de Reserva de lockers',
                             `
Hola,  ${data.nombre} ${data.apellido}
Su reserva para el locker número ${data.numLocker} para ${data.numDia} dias ha sido confirmada.
Fecha de Inicio: ${data.diaIni}
Fecha de Fin: ${data.diaFin}
            
Este correo es para notificación, por favor no responder a este correo.Cualquier consulta contactarse al siguiente correo reservatulocker@expertiatravel.com.
            
Por favor, al culminar la reservar colocar la llave en el locker correspondiente para evitar incovenientes.
                              `); 

                        conn.commit(err => {
                            if (err) {
                                console.error("Error al hacer commit:", err);
                                return conn.rollback(() => {
                                    res.status(500).json({ message: "Error al hacer commit", error: err });
                                });
                            }
                            res.render('confirmacion', { mensaje: 'Reserva realizada con éxito!', tipo: 'success' });
                        });
                    });
                }
            });
        });
    });
};

module.exports = controller;
