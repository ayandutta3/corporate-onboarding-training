/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthUser } from './types';
import { DEFAULT_BACKEND_URL, checkBackendHealth } from './services/api';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { SearchDashboard } from './components/SearchDashboard';
import { UploadPortal } from './components/UploadPortal';
import { MonitoringDashboard } from './components/MonitoringDashboard';
import { PolicyHub } from './components/PolicyHub';
import { UserManagementModal } from './components/UserManagementModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'upload' | 'monitoring' | 'policy' | 'users'>('search');

  const [backendUrl, setBackendUrl] = useState<string>(DEFAULT_BACKEND_URL);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Ping backend on boot
  useEffect(() => {
    checkBackendHealth(backendUrl).then((healthy) => {
      setIsConnected(healthy);
      if (healthy) {
        setIsDemoMode(false); // Auto-connect to real local FastAPI backend if online
      }
    });
  }, [backendUrl]);

  const handleLoginSuccess = (user: AuthUser, token: string) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleSwitchUser = (persona: AuthUser) => {
    setCurrentUser(persona);
  };

  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        backendUrl={backendUrl}
        isDemoMode={isDemoMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050608] text-slate-200 flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Bento radial ambient lighting background */}
      <div className="bento-ambient-bg" />

      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        isConnected={isConnected}
        isDemoMode={isDemoMode}
        backendUrl={backendUrl}
      />

      {/* Main Tab Content */}
      <main className="flex-1 pb-16">
        {activeTab === 'search' && (
          <SearchDashboard
            user={currentUser}
            backendUrl={backendUrl}
            isDemoMode={isDemoMode}
          />
        )}

        {activeTab === 'upload' && (
          <UploadPortal
            user={currentUser}
            backendUrl={backendUrl}
            isDemoMode={isDemoMode}
          />
        )}

        {activeTab === 'policy' && (
          <PolicyHub user={currentUser} backendUrl={backendUrl} />
        )}

        {activeTab === 'monitoring' && (
          <MonitoringDashboard
            user={currentUser}
            backendUrl={backendUrl}
            isDemoMode={isDemoMode}
          />
        )}
      </main>

      {/* Admin User Provisioning Modal */}
      <UserManagementModal
        currentUser={currentUser}
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        backendUrl={backendUrl}
        isDemoMode={isDemoMode}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        backendUrl={backendUrl}
        setBackendUrl={setBackendUrl}
        isDemoMode={isDemoMode}
        setIsDemoMode={setIsDemoMode}
        isConnected={isConnected}
        setIsConnected={setIsConnected}
      />
    </div>
  );
}
