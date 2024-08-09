-- to create a new database
CREATE DATABASE reservaLocker;

-- to use database
use reservaLocker;

-- creating a new table
CREATE TABLE IF NOT EXISTS reserva (
  id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  numLocker INT(6) NOT NULL,
  nombre VARCHAR(30) NOT NULL,
  apellido VARCHAR(15),
  correo  VARCHAR(50),
  diaIni  DATE,
  numDia INT,
  diaReg DATETIME
);

-- to show all tables
show tables;

-- to describe table
describe reserva;



CREATE DATABASE reservaLocker;


ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Cafe16*DEli';
FLUSH PRIVILEGES;

select*from reserva;
ALTER TABLE reserva ADD diaFin DATE;
ALTER TABLE reserva ADD dia_PRUEBA CHAR;
ALTER TABLE reserva DROP COLUMN dia_PRUEBA;
ALTER TABLE reserva
MODIFY COLUMN diaReg DATETIME DEFAULT CURRENT_TIMESTAMP;
SELECT numLocker, diaIni, diaFin 
FROM reserva 
WHERE diaFin >= CURDATE();


CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100),
    email VARCHAR(100),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select*from usuarios;
describe usuarios;

INSERT INTO usuarios (username, password, nombre, email) 
VALUES ('User', 'PRUeb@1234$', 'Gissela', 'gissela.manrique@expertiatravel.com');


SELECT password FROM usuarios WHERE username = 'User';
