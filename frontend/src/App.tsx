import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import BookListPage from './pages/BookListPage';
import IssueBookPage from './pages/IssueBookPage';
import LoginPage from './pages/LoginPage';
import MemberHistoryPage from './pages/MemberHistoryPage';
import MembersPage from './pages/MembersPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Everything below requires a token */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/books" replace />} />
          <Route path="/books" element={<BookListPage />} />
          <Route path="/issue" element={<IssueBookPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/history" element={<MemberHistoryPage />} />
          <Route path="/history/:memberId" element={<MemberHistoryPage />} />
          <Route path="*" element={<Navigate to="/books" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
