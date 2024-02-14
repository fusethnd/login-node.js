const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));

// Dummy user data (replace with a database in a real-world scenario)
const users = [
  {
    id: 1,
    username: 'exampleUser',
    password: '$2b$10$ZnYRP7SsRWygy.rwhzU2EOc6AbY00tHXiXCeqZ3dGT9AeotXun0AC', // Hashed "password"
  },
];

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login');
};

// Middleware to display user-specific content
app.use((req, res, next) => {
  res.locals.currentUser = null;
  if (req.session && req.session.userId) {
    const user = users.find((u) => u.id === req.session.userId);
    res.locals.currentUser = user;
  }
  next();
});

// Home page
app.get('/', isAuthenticated, (req, res) => {
  res.send(`Welcome ${res.locals.currentUser.username}! <a href="/logout">Logout</a>`);
});

// Login page
app.get('/login', (req, res) => {
  res.send(`
    <form method="post" action="/login">
      <label for="username">Username:</label>
      <input type="text" name="username" required><br>
      <label for="password">Password:</label>
      <input type="password" name="password" required><br>
      <button type="submit">Login</button>
    </form>
  `);
});

// Login post request
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.userId = user.id;
    res.redirect('/');
  } else {
    res.send('Invalid username or password');
  }
});

// Logout route
app.get('/logout', isAuthenticated, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send('Error logging out');
    }
    res.redirect('/login');
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
