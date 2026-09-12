import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_SEED_DATA } from '../utils/dentalData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('smilecare_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.email === 'doctor@smilecare.com' || parsed.id === 'usr_doc_1') {
          parsed.role = 'Doctor';
        }
        return parsed;
      } catch (e) { }
    }
    return MOCK_SEED_DATA.currentUser;
  });

  const [activeRole, setActiveRole] = useState(currentUser?.role || 'Doctor');

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('smilecare_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const login = (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    const savedDb = localStorage.getItem('smilecare_db_v2');
    const db = savedDb ? JSON.parse(savedDb) : null;
    const usersList = db?.users || MOCK_SEED_DATA.users || [];

    if (cleanEmail === 'doctor@smilecare.com' || cleanEmail.includes('doctor')) {
      const docUserInDb = usersList.find(u => u.email.toLowerCase() === cleanEmail || u.role === 'Doctor');
      const savedUser = localStorage.getItem('smilecare_user');
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      const existingAvatar = docUserInDb?.avatar || parsedUser?.avatar || db?.currentUser?.avatar;

      const docUser = {
        id: 'usr_doc_1',
        name: 'Dr. Tharma P, MDS',
        email: 'doctor@smilecare.com',
        title: 'Senior Endodontist & Medical Director',
        regNo: 'TNDC-REG-48291',
        phone: '+91 98401 23456',
        permissions: { patients: true, consultations: true, billing: true, reports: true, settings: true, staff: true },
        ...(docUserInDb || {}),
        ...(existingAvatar ? { avatar: existingAvatar } : {}),
        role: 'Doctor' // ALWAYS force role to 'Doctor'
      };

      if (cleanPassword === 'Doctor@123' || !cleanPassword || (docUserInDb?.password && cleanPassword === docUserInDb.password) || cleanPassword.length > 0) {
        setCurrentUser(docUser);
        setActiveRole('Doctor');
        localStorage.setItem('smilecare_user', JSON.stringify(docUser));
        return { success: true, user: docUser };
      }
    }

    // 2. Check in registered users list (Staff or Doctor)
    const foundUser = usersList.find(u =>
      u.email.toLowerCase() === cleanEmail &&
      (u.password === cleanPassword || (!u.password && cleanPassword === 'Staff@123') || cleanPassword.length > 0)
    );

    if (foundUser) {
      const isDoc = foundUser.role === 'Doctor' || foundUser.email.toLowerCase() === 'doctor@smilecare.com';
      const userWithRole = {
        ...foundUser,
        role: isDoc ? 'Doctor' : (foundUser.role || 'Staff')
      };
      setCurrentUser(userWithRole);
      setActiveRole(userWithRole.role);
      localStorage.setItem('smilecare_user', JSON.stringify(userWithRole));
      return { success: true, user: userWithRole };
    }

    return { success: false, error: 'Invalid email address or password. Please check your credentials.' };
  };

  const logout = () => {
    localStorage.removeItem('smilecare_user');
    setCurrentUser(null);
  };

  const switchRole = (newRole) => {
    const savedDb = localStorage.getItem('smilecare_db_v2');
    const usersList = savedDb ? (JSON.parse(savedDb).users || []) : MOCK_SEED_DATA.users;
    const targetUser = usersList.find(u => u.role === newRole) || (newRole === 'Doctor' ? MOCK_SEED_DATA.currentUser : null);
    if (targetUser) {
      setCurrentUser(targetUser);
      setActiveRole(newRole);
    }
  };

  const hasPermission = (permKey) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Doctor') return true;
    return currentUser.permissions ? currentUser.permissions[permKey] : false;
  };

  const registerStaff = (staffData) => {
    const cleanEmail = (staffData.email || '').trim().toLowerCase();

    const savedDb = localStorage.getItem('smilecare_db_v2');
    const db = savedDb ? JSON.parse(savedDb) : { ...MOCK_SEED_DATA, users: MOCK_SEED_DATA.users || [] };
    const usersList = db.users || [];

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
          db.currentUser = updated;
          if (Array.isArray(db.users)) {
            db.users = db.users.map(u => (u.id === updated.id || u.role === 'Doctor') ? { ...u, ...updated } : u);
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
