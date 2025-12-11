import React, { useEffect, useState } from 'react'
import { saveUserProfile } from '../../firebase'
import { setProfessor } from '../../services/professors'

const SAMPLE_PROFESSORS = [
  { uid: 'prof_alvarez', name: 'Prof. Maria Alvarez', email: 'malvarez@umindanao.edu.ph', department: 'Department of Computing Education' },
  { uid: 'prof_orcullo', name: 'Prof. Lowell Jay Orcullo', email: 'lorcullo@umindanao.edu.ph', department: 'Department of Engineering Education' },
  { uid: 'prof_delacruz', name: 'Prof. Jose Delacruz', email: 'jdelacruz@umindanao.edu.ph', department: 'Department of Computing Education' }
]

export default function SeedProfessors() {
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    if (import.meta.env.MODE !== 'development') {
      setStatus('disabled')
      return
    }

    async function seed() {
      setStatus('seeding')
      try {
        for (const p of SAMPLE_PROFESSORS) {
          const profile = {
            name: p.name,
            email: p.email,
            role: 'Professor',
            department: p.department,
            seeded: true,
            createdAt: new Date().toISOString()
          }

          await saveUserProfile(p.uid, profile)

          await setProfessor(p.uid, profile)
        }
        setStatus('done')
      } catch (e) {
        console.error('Seeding failed', e)
        setStatus('error')
      }
    }

    seed()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Seed Professors (dev-only)</h1>
      <p>Status: {status}</p>
      {status === 'done' && <p className="text-green-600">Seeding finished — sample professors created.</p>}
      {status === 'error' && <p className="text-red-600">Seeding failed; check console.</p>}
      {status === 'disabled' && <p className="text-yellow-600">Seeding disabled in non-development mode.</p>}
    </div>
  )
}
