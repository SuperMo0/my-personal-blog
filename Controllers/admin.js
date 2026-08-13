import * as queries from './../db/admin-queries.js'

export function handleSucessLogin(req, res) {
    res.status(200).json({ message: "success" });
}

export async function handleGetAllBlogs(req, res) {
    try {
        let blogs = await queries.getAllBlogs(req.user);
        res.json({ blogs });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function handleGetBlog(req, res) {
    try {
        let blog = await queries.getBlog(req.params.id, req.user);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        res.json({ blog });
    } catch (error) {
        console.error("Error fetching blog:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function handleGetBlogComments(req, res) {
    try {
        let comments = await queries.getAllBlogComments(req.params.id, req.user);
        res.json({ comments });
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function handleNewBlog(req, res) {
    if (!req.body.title || !req.body.content) {
        return res.status(400).json({ message: "Title and Content are required" });
    }

    try {
        await queries.insertBlog(req.body, req.user.id);
        res.status(201).json({ message: "success" });
    } catch (error) {
        console.error("Error creating blog:", error);
        res.status(500).json({ message: "Failed to create blog" });
    }
}

export async function handleUpdateBlog(req, res) {
    try {
        const updated = await queries.updateBlog(req.params.id, req.body);

        if (!updated) {
            return res.status(404).json({ message: "Blog not found or no changes made" });
        }
        res.json({ message: "success" });

    } catch (error) {
        console.error("Error updating blog:", error);
        res.status(500).json({ message: "Failed to update blog" });
    }
}

export async function handleDeleteBlog(req, res) {
    try {
        const deleted = await queries.deleteBlog(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: "Blog not found" });
        }
        res.json({ message: "success" });
    } catch (error) {
        console.error("Error deleting blog:", error);
        if (error.code === '23503') {
            return res.status(409).json({ message: "Cannot delete blog because it has related data" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}
