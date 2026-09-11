// Controller: Auth & Role Access Control

export const handleLogin = (req, res, db) => {
  const { email, role } = req.body || {};
  const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) || 
    (role === 'Doctor' ? db.currentUser : db.users[1]);

  return { success: true, token: 'mock-jwt-token-994821', user };
};
