const express = require('express');
const usersRouter = express.Router();
const { getAllUsers, getUserByUsername, createUser, updateUser, getUserById } = require('../db');
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const requireUser = require('./utils')

usersRouter.use((req, res, next) => {
    console.log("A request is being made to /users");
    next();
});
  
usersRouter.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  // request must have both
  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password"
    });
  }

  try {
    const user = await getUserByUsername(username);
    const token = jwt.sign({
      id: user.id,
      username }, JWT_SECRET, {
          expiresIn: "1w"
  });

    if (user && user.password === password) {
      res.send({
      message: "Logged in!",
      token: token
      })
    } else {
      next({ 
        name: 'IncorrectCredentialsError', 
        message: 'Username or password is incorrect'
      });
    }
  } catch(error) {
    console.log(error);
    next(error);
  }
});

usersRouter.post('/register', async (req, res, next) => {
  const { username, password, name, location } = req.body;

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      next({
        name: 'UserExistsError',
        message: 'A user by that username already exists'
      });
    }

    const user = await createUser({
      username,
      password,
      name,
      location,
    });

    const token = jwt.sign({ 
      id: user.id, 
      username
    }, process.env.JWT_SECRET, {
      expiresIn: '1w'
    });

    res.send({ 
      message: "thank you for signing up",
      token 
    });
  } catch ({ name, message }) {
    next({ name, message })
  } 
});

usersRouter.get('/', async (req, res) => {
  try {
    const allUsers = await getAllUsers();
    const users = allUsers.filter(user => {
        return user.active || (req.user && user.id === req.user.id);
    })
    res.send({ users });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.delete("/:userId", requireUser, async (req, res, next) => {
  try {
      const user = await getUserById(req.params.userId);

      if (user && user.id === req.user.id) {
          const deletedUser = await updateUser(user.id, {active: false});
          res.send({user: deletedUser});
      } else {
          next(user ? {
              name: "Unathorized User",
              message: "You cannot delete another user"
          } : {
              name: "User Not Found",
              message: "That account does not exist"
          });
      }
  } catch ({name, message}) {
      next({name, message});
  }
});

module.exports = usersRouter;