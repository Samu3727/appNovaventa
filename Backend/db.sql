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
imagen_producto varchar(1000),
estado tinyint default 1
);

-- Tabla de Ventas (venta por usuario)
create table Ventas (
id int primary key auto_increment,
usuario_id int,
fecha datetime default current_timestamp,
total decimal(10,2) default 0,
estado tinyint default 1,
foreign key (usuario_id) references Usuarios(id)
);

-- Tabla intermedia para relacion N:M entre Ventas y Productos
create table VentasProductos (
id int primary key auto_increment,
venta_id int,
producto_id int,
cantidad int default 1,
precio_unitario decimal(10,2) default 0,
foreign key (venta_id) references Ventas(id),
foreign key (producto_id) references Productos(id)
);
