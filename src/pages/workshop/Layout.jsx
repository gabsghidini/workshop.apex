import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { NAV } from '../../data/navigation'
import { useProgress } from '../../lib/ProgressContext'

function tagClass(type) {
  if (type === 'callout') return 'tag-callout'
  if (type === 'upsell') return 'tag-upsell'
  if (type === 'material') return 'tag-material'
  return 'tag-module'
}

const TRACKED_IDS = new Set(['mod1', 'mod2', 'mod3', 'mod4', 'mod5', 'mod6'])
const TOTAL_MODULES = TRACKED_IDS.size

export default function Layout() {
  const [user, setUser] = useState(null)
  const [collapsed, setCollapsed] = useState({})
  const [groupCollapsed, setGroupCollapsed] = useState({})
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => { setSidebarOpen(false) }, [location.pathname])
  const { completedIds } = useProgress()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const toggleSection = (id) => setCollapsed(p => ({ ...p, [id]: !p[id] }))
  const toggleGroup = (id) => setGroupCollapsed(p => ({ ...p, [id]: !p[id] }))

  const completedCount = [...TRACKED_IDS].filter(id => completedIds.has(id)).length
  const pct = Math.round((completedCount / TOTAL_MODULES) * 100)

  return (
    <div className="ws-shell">
      <aside className={`ws-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="ws-sidebar-brand">
          <img src="/apex-logo.png" alt="APEX" width={36} height={36} style={{ objectFit: 'contain', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="ws-sidebar-logo-text">APEX Workshop</div>
            <div className="ws-sidebar-sub">Máquina Comercial para Software Houses</div>
          </div>
          <button
            className="ws-sidebar-toggle"
            onClick={() => setSidebarOpen(p => !p)}
            aria-label="Menu"
          >
            <span className={`ws-hamburger ${sidebarOpen ? 'open' : ''}`}>
              <span /><span /><span />
            </span>
          </button>
        </div>

        {user && (
          <div className="ws-sidebar-user">
            <span className="ws-user-dot" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </span>
          </div>
        )}

        <div className="ws-progress-bar-wrap">
          <div className="ws-progress-label">
            <span>{completedCount} de {TOTAL_MODULES} concluídos</span>
            <span>{pct}%</span>
          </div>
          <div className="ws-progress-track">
            <div className="ws-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <nav className="ws-nav">
          {NAV.map(section => {
            if (section.id === 'home') {
              return (
                <NavLink
                  key="home"
                  to="/workshop"
                  end
                  className={({ isActive }) => `ws-nav-item ${isActive ? 'active' : ''}`}
                >
                  Visão Geral
                </NavLink>
              )
            }

            const isOpen = !collapsed[section.id]

            return (
              <div key={section.id}>
                <div className="ws-section-header" onClick={() => toggleSection(section.id)}>
                  <span>{section.label}</span>
                  <span className={`ws-section-chevron ${isOpen ? 'open' : ''}`}>▶</span>
                </div>
                {isOpen && section.children?.map(child => {
                  if (child.type === 'group') {
                    const grpOpen = !groupCollapsed[child.id]
                    return (
                      <div key={child.id}>
                        <div className="ws-nav-group-header" onClick={() => toggleGroup(child.id)}>
                          <span>{child.label}</span>
                          <span className={`ws-section-chevron ${grpOpen ? 'open' : ''}`} style={{ fontSize: 7 }}>▶</span>
                        </div>
                        {grpOpen && child.children?.map(item => (
                          <NavLink
                            key={item.id}
                            to={item.path}
                            className={({ isActive }) => `ws-nav-item ws-nav-sub-item ${isActive ? 'active' : ''}`}
                          >
                            <span style={{ flex: 1 }}>{item.label}</span>
                            <span className={`ws-nav-item-tag ${tagClass(item.type)}`}>{item.tag}</span>
                          </NavLink>
                        ))}
                      </div>
                    )
                  }

                  const isTrackedItem = TRACKED_IDS.has(child.id)
                  const isComplete = isTrackedItem && completedIds.has(child.id)

                  return (
                    <NavLink
                      key={child.id}
                      to={child.path}
                      className={({ isActive }) => `ws-nav-item ${isActive ? 'active' : ''}`}
                    >
                      {isTrackedItem && (
                        <span className={`ws-nav-dot ${isComplete ? 'complete' : ''}`} />
                      )}
                      <span style={{ flex: 1 }}>{child.label}</span>
                      <span className={`ws-nav-item-tag ${tagClass(child.type)}`}>{child.tag}</span>
                    </NavLink>
                  )
                })}
              </div>
            )
          })}
        </nav>

        <div className="ws-sidebar-footer">
          <button className="ws-logout-btn" onClick={logout}>Sair da conta</button>
        </div>
      </aside>

      <main className="ws-main">
        <Outlet />
      </main>
    </div>
  )
}
