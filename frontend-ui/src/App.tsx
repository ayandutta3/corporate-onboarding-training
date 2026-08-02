import React, { useState, useEffect } from 'react';
import { AuthUser } from './types';
import { DEFAULT_BACKEND_URL, checkBackendHealth } from './services/api';
import { Sidebar, NavTab } from './components/Sidebar';
import { LoginScreen } from './components/LoginScreen';
import { SearchDashboard } from './components/SearchDashboard';
import { UploadPortal } from './components/UploadPortal';
import { MonitoringDashboard } from './components/MonitoringDashboard';
import { PolicyHub } from './components/PolicyHub';
import { UserManagementModal } from './components/UserManagementModal';
import { SettingsModal } from './components/SettingsModal';
import { RagasReportView } from './components/RagasReportView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('search');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

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
    <div className="min-h-screen bg-[#050608] text-slate-200 flex font-sans relative overflow-x-hidden">

      {/* Bento radial ambient lighting background */}
      <div className="bento-ambient-bg" />

      {/* Collapsible Left Sidebar */}
      <Sidebar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        isConnected={isConnected}
        isDemoMode={isDemoMode}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Tab Content Container (offset by sidebar width) */}
      <main className={`flex-1 transition-all duration-300 pb-16 ${isSidebarCollapsed ? 'pl-20' : 'pl-64'}`}>
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

        {activeTab === 'ragas_report' && (
          <RagasReportView user={currentUser} backendUrl={backendUrl} />
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
