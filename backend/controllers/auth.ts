import type { Request, Response } from 'express';
import * as authService from '../services/authService.ts';

export async function authenticateAdmin(req: Request, res: Response): Promise<void> {
    const token = await authService.authenticateAdmin(req.body.email, req.body.password);
    res.json({ token });
}

export async function authenticateDemo(_req: Request, res: Response): Promise<void> {
    const token = await authService.authenticateDemo();
    res.json({ token });
}
