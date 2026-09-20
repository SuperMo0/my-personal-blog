import type { ContributionUpdateInput, NewContributionInput } from '../db/contribution-queries.ts';
import * as queries from '../db/contribution-queries.ts';
import { NotFoundError } from '../errors.ts';
import type { ContributionRow } from '../types.ts';

export async function listContributions(): Promise<ContributionRow[]> {
    return queries.getAllContributions();
}

export async function createContribution(contribution: NewContributionInput): Promise<ContributionRow> {
    return queries.insertContribution(contribution);
}

export async function updateContribution(id: string, contribution: ContributionUpdateInput): Promise<ContributionRow> {
    const updated = await queries.updateContribution(id, contribution);
    if (!updated) {
        throw new NotFoundError('Contribution not found or no changes made');
    }
    return updated;
}

export async function deleteContribution(id: string): Promise<void> {
    const deleted = await queries.deleteContribution(id);
    if (!deleted) {
        throw new NotFoundError('Contribution not found');
    }
}
