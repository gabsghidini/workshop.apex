import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'

const Ctx = createContext(null)

export function ProgressProvider({ children }) {
  const [completedIds, setCompletedIds] = useState(new Set())
  const [checklistMap, setChecklistMap] = useState({}) // { [item_key]: boolean }
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return setLoading(false)
      setUserId(data.user.id)
      Promise.all([
        supabase.from('module_progress').select('item_id').eq('user_id', data.user.id),
        supabase.from('checklist_progress').select('item_key, checked').eq('user_id', data.user.id),
      ]).then(([modRes, chkRes]) => {
        if (modRes.data) setCompletedIds(new Set(modRes.data.map(r => r.item_id)))
        if (chkRes.data) {
          const map = {}
          chkRes.data.forEach(r => { map[r.item_key] = r.checked })
          setChecklistMap(map)
        }
        setLoading(false)
      })
    })
  }, [])

  const markComplete = useCallback(async (itemId) => {
    if (!userId) return
    setCompletedIds(prev => new Set([...prev, itemId]))
    await supabase.from('module_progress').upsert({ user_id: userId, item_id: itemId })
  }, [userId])

  const markIncomplete = useCallback(async (itemId) => {
    if (!userId) return
    setCompletedIds(prev => { const s = new Set(prev); s.delete(itemId); return s })
    await supabase.from('module_progress').delete().eq('user_id', userId).eq('item_id', itemId)
  }, [userId])

  const toggleCheck = useCallback(async (key, checked) => {
    if (!userId) return
    setChecklistMap(prev => ({ ...prev, [key]: checked }))
    await supabase.from('checklist_progress').upsert({ user_id: userId, item_key: key, checked, updated_at: new Date().toISOString() })
  }, [userId])

  return (
    <Ctx.Provider value={{ completedIds, checklistMap, loading, markComplete, markIncomplete, toggleCheck }}>
      {children}
    </Ctx.Provider>
  )
}

export const useProgress = () => useContext(Ctx)
