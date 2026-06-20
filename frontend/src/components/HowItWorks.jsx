import { useNavigate } from 'react-router-dom'

export default function HowItWorks() {
  const navigate = useNavigate()

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate('/')} className="text-sm text-gray-400 hover:text-white mb-6 flex items-center gap-1">
        ← Back to agents
      </button>

      <article className="prose prose-invert prose-sm max-w-none">
        <h1 className="text-2xl font-bold text-white mb-2">How It Works</h1>
        <p className="text-gray-400 text-base mb-8">
          This isn't a prompt wrapper. The agent uses a multi-phase reasoning loop on every message.
        </p>

        {/* The One Line */}
        <div className="p-4 bg-blue-900/20 border border-blue-800/40 rounded-xl mb-8">
          <p className="text-sm text-blue-200 italic">
            "The agent runs a Plan → Reflect → Act loop on every message — it strategizes about the candidate's mental state, 
            drafts a response, critiques its own draft against personality and plan, and rewrites if it fails its own quality check. 
            It's not generating text; it's reasoning about what to say and why."
          </p>
        </div>

        {/* Architecture */}
        <h2 className="text-lg font-semibold text-white mt-8 mb-4">The Reasoning Loop</h2>
        <div className="space-y-4">
          <div className="p-4 bg-yellow-900/15 border border-yellow-800/40 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">🧠</span>
              <h3 className="text-sm font-semibold text-yellow-300 m-0">Phase 1: Plan</h3>
            </div>
            <p className="text-sm text-gray-300 m-0">
              Analyzes the candidate's likely mental state. Picks a communication strategy. Identifies which specific company 
              detail to reference. Decides what approach to take (question, value prop, social proof, urgency) and what to avoid.
            </p>
          </div>

          <div className="p-4 bg-blue-900/15 border border-blue-800/40 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">✍️</span>
              <h3 className="text-sm font-semibold text-blue-300 m-0">Phase 2: Act</h3>
            </div>
            <p className="text-sm text-gray-300 m-0">
              Generates a draft message in-character, following the strategic plan. Uses the personality config 
              (voice, values, message length, emoji usage) to stay consistent across all interactions.
            </p>
          </div>

          <div className="p-4 bg-orange-900/15 border border-orange-800/40 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">🔍</span>
              <h3 className="text-sm font-semibold text-orange-300 m-0">Phase 3: Reflect</h3>
            </div>
            <p className="text-sm text-gray-300 m-0">
              Self-critiques the draft on 5 dimensions: voice/tone match (1-10), company detail specificity, 
              personalization level, strategic plan adherence, and suggested improvements. If score is 8+, approves. Otherwise, explains what needs to change.
            </p>
          </div>

          <div className="p-4 bg-green-900/15 border border-green-800/40 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">✓</span>
              <h3 className="text-sm font-semibold text-green-300 m-0">Phase 4: Send or Revise</h3>
            </div>
            <p className="text-sm text-gray-300 m-0">
              If the reflection says "APPROVED" — sends the first draft. If not — regenerates the message incorporating 
              the feedback. You can see which path was taken on each message: <span className="text-green-400">✓ First draft</span> or <span className="text-orange-400">↻ Revised</span>.
            </p>
          </div>
        </div>

        {/* What makes it autonomous */}
        <h2 className="text-lg font-semibold text-white mt-8 mb-4">What Makes It Autonomous</h2>
        <ul className="space-y-2 text-sm text-gray-300">
          <li><strong className="text-white">Self-configuring</strong> — Give it company context, it builds its own personality (voice, values, boundaries, persuasion style)</li>
          <li><strong className="text-white">Self-correcting</strong> — It can reject its own drafts and rewrite them</li>
          <li><strong className="text-white">Context-aware</strong> — Full conversation history is passed on every reply, so it adapts strategy</li>
          <li><strong className="text-white">Intent-driven</strong> — Each message in the sequence has a different strategic intent (curiosity → value → urgency)</li>
          <li><strong className="text-white">Personality-consistent</strong> — Same company config always produces messages in the same voice, even across different candidates</li>
        </ul>

        {/* Tech Stack */}
        <h2 className="text-lg font-semibold text-white mt-8 mb-4">Tech Stack</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-gray-800 rounded-lg">
            <p className="text-gray-400 text-xs mb-1">Backend</p>
            <p className="text-white m-0">Python, FastAPI</p>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg">
            <p className="text-gray-400 text-xs mb-1">LLM</p>
            <p className="text-white m-0">Groq (Llama 3)</p>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg">
            <p className="text-gray-400 text-xs mb-1">Frontend</p>
            <p className="text-white m-0">React, Vite, Tailwind</p>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg">
            <p className="text-gray-400 text-xs mb-1">Architecture</p>
            <p className="text-white m-0">Plan → Reflect → Act loop</p>
          </div>
        </div>

        {/* Design Choices */}
        <h2 className="text-lg font-semibold text-white mt-8 mb-4">Design Choices</h2>
        <ul className="space-y-2 text-sm text-gray-300">
          <li><strong className="text-white">3 separate LLM calls per message</strong> — gives transparency, self-correction, and visible reasoning</li>
          <li><strong className="text-white">Personality as structured JSON</strong> — inspectable, testable, changes with different company configs</li>
          <li><strong className="text-white">Visible reasoning panel</strong> — watch the agent think, not just see output</li>
          <li><strong className="text-white">Phase-aware loading</strong> — UI shows which reasoning phase the agent is in</li>
          <li><strong className="text-white">No database</strong> — JSON persistence + localStorage, simple for a demo</li>
        </ul>
      </article>
    </div>
  )
}
