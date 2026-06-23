export type StudentSession = {
  studentId: string;
  email: string;
  fullName?: string;
  createdAt: string;
};

export type StudentAccount = StudentSession & {
  password: string;
};

const ACCOUNTS_KEY = "safevoice-student-accounts";
const SESSION_KEY = "safevoice-student-session";
const STUDENT_ID_PREFIX = "SV";
const STUDENT_ID_LENGTH = 8;

function parseStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function generateStudentId(existingIds: Set<string>) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const id = Array.from({ length: STUDENT_ID_LENGTH }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
    const candidate = `${STUDENT_ID_PREFIX}-${id}`;
    if (!existingIds.has(candidate)) return candidate;
  }
  return `${STUDENT_ID_PREFIX}-${Math.floor(Date.now() / 1000)}-${Math.floor(Math.random() * 1000)}`;
}

function setStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore write failures
  }
}

export function getStudentAccounts(): StudentAccount[] {
  return parseStorage<StudentAccount[]>(ACCOUNTS_KEY) ?? [];
}

export function saveStudentAccounts(accounts: StudentAccount[]) {
  setStorage(ACCOUNTS_KEY, accounts);
}

export function getCurrentStudent(): StudentSession | null {
  return parseStorage<StudentSession>(SESSION_KEY);
}

export function setCurrentStudent(session: StudentSession) {
  setStorage(SESSION_KEY, session);
}

export function signOutStudent() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validateMzuniEmail(email: string): boolean {
  return /^[^\s@]+@mzuni\.ac\.mw$/i.test(email.trim());
}

export function signUpStudent(payload: {
  email: string;
  password: string;
  fullName?: string;
}): { ok: true; session: StudentSession } | { ok: false; error: string } {
  const email = normalizeEmail(payload.email);
  const password = payload.password;

  if (!validateMzuniEmail(email)) {
    return { ok: false, error: "Email must end with @mzuni.ac.mw." };
  }

  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }

  const accounts = getStudentAccounts();
  if (accounts.some((account) => account.email === email)) {
    return { ok: false, error: "That email is already registered." };
  }

  const existingIds = new Set(accounts.map((account) => account.studentId));
  const studentId = generateStudentId(existingIds);

  const newAccount: StudentAccount = {
    studentId,
    email,
    password,
    fullName: payload.fullName?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  saveStudentAccounts([newAccount, ...accounts]);
  const session = {
    studentId,
    email,
    fullName: newAccount.fullName,
    createdAt: newAccount.createdAt,
  };
  setCurrentStudent(session);
  return { ok: true, session };
}

export function signInStudent(emailRaw: string, password: string): { ok: true; session: StudentSession } | { ok: false; error: string } {
  const email = normalizeEmail(emailRaw);
  const accounts = getStudentAccounts();
  const account = accounts.find((account) => account.email === email);

  if (!account || account.password !== password) {
    return { ok: false, error: "Invalid student email or password." };
  }

  const session = {
    studentId: account.studentId,
    email: account.email,
    fullName: account.fullName,
    createdAt: account.createdAt,
  };
  setCurrentStudent(session);
  return { ok: true, session };
}

export function updateStudentProfile(payload: {
  studentId: string;
  email?: string;
  password?: string;
  fullName?: string;
}): { ok: true; session: StudentSession } | { ok: false; error: string } {
  const accounts = getStudentAccounts();
  const index = accounts.findIndex((account) => account.studentId === payload.studentId);
  if (index === -1) {
    return { ok: false, error: "Student account not found." };
  }

  const updatedEmail = payload.email ? normalizeEmail(payload.email) : accounts[index].email;
  if (!validateMzuniEmail(updatedEmail)) {
    return { ok: false, error: "Email must end with @mzuni.ac.mw." };
  }

  if (payload.password && payload.password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }

  const duplicateEmail = accounts.some(
    (account, i) => i !== index && account.email === updatedEmail,
  );
  if (duplicateEmail) {
    return { ok: false, error: "That email is already in use." };
  }

  const updatedAccount: StudentAccount = {
    ...accounts[index],
    email: updatedEmail,
    fullName: payload.fullName?.trim() || accounts[index].fullName,
    password: payload.password ? payload.password : accounts[index].password,
  };

  accounts[index] = updatedAccount;
  saveStudentAccounts(accounts);

  const session: StudentSession = {
    studentId: updatedAccount.studentId,
    email: updatedAccount.email,
    fullName: updatedAccount.fullName,
    createdAt: updatedAccount.createdAt,
  };
  setCurrentStudent(session);
  return { ok: true, session };
}
