import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Article, Project, Message } from '../types/database'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface Stats {
  totalArticles: number
  publishedArticles: number
  totalProjects: number
  publishedProjects: number
  unreadMessages: number
  totalMessages: number
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({
    totalArticles: 0,
    publishedArticles: 0,
    totalProjects: 0,
    publishedProjects: 0,
    unreadMessages: 0,
    totalMessages: 0,
  })
  const [recentMessages, setRecentMessages] = useState<Message[]>([])
  const [articlesByMonth, setArticlesByMonth] = useState<{ month: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    setLoading(true)

    // Récupère articles, projects, messages en parallèle
    const [articlesRes, projectsRes, messagesRes] = await Promise.all([
      supabase.from('articles').select('*').eq('user_id', user!.id),
      supabase.from('projects').select('*').eq('user_id', user!.id),
      supabase
        .from('messages')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false }),
    ])

    const articles: Article[] = articlesRes.data || []
    const projects: Project[] = projectsRes.data || []
    const messages: Message[] = messagesRes.data || []

    setStats({
      totalArticles: articles.length,
      publishedArticles: articles.filter((a) => a.status === 'published').length,
      totalProjects: projects.length,
      publishedProjects: projects.filter((p) => p.status === 'published').length,
      unreadMessages: messages.filter((m) => !m.read).length,
      totalMessages: messages.length,
    })

    // 5 derniers messages
    setRecentMessages(messages.slice(0, 5))

    // Articles publiés groupés par mois (6 derniers mois)
    const monthsData = computeArticlesByMonth(articles)
    setArticlesByMonth(monthsData)

    setLoading(false)
  }

  const computeArticlesByMonth = (articles: Article[]) => {
    const months: { month: string; count: number }[] = []
    const now = new Date()

    // Initialise les 6 derniers mois à 0
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthLabel = date.toLocaleDateString('fr-FR', {
        month: 'short',
        year: '2-digit',
      })
      months.push({ month: monthLabel, count: 0 })
    }

    // Compte les articles publiés par mois
    articles
      .filter((a) => a.status === 'published')
      .forEach((article) => {
        const date = new Date(article.created_at)
        const monthLabel = date.toLocaleDateString('fr-FR', {
          month: 'short',
          year: '2-digit',
        })
        const monthEntry = months.find((m) => m.month === monthLabel)
        if (monthEntry) {
          monthEntry.count += 1
        }
      })

    return months
  }

  if (loading) {
    return (
      <Layout>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500">Chargement du dashboard...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Vue d'ensemble de votre activité.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            label="Articles"
            value={stats.totalArticles}
            sublabel={`${stats.publishedArticles} publié${stats.publishedArticles > 1 ? 's' : ''}`}
            color="blue"
            icon="📝"
          />
          <StatsCard
            label="Projets"
            value={stats.totalProjects}
            sublabel={`${stats.publishedProjects} publié${stats.publishedProjects > 1 ? 's' : ''}`}
            color="purple"
            icon="💼"
          />
          <StatsCard
            label="Messages"
            value={stats.totalMessages}
            sublabel={`${stats.unreadMessages} non lu${stats.unreadMessages > 1 ? 's' : ''}`}
            color="green"
            icon="✉️"
          />
        </div>

        {/* Chart + Recent messages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart : Articles publiés par mois */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Articles publiés (6 derniers mois)
            </h2>
            {articlesByMonth.every((m) => m.count === 0) ? (
              <p className="text-gray-500 italic text-sm">
                Aucun article publié pour le moment.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={articlesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Derniers messages */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Derniers messages
            </h2>
            {recentMessages.length === 0 ? (
              <p className="text-gray-500 italic text-sm">Aucun message.</p>
            ) : (
              <ul className="space-y-3">
                {recentMessages.map((message) => (
                  <li
                    key={message.id}
                    className="border-b border-gray-100 pb-3 last:border-0"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-sm ${
                          !message.read ? 'font-semibold text-gray-900' : 'text-gray-700'
                        }`}
                      >
                        {!message.read && (
                          <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                        )}
                        {message.sender_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    {message.subject && (
                      <p className="text-xs text-gray-600 truncate">{message.subject}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

// Composant StatsCard interne
interface StatsCardProps {
  label: string
  value: number
  sublabel: string
  color: 'blue' | 'purple' | 'green'
  icon: string
}

function StatsCard({ label, value, sublabel, color, icon }: StatsCardProps) {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    purple: 'border-purple-200 bg-purple-50',
    green: 'border-green-200 bg-green-50',
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm text-gray-600">{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sublabel}</p>
    </div>
  )
}