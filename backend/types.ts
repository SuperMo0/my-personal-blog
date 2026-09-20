export type Role = 'admin' | 'viewer';

export interface UserRow {
    id: number;
    name: string;
    email: string;
    password: string;
    role: string;
}

export interface SessionUser {
    id: number;
    name: string;
    email: string;
    role: Role;
}

export interface BlogSummaryRow {
    id: number;
    title: string;
    created_at: string;
    likes: number;
    published?: boolean;
}

export interface BlogRow extends BlogSummaryRow {
    content: string;
    author_id: number;
    published: boolean;
}

export interface CommentRow {
    id: number;
    author_name: string;
    content: string;
    blog_id: number;
    created_at: string;
}

export interface ContributionRow {
    id: number;
    project: string;
    title: string;
    url: string;
    description: string | null;
    contributed_at: string | null;
    position: number;
    created_at: string;
}
