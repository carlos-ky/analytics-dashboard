import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Project, ProjectInput } from '../types/database'
import ProjectModal from '../components/ProjectModal'

export default function Projects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const fetchProjects = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
    } else {
      setProjects(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProjects()
  }, [user])

  const handleSave = async (input: ProjectInput) => {
    if (!user) return

    if (editingProject) {
      const { error } = await supabase
        .from('projects')
        .update(input)
        .eq('id', editingProject.id)

      if (error) {
        alert('Erreur: ' + error.message)
        return
      }
    } else {
      const { error } = await supabase
        .from('projects')
        .insert({ ...input, user_id: user.id })

      if (error) {
        alert('Erreur: ' + error.message)
        return
      }
    }

    setShowModal(false)
    setEditingProject(null)
    fetchProjects()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce projet ?')) return

    const { error } = await supabase.from('projects').delete().eq('id', id)

    if (error) {
      alert('Erreur: ' + error.message)
      return
    }

    fetchProjects()
  }

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Projets</h1>
          <button
            onClick={() => {
              setEditingProject(null)
              setShowModal(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            + Nouveau projet
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Chargement...</p>
        ) : projects.length === 0 ? (
          <p className="text-gray-500 italic">
            Aucun projet pour le moment. Ajoutez votre premier projet portfolio.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{project.title}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      project.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {project.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                </div>

                {project.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {project.tech_stack && project.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.tech_stack.map((tech, i) => (
                      <span
                        key={i}
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 text-sm mb-3">
                  {project.project_url && (
                    
                    <a  href={project.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      ↗ Live
                    </a>
                  )}
                  {project.github_url && (
                    
                    <a  href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      ↗ GitHub
                    </a>
                  )}
                </div>

                <div className="flex justify-end gap-3 text-sm border-t pt-3">
                  <button
                    onClick={() => {
                      setEditingProject(project)
                      setShowModal(true)
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ProjectModal
          project={editingProject}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false)
            setEditingProject(null)
          }}
        />
      )}
    </Layout>
  )
}