import { z } from 'zod';

export const idParamSchema = z.object({
    id: z.string().regex(/^\d+$/, 'must be a positive integer'),
});
