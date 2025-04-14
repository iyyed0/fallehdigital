// sessionStore.js
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

// MySQL connection options (match your XAMPP credentials)
const options = {
  host: 'localhost',
  port: 3306,
  user: 'root',          // Default XAMPP username
  password: '',          // Default XAMPP password (empty)
  database: 'projet_ln2', // Replace with your database name
};

const sessionStore = new MySQLStore(options);

module.exports = session({
  secret: 'your-secret-key', // Replace with a strong key
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
});