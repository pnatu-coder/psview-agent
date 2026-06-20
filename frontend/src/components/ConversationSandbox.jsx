import { useState, useRef, useEffect } from 'react'

export default function ConversationSandbox({ conversation, sequence, personality, onReply, loading, loadingPhase, onClearConversation, onRetry, onSelectMessage }) {
  const [reply, setReply] = useState('')
  const [showSequence, setShowSequence] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation])

  const handleSend = (e) => {
    e.preventDefault()
    if (!reply.trim() || loading) return
    onReply(reply.trim())
    setReply('')
  }

  const phaseLabels = {
    planning: '🧠 Planning strategy...',
    acting: '✍️ Composing message...',
    reflecting: '🔍 Self-reflecting...',
    revising: '↻ Revising based on feedback...',
    generating: '⚙️ Generating sequence...',
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const d = new Date(timestamp)
    const now = new Date()
    const diffMin = Math.floor((now - d) / 60000)
    if (diffMin < 1) return 'just now'
    if (diffMin < 60) return `${diffMin}m ago`
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Get agent initial and color for avatar
  const agentInitial = personality?.name?.charAt(0) || '?'
  const agentColors = ['bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-rose-600', 'bg-amber-600', 'bg-cyan-600', 'bg-indigo-600', 'bg-pink-600']
  const colorIndex = (personality?.name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % agentColors.length
  const agentColor = agentColors[colorIndex]

  if (!personality) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 flex flex-col h-[600px] lg:h-[700px] items-center justify-center">
        <div className="text-5xl mb-4">🤖</div>
        <h3 className="text-lg font-medium text-white mb-2">No Agent Loaded</h3>
        <p className="text-gray-400 text-sm text-center max-w-md">
          Create a new agent or select one from the list to start a conversation.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 flex flex-col h-[600px] lg:h-[700px]">
      {/* Header */}
      <div className="p-3 lg:p-4 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full ${agentColor} flex items-center justify-center text-white font-bold text-sm`}>
            {agentInitial}
          </div>
          <div>
            <h2 className="text-base lg:text-lg font-semibold text-white">Conversation Preview</h2>
            <p className="text-xs lg:text-sm text-gray-400">
              Agent: <span className="text-blue-400">{personality?.name || 'Agent'}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {onClearConversation && conversation.length > 1 && (
            <button
              onClick={onClearConversation}
              className="text-xs lg:text-sm px-3 py-1 bg-gray-800 text-gray-300 rounded-lg hover:bg-red-900/50 hover:text-red-300 transition"
              title="Reset conversation to initial message"
            >
              ↺ Reset
            </button>
          )}
          {sequence.length > 0 && (
            <button
              onClick={() => setShowSequence(!showSequence)}
              className="text-xs lg:text-sm px-3 py-1 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
            >
              {showSequence ? 'Hide' : 'Show'} Sequence
            </button>
          )}
        </div>
      </div>

      {/* Sequence Preview (toggleable) */}
      {showSequence && (
        <div className="p-3 lg:p-4 bg-gray-950 border-b border-gray-800 max-h-60 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Generated Outreach Sequence</h3>
          {sequence.map((msg, i) => (
            <div key={i} className="mb-3 p-3 bg-gray-900 rounded-lg">
              <div className="text-xs text-blue-400 mb-1">Message {msg.message_number}: {msg.intent}</div>
              <div className="text-sm text-gray-200">{msg.content}</div>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-4">
        {conversation.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'agent' ? 'justify-start' : 'justify-end'}`}>
            <div
              onClick={() => msg.role === 'agent' && msg.reasoning && onSelectMessage && onSelectMessage(msg)}
              className={`max-w-[90%] lg:max-w-[80%] rounded-xl px-4 py-3 ${
                msg.role === 'agent'
                  ? 'bg-blue-900/30 border border-blue-800/50 text-blue-100 cursor-pointer hover:border-blue-600/70 transition'
                  : 'bg-green-900/30 border border-green-800/50 text-green-100'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {msg.role === 'agent' && (
                  <div className={`w-5 h-5 rounded-full ${agentColor} flex items-center justify-center text-white text-[10px] font-bold`}>
                    {agentInitial}
                  </div>
                )}
                <span className="text-xs text-gray-400">
                  {msg.role === 'agent' ? personality?.name || 'Agent' : 'Candidate (You)'}
                </span>
                <span className="text-xs text-gray-600">
                  {msg.timestamp ? formatTime(msg.timestamp) : ''}
                </span>
              </div>
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              {msg.role === 'agent' && msg.reasoning && (
                <div className="mt-2 flex items-center gap-2">
                  {(() => {
                    try {
                      const r = JSON.parse(msg.reasoning)
                      return r.approved_first_draft
                        ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-900/50 text-green-400 border border-green-800/50">✓ First draft</span>
                        : <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-900/50 text-orange-400 border border-orange-800/50">↻ Revised</span>
                    } catch { return null }
                  })()}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-blue-300 text-sm">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {phaseLabels[loadingPhase] || '🤖 Agent is thinking...'}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Reply Input */}
      <form onSubmit={handleSend} className="p-3 lg:p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type a candidate reply..."
            disabled={loading}
            className="flex-1 px-3 lg:px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 text-sm lg:text-base"
          />
          <button
            type="submit"
            disabled={loading || !reply.trim()}
            className="px-4 lg:px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm lg:text-base"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
