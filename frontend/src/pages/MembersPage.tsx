import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/library';
import type { Column } from '../components/DataTable';
import { DataTable } from '../components/DataTable';
import { ErrorMessage, Spinner } from '../components/Feedback';
import { useToast } from '../context/ToastContext';
import { useFetch } from '../hooks/useFetch';
import type { Member } from '../types';
import { formatDate, getErrorMessage } from '../utils/format';

const columns: Column<Member>[] = [
  { header: 'Name', render: (m) => <strong>{m.name}</strong> },
  { header: 'Email', render: (m) => m.email },
  { header: 'Membership ID', render: (m) => m.membershipId },
  { header: 'Joined', render: (m) => formatDate(m.joinedDate) },
  { header: '', render: (m) => <Link to={`/history/${m._id}`}>View history</Link> },
];

export default function MembersPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch<Member[]>((signal) => api.getMembers(signal), []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [membershipId, setMembershipId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const member = await api.createMember({ name: name.trim(), email: email.trim(), membershipId: membershipId.trim() });
      toast.success(`${member.name} registered.`);
      setName('');
      setEmail('');
      setMembershipId('');
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <div className="page-heading">
        <span className="eyebrow">Community</span>
        <h1>Members</h1>
        <p>Manage library members and open their borrowing history.</p>
      </div>

      <form className="card form-inline" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="m-name">Name</label>
          <input id="m-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="m-email">Email</label>
          <input id="m-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="m-id">Membership ID</label>
          <input id="m-id" value={membershipId} onChange={(e) => setMembershipId(e.target.value)} required />
        </div>
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Saving...' : 'Register member'}
        </button>
      </form>

      {loading && !data && <Spinner label="Loading members..." />}
      {error && <ErrorMessage message={error} onRetry={reload} />}
      {data && <DataTable data={data} columns={columns} getRowKey={(m) => m._id} emptyMessage="No members yet." />}
    </section>
  );
}
