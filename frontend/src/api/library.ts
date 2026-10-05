import { request } from './http';
import type {
  Book,
  BookListParams,
  BookListResponse,
  BorrowRecord,
  IssueBookRequest,
  LoginRequest,
  LoginResponse,
  Member,
  MemberHistoryResponse,
  MemberListResponse,
  NewMember,
} from '../types';

const toQuery = (params: BookListParams): string => {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.genre) search.set('genre', params.genre);
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};

export const api = {
  login: (body: LoginRequest) => request<LoginResponse>('/auth/login', { method: 'POST', body }),

  getBooks: (params: BookListParams = {}, signal?: AbortSignal) =>
    request<BookListResponse>(`/books${toQuery(params)}`, { signal }),

  // The backend paginates (max 100/page) and has no title search, so the Book
  // List page loads every page once and filters by title/genre on the client.
  async getAllBooks(signal?: AbortSignal): Promise<Book[]> {
    const first = await api.getBooks({ page: 1, limit: 100 }, signal);
    const books = [...first.books];
    for (let page = 2; page <= first.pagination.totalPages; page++) {
      const next = await api.getBooks({ page, limit: 100 }, signal);
      books.push(...next.books);
    }
    return books;
  },

  // Requires the small GET /api/members patch on the backend (see README)
  async getMembers(signal?: AbortSignal): Promise<Member[]> {
    const res = await request<MemberListResponse>('/members', { signal });
    return res.members;
  },

  createMember: (body: NewMember) => request<Member>('/members', { method: 'POST', body }),

  getMemberHistory: (memberId: string, signal?: AbortSignal) =>
    request<MemberHistoryResponse>(`/members/${memberId}/history`, { signal }),

  issueBook: (body: IssueBookRequest) => request<BorrowRecord>('/borrow', { method: 'POST', body, auth: true }),

  returnBook: (borrowId: string) => request<BorrowRecord>(`/return/${borrowId}`, { method: 'POST', auth: true }),
};
