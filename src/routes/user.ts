'use strict';

import express from 'express';
// import multer from 'multer';
import UserController from '../controllers/user';
import md_auth from '../middlewares/authentication';

// const multipart = require('connect-multiparty');
// const md_upload = multipart({ uploadDir: './uploads/users' });

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

// api.get('/user/:id', md_auth, UserController.getUser);
// api.get('/users/:page?', md_auth, UserController.getUsers);
// api.get('/counters/:id?', md_auth, UserController.getCounters);
// api.put('/update-user/:id', md_auth, UserController.updateUser);

// api.post('/upload-image/:id', md_auth, UserController.uploadImage);
// api.get('/get-image/:imageFile', md_auth, UserController.getImageFile);

export default api;
