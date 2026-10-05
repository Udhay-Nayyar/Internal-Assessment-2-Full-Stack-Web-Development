// Types mirror the Mongoose schemas / JSON responses of the Express backend.
// Dates arrive as ISO strings over JSON.

export interface Book {
  _id: string;
  title: string;
  author: string;
  ISBN: string; // note: backend field name is upper-case
  genre: string;
  totalCopies: number;
  availableCopies: number;
}

export interface Member {
  _id: string;
  name: string;
  email: string;
  membershipId: string;
  joinedDate: string;
}

export type BorrowStatus = 'issued' | 'returned' | 'overdue';

// POST /api/borrow and POST /api/return/:id return the record with book/member as ids
export interface BorrowRecord {
  _id: string;
  book: string;
  member: string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  status: BorrowStatus;
}

// GET /api/members/:id/history returns records with `book` populated
export interface PopulatedBorrowRecord extends Omit<BorrowRecord, 'book'> {
  book: Book | null; // null if the book document was deleted
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ---- Request / response shapes ----
export interface LoginRequest {
  username: string;
  password: string;
}
export interface LoginResponse {
  token: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface BookListParams {
  page?: number;
  limit?: number;
  genre?: string;
}
export interface BookListResponse {
  books: Book[];
  pagination: Pagination;
}

export interface NewMember {
  name: string;
  email: string;
  membershipId: string;
}
export interface MemberListResponse {
  members: Member[];
}
export interface MemberHistoryResponse {
  member: Member;
  history: PopulatedBorrowRecord[];
}

export interface IssueBookRequest {
  bookId: string;
  memberId: string;
  dueDate: string; // ISO string
}

export interface ApiErrorBody {
  error: string;
}
