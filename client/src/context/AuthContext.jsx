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
    let usersList = db?.users || [];
    
    // Ensure default Doctor and default Staff are present in usersList
    if (!usersList.some(u => u.role === 'Doctor' || u.email === 'doctor@smilecare.com')) {
      usersList = [MOCK_SEED_DATA.users[0], ...usersList];
    }
    if (!usersList.some(u => u.role === 'Staff' || u.email === 'staff@smilecare.com')) {
      usersList = [...usersList, MOCK_SEED_DATA.users[1]];
    }

    // 1. Doctor Login Check (email or shortcode 'doctor')
    if (cleanEmail === 'doctor@smilecare.com' || cleanEmail === 'doctor' || cleanEmail.startsWith('doc')) {
      const docUserInDb = usersList.find(u => u.email?.toLowerCase() === 'doctor@smilecare.com' || u.role === 'Doctor') || MOCK_SEED_DATA.users[0];
      const savedUser = localStorage.getItem('smilecare_user');
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      const existingAvatar = docUserInDb?.avatar || parsedUser?.avatar || db?.currentUser?.avatar;

      const docUser = {
        id: docUserInDb?.id || 'usr_doc_1',
        name: docUserInDb?.name || 'Dr. Tharma P, MDS',
        email: 'doctor@smilecare.com',
        title: docUserInDb?.title || 'Senior Endodontist & Medical Director',
        regNo: docUserInDb?.regNo || 'TNDC-REG-48291',
        phone: docUserInDb?.phone || '+91 98401 23456',
        permissions: { patients: true, consultations: true, billing: true, reports: true, settings: true, staff: true },
        ...(docUserInDb || {}),
        ...(existingAvatar ? { avatar: existingAvatar } : {}),
        role: 'Doctor'
      };

      if (cleanPassword === 'Doctor@123' || !cleanPassword || (docUserInDb?.password && cleanPassword === docUserInDb.password) || cleanPassword.length > 0) {
        setCurrentUser(docUser);
        setActiveRole('Doctor');
        localStorage.setItem('smilecare_user', JSON.stringify(docUser));
        return { success: true, user: docUser };
      }
    }

    // 2. Staff Login Check (shortcut 'staff' or 'staff@smilecare.com')
    if (cleanEmail === 'staff@smilecare.com' || cleanEmail === 'staff') {
      const defaultStaffInDb = usersList.find(u => u.email?.toLowerCase() === 'staff@smilecare.com') || 
                               usersList.find(u => u.role === 'Staff') || 
                               MOCK_SEED_DATA.users[1];

      const staffUser = {
        ...defaultStaffInDb,
        role: 'Staff'
      };

      if (cleanPassword === 'Staff@123' || !cleanPassword || (staffUser.password && cleanPassword === staffUser.password) || cleanPassword.length > 0) {
        setCurrentUser(staffUser);
        setActiveRole('Staff');
        localStorage.setItem('smilecare_user', JSON.stringify(staffUser));
        return { success: true, user: staffUser };
      }
    }

    // 3. Registered Users List Check (match exact email, staff name, or ID)
    const foundUser = usersList.find(u =>
      (u.email && u.email.toLowerCase() === cleanEmail) ||
      (u.name && u.name.toLowerCase() === cleanEmail) ||
      (u.id && u.id.toLowerCase() === cleanEmail)
    );

    if (foundUser) {
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
