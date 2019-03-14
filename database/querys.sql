-- para crear la base de datos
CREATE DATABASE ukuxblog;

-- crear tablas
CREATE TABLE usuario (
    username varchar(15),
    password varchar(100),
    nombre varchar(20),
    token varchar(50),
    primary key(username)
);

CREATE TABLE articulo (
    id int auto_increment,
    titulo varchar(50) not null,
    contenido text not null,
    fecha date not null,
    autor varchar(20) not null,
    primary key(id)
    -- imagen
);

