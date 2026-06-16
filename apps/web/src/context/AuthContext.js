import { jsx as _jsx } from "react/jsx-runtime";
import axios from 'axios';
import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../lib/api';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem('codequest.user');
        return raw ? JSON.parse(raw) : null;
    });
    async function persistSession(path, payload) {
        try {
            const { data } = await api.post(path, payload);
            localStorage.setItem('codequest.accessToken', data.accessToken);
            localStorage.setItem('codequest.refreshToken', data.refreshToken);
            localStorage.setItem('codequest.user', JSON.stringify(data.user));
            setUser(data.user);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const apiMessage = error.response?.data?.message;
                if (status === 409) {
                    throw new Error(apiMessage ?? 'Este email já está em uso.');
                }
                if (status === 401) {
                    throw new Error(apiMessage ?? 'Email ou senha inválidos.');
                }
                throw new Error(apiMessage ?? 'Não foi possível concluir a autenticação.');
            }
            throw error;
        }
    }
    const value = useMemo(() => ({
        user,
        login: (email, password) => persistSession('/auth/login', { email, password }),
        register: (name, email, password) => persistSession('/auth/register', { name, email, password }),
        logout: () => {
            localStorage.removeItem('codequest.accessToken');
            localStorage.removeItem('codequest.refreshToken');
            localStorage.removeItem('codequest.user');
            setUser(null);
        },
    }), [user]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
}
export function useAuth() {
    const value = useContext(AuthContext);
    if (!value)
        throw new Error('useAuth must be used within AuthProvider');
    return value;
}
