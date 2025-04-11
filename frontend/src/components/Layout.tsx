import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import ThemeToggle from './ThemeToggle';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useStore();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="navbar bg-base-100 shadow-md">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl">Sermon Translator</Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1">
            {user ? (
              <>
                <li>
                  <Link 
                    to="/dashboard" 
                    className={isActive('/dashboard') ? 'active' : ''}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button onClick={logout} className="btn btn-ghost">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link 
                    to="/login" 
                    className={isActive('/login') ? 'active' : ''}
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/register" 
                    className={isActive('/register') ? 'active' : ''}
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
            <li>
              <ThemeToggle />
            </li>
          </ul>
        </div>
      </div>
      <main className="flex-1 p-4">
        {children}
      </main>
    </div>
  );
} 