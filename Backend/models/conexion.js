const mysql = require('mysql2/promise');

let pool;

if (process.env.MYSQL_URL) {

    //Conexion a Railway.

    pool = mysql.createPool(process.env.MYSQL_URL);
} else {

    //Conexion de modo local a la base de datos.

    pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'SAOanime37*',
        database: process.env.DB_NAME || 'Novaventa',
        port: process.env.DB_PORT || 3306,
    });
}

module.exports = pool;