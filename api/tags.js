const express = require('express');
const tagsRouter = express.Router();
const { getAllTags, getPostsByTagName } = require('../db');

tagsRouter.use((req, res, next) => {
    console.log("A request is being made to /tags");
    next();
});
  
tagsRouter.get('/', async (req, res) => {
    const tags = await getAllTags();
  
    res.send({ tags });
  });

  tagsRouter.get("/:tagName/posts", async (req, res, next) => {
    const { tagName } = req.params;

    try {
        const allPostsWithTag = await getPostsByTagName(tagName);
        const postsWithTag = allPostsWithTag.filter(postsWithTag => {
            return postsWithTag.active || (req.user && postsWithTag.author.id === req.user.id);
        });
        res.send({postsWithTag})

    } catch ({name, message}) {
        next({name, message});
    }
})

module.exports = tagsRouter;