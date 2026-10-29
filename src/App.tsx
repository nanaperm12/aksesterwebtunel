import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Customer Tabs
import { OverviewTab } from './components/customer/OverviewTab';
import { WebTunnelsTab } from './components/customer/WebTunnelsTab';
import { PortTunnelsTab } from './components/customer/PortTunnelsTab';
import { CustomDomainsTab } from './components/customer/CustomDomainsTab';
import { AgentsTab } from './components/customer/AgentsTab';
import { PlansTab } from './components/customer/PlansTab';
import { InvoicesTab } from './components/customer/InvoicesTab';
import { ActivityTab } from './components/customer/ActivityTab';

// Admin Tabs
import { AdminOverviewTab } from './components/admin/AdminOverviewTab';
import { AdminUsersTab } from './components/admin/AdminUsersTab';
import { AdminPlansTab } from './components/admin/AdminPlansTab';
import { AdminJobsTab } from './components/admin/AdminJobsTab';
import { AdminPortsTab } from './components/admin/AdminPortsTab';
import { AdminAuditLogsTab } from './components/admin/AdminAuditLogsTab';

// Modals
import { CreateWebTunnelModal } from './components/modals/CreateWebTunnelModal';
import { CreatePortTunnelModal } from './components/modals/CreatePortTunnelModal';
import { AddCustomDomainModal } from './components/modals/AddCustomDomainModal';
import { AddAgentModal } from './components/modals/AddAgentModal';

const DashboardContent: React.FC = () => {
  const { isCustomerView, activeCustomerTab, activeAdminTab } = useApp();

  const [isCreateWebOpen, setIsCreateWebOpen] = useState(false);
  const [isCreatePortOpen, setIsCreatePortOpen] = useState(false);
  const [isAddDomainOpen, setIsAddDomainOpen] = useState(false);
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto overflow-y-auto">
          {isCustomerView ? (
            <>
              {activeCustomerTab === 'overview' && (
                <OverviewTab
                  onOpenCreateWeb={() => setIsCreateWebOpen(true)}
                  onOpenCreatePort={() => setIsCreatePortOpen(true)}
                  onOpenAddAgent={() => setIsAddAgentOpen(true)}
                />
              )}
              {activeCustomerTab === 'web_tunnels' && (
                <WebTunnelsTab onOpenCreate={() => setIsCreateWebOpen(true)} />
              )}
              {activeCustomerTab === 'port_tunnels' && (
                <PortTunnelsTab onOpenCreate={() => setIsCreatePortOpen(true)} />
              )}
              {activeCustomerTab === 'custom_domains' && (
                <CustomDomainsTab onOpenAdd={() => setIsAddDomainOpen(true)} />
              )}
              {activeCustomerTab === 'agents' && (
                <AgentsTab onOpenAdd={() => setIsAddAgentOpen(true)} />
              )}
              {activeCustomerTab === 'plans' && <PlansTab />}
              {activeCustomerTab === 'invoices' && <InvoicesTab />}
              {activeCustomerTab === 'activity' && <ActivityTab />}
            </>
          ) : (
            <>
              {activeAdminTab === 'admin_overview' && <AdminOverviewTab />}
              {activeAdminTab === 'admin_users' && <AdminUsersTab />}
              {activeAdminTab === 'admin_plans' && <AdminPlansTab />}
              {activeAdminTab === 'admin_jobs' && <AdminJobsTab />}
              {activeAdminTab === 'admin_ports' && <AdminPortsTab />}
              {activeAdminTab === 'admin_audit' && <AdminAuditLogsTab />}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateWebTunnelModal
        isOpen={isCreateWebOpen}
        onClose={() => setIsCreateWebOpen(false)}
      />
      <CreatePortTunnelModal
        isOpen={isCreatePortOpen}
        onClose={() => setIsCreatePortOpen(false)}
      />
      <AddCustomDomainModal
        isOpen={isAddDomainOpen}
        onClose={() => setIsAddDomainOpen(false)}
      />
      <AddAgentModal
        isOpen={isAddAgentOpen}
        onClose={() => setIsAddAgentOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
