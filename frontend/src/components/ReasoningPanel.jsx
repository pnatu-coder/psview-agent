import { useState } from 'react'

function TruncatedText({ text, maxLines = 4 }) {
  const [expanded, setExpanded] = useState(false)
  const lines = (text || '').split('\n')
  const needsTruncation = lines.length > maxLines

  return (
    <div>
      <p className={`text-xs text-gray-300 whitespace-pre-wrap ${!expanded && needsTruncation ? 'line-clamp-4' : ''}`}>
        {text}
      </p>
      {needsTruncation && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[10px] text-blue-400 hover:text-blue-300 mt-1"
        >
          {expanded ? 'Show less' : 'Show more...'}
        </button>
      )}
    </div>
  )
}

export default function ReasoningPanel({ reasoning, personality, onSelectReasoning, conversation }) {
  const [collapsed, setCollapsed] = useState(false)
  const [showPersonality, setShowPersonality] = useState(false)

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 h-auto lg:h-[700px] flex flex-col">
      {/* Header */}
      <div
        className="p-4 border-b border-gray-800 flex items-center justify-between cursor-pointer lg:cursor-default"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div>
          <h2 className="text-lg font-semibold text-white">Agent Reasoning</h2>
          <p className="text-sm text-gray-400 hidden sm:block">Click a message to see its thinking</p>
        </div>
        <button className="lg:hidden text-gray-400 hover:text-white">
          {collapsed ? '▼' : '▲'}
        </button>
      </div>

      <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${collapsed ? 'hidden' : ''} lg:block`}>
        {/* Personality Card — collapsed by default */}
        {personality && (
          <div className="p-3 bg-purple-900/20 border border-purple-800/50 rounded-lg">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowPersonality(!showPersonality)}
            >
              <h3 className="text-sm font-semibold text-purple-300">
                {personality.name}'s Personality
              </h3>
              <span className="text-xs text-purple-400">{showPersonality ? '▲' : '▼'}</span>
            </div>
            {showPersonality && (
              <div className="space-y-1 text-xs text-gray-300 mt-2">
                <p><span className="text-purple-400">Voice:</span> {personality.voice}</p>
                <p><span className="text-purple-400">Opening:</span> {personality.opening_style}</p>
                <p><span className="text-purple-400">Persuasion:</span> {personality.persuasion_approach}</p>
                <p><span className="text-purple-400">Length:</span> {personality.message_length} | <span className="text-purple-400">Emoji:</span> {personality.emoji_usage}</p>
                {personality.values && (
                  <div>
                    <span className="text-purple-400">Values:</span>
                    <ul className="ml-3 mt-1 list-disc list-inside text-gray-400">
                      {(Array.isArray(personality.values) ? personality.values : [personality.values]).map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Reasoning Trace */}
        {reasoning && (
          <>
            {/* Plan */}
            <div className="p-3 bg-yellow-900/20 border border-yellow-800/50 rounded-lg">
              <h3 className="text-xs font-semibold text-yellow-300 mb-1">🧠 Strategic Plan</h3>
              <TruncatedText text={reasoning.plan} maxLines={5} />
            </div>

            {/* Reflection */}
            <div className="p-3 bg-orange-900/20 border border-orange-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xs font-semibold text-orange-300">🔍 Self-Reflection</h3>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                  reasoning.approved_first_draft
                    ? 'bg-green-800/50 text-green-300'
                    : 'bg-red-800/50 text-red-300'
                }`}>
                  {reasoning.approved_first_draft ? '✓ Approved' : '↻ Revised'}
                </span>
              </div>
              <TruncatedText text={reasoning.reflection} maxLines={5} />
            </div>
          </>
        )}

        {!reasoning && (
          <div className="text-center text-gray-500 text-sm mt-8">
            <p>Click on an agent message to see its reasoning</p>
          </div>
        )}

        {/* Message selector */}
        {conversation.filter(m => m.role === 'agent' && m.reasoning).length > 1 && (
          <div className="pt-3 border-t border-gray-800">
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase mb-2">All messages</h3>
            {conversation.filter(m => m.role === 'agent' && m.reasoning).map((msg, i) => (
              <button
                key={i}
                onClick={() => onSelectReasoning(JSON.parse(msg.reasoning))}
                className="block w-full text-left text-xs p-2 rounded hover:bg-gray-800 text-gray-400 truncate mb-1"
              >
                {i + 1}. {msg.content.substring(0, 50)}...
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
