# Library Management API

REST API for managing books, members, and book loans. Data is stored in MongoDB.

## Setup

Requirements: Node.js and a running MongoDB instance.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `backend/.env` file with your local settings:

   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/library_management
   PORT=3000
   LIBRARIAN_USERNAME=librarian
   LIBRARIAN_PASSWORD=replace-with-a-strong-password
   JWT_SECRET=replace-with-a-long-random-secret
   ```

   Keep these credentials and the JWT secret private. Do not commit `.env`.

3. Start the API:

   ```bash
   npm start
   ```

   The API listens at `http://localhost:3000` by default. Set `PORT` to use another port.

## Authentication

`POST /api/books`, `POST /api/borrow`, and `POST /api/return/:borrowId` require a librarian JWT. First call the login endpoint below, then include its token in the `Authorization: Bearer <token>` header. Tokens expire after one hour.

## API endpoints

All request and response bodies use JSON.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Log in as the configured librarian and receive a JWT |
| `POST` | `/api/books` | Librarian | Add a book |
| `GET` | `/api/books` | Public | List books; optional `page`, `limit`, and `genre` query parameters |
| `POST` | `/api/members` | Public | Register a member |
| `POST` | `/api/borrow` | Librarian | Issue a book to a member |
| `POST` | `/api/return/:borrowId` | Librarian | Return an issued book |
| `GET` | `/api/members/:id/history` | Public | Get a member and their borrow history |

Book listing defaults to page 1 and 10 results per page; `limit` is capped at 100. Genre filtering matches the genre value exactly.

## Sample requests

Use `curl` on macOS/Linux or `curl.exe` in Windows PowerShell. Replace placeholder IDs with the MongoDB `_id` values returned by the API. For protected calls, replace `<jwt>` with the token from login.

### Log in

```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"username":"librarian","password":"replace-with-a-strong-password"}'
```

Example response:

```json
{
  "token": "<jwt>",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

### Add a book

`availableCopies` is optional; it defaults to `totalCopies`.

```bash
curl -X POST http://localhost:3000/api/books -H "Authorization: Bearer <jwt>" -H "Content-Type: application/json" -d '{"title":"The Hobbit","author":"J. R. R. Tolkien","ISBN":"9780547928227","genre":"Fantasy","totalCopies":5}'
```

### List books

```bash
curl "http://localhost:3000/api/books?page=1&limit=10&genre=Fantasy"
```

Example response:

```json
{
  "books": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

### Register a member

```bash
curl -X POST http://localhost:3000/api/members -H "Content-Type: application/json" -d '{"name":"Alex Reader","email":"alex@example.com","membershipId":"MEM-001"}'
```

### Issue a book

The book and member IDs must be existing MongoDB document IDs. `dueDate` must be a valid date.

```bash
curl -X POST http://localhost:3000/api/borrow -H "Authorization: Bearer <jwt>" -H "Content-Type: application/json" -d '{"bookId":"<book-id>","memberId":"<member-id>","dueDate":"2026-11-05T00:00:00.000Z"}'
```

### Return a book

Use the borrow record `_id` returned when issuing the book.

```bash
curl -X POST http://localhost:3000/api/return/BORROW_ID -H "Authorization: Bearer <jwt>"
```

### Get a member's borrow history

```bash
curl http://localhost:3000/api/members/MEMBER_ID/history
```

The response contains the member and a `history` array with each borrow record and its populated book.

## Errors

Errors return a JSON object with an `error` message. Common status codes include `400` for invalid input, `401` for missing or invalid authentication, `403` for a token without the librarian role, `404` for missing records, and `409` when a book has no available copies or a record already exists.
