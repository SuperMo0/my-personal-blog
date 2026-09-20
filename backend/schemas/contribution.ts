import { z } from 'zod';

export const newContributionBodySchema = z.object({
    project: z.string().trim().min(1, 'Project, title, and url are required'),
    title: z.string().trim().min(1, 'Project, title, and url are required'),
    url: z.string().trim().min(1, 'Project, title, and url are required'),
    description: z.string().trim().min(1).optional(),
    contributed_at: z.string().trim().min(1).optional(),
    position: z.number().int().optional(),
});

export const updateContributionBodySchema = newContributionBodySchema.partial();
