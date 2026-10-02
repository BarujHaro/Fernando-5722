//Se impoartan tipos e interfaces definidos
import type { AppDatabase, User, UserSession } from '../types/types';

// Clave única que se usará para guardar y buscar los datos en el LocalStorage del navegador
const STORAGE_KEY = 'snail_bet_db_v1';

// Estado inicial de la base de datos cuando la aplicación se ejecuta por primera vez
const initialDatabase: AppDatabase = {
  users: [],             // Lista de usuarios vacía
  currentSession: null,  // Sin sesión activa al inicio
  balance: 0,            // Saldo inicial en cero
};


/**
 * Servicio encargado de gestionar la persistencia de datos de la aplicación
 * simulando una base de datos utilizando el LocalStorage del navegador.
 */
class StorageService{

    /*
    Metodo privado para obtener estado de la base de datos de LS
    si no existe o esta corrupta, la incializacion con valores por defecto
    */
    private _getDB(): AppDatabase {
        const data = localStorage.getItem(STORAGE_KEY);
        if(!data) {
            this._saveDB(initialDatabase);
            return initialDatabase;
        }
        try{
            return JSON.parse(data) as AppDatabase;
        }catch(error){
            console.error("Error parseando localstorage ", error);
            this._saveDB(initialDatabase);
            return initialDatabase;
        }
    }

    /**
     * Método privado para sobrescribir y actualizar LocalStorage con el nuevo estado de la base de datos.
     * Convierte el objeto de TypeScript a una cadena de texto (JSON).
     */
    private _saveDB(db: AppDatabase): void{
        localStorage.setItem(STORAGE_KEY, JSON.stringify(db));    
    }


    /**
     * Registra un nuevo usuario en el sistema.
     * returns `true` si el registro fue exitoso, `false` si el correo ya estaba registrado.
     */
    registerUser(newUser: User): boolean {
        const db = this._getDB();
        // Verifica si ya existe algún usuario con el mismo correo electrónico
        const userExists = db.users.some(u => u.email === newUser.email);
        
        if(userExists) return false;

         // Agrega el nuevo usuario a la lista, guarda los cambios y confirma el éxito
        db.users.push(newUser);
        this._saveDB(db);
        return true;
    }

    /**
     * Autentica a un usuario comparando su correo y contraseña encriptada (hash).
     * returns La sesión del usuario (`UserSession`) si las credenciales son correctas, o `null` si falla.
     */
    loginUser(email: string, passwordHash: string): UserSession | null {
        const db =this._getDB();
        const user = db.users.find(u => u.email === email && u.passwordHash === passwordHash);

        if(!user) return null;

        // Crea el objeto de sesión omitiendo la contraseña (passwordHash) por seguridad
        const session: UserSession = {
            user: {id: user.id, fullName: user.fullName, email: user.email},
            // Genera un token simulado usando la fecha/hora actual
            token: `simulated-jwt-${Date.now()}`,
        };

        // Guarda la sesión en el estado global
        db.currentSession = session;

        this._saveDB(db);
        return session;
    }

    //Cierra la sesión del usuario actual borrando sus datos de `currentSession`.
    
    logout(): void{
        const db = this._getDB();
        db.currentSession = null;
        this._saveDB(db);
    }

    getCurrentSession(): UserSession | null {
        return this._getDB().currentSession;
    }

    getBalance(): number {
        return this._getDB().balance;
    }

        /**
     * Modifica el saldo actual sumando o restando un monto.
     * param amount Cantidad a cambiar (positivo para depósitos, negativo para retiros o apuestas).
     * throws Error si el retiro deja la cuenta en números negativos.
     * returns El nuevo saldo actualizado.
     */
    updateBalance(amount: number): number {
        const db = this._getDB();
        if (db.balance + amount < 0) {
        throw new Error("Saldo insuficiente para esta operación.");
        }
        db.balance += amount;
        this._saveDB(db);
        return db.balance;
    }

    saveCardData(cardData: {number: string; cvv: string;}): void {
        localStorage.setItem('snailpay_last_card', JSON.stringify(cardData));
    }


}

export const storageService = new StorageService();