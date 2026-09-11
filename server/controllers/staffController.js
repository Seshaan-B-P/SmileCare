// Controller: Staff Management & RBAC Permissions

export const getStaffMembers = (db) => db.users;

export const createStaffMember = (staffData, db) => {
  const newStaff = {
    id: `usr_staff_${db.users.length + 1}`,
    role: 'Staff',
    ...staffData
  };
  db.users.push(newStaff);
  return newStaff;
};
