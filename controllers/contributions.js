import * as queries from '../db/contribution-queries.js';

export async function handleGetAllContributions(_req, res) {
    try {
        const contributions = await queries.getAllContributions();
        res.json({ contributions });
    } catch (error) {
        console.error('Error fetching open source contributions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function handleNewContribution(req, res) {
    if (!req.body.project || !req.body.title || !req.body.url) {
        return res.status(400).json({ message: 'Project, title, and url are required' });
    }

    try {
        const contribution = await queries.insertContribution(req.body);
        res.status(201).json({ contribution });
    } catch (error) {
        console.error('Error creating contribution:', error);
        res.status(500).json({ message: 'Failed to create contribution' });
    }
}

export async function handleUpdateContribution(req, res) {
    try {
        const updated = await queries.updateContribution(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ message: 'Contribution not found or no changes made' });
        }
        res.json({ contribution: updated });
    } catch (error) {
        console.error('Error updating contribution:', error);
        res.status(500).json({ message: 'Failed to update contribution' });
    }
}

export async function handleDeleteContribution(req, res) {
    try {
        const deleted = await queries.deleteContribution(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Contribution not found' });
        }
        res.json({ message: 'success' });
    } catch (error) {
        console.error('Error deleting contribution:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
