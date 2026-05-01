import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={signOut}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
            >
              Déconnexion
            </button>
          </div>
          <p className="text-gray-600">
            Bienvenue, <span className="font-semibold">{user?.email}</span>
          </p>
          <p className="text-gray-500 mt-2">
            Tu es connecté. Le contenu du dashboard arrive en Session 2.
          </p>
        </div>
      </div>
    </div>
  )
}