import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import { formatDate } from "@/lib/utils";

export default function AdminsPage() {
    const [email, setEmail] = useState('');
    const [adminEmails, setAdminEmails] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const addAdmin = async (ev) => {
        ev.preventDefault();
        setError('');
        try {
            const res = await axios.post('/api/admins', { email });
            alert('Admin created');
            setEmail('');
            fetchAdmins();
        } catch (err) {
            setError('Failed to add admin. Please try again.');
            console.error(err);
        }
    };

    const deleteAdmin = async (_id) => {
        setError('');
        const confirmDelete = window.confirm("You CANNOT undo. Are you sure?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`/api/admins?_id=${_id}`);
            alert('Admin removed');
            fetchAdmins();
        } catch (err) {
            setError('Failed to remove admin. Please try again.');
            console.error(err);
        }
    };

    const fetchAdmins = async () => {
        setIsLoading(true);
        setError('');
        try {
            const res = await axios.get('/api/admins');
            setAdminEmails(res.data);
        } catch (err) {
            setError('Failed to fetch admins. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    return (
        <Layout>
            <h1>Admin Panel</h1>
            <h2>Add new admin</h2>
            <form onSubmit={addAdmin}>
                <div className="flex gap-2">
                    <input
                        type="email"
                        className="mb-0"
                        value={email}
                        onChange={(ev) => setEmail(ev.target.value)}
                        placeholder="Google email"
                        required
                    />
                    <button
                        type="submit"
                        className="btn-primary py-1"
                    >
                        Add
                    </button>
                </div>
            </form>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <h2>Existing Admins</h2>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <table className="basic">
                    <thead>
                        <tr>
                            <th className="text-left">Admin Google email</th>
                            <th className="text-left">Date Added</th>
                            <th className="text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {adminEmails.length > 0 ? (
                            adminEmails.map((adminEmail) => (
                                <tr key={adminEmail._id}>
                                    <td>{adminEmail.email}</td>
                                    <td>{adminEmail.createdAt && formatDate(adminEmail.createdAt)}</td>
                                    <td>
                                        <button className="btn-red" onClick={() => deleteAdmin(adminEmail._id)}>
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3">No admins found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </Layout>
    );
}
