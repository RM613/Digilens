import { User } from '../types';

const USERS_KEY = 'digitlens_users';
const SESSION_KEY = 'digitlens_session';
const OTPS_KEY = 'digitlens_otps';

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const usersStr = localStorage.getItem(USERS_KEY);
    const users = usersStr ? JSON.parse(usersStr) : [];
    
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    const sessionUser = { email: user.email, name: user.name };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  signup: async (name: string, email: string, password: string): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (!name || !email || !password) {
        throw new Error('All fields are required');
    }

    const usersStr = localStorage.getItem(USERS_KEY);
    const users = usersStr ? JSON.parse(usersStr) : [];
    
    const existingUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      if (existingUser.name.toLowerCase() === name.toLowerCase()) {
         throw new Error('Account with this Name and Email already exists.');
      }
      throw new Error('Email is already registered.');
    }

    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const sessionUser = { email, name };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  requestPasswordReset: async (email: string): Promise<void> => {
    // Simulate network delay (slightly longer for email service)
    await new Promise(resolve => setTimeout(resolve, 1500));

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('No account found with this email');
    }

    // Generate a 6-digit mock OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 5 minute expiration
    const otps = JSON.parse(localStorage.getItem(OTPS_KEY) || '{}');
    otps[email.toLowerCase()] = {
      code: otp,
      expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    };
    localStorage.setItem(OTPS_KEY, JSON.stringify(otps));

    // SIMULATE EMAIL SENDING
    // In a real application, this would call a backend endpoint or an email service API.
    // For this frontend-only demo, we log the email content to the console.
    // ... inside requestPasswordReset function ...

  try {
    const response = await fetch('http://localhost:5000/api/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email via server');
    }
  } catch (error) {
    console.error("Backend connection failed, falling back to console log for demo");
  // Keep the console log as a fallback if the server isn't running
    console.log(`Fallback OTP for ${email}: ${otp}`);
  }
  },

  resetPassword: async (email: string, otp: string, newPassword: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (!newPassword || newPassword.length < 4) {
      throw new Error('Password must be at least 4 characters');
    }

    const otps = JSON.parse(localStorage.getItem(OTPS_KEY) || '{}');
    const storedOtp = otps[email.toLowerCase()];

    if (!storedOtp) {
      throw new Error('No reset request found for this email');
    }

    if (storedOtp.code !== otp) {
      throw new Error('Invalid OTP code');
    }

    if (Date.now() > storedOtp.expires) {
      throw new Error('OTP has expired. Please request a new one.');
    }

    // Update the password
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
    
    if (userIndex === -1) {
       throw new Error('User account not found');
    }

    users[userIndex].password = newPassword;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Cleanup used OTP
    delete otps[email.toLowerCase()];
    localStorage.setItem(OTPS_KEY, JSON.stringify(otps));
  },

  getCurrentUser: (): User | null => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  }
};