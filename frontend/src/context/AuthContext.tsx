import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User, Company, SubscriptionPlan, Notification } from '../types';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  plan: SubscriptionPlan;
  activeModule: 'overview' | 'hrm' | 'crm' | 'settings';
  activeSubmenu: string;
  isLoading: boolean;
  notifications: Notification[];
  unreadCount: number;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchModule: (module: 'overview' | 'hrm' | 'crm' | 'settings') => void;
  setActiveSubmenu: (submenu: string) => void;
  switchDemoPersona: (personaEmail: string) => Promise<void>;
  switchCompany: (companyId: number) => Promise<void>;
  updateSubscriptionPlan: (newPlan: SubscriptionPlan) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan>('enterprise');
  const [activeModule, setActiveModule] = useState<'overview' | 'hrm' | 'crm' | 'settings'>('overview');
  const [activeSubmenu, setActiveSubmenu] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initial load check
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const res = await api.get('/me');
          if (res.data.success && res.data.data.user) {
            setUser(res.data.data.user);
            setCompany(res.data.data.company);
            setPlan(res.data.data.company?.plan || 'enterprise');
            fetchNotifications();
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Session expired or error fetching me:', e);
        }
      }
      
      // Auto-login with default super_admin if no session for immediate usability
      await autoLoginAdmin();
    };

    initAuth();
  }, []);

  const autoLoginAdmin = async () => {
    try {
      const res = await api.post('/login', {
        email: 'admin@innowise.com',
        password: 'password123',
      });
      if (res.data.success) {
        localStorage.setItem('auth_token', res.data.data.token);
        setUser(res.data.data.user);
        setCompany(res.data.data.company);
        setPlan(res.data.data.plan || 'enterprise');
        fetchNotifications();
      }
    } catch (e) {
      console.error('Auto login error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password = 'password123') => {
    setIsLoading(true);
    try {
      const res = await api.post('/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('auth_token', res.data.data.token);
        setUser(res.data.data.user);
        setCompany(res.data.data.company);
        setPlan(res.data.data.plan || 'enterprise');
        fetchNotifications();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Login error:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      console.warn('Logout api error:', e);
    }
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const switchDemoPersona = async (personaEmail: string) => {
    setIsLoading(true);
    await login(personaEmail, 'password123');
    // Set appropriate starting module for the persona
    if (personaEmail.includes('hrm')) {
      setActiveModule('hrm');
      setActiveSubmenu('employees');
    } else if (personaEmail.includes('sales') || personaEmail.includes('crm')) {
      setActiveModule('crm');
      setActiveSubmenu('pipeline');
    } else if (personaEmail.includes('engineer')) {
      setActiveModule('hrm');
      setActiveSubmenu('ess');
    } else {
      setActiveModule('overview');
      setActiveSubmenu('dashboard');
    }
  };

  const switchCompany = async (companyId: number) => {
    try {
      const res = await api.post('/switch-company', { company_id: companyId });
      if (res.data.success) {
        setCompany(res.data.data.company);
        setPlan(res.data.data.plan);
        // If company plan changed and current module is not allowed, route to overview
        if (res.data.data.plan === 'hrm_only' && activeModule === 'crm') {
          setActiveModule('hrm');
        } else if (res.data.data.plan === 'crm_only' && activeModule === 'hrm') {
          setActiveModule('crm');
        }
      }
    } catch (e) {
      console.error('Switch company error:', e);
    }
  };

  const updateSubscriptionPlan = async (newPlan: SubscriptionPlan) => {
    try {
      const res = await api.post('/companies/subscription', { plan: newPlan });
      if (res.data.success) {
        setPlan(newPlan);
        if (company) {
          setCompany({ ...company, plan: newPlan });
        }
      }
    } catch (e) {
      console.error('Subscription update error:', e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (e) {
      console.warn('Notifications fetch error:', e);
    }
  };

  const markNotificationRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.warn('Mark read error:', e);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        plan,
        activeModule,
        activeSubmenu,
        isLoading,
        notifications,
        unreadCount,
        login,
        logout,
        switchModule: (mod) => {
          setActiveModule(mod);
          if (mod === 'overview') setActiveSubmenu('dashboard');
          if (mod === 'hrm') setActiveSubmenu('employees');
          if (mod === 'crm') setActiveSubmenu('pipeline');
          if (mod === 'settings') setActiveSubmenu('general');
        },
        setActiveSubmenu,
        switchDemoPersona,
        switchCompany,
        updateSubscriptionPlan,
        fetchNotifications,
        markNotificationRead,
      }}
    >
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
