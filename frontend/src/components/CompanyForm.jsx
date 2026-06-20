import { useState } from 'react'

const SAMPLE_DATA = [
  {
    form: {
      company_name: 'Stripe',
      industry: 'Fintech / Payments Infrastructure',
      culture: 'Remote-first, deep work culture, writing-heavy (memos over meetings), high autonomy, small teams owning massive scope',
      tone: 'casual',
      roles_hiring: 'Senior Backend Engineers, Infrastructure Engineers, ML Engineers',
      unique_selling_points: 'Building the economic infrastructure of the internet. 95% of Fortune 500 use Stripe. Teams of 3-5 engineers ship products used by millions.',
      additional_context: 'We value people who write clearly, think from first principles, and ship fast.',
    },
    candidate: { name: 'Alex Chen', current_role: 'Senior Software Engineer', current_company: 'Google', skills: 'Distributed systems, Go, Python, API design' },
  },
  {
    form: {
      company_name: 'Figma',
      industry: 'Design Tools / Collaboration Software',
      culture: 'Maker culture, design-obsessed, low-ego collaboration, hybrid (SF HQ + remote), ship weekly, celebrate craft',
      tone: 'warm',
      roles_hiring: 'Senior Frontend Engineers, Full-Stack Engineers, DevTools Engineers',
      unique_selling_points: 'Real-time multiplayer editing used by every major design team. Built on WebGL and CRDTs — bleeding edge browser tech.',
      additional_context: 'Engineers here are craftspeople. We care about performance, polish, and delighting users.',
    },
    candidate: { name: 'Priya Sharma', current_role: 'Staff Frontend Engineer', current_company: 'Airbnb', skills: 'React, WebGL, performance optimization, design systems' },
  },
  {
    form: {
      company_name: 'Anduril',
      industry: 'Defense Technology / Autonomous Systems',
      culture: 'Mission-driven, move-fast-break-things applied to defense, startup energy with serious impact, in-office',
      tone: 'edgy',
      roles_hiring: 'Robotics Engineers, Computer Vision Engineers, Systems Engineers',
      unique_selling_points: 'Building the future of national defense. Autonomous drones, AI-powered surveillance, hardware + software at scale. Your code protects lives.',
      additional_context: 'We hire people who want their work to matter at a civilizational level. Not for everyone — and that\'s the point.',
    },
    candidate: { name: 'Marcus Johnson', current_role: 'Robotics Engineer', current_company: 'Boston Dynamics', skills: 'C++, ROS, computer vision, autonomous navigation, sensor fusion' },
  },
  {
    form: {
      company_name: 'Notion',
      industry: 'Productivity Software / Knowledge Management',
      culture: 'Calm company, thoughtful product design, async-first, small team (< 500), craftsman mindset, Tokyo + SF',
      tone: 'playful',
      roles_hiring: 'Full-Stack Engineers, AI Engineers, Mobile Engineers',
      unique_selling_points: 'All-in-one workspace used by 30M+ people. Building next-gen knowledge tools with AI. Small eng team with outsized impact.',
      additional_context: 'We believe tools shape thinking. We hire people who care about elegance and simplicity.',
    },
    candidate: { name: 'Sofia Rodriguez', current_role: 'Senior Product Engineer', current_company: 'Linear', skills: 'TypeScript, React, AI/LLM integration, product thinking' },
  },
  {
    form: {
      company_name: 'SpaceX',
      industry: 'Aerospace / Space Transportation',
      culture: 'Intense, mission-obsessed, hardware meets software, long hours but historic impact, Hawthorne CA + Starbase TX',
      tone: 'formal',
      roles_hiring: 'Flight Software Engineers, Embedded Systems Engineers, GNC Engineers',
      unique_selling_points: 'Making humanity multiplanetary. 200+ missions launched. Only private company to send astronauts to ISS. Starship is the most powerful rocket ever built.',
      additional_context: 'We want people who work like the mission depends on them — because it does. Engineers here ship code that flies.',
    },
    candidate: { name: 'David Park', current_role: 'Senior Embedded Engineer', current_company: 'Apple', skills: 'C, C++, RTOS, flight software, control systems, embedded Linux' },
  },
  {
    form: {
      company_name: 'Vercel',
      industry: 'Developer Tools / Cloud Infrastructure',
      culture: 'Open source at heart, developer experience obsessed, fully remote, ship daily, community-driven',
      tone: 'casual',
      roles_hiring: 'Platform Engineers, Rust Engineers, Developer Experience Engineers',
      unique_selling_points: 'Created Next.js. Powers the frontend for half the internet. From zero to deployed in seconds. 3M+ developers on the platform.',
      additional_context: 'We believe the best developer tools feel like magic. Push to main, deployed in 3 seconds — that\'s us.',
    },
    candidate: { name: 'Emma Liu', current_role: 'Senior Platform Engineer', current_company: 'Cloudflare', skills: 'Rust, TypeScript, edge computing, CDN architecture, Wasm' },
  },
  {
    form: {
      company_name: 'OpenAI',
      industry: 'Artificial Intelligence / Research',
      culture: 'Research meets product, intense intellectual environment, SF-based, move fast on frontier AI, safety-conscious but ambitious',
      tone: 'professional',
      roles_hiring: 'Research Engineers, Infrastructure Engineers, Applied AI Engineers',
      unique_selling_points: 'Building AGI. Created GPT-4, DALL-E, ChatGPT. 200M+ weekly users. Working on the most important technology of our lifetime.',
      additional_context: 'We hire people who want to be at the frontier. The problems here don\'t have textbook answers.',
    },
    candidate: { name: 'James Wright', current_role: 'ML Research Engineer', current_company: 'DeepMind', skills: 'PyTorch, transformers, RLHF, distributed training, ML infrastructure' },
  },
  {
    form: {
      company_name: 'Shopify',
      industry: 'E-commerce / SaaS Platform',
      culture: 'Merchant-obsessed, remote-first (digital by default), high trust, long-term thinking, craft over process',
      tone: 'warm',
      roles_hiring: 'Senior Ruby Engineers, React Native Engineers, Data Engineers',
      unique_selling_points: 'Powers 10% of all US e-commerce. $200B+ in merchant sales. From single-store to enterprise in one platform.',
      additional_context: 'We build for entrepreneurs. Every line of code helps someone chase their dream.',
    },
    candidate: { name: 'Aisha Okafor', current_role: 'Senior Backend Engineer', current_company: 'Amazon', skills: 'Ruby, Rails, distributed systems, event-driven architecture, PostgreSQL' },
  },
]

