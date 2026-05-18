export interface AuthUser {
  name: string;
  email: string;
}

interface StoredUser extends AuthUser {
  password: string;
}

const USERS_KEY = "pitchPilotUsers";
const SESSION_KEY = "pitchPilotSession";

function getStoredUsers(): StoredUser[] {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentUser(): AuthUser | null {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
}

export function signUp(name: string, email: string, password: string): AuthUser {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getStoredUsers();

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error("An account already exists with this email.");
  }

  const user = { name: name.trim(), email: normalizedEmail, password };
  saveStoredUsers([...users, user]);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email }));

  return { name: user.name, email: user.email };
}

export function login(email: string, password: string): AuthUser {
  const normalizedEmail = email.trim().toLowerCase();
  const user = getStoredUsers().find(
    (storedUser) => storedUser.email === normalizedEmail && storedUser.password === password
  );

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const sessionUser = { name: user.name, email: user.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  return sessionUser;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function deleteAccount(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getStoredUsers().filter((user) => user.email !== normalizedEmail);
  saveStoredUsers(users);
  localStorage.removeItem(`pitchDecks:${normalizedEmail}`);

  const currentUser = getCurrentUser();
  if (currentUser?.email === normalizedEmail) {
    logout();
  }
}
