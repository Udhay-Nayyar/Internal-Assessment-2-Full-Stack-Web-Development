# ShelfLife Frontend (Q2) — React + TypeScript + Vite

## 1. One-time backend patch (needed for the member dropdowns)
Your backend has no "list members" endpoint, but the Issue Book form and History page must let the
librarian *select a member*. Add this small endpoint.

**backend/controllers/membersController.js** — add at the bottom:
```js
exports.listMembers = async (req, res) => {
  const members = await Member.find().sort({ name: 1 });
  res.json({ members });
};
```

**backend/routes/members.js** — add this line right after `const router = express.Router();`:
```js
router.get("/", asyncHandler(membersController.listMembers));
```

## 2. Run
```bash
# terminal 1 - backend (from the folder that has the backend's package.json)
npm start                      # http://localhost:5000

# terminal 2 - frontend
cd frontend
npm install
npm run dev                    # http://localhost:5173
```
Login with the `LIBRARIAN_USERNAME` / `LIBRARIAN_PASSWORD` values from `backend/.env`.
The Vite dev server proxies `/api` -> `http://localhost:5000` (see `vite.config.ts`), so no CORS setup is needed.
If your backend runs on another port, change the proxy `target` there.

Suggested demo order: Members (register 1-2 members) -> add books with curl/Postman (`POST /api/books`)
-> Books page -> Issue Book -> History (try a past due date to see the red Overdue badge, then Return).

## 3. Folder structure
```
src/
├── types/index.ts            Book, Member, BorrowRecord + request/response types      (Q2a)
├── api/http.ts               typed fetch wrapper: request<T>(), ApiError, token store (Q2a)
├── api/library.ts            typed API functions (login, getBooks, issueBook, ...)    (Q2a)
├── context/AuthContext.tsx   token + login/logout (global state)
├── context/ToastContext.tsx  success/error toasts
├── hooks/useFetch.ts         generic useState/useEffect data hook (loading/error/reload)
├── components/
│   ├── DataTable.tsx         generic <DataTable<T>>                                    (Q2e)
│   ├── Select.tsx            generic <Select<T>>                                       (Q2e)
│   ├── ProtectedRoute.tsx    redirects to /login without a token                       (Q2f)
│   ├── Badge, Feedback (Spinner/ErrorMessage), Layout
├── pages/
│   ├── LoginPage.tsx
│   ├── BookListPage.tsx      search + genre filter, loading/error states               (Q2b)
│   ├── IssueBookPage.tsx     select member+book, toast, disabled button in flight      (Q2c)
│   ├── MemberHistoryPage.tsx overdue badge, Return button                              (Q2d)
│   └── MembersPage.tsx       register + list members
├── utils/format.ts           isOverdue(), date helpers
├── App.tsx                   routes          └── main.tsx
```

## 4. State-management note (deliverable)
I used **local component state (`useState`) for almost everything, plus two small React Contexts**,
and no external library (Redux/Zustand/React Query).
- **Local state / `useFetch` hook:** book lists, filters, form fields and loading/error flags belong to a
  single page, so keeping them local is simplest and avoids unnecessary re-renders elsewhere.
- **AuthContext:** the JWT is needed by the route guard, the navbar (logout) and the API layer, so it is
  genuinely global. It is persisted in `localStorage`, and a 401 from a protected call logs the user out.
- **ToastContext:** any page needs to show a toast without prop drilling.
- **Why not a library:** the app has few screens and no cross-page shared server cache. React Query would
  help with caching/refetching at larger scale, but would be over-engineering here.

## 5. Design decisions
- The backend paginates and has no title search, so the Book List loads all pages once (100 per request)
  and filters by title and genre on the client.
- Overdue = `returnDate` is null AND `dueDate` is before the start of today (computed on the client,
  because the backend never sets the `overdue` status itself).
- `AbortController` in `useFetch` cancels in-flight requests on unmount/param change (no stale updates).
