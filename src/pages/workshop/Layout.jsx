import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { NAV } from '../../data/navigation'

function tagClass(type) {
  if (type === 'callout') return 'tag-callout'
  if (type === 'upsell') return 'tag-upsell'
  if (type === 'material') return 'tag-material'
  return 'tag-module'
}

export default function Layout() {
  const [user, setUser] = useState(null)
  const [collapsed, setCollapsed] = useState({})
  const [groupCollapsed, setGroupCollapsed] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const toggleSection = (id) => setCollapsed(p => ({ ...p, [id]: !p[id] }))
  const toggleGroup = (id) => setGroupCollapsed(p => ({ ...p, [id]: !p[id] }))

  return (
    <div className="ws-shell">
      <aside className="ws-sidebar">
        <div className="ws-sidebar-brand">
          <div style={{
            width: 36, height: 36, borderRadius: 9, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--blue), var(--blue-deep))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 14, color: '#fff',
          }}>A</div>
          <div>
            <div className="ws-sidebar-logo-text">APEX Workshop</div>
            <div className="ws-sidebar-sub">Máquina Comercial para Software Houses</div>
          </div>
        </div>

        {user && (
          <div className="ws-sidebar-user">
            <span className="ws-user-dot" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </span>
          </div>
        )}

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
                  return (
                    <NavLink
                      key={child.id}
                      to={child.path}
                      className={({ isActive }) => `ws-nav-item ${isActive ? 'active' : ''}`}
                    >
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
