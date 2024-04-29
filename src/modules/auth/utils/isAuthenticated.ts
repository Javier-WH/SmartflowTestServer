export default function isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token != null && user != null) return true;

    return false;
}