export default function CompanyForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    company_name: '',
    industry: '',
    culture: '',
    tone: 'casual',
    roles_hiring: '',
    unique_selling_points: '',
    additional_context: '',
  })
  const [candidate, setCandidate] = useState({
    name: '',
    current_role: '',
    current_company: '',
    skills: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form, candidate)
  }

  const loadSample = () => {
    const sample = SAMPLE_DATA[Math.floor(Math.random() * SAMPLE_DATA.length)]
    setForm(sample.form)
    setCandidate(sample.candidate)
  }

  const toneOptions = ['casual', 'formal', 'edgy', 'warm', 'professional', 'playful']

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      {/* Quick Start Banner */}
      <div className="mb-6 p-4 bg-purple-900/20 border border-purple-700/40 rounded-xl flex items-center justify-between">
        <div>
          <p className="text-sm text-purple-200 font-medium">Want to skip the form?</p>
          <p className="text-xs text-purple-400">Load a pre-filled sample to test the agent instantly</p>
        </div>
        <button
          type="button"
          onClick={loadSample}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition text-sm font-medium whitespace-nowrap"
        >
          🎲 Random Sample
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Company Context */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">Company Context</h2>
          <p className="text-gray-400 text-sm mb-5">Tell the agent about the company. It will build its personality from this.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={form.company_name}
                onChange={(e) => setForm({...form, company_name: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Stripe"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Industry *</label>
              <input
                type="text"
                required
                value={form.industry}
                onChange={(e) => setForm({...form, industry: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Fintech / Payments Infrastructure"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Culture *</label>
              <textarea
                required
                value={form.culture}
                onChange={(e) => setForm({...form, culture: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="e.g. Remote-first, async communication, high autonomy, move fast..."
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Tone *</label>
              <select
                value={form.tone}
                onChange={(e) => setForm({...form, tone: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {toneOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Roles Hiring For *</label>
              <input
                type="text"
                required
                value={form.roles_hiring}
                onChange={(e) => setForm({...form, roles_hiring: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Senior Backend Engineers, ML Engineers"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">What Makes You Special *</label>
              <textarea
                required
                value={form.unique_selling_points}
                onChange={(e) => setForm({...form, unique_selling_points: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="e.g. Building the internet's payment infrastructure, 95% of Fortune 500 use us..."
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Additional Context</label>
              <textarea
                value={form.additional_context}
                onChange={(e) => setForm({...form, additional_context: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Anything else the agent should know..."
              />
            </div>
          </div>
        </div>

        {/* Candidate Profile */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">Test Candidate</h2>
          <p className="text-gray-400 text-sm mb-6">Create a fake candidate to test the agent's outreach.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Candidate Name *</label>
              <input
                type="text"
                required
                value={candidate.name}
                onChange={(e) => setCandidate({...candidate, name: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Alex Chen"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Current Role</label>
              <input
                type="text"
                value={candidate.current_role}
                onChange={(e) => setCandidate({...candidate, current_role: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Senior Software Engineer"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Current Company</label>
              <input
                type="text"
                value={candidate.current_company}
                onChange={(e) => setCandidate({...candidate, current_company: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Google"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Skills</label>
              <input
                type="text"
                value={candidate.skills}
                onChange={(e) => setCandidate({...candidate, skills: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Python, distributed systems, ML"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Agent is thinking...
                </span>
              ) : 'Generate Agent & Outreach Sequence'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
