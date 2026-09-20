import { z } from 'zod';

export const loginBodySchema = z.object({
    email: z.string().trim().min(1, 'Email and Password are required'),
    password: z.string().min(1, 'Email and Password are required'),
});
