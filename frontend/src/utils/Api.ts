export default async function apiRequest<T = unknown>(path: string, options: RequestInit = {}): Promise<[T, boolean]> {
    const url = import.meta.env.MODE === 'development' ? `http://localhost:3000/api${path}` : `/api${path}`;
    const token = localStorage.getItem('token');

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });
    return [await response.json(), response.ok];
}
