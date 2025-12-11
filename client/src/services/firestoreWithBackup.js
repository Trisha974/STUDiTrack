

import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const BACKUP_PREFIX = 'firestore_backup_'

export async function getWithBackup(collection, docId) {
  const storageKey = `${BACKUP_PREFIX}${collection}_${docId}`

const lastQuotaError = localStorage.getItem('lastQuotaError')
  if (lastQuotaError) {
    const timeSinceError = Date.now() - parseInt(lastQuotaError, 10)

    if (timeSinceError < 86400000) {
      const backup = getFromBackup(storageKey)
      if (backup) {
        console.log(`📦 Using localStorage backup (quota protection): ${collection}/${docId}`)
        return backup
      }
    } else {

      localStorage.removeItem('lastQuotaError')
      quotaExceeded = false
    }
  }

if (quotaExceeded) {
    const backup = getFromBackup(storageKey)
    if (backup) {
      return backup
    }
  }

  try {

    const docRef = doc(db, collection, docId)
    const snap = await getDoc(docRef)

    if (snap.exists()) {
      const data = snap.data()

      try {
        localStorage.setItem(storageKey, JSON.stringify({
          data,
          timestamp: new Date().toISOString(),
          source: 'firestore'
        }))
      } catch (e) {
        console.warn('Could not update localStorage backup:', e)
      }
      return data
    }

return getFromBackup(storageKey)
  } catch (error) {

    console.warn(`Firestore read failed for ${collection}/${docId}, using localStorage backup:`, error.message)

if (error.code === 'resource-exhausted' || error.message?.includes('quota') || error.message?.includes('Quota')) {
      quotaExceeded = true
      localStorage.setItem('lastQuotaError', Date.now().toString())
    }

    return getFromBackup(storageKey)
  }
}

function getFromBackup(storageKey) {
  try {
    const backup = localStorage.getItem(storageKey)
    if (backup) {
      const parsed = JSON.parse(backup)
      console.log(`Using localStorage backup for ${storageKey}`)
      return parsed.data || null
    }
  } catch (error) {
    console.warn('Could not read from localStorage backup:', error)
  }
  return null
}

let quotaExceeded = false
const QUOTA_RETRY_DELAY = 60000

export async function setWithBackup(collection, docId, data, options = {}) {
  const storageKey = `${BACKUP_PREFIX}${collection}_${docId}`
  const { forceWrite, ...firestoreOptions } = options

if (quotaExceeded && !forceWrite) {

    const lastQuotaError = localStorage.getItem('lastQuotaError')
    if (lastQuotaError) {
      const timeSinceError = Date.now() - parseInt(lastQuotaError, 10)
      const remainingCooldown = Math.ceil((QUOTA_RETRY_DELAY - timeSinceError) / 1000)
      if (timeSinceError < QUOTA_RETRY_DELAY) {

        console.warn(`⏭️ Skipping Firestore write (quota cooldown - ${remainingCooldown}s remaining): ${collection}/${docId}`)
        console.warn(`💾 Data saved to localStorage only. Use syncBackupToFirestore() after quota resets.`)

        try {
          localStorage.setItem(storageKey, JSON.stringify({
            data,
            timestamp: new Date().toISOString(),
            source: 'localStorage'
          }))
        } catch (e) {
          console.warn('Could not save to localStorage backup:', e)
        }
        return false
      } else {

        console.log(`✅ Quota cooldown expired - resuming Firestore writes`)
        quotaExceeded = false
        localStorage.removeItem('lastQuotaError')
      }
    }
  }

if (!forceWrite) {
    try {
      const existingBackup = localStorage.getItem(storageKey)
      if (existingBackup) {
        const parsed = JSON.parse(existingBackup)

        const existingDataStr = JSON.stringify(parsed.data)
        const newDataStr = JSON.stringify(data)
        if (existingDataStr === newDataStr && parsed.source === 'firestore') {

          console.log(`⏭️ Skipping Firestore write (no changes detected): ${collection}/${docId}`)
          return true
        } else if (existingDataStr === newDataStr && parsed.source === 'localStorage') {

          console.log(`🔄 Retrying Firestore write (data unchanged but not synced): ${collection}/${docId}`)
        }
      }
    } catch (e) {

      console.warn('Data comparison failed, proceeding with write:', e)
    }
  }

try {
    localStorage.setItem(storageKey, JSON.stringify({
      data,
      timestamp: new Date().toISOString(),
      source: 'localStorage'
    }))
  } catch (e) {
    console.warn('Could not save to localStorage backup:', e)
  }

try {

const shouldMerge = firestoreOptions.merge === true
    const finalOptions = shouldMerge ? { merge: true } : {}

    console.log(`📤 Attempting Firestore write: ${collection}/${docId}`, {
      hasMerge: shouldMerge,
      forceWrite: forceWrite || false,
      dataKeys: Object.keys(data || {}),
      studentsCount: data?.students?.length || 0,
      enrollsCount: Object.keys(data?.enrolls || {}).length,
      enrollsDetails: data?.enrolls ? Object.keys(data.enrolls).map(key => ({
        subject: key,
        studentCount: (data.enrolls[key] || []).length
      })) : []
    })
    const docRef = doc(db, collection, docId)

await setDoc(docRef, data, finalOptions)

try {
      localStorage.setItem(storageKey, JSON.stringify({
        data,
        timestamp: new Date().toISOString(),
        source: 'firestore'
      }))
    } catch (e) {

    }

quotaExceeded = false
    localStorage.removeItem('lastQuotaError')

    console.log(`✅ Successfully saved to Firestore: ${collection}/${docId}`)
    return true
  } catch (error) {

    console.error(`❌ Firestore write failed for ${collection}/${docId}:`, error.message)
    console.error(`💾 Data saved to localStorage backup only`)

if (error.code === 'resource-exhausted' || error.message?.includes('quota') || error.message?.includes('Quota')) {
      console.warn('⚠️ Firestore quota exceeded - data saved to localStorage only')
      console.warn('💡 Tip: Use syncBackupToFirestore() after quota resets to sync pending data')
      quotaExceeded = true
      localStorage.setItem('lastQuotaError', Date.now().toString())
    } else {

      console.warn(`Error details:`, error.code, error.message)
    }

    return false
  }
}

