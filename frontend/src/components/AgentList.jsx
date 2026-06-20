export default function AgentList({ agents, agentsLoaded, onSelect, onDelete, onCreate }) {
  // Full page loader until data arrives
  if (!agentsLoaded) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-400 mt-4 text-sm">Loading agents...</p>
      </div>
    )
  }

  if (agents.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="text-6xl mb-4">🤖</div>
        <h2 className="text-2xl font-semibold text-white mb-2">No Agents Yet</h2>
        <p className="text-gray-400 mb-8">
          Create your first recruiting agent by configuring a company's context.
          The agent will build its own personality and generate outreach sequences.
        </p>
        <button
          onClick={onCreate}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition"
        >
          + Create First Agent
        </button>
      </div>
    )
  }

  const agentColors = ['bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-rose-600', 'bg-amber-600', 'bg-cyan-600', 'bg-indigo-600', 'bg-pink-600']
  const toneColors = {
    casual: 'bg-sky-900/40 text-sky-300 border-sky-800/50',
    formal: 'bg-slate-900/40 text-slate-300 border-slate-700/50',
    edgy: 'bg-red-900/40 text-red-300 border-red-800/50',
    warm: 'bg-amber-900/40 text-amber-300 border-amber-800/50',
    professional: 'bg-indigo-900/40 text-indigo-300 border-indigo-800/50',
    playful: 'bg-pink-900/40 text-pink-300 border-pink-800/50',
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Your Agents</h2>
        <p className="text-xs text-gray-500">{agents.length} agent{agents.length !== 1 ? 's' : ''} configured</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {agents.map((agent) => {
          const savedConvo = localStorage.getItem(`convo_${agent.id}`)
          const convoCount = savedConvo ? JSON.parse(savedConvo).conversation.length : agent.message_count || 0
          const colorIndex = (agent.personality_name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % agentColors.length
          const agentColor = agentColors[colorIndex]
          const toneStyle = toneColors[agent.tone] || toneColors.casual

          return (
            <div
              key={agent.id}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-all cursor-pointer group hover:shadow-lg hover:shadow-black/20"
              onClick={() => onSelect(agent.id)}
            >
              {/* Top color bar */}
              <div className={`h-1 ${agentColor}`} />

              <div className="p-5">
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full ${agentColor} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {agent.personality_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition">
                        {agent.company_name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {agent.personality_name} <span className="text-gray-600">·</span> <span className="text-gray-500">{agent.industry}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(agent.id)
                    }}
                    className="text-gray-700 hover:text-red-400 transition p-1 opacity-0 group-hover:opacity-100"
                    title="Delete agent"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Personality voice */}
                {agent.personality_voice && (
                  <p className="text-xs text-gray-500 italic mb-3 line-clamp-2">
                    "{agent.personality_voice}"
                  </p>
                )}

                {/* Footer stats */}
                <div className="flex items-center gap-3 pt-3 border-t border-gray-800/50">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${toneStyle}`}>
                    {agent.tone}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    {convoCount} messages
                  </span>
                  <span className="ml-auto text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 transition">
                    Click to open →
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
