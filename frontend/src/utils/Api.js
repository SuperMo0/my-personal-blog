export default async function apiRequest(path, options = {}) {
    let url = import.meta.env.MODE === 'development' ? 'http://localhost:3000/api' + path : '/api' + path;
    let token = localStorage.getItem('token');

    let response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'Application/json',
            'authorization': `Bearer ${token}`
        }
    });
    return [await response.json(), response.ok];
}
