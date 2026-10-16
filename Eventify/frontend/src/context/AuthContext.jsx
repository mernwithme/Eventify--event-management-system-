import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            return userInfo ? JSON.parse(userInfo) : null;
        } catch (e) {
            console.error('Failed to parse user info from localStorage', e);
            return null;
        }
    });
    const [loading] = useState(false);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            if (data.otpRequired) {
                return {
                    success: true,
                    otpRequired: true,
                    email: data.email,
                    message: data.message,
                    devOtp: data.devOtp
                };
            }
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const verifyLoginOtp = async (email, otp) => {
        try {
            const { data } = await axios.post(`${API_URL}/api/auth/verify-login-otp`, { email, otp });
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Verification failed' };
        }
    };

    const resendLoginOtp = async (email) => {
        try {
            const { data } = await axios.post(`${API_URL}/api/auth/resend-login-otp`, { email });
            return {
                success: true,
                message: data.message || 'Verification code resent successfully',
                devOtp: data.devOtp
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to resend verification code'
            };
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, verifyLoginOtp, resendLoginOtp, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
