export interface User {
  id: string;
  name: string;
  email: string;
  institution: string;
  role: string;
  createdAt: string;
}

const STORAGE_USERS_KEY = 'paperforge_users_db';
const STORAGE_SESSION_KEY = 'paperforge_current_session';

const DEFAULT_USERS: Record<string, { user: User; passwordHash: string }> = {
  'teacher@evalvia.edu': {
    user: {
      id: 'usr_evalvia_01',
      name: 'Dr. Sarah Jenkins',
      email: 'teacher@evalvia.edu',
      institution: 'St. Jude Collegiate Academy',
      role: 'Head of STEM Assessments',
      createdAt: new Date().toISOString(),
    },
    passwordHash: 'password123',
  },
};

function getUsersDB(): Record<string, { user: User; passwordHash: string }> {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USERS;
  }
}

function saveUsersDB(db: Record<string, { user: User; passwordHash: string }>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save users database:', e);
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const session = localStorage.getItem(STORAGE_SESSION_KEY);
    if (session) {
      return JSON.parse(session);
    }
  } catch {}
  return null;
}

export function signIn(email: string, password: string): { success: boolean; user?: User; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const db = getUsersDB();
  const record = db[cleanEmail];

  if (!record) {
    return { success: false, error: 'No account found with this email address.' };
  }

  if (record.passwordHash !== password) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(record.user));
  }

  return { success: true, user: record.user };
}

export function signUp(
  name: string,
  email: string,
  password: string,
  institution?: string,
  role?: string
): { success: boolean; user?: User; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { success: false, error: 'Email and password are required.' };
  }
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  const db = getUsersDB();
  if (db[cleanEmail]) {
    return { success: false, error: 'An account with this email already exists. Please sign in.' };
  }

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: name.trim() || cleanEmail.split('@')[0],
    email: cleanEmail,
    institution: institution?.trim() || 'Department of Examinations & Assessment',
    role: role?.trim() || 'STEM Educator',
    createdAt: new Date().toISOString(),
  };

  db[cleanEmail] = {
    user: newUser,
    passwordHash: password,
  };

  saveUsersDB(db);

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(newUser));
  }

  return { success: true, user: newUser };
}

export function signOut() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  }
}
