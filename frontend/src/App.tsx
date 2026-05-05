import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'

import { TestConnection } from './components/TestConnection'

function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <TestConnection />
      <p className="mt-4 text-slate-600">Welcome to FinPredict. Your financial overview will appear here.</p>
    </div>
  )
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<div>Transactions Page</div>} />
        <Route path="/budgets" element={<div>Budgets Page</div>} />
      </Routes>
    </Layout>
  )
}

export default App
