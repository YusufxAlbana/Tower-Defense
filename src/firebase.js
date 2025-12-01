import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBrSTR6OyNvwzLGPpm3dA3rW-pz6PZSlqU",
  authDomain: "tower-defense-785bd.firebaseapp.com",
  projectId: "tower-defense-785bd",
  storageBucket: "tower-defense-785bd.firebasestorage.app",
  messagingSenderId: "129718667702",
  appId: "1:129718667702:web:7cf07310a659679fad5917",
  measurementId: "G-RJK7LVSVEW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Simple hash function for password (for demo purposes)
const hashPassword = (password) => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

// ==================== AUTH FUNCTIONS ====================

// Register new user with username and password
export const registerUser = async (username, password) => {
  try {
    // Check if username already exists
    const usersRef = collection(db, "players");
    const q = query(usersRef, where("username", "==", username.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { success: false, error: 'Username already taken!' };
    }

    // Create user document
    const odId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const hashedPassword = hashPassword(password);
    
    await setDoc(doc(db, "players", odId), {
      odId: odId,
      username: username.toLowerCase(),
      displayName: username,
      password: hashedPassword,
      coins: 0,
      unlockedTowers: ['ARCHER', 'CANNON', 'ICE'],
      activeDeck: ['ARCHER', 'CANNON', 'ICE'],
      totalGamesPlayed: 0,
      highestWave: 0,
      totalKills: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Save to localStorage
    localStorage.setItem('td_user_id', odId);
    localStorage.setItem('td_username', username);
    
    return { success: true, odId, username };
  } catch (error) {
    console.error("Register error:", error);
    return { success: false, error: error.message };
  }
};

// Login user with username and password
export const loginUser = async (username, password) => {
  try {
    const usersRef = collection(db, "players");
    const q = query(usersRef, where("username", "==", username.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: false, error: 'User not found!' };
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const hashedPassword = hashPassword(password);
    
    if (userData.password !== hashedPassword) {
      return { success: false, error: 'Wrong password!' };
    }
    
    // Save to localStorage
    localStorage.setItem('td_user_id', userData.odId);
    localStorage.setItem('td_username', userData.displayName);
    
    return { success: true, odId: userData.odId, data: userData };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: error.message };
  }
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem('td_user_id');
  localStorage.removeItem('td_username');
  return { success: true };
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const odId = localStorage.getItem('td_user_id');
    if (!odId) return { success: false, error: 'Not logged in!' };
    
    const docRef = doc(db, "players", odId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return { success: false, error: 'User not found!' };
    }
    
    const userData = docSnap.data();
    const hashedCurrent = hashPassword(currentPassword);
    
    if (userData.password !== hashedCurrent) {
      return { success: false, error: 'Current password is wrong!' };
    }
    
    const hashedNew = hashPassword(newPassword);
    await setDoc(docRef, { password: hashedNew, updatedAt: new Date().toISOString() }, { merge: true });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get current user
export const getCurrentUser = () => {
  const odId = localStorage.getItem('td_user_id');
  const username = localStorage.getItem('td_username');
  if (odId && username) {
    return { odId, username };
  }
  return null;
};

// Check if logged in
export const isLoggedIn = () => {
  return !!localStorage.getItem('td_user_id');
};

// ==================== PLAYER DATA FUNCTIONS ====================

// Save player data to Firestore
export const savePlayerData = async (data) => {
  try {
    const odId = localStorage.getItem('td_user_id');
    if (!odId) return { success: false, error: 'Not logged in!' };
    
    await setDoc(doc(db, "players", odId), {
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    return { success: true };
  } catch (error) {
    console.error("Error saving player data:", error);
    return { success: false, error: error.message };
  }
};

// Load player data from Firestore
export const loadPlayerData = async () => {
  try {
    const odId = localStorage.getItem('td_user_id');
    if (!odId) return { success: false, error: 'Not logged in!' };
    
    const docRef = doc(db, "players", odId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: 'No data found' };
    }
  } catch (error) {
    console.error("Error loading player data:", error);
    return { success: false, error: error.message };
  }
};
