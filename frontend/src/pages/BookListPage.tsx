import { useMemo, useState } from 'react';
import { api } from '../api/library';
import { Badge } from '../components/Badge';
import type { Column } from '../components/DataTable';
import { DataTable } from '../components/DataTable';
import { ErrorMessage, Spinner } from '../components/Feedback';
import { Select } from '../components/Select';
import { useFetch } from '../hooks/useFetch';
import type { Book } from '../types';

const columns: Column<Book>[] = [
  { header: 'Title', render: (b) => <strong>{b.title}</strong> },
  { header: 'Author', render: (b) => b.author },
  { header: 'ISBN', render: (b) => b.ISBN },
  { header: 'Genre', render: (b) => b.genre },
  {
    header: 'Availability',
    render: (b) =>
      b.availableCopies > 0 ? (
        <Badge variant="success">
          {b.availableCopies} / {b.totalCopies} available
        </Badge>
      ) : (
        <Badge variant="danger">Out of stock</Badge>
      ),
  },
];

export default function BookListPage() {
  const { data, loading, error, reload } = useFetch<Book[]>((signal) => api.getAllBooks(signal), []);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');

  const books = data ?? [];

  const genres = useMemo(() => Array.from(new Set(books.map((b) => b.genre))).sort(), [books]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return books.filter((b) => (!genre || b.genre === genre) && (!q || b.title.toLowerCase().includes(q)));
  }, [books, search, genre]);

  return (
    <section>
      <div className="page-heading">
        <span className="eyebrow">Your collection</span>
        <h1>Books</h1>
        <p>Explore the library catalogue, check availability, and find the right read for every member.</p>
      </div>

      {data && (
        <div className="book-stats" aria-label="Catalogue overview">
          <div className="stat-card">
            <span className="stat-label">Titles in catalogue</span>
            <strong className="stat-value">{books.length}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Available copies</span>
            <strong className="stat-value">{books.reduce((total, book) => total + book.availableCopies, 0)}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Genres</span>
            <strong className="stat-value">{genres.length}</strong>
          </div>
        </div>
      )}

      <div className="toolbar">
        <div className="field grow">
          <label htmlFor="search">Search by title</label>
          <input
            id="search"
            type="search"
            placeholder="e.g. Clean Code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select<string>
          id="genre"
          label="Genre"
          options={genres}
          value={genre}
          onChange={setGenre}
          getValue={(g) => g}
          getLabel={(g) => g}
          placeholder="All genres"
        />
      </div>

      {loading && !data && <Spinner label="Loading books..." />}
      {error && <ErrorMessage message={error} onRetry={reload} />}
      {data && (
        <>
          <p className="result-count">
            Showing {filtered.length} of {books.length} books
          </p>
          <DataTable
            data={filtered}
            columns={columns}
            getRowKey={(b) => b._id}
            emptyMessage="No books match your search."
          />
        </>
      )}
    </section>
  );
}
