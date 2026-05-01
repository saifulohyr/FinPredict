export function Navbar() {
  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6">
      <div className="flex items-center md:hidden">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">FinPredict</h1>
      </div>
      <div className="flex items-center space-x-4 ml-auto">
        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
          U
        </div>
      </div>
    </header>
  );
}
