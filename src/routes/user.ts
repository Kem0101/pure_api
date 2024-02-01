'use strict';

import express from 'express';

import UserController from '../controllers/user';
import md_auth from '../middlewares/authentication';

const api = express.Router();

// Área publica
api.post('/register', UserController.saveUser);
api.get('/confirm/:token', UserController.userConfirm);
api.post('/login', UserController.userLogin);
api.post('/forgot-password', UserController.forgotPassword);
api
  .route('/forgot-password/:token')
  .get(UserController.checkToken)
  .post(UserController.newPassword);

// Área privada
api.get('/perfil', md_auth, UserController.homeUser);

api.get('/user/:id', md_auth, UserController.getUser);
api.get('/users/:page?', md_auth, UserController.getUsers);
api.get('/counters/:id?', md_auth, UserController.getCounters);
api.put('/update-user/:id', md_auth, UserController.updateUser);

export default api;
