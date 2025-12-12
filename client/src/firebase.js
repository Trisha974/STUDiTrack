
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged as firebaseOnAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs } from 'firebase/firestore'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
]

const missingVars = requiredEnvVars.filter(key => !import.meta.env[key])
if (missingVars.length > 0) {
  console.error('❌ Missing Firebase environment variables:', missingVars.join(', '))
  console.error('💡 Please check your .env file in client/ directory')
}

let app
try {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined') {
    const errorMsg = '❌ CRITICAL: Firebase API key is missing. Please set VITE_FIREBASE_API_KEY in Vercel environment variables.'
    console.error(errorMsg)
    if (typeof document !== 'undefined') {
      document.body.innerHTML = `
        <div style="padding: 40px; font-family: Arial; text-align: center; max-width: 800px; margin: 50px auto;">
          <h1 style="color: #7b1113; margin-bottom: 20px;">⚠️ Configuration Error</h1>
          <p style="font-size: 18px; margin-bottom: 20px; color: #333;">
            Firebase environment variables are not configured.
          </p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: left; margin: 20px 0;">
            <h3 style="color: #7b1113; margin-top: 0;">Required Environment Variables:</h3>
            <ul style="line-height: 1.8;">
              <li>VITE_FIREBASE_API_KEY</li>
              <li>VITE_FIREBASE_AUTH_DOMAIN</li>
              <li>VITE_FIREBASE_PROJECT_ID</li>
              <li>VITE_FIREBASE_STORAGE_BUCKET</li>
              <li>VITE_FIREBASE_MESSAGING_SENDER_ID</li>
              <li>VITE_FIREBASE_APP_ID</li>
            </ul>
          </div>
          <p style="color: #666; margin-top: 20px;">
            Please add these variables in Vercel Settings → Environment Variables, then redeploy.
          </p>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            See docs/TROUBLESHOOTING_BLANK_PAGE.md for detailed instructions.
          </p>
        </div>
      `
    }
    throw new Error(errorMsg)
  }
  app = initializeApp(firebaseConfig)
  console.log('✅ Firebase initialized successfully')
} catch (error) {
  console.error('❌ Firebase initialization failed:', error)
  if (typeof document !== 'undefined' && !document.body.innerHTML.includes('Configuration Error')) {
    document.body.innerHTML = `
      <div style="padding: 40px; font-family: Arial; text-align: center; max-width: 800px; margin: 50px auto;">
        <h1 style="color: #7b1113; margin-bottom: 20px;">❌ Application Error</h1>
        <p style="font-size: 18px; margin-bottom: 20px; color: #333;">
          Failed to initialize the application.
        </p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: left; margin: 20px 0;">
          <h3 style="color: #7b1113; margin-top: 0;">Error Details:</h3>
          <pre style="white-space: pre-wrap; word-wrap: break-word; color: #666;">${error.message}</pre>
        </div>
        <p style="color: #666; margin-top: 20px;">
          Please check the browser console (F12) for more details.
        </p>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          If this is a configuration issue, see docs/TROUBLESHOOTING_BLANK_PAGE.md
        </p>
      </div>
    `
  }
  throw error
}

let analytics = null
try {
  if (typeof window !== 'undefined') analytics = getAnalytics(app)
} catch (e) {
  analytics = null
}

const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

async function registerWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
}

async function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

async function signOutUser() {
  return signOut(auth)
}

async function resetPassword(email) {
  return sendPasswordResetEmail(auth, email)
}

function onAuthStateChanged(callback) {
  return firebaseOnAuthStateChanged(auth, callback)
}

async function saveUserProfile(uid, profile) {

  const userDoc = doc(db, 'users', uid)
  await setDoc(userDoc, { ...profile, updatedAt: new Date().toISOString() }, { merge: true })
  return (await getDoc(userDoc)).data()
}

async function getUserProfile(uid) {
  const userDoc = doc(db, 'users', uid)
  const snap = await getDoc(userDoc)
  return snap.exists() ? snap.data() : null
}

async function saveDashboardData(uid, data) {
  const col = collection(db, 'users', uid, 'dashboard')
  const docRef = await addDoc(col, { ...data, createdAt: new Date().toISOString() })
  return docRef.id
}

async function getDashboardData(uid) {
  const col = collection(db, 'users', uid, 'dashboard')
  const snap = await getDocs(col)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

async function uploadProfileImage(uid, file) {

  const ref = storageRef(storage, `profiles/${uid}/${file.name}`)
  const snapshot = await uploadBytes(ref, file)
  const url = await getDownloadURL(snapshot.ref)
  return url
}

export {
  app,
  analytics,
  auth,
  db,
  storage,
  registerWithEmail,
  signIn,
  signOutUser,
  resetPassword,
  onAuthStateChanged,
  saveUserProfile,
  getUserProfile,
  saveDashboardData,
  getDashboardData,
  uploadProfileImage,
}
