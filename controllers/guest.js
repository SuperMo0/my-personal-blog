import * as queries from '../db/guest-queries.js'

export async function handleGetAllBlogs(req, res) {
    try {
        let blogs = await queries.getAllBlogs();
        res.json({ blogs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function handleGetBlog(req, res) {
    try {
        let blog = await queries.getBlog(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json({ blog });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function handleGetBlogComments(req, res) {
    try {
        let comments = await queries.getBlogComments(req.params.id);
        res.json({ comments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function handleNewComment(req, res) {
    if (!req.body.author_name || !req.body.content) {
        return res.status(400).json({ message: "Name and Content are required" });
    }

    try {
        let comment = await queries.insertNewComment(req.body, req.params.id);
        res.status(201).json({ comment });
    } catch (error) {
        console.error(error);
        if (error.code === '23503') {
            return res.status(404).json({ message: "Blog not found" });
        }
        res.status(500).json({ message: 'failure' });
    }
}

export async function handleNewLike(req, res) {
    try {
        const liked = req.body.liked;
        let result;
        if (liked == undefined) {
            return res.stats(400).json({ message: 'Bad request', });
        }
        if (liked) {
            result = await queries.addLike(req.params.id);
        }
        else {
            result = await queries.removeLike(req.params.id)
        };
        if (!result) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json({ message: 'success', likes: result.likes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'failure' });
    }
}