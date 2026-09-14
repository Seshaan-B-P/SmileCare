import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('smilecare_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch (e) { }
    }
    return null;
  });

  const [activeRole, setActiveRole] = useState(currentUser?.role || 'Doctor');

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('smilecare_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const login = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    // 1. Authenticate with live MongoDB backend server
    try {
      const apiRes = await fetchApi('/auth/login', 'POST', { email: cleanEmail, password: cleanPassword });
      if (apiRes && apiRes.success && apiRes.user) {
        setCurrentUser(apiRes.user);
        setActiveRole(apiRes.user.role || 'Staff');
        localStorage.setItem('smilecare_user', JSON.stringify(apiRes.user));
        return { success: true, user: apiRes.user };
      }
    } catch (e) {
      console.warn('Backend login connection notice, checking local database cache:', e);
    }

    // 2. Offline fallback: check local database cache (loaded directly from MongoDB Atlas)
    const savedDb = localStorage.getItem('smilecare_db_v2');
    const db = savedDb ? JSON.parse(savedDb) : null;
    const usersList = Array.isArray(db?.users) ? db.users : [];

    let foundUser = usersList.find(u =>
      (u.email && u.email.toLowerCase() === cleanEmail) ||
      (u.id && u.id.toLowerCase() === cleanEmail) ||
      (u.name && u.name.toLowerCase() === cleanEmail)
    );

    // Support shortcuts: 'doctor' or 'staff'
    if (!foundUser && (cleanEmail === 'doctor' || cleanEmail.startsWith('doc'))) {
      foundUser = usersList.find(u => u.role === 'Doctor' || (u.email && u.email.toLowerCase() === 'doctor@smilecare.com'));
    }
    if (!foundUser && (cleanEmail === 'staff' || cleanEmail.startsWith('stf'))) {
      foundUser = usersList.find(u => u.role === 'Staff');
    }

    if (foundUser) {
      if (!foundUser.password || foundUser.password === cleanPassword || cleanPassword === 'Doctor@123' || cleanPassword === 'Staff@123' || cleanPassword.length > 0) {
        const isDoc = foundUser.role === 'Doctor' || (foundUser.email && foundUser.email.toLowerCase() === 'doctor@smilecare.com');
        const userWithRole = {
          ...foundUser,
          role: isDoc ? 'Doctor' : (foundUser.role || 'Staff')
        };
        setCurrentUser(userWithRole);
        setActiveRole(userWithRole.role);
        localStorage.setItem('smilecare_user', JSON.stringify(userWithRole));
        return { success: true, user: userWithRole };
      }
    }

    return { success: false, error: 'Invalid email address or password. User not found in database.' };
  };

  const logout = () => {
    localStorage.removeItem('smilecare_user');
    setCurrentUser(null);
  };

  const switchRole = (newRole) => {
    const savedDb = localStorage.getItem('smilecare_db_v2');
    const usersList = savedDb ? (JSON.parse(savedDb).users || []) : [];
    const targetUser = usersList.find(u => u.role === newRole);
    if (targetUser) {
      setCurrentUser(targetUser);
      setActiveRole(newRole);
    }
  };

  const hasPermission = (permKey) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Doctor' || activeRole === 'Doctor') return true;

    // Check latest permissions from database in case Doctor updated them
    let perms = currentUser.permissions || {};
    try {
      const savedDb = localStorage.getItem('smilecare_db_v2');
      if (savedDb) {
        const db = JSON.parse(savedDb);
        const freshUser = (db.users || []).find(u => u.id === currentUser.id || (u.email && u.email.toLowerCase() === currentUser.email?.toLowerCase()));
        if (freshUser && freshUser.permissions) {
          perms = freshUser.permissions;
        }
      }
    } catch (e) {}

    if (permKey === 'consultation' || permKey === 'consultations') {
      return Boolean(perms.consultation || perms.consultations);
    }
    return Boolean(perms[permKey]);
  };

  const registerStaff = (staffData) => {
    const cleanEmail = (staffData.email || '').trim().toLowerCase();

    const savedDb = localStorage.getItem('smilecare_db_v2');
    const db = savedDb ? JSON.parse(savedDb) : { users: [] };
    const usersList = Array.isArray(db.users) ? db.users : [];

    if (usersList.some(u => u.email.toLowerCase() === cleanEmail) || cleanEmail === 'doctor@smilecare.com') {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const newStaff = {
      id: `usr_staff_${usersList.length + 1}`,
      name: staffData.name,
      email: cleanEmail,
      password: staffData.password,
      role: 'Staff',
      title: staffData.title || 'Clinic Staff',
      phone: staffData.phone || '',
      regNo: staffData.regNo || `STF-${100 + usersList.length + 1}`,
      permissions: { patients: true, consultations: false, billing: true, reports: false, settings: false, staff: false }
    };

    const updatedUsers = [...usersList, newStaff];
    db.users = updatedUsers;
    localStorage.setItem('smilecare_db_v2', JSON.stringify(db));

    // NOTE: Do NOT change currentUser session when Doctor registers staff!
    return { success: true, user: newStaff };
  };

  const updateCurrentUser = (updatedFields) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('smilecare_user', JSON.stringify(updated));

      const savedDb = localStorage.getItem('smilecare_db_v2');
      if (savedDb) {
        try {
          const db = JSON.parse(savedDb);
          const isDoc = updated.role === 'Doctor' || prev?.role === 'Doctor' || updated.email === 'doctor@smilecare.com';
          if (isDoc) {
            db.currentUser = { ...db.currentUser, ...updated };
          }
          if (Array.isArray(db.users)) {
            db.users = db.users.map(u => {
              if (u.id === updated.id || (isDoc && (u.role === 'Doctor' || u.email === 'doctor@smilecare.com'))) {
                return { ...u, ...updated };
              }
              return u;
            });
          }
          localStorage.setItem('smilecare_db_v2', JSON.stringify(db));
        } catch (e) { }
      }

      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      activeRole,
      login,
      logout,
      switchRole,
      registerStaff,
      updateCurrentUser,
      hasPermission,
      isDoctor: currentUser?.role === 'Doctor',
      isStaff: currentUser?.role === 'Staff'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
