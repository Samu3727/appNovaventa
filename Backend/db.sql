create database Novaventa;

use Novaventa;

create table Usuarios (
id int primary key auto_increment,
nombres varchar(100),
apellidos varchar(255),
correo varchar(255),
contrasena varchar(1000),
venta_final int, 
estado tinyint default 1
);

create table Productos (
id int primary key auto_increment,
nombre_producto varchar(255),
codigo_producto varchar(6),
precio_producto int,
estado tinyint default 1
);

insert into Usuarios (nombres, apellidos, correo, contrasena) values ('Eliana','Esquivel', 'Admin@admin.com', 'Admin123');
