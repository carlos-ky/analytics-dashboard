import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Message } from '../types/database'

export default function Messages() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  const fetchMessages = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching messages:', error)
    } else {
      setMessages(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMessages()
  }, [user])

  const handleSelectMessage = async (message: Message) => {
    setSelectedMessage(message)

    // Marquer comme lu si pas déjà lu
    if (!message.read) {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', message.id)

      if (!error) {
        fetchMessages()
      }
    }
  }

  const handleToggleRead = async (message: Message, e: React.MouseEvent) => {
    e.stopPropagation()
    const { error } = await supabase
      .from('messages')
      .update({ read: !message.read })
      .eq('id', message.id)

    if (error) {
      alert('Erreur: ' + error.message)
      return
    }

    fetchMessages()
    if (selectedMessage?.id === message.id) {
      setSelectedMessage({ ...message, read: !message.read })
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Supprimer ce message ?')) return

    const { error } = await supabase.from('messages').delete().eq('id', id)

    if (error) {
      alert('Erreur: ' + error.message)
      return
    }

    if (selectedMessage?.id === id) {
      setSelectedMessage(null)
    }
    fetchMessages()
  }

  const unreadCount = messages.filter((m) => !m.read).length

  // Format date relative
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays}j`
    return date.toLocaleDateString('fr-FR')
  }

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-md overflow-hidden h-[calc(100vh-4rem)]">
        <div className="flex h-full">
          {/* Liste des messages */}
          <div className="w-2/5 border-r overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                {unreadCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {loading ? (
              <p className="p-4 text-gray-500">Chargement...</p>
            ) : messages.length === 0 ? (
              <p className="p-4 text-gray-500 italic">Aucun message reçu.</p>
            ) : (
              <ul>
                {messages.map((message) => (
                  <li
                    key={message.id}
                    onClick={() => handleSelectMessage(message)}
                    className={`p-4 border-b cursor-pointer transition ${
                      selectedMessage?.id === message.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    } ${!message.read ? 'font-semibold' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {!message.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                        )}
                        <span className="text-sm text-gray-900 truncate">
                          {message.sender_name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                    {message.subject && (
                      <p className="text-sm text-gray-700 truncate mb-1">
                        {message.subject}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 truncate">{message.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Détail du message */}
          <div className="flex-1 overflow-y-auto">
            {selectedMessage ? (
              <div className="p-6">
                <div className="flex justify-between items-start mb-4 pb-4 border-b">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      {selectedMessage.subject || '(Pas de sujet)'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      De : <span className="font-medium">{selectedMessage.sender_name}</span>{' '}
                      &lt;{selectedMessage.sender_email}&gt;
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(selectedMessage.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleToggleRead(selectedMessage, e)}
                      className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 border rounded-md transition"
                    >
                      {selectedMessage.read ? 'Marquer non lu' : 'Marquer lu'}
                    </button>
                    <button
                      onClick={(e) => handleDelete(selectedMessage.id, e)}
                      className="text-sm text-red-600 hover:text-red-800 px-3 py-1 border border-red-200 rounded-md transition"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                <div className="mt-6 pt-4 border-t">
                  
                    <a href={`mailto:${selectedMessage.sender_email}?subject=Re: ${selectedMessage.subject || ''}`}
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
                    >
                    Répondre par email
                  </a>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>Sélectionnez un message pour le lire</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}