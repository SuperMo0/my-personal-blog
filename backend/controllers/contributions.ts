import type { Request, Response } from 'express';
import type { IdRequest } from '../express.d.ts';
import * as contributionService from '../services/contributionService.ts';

export async function handleGetAllContributions(_req: Request, res: Response): Promise<void> {
    const contributions = await contributionService.listContributions();
    res.json({ contributions });
}

export async function handleNewContribution(req: Request, res: Response): Promise<void> {
    const contribution = await contributionService.createContribution(req.body);
    res.status(201).json({ contribution });
}

export async function handleUpdateContribution(req: IdRequest, res: Response): Promise<void> {
    const contribution = await contributionService.updateContribution(req.params.id, req.body);
    res.json({ contribution });
}

export async function handleDeleteContribution(req: IdRequest, res: Response): Promise<void> {
    await contributionService.deleteContribution(req.params.id);
    res.json({ message: 'success' });
}
