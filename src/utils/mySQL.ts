import mysql from "mysql2/promise";

export default mysql.createPool({
	host: process.env.MYSQL_HOST || "localhost",
	user: process.env.MySQL_USER,
	password: process.env.MySQL_PASSWORD,
	database: process.env.MySQL_DATABASE,
});
