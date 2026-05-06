import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { LoginPage } from '@/pages/LoginPage'
import { Dashboard } from '@/components/Dashboard'


function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/transactions" element={<div>Transactions Page</div>} />
        <Route path="/budgets" element={<div>Budgets Page</div>} />
      </Routes>
    </Layout>
  )
}

export default App
