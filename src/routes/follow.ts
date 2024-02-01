'use strict';

import express from 'express';
import followController from '../controllers/follow';
import md_auth from '../middlewares/authentication';

const api = express.Router();

api.post('/follow', md_auth, followController.saveFollow);
api.delete('/follow/:id', md_auth, followController.deleteFollow);
api.get('/following/:id?/:page?', md_auth, followController.getFollowingUser);
api.get('/followed/:id?/:page?', md_auth, followController.getFollowedUsers);
api.get('/get-my-follows/:followed?', md_auth, followController.getMyFollows);

export default api;
