import { type FormEvent, useEffect, useState } from 'react';
import { GoPencil, GoPlus, GoTrash } from 'react-icons/go';
import api from '../../utils/Api';

interface Contribution {
    id: number;
    project: string;
    title: string;
    url: string;
    description: string | null;
    contributed_at: string | null;
}

interface FormState {
    project: string;
    title: string;
    url: string;
    description: string;
    contributed_at: string;
}

const EMPTY_FORM: FormState = { project: '', title: '', url: '', description: '', contributed_at: '' };

function ContributionForm({
    initial,
    onCancel,
    onSubmit,
}: {
    initial: FormState;
    onCancel: () => void;
    onSubmit: (form: FormState) => Promise<void>;
}) {
    const [form, setForm] = useState<FormState>(initial);
    const [saving, setSaving] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setSaving(true);
        try {
            await onSubmit(form);
        } finally {
            setSaving(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-3 border border-(--border-color) rounded-lg p-4 sm:grid-cols-2"
        >
            <label className="block">
                <span className="text-xs font-semibold text-(--text-secondary)">Project (owner/repo)</span>
                <input
                    required
                    value={form.project}
                    onChange={(e) => setForm({ ...form, project: e.target.value })}
                    placeholder="nodejs/node"
                    className="input-field mt-1"
                />
            </label>
            <label className="block">
                <span className="text-xs font-semibold text-(--text-secondary)">PR title</span>
                <input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input-field mt-1"
                />
            </label>
            <label className="block sm:col-span-2">
                <span className="text-xs font-semibold text-(--text-secondary)">PR URL</span>
                <input
                    required
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://github.com/..."
                    className="input-field mt-1"
                />
            </label>
            <label className="block sm:col-span-2">
                <span className="text-xs font-semibold text-(--text-secondary)">Description (optional)</span>
                <input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input-field mt-1"
                />
            </label>
            <label className="block">
                <span className="text-xs font-semibold text-(--text-secondary)">Date (optional)</span>
                <input
                    type="date"
                    value={form.contributed_at}
                    onChange={(e) => setForm({ ...form, contributed_at: e.target.value })}
                    className="input-field mt-1"
                />
            </label>
            <div className="flex items-end gap-2 sm:col-span-2">
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
                    {saving ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={onCancel} className="btn-ghost">
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default function ContributionsManager({ readOnly }: { readOnly: boolean }) {
    const [contributions, setContributions] = useState<Contribution[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const [result, ok] = await api<{ contributions: Contribution[] }>('/admin/contributions');
                if (ok) setContributions(result.contributions || []);
            } catch {
                console.error('Failed to load contributions');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    async function handleCreate(form: FormState) {
        const [result, ok] = await api<{ contribution: Contribution }>('/admin/contributions', {
            method: 'post',
            body: JSON.stringify({
                project: form.project,
                title: form.title,
                url: form.url,
                description: form.description || null,
                contributed_at: form.contributed_at || null,
            }),
        });
        if (ok) {
            setContributions((prev) => [...prev, result.contribution]);
            setAdding(false);
        }
    }

    async function handleUpdate(id: number, form: FormState) {
        const [result, ok] = await api<{ contribution: Contribution }>(`/admin/contributions/${id}`, {
            method: 'put',
            body: JSON.stringify({
                project: form.project,
                title: form.title,
                url: form.url,
                description: form.description || null,
                contributed_at: form.contributed_at || null,
            }),
        });
        if (ok) {
            setContributions((prev) => prev.map((c) => (c.id === id ? result.contribution : c)));
            setEditingId(null);
        }
    }

    async function handleDelete(id: number) {
        if (!window.confirm('Delete this contribution?')) return;
        const [, ok] = await api(`/admin/contributions/${id}`, { method: 'delete' });
        if (ok) setContributions((prev) => prev.filter((c) => c.id !== id));
    }

    if (loading) return null;

    return (
        <div className="mt-14">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Open Source Contributions</h2>
                {!readOnly && !adding && (
                    <button
                        type="button"
                        onClick={() => setAdding(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <GoPlus /> Add
                    </button>
                )}
            </div>

            {adding && (
                <div className="mb-6">
                    <ContributionForm initial={EMPTY_FORM} onCancel={() => setAdding(false)} onSubmit={handleCreate} />
                </div>
            )}

            <div className="bg-(--bg-card) shadow-md rounded-xl overflow-hidden border border-(--border-color) divide-y divide-(--border-color)">
                {contributions.length === 0 ? (
                    <p className="px-6 py-8 text-center text-(--text-secondary)">No contributions yet.</p>
                ) : (
                    contributions.map((contribution) => (
                        <div key={contribution.id} className="px-6 py-4">
                            {editingId === contribution.id ? (
                                <ContributionForm
                                    initial={{
                                        project: contribution.project,
                                        title: contribution.title,
                                        url: contribution.url,
                                        description: contribution.description ?? '',
                                        contributed_at: contribution.contributed_at
                                            ? contribution.contributed_at.slice(0, 10)
                                            : '',
                                    }}
                                    onCancel={() => setEditingId(null)}
                                    onSubmit={(form) => handleUpdate(contribution.id, form)}
                                />
                            ) : (
                                <div className="flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-(--text-secondary)">
                                            {contribution.project}
                                        </p>
                                        <a
                                            href={contribution.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium hover:text-(--accent) truncate block"
                                        >
                                            {contribution.title}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            type="button"
                                            onClick={readOnly ? undefined : () => setEditingId(contribution.id)}
                                            disabled={readOnly}
                                            className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            title={readOnly ? 'Unavailable in the read-only demo' : 'Edit'}
                                        >
                                            <GoPencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={readOnly ? undefined : () => handleDelete(contribution.id)}
                                            disabled={readOnly}
                                            className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            title={readOnly ? 'Unavailable in the read-only demo' : 'Delete'}
                                        >
                                            <GoTrash className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
