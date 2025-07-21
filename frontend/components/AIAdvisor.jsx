import { useState } from 'react'

export default function AIAdvisor({ onClose, initialMessage = '' }) {
  const [message, setMessage] = useState(initialMessage)
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      if (data.error) {
        setResponse(`Error: ${data.error}`)
      } else {
        setResponse(data.response)
      }
    } catch (err) {
      setResponse(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Asesor de Carpi Hogar</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            Cerrar
          </button>
        </div>
        <div className="mb-4">
          <textarea
            rows="3"
            className="w-full border border-gray-300 rounded p-2"
            placeholder="Escribe tu consulta..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div className="flex justify-end space-x-2 mb-4">
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
        {response && (
          <div className="border border-gray-300 rounded p-2 whitespace-pre-wrap">
            {response}
          </div>
        )}
      </div>
    </div>
  )
}