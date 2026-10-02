//Tipos (plantillas para asegurar la info del usuario)
export interface User {
    id: string;
    fullName: string;
    email: string;
    passwordHash: string;
}

export interface UserSession {
    user: Omit<User, 'passwordHash'>;
    token: string;
}

export interface AppDatabase {
    users: User[];
    currentSession: UserSession | null;
    balance: number;
}