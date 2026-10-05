import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const { logout } = useAuth();

  return (
    <>
      <header className="navbar">
        <span className="brand">
          <span className="brand-mark" aria-hidden="true">S</span>
          ShelfLife
        </span>
        <nav>
          <NavLink to="/books">Books</NavLink>
          <NavLink to="/issue">Issue Book</NavLink>
          <NavLink to="/members">Members</NavLink>
          <NavLink to="/history">History</NavLink>
        </nav>
        <button type="button" className="btn btn-small btn-outline" onClick={logout}>
          Logout
        </button>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
