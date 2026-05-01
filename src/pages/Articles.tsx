import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Article, ArticleInput } from '../types/database'
import ArticleModal from '../components/ArticleModal'

export default function Articles() {
  const { user } = useAuth()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)

  // Charger les articles
  const fetchArticles = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching articles:', error)
    } else {
      setArticles(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchArticles()
  }, [user])

  // Créer ou modifier un article
  const handleSave = async (input: ArticleInput) => {
    if (!user) return

    if (editingArticle) {
      // Update
      const { error } = await supabase
        .from('articles')
        .update(input)
        .eq('id', editingArticle.id)

      if (error) {
        alert('Erreur lors de la modification: ' + error.message)
        return
      }
    } else {
      // Insert
      const { error } = await supabase
        .from('articles')
        .insert({ ...input, user_id: user.id })

      if (error) {
        alert('Erreur lors de la création: ' + error.message)
        return
      }
    }

    setShowModal(false)
    setEditingArticle(null)
    fetchArticles()
  }

  // Supprimer un article
  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return

    const { error } = await supabase.from('articles').delete().eq('id', id)

    if (error) {
      alert('Erreur lors de la suppression: ' + error.message)
      return
    }

    fetchArticles()
  }

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
          <button
            onClick={() => {
              setEditingArticle(null)
              setShowModal(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            + Nouvel article
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Chargement...</p>
        ) : articles.length === 0 ? (
          <p className="text-gray-500 italic">
            Aucun article pour le moment. Créez votre premier article.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-600">
                  <th className="pb-3 font-medium">Titre</th>
                  <th className="pb-3 font-medium">Statut</th>
                  <th className="pb-3 font-medium">Créé le</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">{article.title}</td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs ${
                          article.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {article.status === 'published' ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {new Date(article.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          setEditingArticle(article)
                          setShowModal(true)
                        }}
                        className="text-blue-600 hover:underline mr-3 text-sm"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <ArticleModal
          article={editingArticle}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false)
            setEditingArticle(null)
          }}
        />
      )}
    </Layout>
  )
}