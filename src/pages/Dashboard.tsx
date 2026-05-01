import Layout from '../components/Layout'

export default function Dashboard() {
  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Vue d'ensemble de votre activité. Les statistiques arrivent en Session 4.
        </p>
      </div>
    </Layout>
  )
}