export function getBackupKeys(collection) {
  const prefix = `${BACKUP_PREFIX}${collection}_`
  const keys = []

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) {
        const docId = key.replace(prefix, '')
        keys.push(docId)
      }
    }
  } catch (error) {
    console.warn('Could not read backup keys:', error)
  }

  return keys
}

export async function syncBackupToFirestore(collection, docId) {
  const storageKey = `${BACKUP_PREFIX}${collection}_${docId}`
  const backup = getFromBackup(storageKey)

  if (!backup) {
    return false
  }

try {
    const docRef = doc(db, collection, docId)
    const snap = await getDoc(docRef)
    if (snap.exists()) {
      const existingData = snap.data()

      if (JSON.stringify(existingData) === JSON.stringify(backup)) {
        console.log(`⏭️ Skipping sync (data unchanged): ${collection}/${docId}`)

        try {
          localStorage.setItem(storageKey, JSON.stringify({
            data: backup,
            timestamp: new Date().toISOString(),
            source: 'firestore'
          }))
        } catch (e) {

        }
        return true
      }
    }
  } catch (error) {

    console.warn(`Could not check existing data before sync: ${error.message}`)
  }

  try {
    const docRef = doc(db, collection, docId)
    await setDoc(docRef, backup, { merge: true })
    console.log(`✅ Synced backup to Firestore: ${collection}/${docId}`)

try {
      localStorage.setItem(storageKey, JSON.stringify({
        data: backup,
        timestamp: new Date().toISOString(),
        source: 'firestore'
      }))
    } catch (e) {

    }

quotaExceeded = false
    localStorage.removeItem('lastQuotaError')

    return true
  } catch (error) {
    console.warn(`Failed to sync backup to Firestore: ${collection}/${docId}`, error)

if (error.code === 'resource-exhausted' || error.message?.includes('quota') || error.message?.includes('Quota')) {
      quotaExceeded = true
      localStorage.setItem('lastQuotaError', Date.now().toString())
    }

    return false
  }
}

export function isQuotaExceeded() {
  return quotaExceeded
}

export function resetQuotaStatus() {
  quotaExceeded = false
  localStorage.removeItem('lastQuotaError')
  console.log('✅ Quota status reset - Firestore writes enabled')
}

export function getQuotaStatus() {
  const lastQuotaError = localStorage.getItem('lastQuotaError')
  if (!lastQuotaError) {
    return {
      exceeded: quotaExceeded,
      cooldownActive: false,
      cooldownRemaining: 0
    }
  }

  const timeSinceError = Date.now() - parseInt(lastQuotaError, 10)
  const cooldownActive = timeSinceError < QUOTA_RETRY_DELAY
  const cooldownRemaining = Math.max(0, Math.ceil((QUOTA_RETRY_DELAY - timeSinceError) / 1000))

  return {
    exceeded: quotaExceeded,
    cooldownActive,
    cooldownRemaining,
    lastErrorTime: new Date(parseInt(lastQuotaError, 10)).toISOString()
  }
}

