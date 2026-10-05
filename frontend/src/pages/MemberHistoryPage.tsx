import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/library';
import { Badge } from '../components/Badge';
import type { Column } from '../components/DataTable';
import { DataTable } from '../components/DataTable';
import { ErrorMessage, Spinner } from '../components/Feedback';
import { Select } from '../components/Select';
import { useToast } from '../context/ToastContext';
import { useFetch } from '../hooks/useFetch';
import type { Member, PopulatedBorrowRecord } from '../types';
import { formatDate, getErrorMessage, isOverdue } from '../utils/format';

function StatusBadge({ record }: { record: PopulatedBorrowRecord }) {
  if (record.returnDate !== null || record.status === 'returned') return <Badge variant="success">Returned</Badge>;
  if (isOverdue(record)) return <Badge variant="danger">⚠ Overdue</Badge>;
  return <Badge variant="info">Issued</Badge>;
}

export default function MemberHistoryPage() {
  const { memberId = '' } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [returningId, setReturningId] = useState<string | null>(null);

  const members = useFetch<Member[]>((signal) => api.getMembers(signal), []);
  const history = useFetch(
    (signal) => api.getMemberHistory(memberId, signal),
    [memberId],
    memberId !== '' // only fetch once a member is selected
  );

  async function handleReturn(record: PopulatedBorrowRecord) {
    setReturningId(record._id);
    try {
      await api.returnBook(record._id);
      toast.success(`"${record.book?.title ?? 'Book'}" returned.`);
      history.reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setReturningId(null);
    }
  }

  const columns: Column<PopulatedBorrowRecord>[] = [
    { header: 'Book', render: (r) => <strong>{r.book?.title ?? 'Deleted book'}</strong> },
    { header: 'Issued', render: (r) => formatDate(r.issueDate) },
    { header: 'Due', render: (r) => formatDate(r.dueDate) },
    { header: 'Returned', render: (r) => formatDate(r.returnDate) },
    { header: 'Status', render: (r) => <StatusBadge record={r} /> },
    {
      header: '',
      render: (r) =>
        r.returnDate === null && r.status !== 'returned' ? (
          <button
            type="button"
            className="btn btn-small"
            disabled={returningId === r._id}
            onClick={() => handleReturn(r)}
          >
            {returningId === r._id ? 'Returning...' : 'Return'}
          </button>
        ) : null,
    },
  ];

  const records = history.data?.history ?? [];
  const overdueCount = records.filter(isOverdue).length;

  return (
    <section>
      <div className="page-heading">
        <span className="eyebrow">Circulation</span>
        <h1>Member history</h1>
        <p>Review borrowed titles, due dates, and returns for a library member.</p>
      </div>

      <div className="toolbar">
        <Select<Member>
          id="history-member"
          label="Member"
          options={members.data ?? []}
          value={memberId}
          onChange={(id) => navigate(id ? `/history/${id}` : '/history')}
          getValue={(m) => m._id}
          getLabel={(m) => `${m.name} (${m.membershipId})`}
          placeholder="Select a member"
          disabled={members.loading && !members.data}
        />
      </div>
      {members.error && <ErrorMessage message={members.error} onRetry={members.reload} />}

      {!memberId && !members.error && <p className="muted">Choose a member to see their borrow history.</p>}
      {memberId && history.loading && <Spinner label="Loading history..." />}
      {memberId && history.error && <ErrorMessage message={history.error} onRetry={history.reload} />}

      {memberId && !history.loading && history.data && (
        <>
          <div className="card summary">
            <div>
              <strong>{history.data.member.name}</strong>
              <div className="muted">
                {history.data.member.email} · {history.data.member.membershipId}
              </div>
            </div>
            <div className="summary-stats">
              <span>{records.length} total</span>
              {overdueCount > 0 && <Badge variant="danger">{overdueCount} overdue</Badge>}
            </div>
          </div>
          <DataTable
            data={records}
            columns={columns}
            getRowKey={(r) => r._id}
            emptyMessage="This member hasn't borrowed any books yet."
          />
        </>
      )}
    </section>
  );
}
