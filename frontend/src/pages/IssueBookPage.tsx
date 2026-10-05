import { useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../api/library';
import { ErrorMessage, Spinner } from '../components/Feedback';
import { Select } from '../components/Select';
import { useToast } from '../context/ToastContext';
import { useFetch } from '../hooks/useFetch';
import type { Book, Member } from '../types';
import { daysFromNow, endOfDayISO, formatDate, getErrorMessage, toInputDate } from '../utils/format';

export default function IssueBookPage() {
  const toast = useToast();
  const books = useFetch<Book[]>((signal) => api.getAllBooks(signal), []);
  const members = useFetch<Member[]>((signal) => api.getMembers(signal), []);

  const [memberId, setMemberId] = useState('');
  const [bookId, setBookId] = useState('');
  const [dueDate, setDueDate] = useState(toInputDate(daysFromNow(14)));
  const [submitting, setSubmitting] = useState(false);

  const bookList = books.data ?? [];
  const memberList = members.data ?? [];
  const initialLoading = (books.loading && !books.data) || (members.loading && !members.data);
  const loadError = books.error ?? members.error;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!memberId || !bookId || submitting) return;

    setSubmitting(true);
    try {
      const record = await api.issueBook({ bookId, memberId, dueDate: endOfDayISO(dueDate) });
      const title = bookList.find((b) => b._id === bookId)?.title ?? 'Book';
      toast.success(`"${title}" issued. Due ${formatDate(record.dueDate)}.`);
      setBookId('');
      books.reload(); // refresh available copy counts
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false); // re-enable the button whether it worked or not
    }
  }

  return (
    <section>
      <div className="page-heading">
        <span className="eyebrow">Circulation</span>
        <h1>Issue a book</h1>
        <p>Select a member and an available title, then set when it should be returned.</p>
      </div>

      {initialLoading && <Spinner label="Loading books and members..." />}
      {loadError && (
        <ErrorMessage
          message={loadError}
          onRetry={() => {
            books.reload();
            members.reload();
          }}
        />
      )}

      {!initialLoading && !loadError && (
        <form className="card form" onSubmit={handleSubmit}>
          <Select<Member>
            id="member"
            label="Member"
            options={memberList}
            value={memberId}
            onChange={setMemberId}
            getValue={(m) => m._id}
            getLabel={(m) => `${m.name} (${m.membershipId})`}
            placeholder="Select a member"
            disabled={submitting}
          />
          <Select<Book>
            id="book"
            label="Book"
            options={bookList}
            value={bookId}
            onChange={setBookId}
            getValue={(b) => b._id}
            getLabel={(b) => `${b.title} — ${b.author} (${b.availableCopies} available)`}
            isOptionDisabled={(b) => b.availableCopies <= 0}
            placeholder="Select a book"
            disabled={submitting}
          />
          <div className="field">
            <label htmlFor="dueDate">Due date</label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              min={toInputDate(new Date())}
              onChange={(e) => setDueDate(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <button type="submit" className="btn" disabled={submitting || !memberId || !bookId || !dueDate}>
            {submitting ? 'Issuing...' : 'Issue book'}
          </button>
        </form>
      )}
    </section>
  );
}
