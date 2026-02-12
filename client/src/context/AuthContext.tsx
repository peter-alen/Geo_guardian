import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

// Define User type on frontend
export interface User {
    _id?: string;
    name: string;
    email: string;
    vehicleType: 'car' | 'heavy' | 'emergency' | 'walk' | 'two-wheeler';
    role: 'user' | 'admin';
}

interface AuthContextType {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('geo_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('geo_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('geo_user');
    };

    const updateUser = (updates: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('geo_user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
