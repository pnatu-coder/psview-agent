import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom'
import CompanyForm from './components/CompanyForm'
import ConversationSandbox from './components/ConversationSandbox'
import ReasoningPanel from './components/ReasoningPanel'
import AgentList from './components/AgentList'
import HowItWorks from './components/HowItWorks'

const API_BASE = 'http://localhost:8000'

function Layout() {
  const navigate = useNavigate()
  const [companyContext, setCompanyContext] = useState(null)
  const [candidate, setCandidate] = useState(null)
  const [personality, setPersonality] = useState(null)
  const [sequence, setSequence] = useState([])
  const [conversation, setConversation] = useState([])
  const [currentReasoning, setCurrentReasoning] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [agents, setAgents] = useState([])
  const [currentAgentId, setCurrentAgentId] = useState(null)
  const [loadingPhase, setLoadingPhase] = useState(null)
  const [agentsLoaded, setAgentsLoaded] = useState(false)

  useEffect(() => {
    fetchAgents()
  }, [])

  // Save conversation to localStorage whenever it changes
  useEffect(() => {
    if (currentAgentId && conversation.length > 0) {
      localStorage.setItem(`convo_${currentAgentId}`, JSON.stringify({
        conversation,
        lastReasoning: currentReasoning,
      }))
    }
  }, [conversation, currentReasoning, currentAgentId])

  const fetchAgents = async (isRefresh = false) => {
    try {
      const res = await fetch(`${API_BASE}/api/agents`)
      if (res.ok) {
        const data = await res.json()
        setAgents(data.agents)
      }
    } catch (err) {
      // server not up yet, leave agents empty
    }
    setAgentsLoaded(true)
  }

  const handleFormSubmit = async (context, candidateInfo) => {
    setLoading(true)
    setLoadingPhase('generating')
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_context: context,
          candidate: candidateInfo,
        }),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || `API error: ${res.status}`)
      }
      const data = await res.json()

      setCompanyContext(context)
      setCandidate(candidateInfo)
      setPersonality(data.personality)
      setSequence(data.sequence)
      setCurrentAgentId(data.id)

      const firstMsg = data.sequence[0]
      setConversation([{
        role: 'agent',
        content: firstMsg.content,
        reasoning: JSON.stringify(firstMsg.reasoning),
        timestamp: new Date().toISOString(),
      }])
      setCurrentReasoning(firstMsg.reasoning)
      fetchAgents(true)
      navigate(`/agents/${data.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setLoadingPhase(null)
    }
  }

  const handleSelectAgent = async (agentId) => {
    navigate(`/agents/${agentId}`)
  }

  const loadAgent = async (agentId) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/agents/${agentId}`)
      if (!res.ok) throw new Error('Failed to load agent')
      const data = await res.json()

      setCompanyContext(data.company_context)
      setPersonality(data.personality)
      setCandidate(null)
      setSequence(data.sequence || [])
      setCurrentAgentId(agentId)

      const savedConvo = localStorage.getItem(`convo_${agentId}`)
      if (savedConvo) {
        const parsed = JSON.parse(savedConvo)
        setConversation(parsed.conversation)
        setCurrentReasoning(parsed.lastReasoning)
      } else if (data.sequence && data.sequence.length > 0) {
        const firstMsg = data.sequence[0]
        setConversation([{
          role: 'agent',
          content: firstMsg.content,
          reasoning: JSON.stringify(firstMsg.reasoning),
          timestamp: new Date().toISOString(),
        }])
        setCurrentReasoning(firstMsg.reasoning)
      } else {
        setConversation([])
        setCurrentReasoning(null)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClearConversation = () => {
    if (currentAgentId) {
      localStorage.removeItem(`convo_${currentAgentId}`)
    }
    if (sequence && sequence.length > 0) {
      const firstMsg = sequence[0]
      setConversation([{
        role: 'agent',
        content: firstMsg.content,
        reasoning: JSON.stringify(firstMsg.reasoning),
        timestamp: new Date().toISOString(),
      }])
      setCurrentReasoning(firstMsg.reasoning)
    } else {
      setConversation([])
      setCurrentReasoning(null)
    }
  }

  const handleDeleteAgent = async (agentId) => {
    try {
      await fetch(`${API_BASE}/api/agents/${agentId}`, { method: 'DELETE' })
      localStorage.removeItem(`convo_${agentId}`)
      fetchAgents(true)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCandidateReply = async (reply) => {
    setLoading(true)
    setLoadingPhase('planning')
    setError(null)

    const updatedConversation = [
      ...conversation,
      { role: 'candidate', content: reply, timestamp: new Date().toISOString() },
    ]
    setConversation(updatedConversation)

    // Simulate phase transitions for UX
    const phaseTimer1 = setTimeout(() => setLoadingPhase('acting'), 3000)
    const phaseTimer2 = setTimeout(() => setLoadingPhase('reflecting'), 6000)
    const phaseTimer3 = setTimeout(() => setLoadingPhase('revising'), 9000)

    try {
      const res = await fetch(`${API_BASE}/api/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_context: companyContext,
          candidate: candidate || { name: 'Candidate' },
          conversation_history: updatedConversation,
          candidate_reply: reply,
        }),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || `API error: ${res.status}`)
      }
      const data = await res.json()

      setConversation([
        ...updatedConversation,
        { role: 'agent', content: data.agent_message, reasoning: JSON.stringify(data.reasoning), timestamp: new Date().toISOString() },
      ])
      setCurrentReasoning(data.reasoning)
    } catch (err) {
      setError(err.message)
    } finally {
      clearTimeout(phaseTimer1)
      clearTimeout(phaseTimer2)
      clearTimeout(phaseTimer3)
      setLoading(false)
      setLoadingPhase(null)
    }
  }

  return (
    <div className="min-h-screen p-6">
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="cursor-pointer flex items-center gap-3" onClick={() => navigate('/')}>
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">PSVIEW<span className="text-blue-400">.</span>agent</h1>
              <p className="text-gray-500 text-xs">Autonomous Recruiting AI</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/how-it-works')} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition text-sm">
              How It Works
            </button>
            <button onClick={() => navigate('/')} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition">
              All Agents
            </button>
            <button onClick={() => navigate('/new')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition">
              + New Agent
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200 flex items-center justify-between">
          <span className="text-sm">{error}</span>
          <div className="flex gap-2">
            {error.includes('rate') || error.includes('429') || error.includes('500') ? (
              <button onClick={() => { setError(null); window.location.reload() }} className="px-3 py-1 bg-red-800 text-red-100 rounded text-sm hover:bg-red-700">
                Retry
              </button>
            ) : null}
            <button onClick={() => setError(null)} className="px-2 py-1 text-red-400 hover:text-red-200 text-sm">✕</button>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={
          <AgentList
            agents={agents}
            agentsLoaded={agentsLoaded}
            onSelect={handleSelectAgent}
            onDelete={handleDeleteAgent}
            onCreate={() => navigate('/new')}
          />
        } />
        <Route path="/new" element={
          <CompanyForm onSubmit={handleFormSubmit} loading={loading} />
        } />
        <Route path="/how-it-works" element={
          <HowItWorks />
        } />
        <Route path="/agents/:id" element={
          <AgentSandbox
            loadAgent={loadAgent}
            conversation={conversation}
            sequence={sequence}
            personality={personality}
            currentReasoning={currentReasoning}
            setCurrentReasoning={setCurrentReasoning}
            onReply={handleCandidateReply}
            loading={loading}
            loadingPhase={loadingPhase}
            onClearConversation={handleClearConversation}
          />
        } />
      </Routes>
    </div>
  )
}

function AgentSandbox({ loadAgent, conversation, sequence, personality, currentReasoning, setCurrentReasoning, onReply, loading, loadingPhase, onClearConversation }) {
  const { id } = useParams()

  useEffect(() => {
    loadAgent(id)
  }, [id])

  const handleSelectMessage = (msg) => {
    if (msg.reasoning) {
      try {
        setCurrentReasoning(JSON.parse(msg.reasoning))
      } catch {}
    }
  }

  if (!personality) {
    return <div className="text-center text-gray-400 py-20">Loading agent...</div>
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <ConversationSandbox
          conversation={conversation}
          sequence={sequence}
          personality={personality}
          onReply={onReply}
          loading={loading}
          loadingPhase={loadingPhase}
          onClearConversation={onClearConversation}
          onSelectMessage={handleSelectMessage}
        />
      </div>
      <div className="lg:col-span-1">
        <ReasoningPanel
          reasoning={currentReasoning}
          personality={personality}
          onSelectReasoning={setCurrentReasoning}
          conversation={conversation}
        />
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

export default App
