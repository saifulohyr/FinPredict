import { Link, useLocation } from 'react-router-dom';

export function Sidebar() {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Transactions', path: '/transactions' },
    { name: 'Budgets', path: '/budgets' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">FinPredict</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-4 py-2 text-sm rounded-md transition-colors ${
              location.pathname === item.path
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-medium'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
