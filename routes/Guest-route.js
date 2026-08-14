import { Router } from "express";
import * as controller from './../controllers/guest.js'
import express from 'express'


let router = Router();

router.get('/', controller.handleGetAllBlogs);

router.get('/:id', controller.handleGetBlog);

router.get('/:id/comments', controller.handleGetBlogComments);

router.post('/:id', express.json(), controller.handleNewComment);

router.post('/:id/like', express.json(), controller.handleNewLike);

export default router 