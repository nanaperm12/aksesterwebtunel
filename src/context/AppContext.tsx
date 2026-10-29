import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  Plan,
  Subscription,
  Invoice,
  Agent,
  Tunnel,
  CustomDomain,
  ProvisioningJob,
  AuditLog,
  PaymentEvent,
  TunnelProtocol,
  AgentPlatform,
  PaymentMethod,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PLANS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_AGENTS,
  INITIAL_TUNNELS,
  INITIAL_CUSTOM_DOMAINS,
  INITIAL_INVOICES,
  INITIAL_JOBS,
  INITIAL_AUDIT_LOGS,
  INITIAL_PAYMENT_EVENTS,
  RESERVED_SUBDOMAINS,
} from '../data/initialData';

export type CustomerTab =
  | 'overview'
  | 'web_tunnels'
  | 'port_tunnels'
  | 'custom_domains'
  | 'agents'
  | 'plans'
  | 'invoices'
  | 'activity';

export type AdminTab =
  | 'admin_overview'
  | 'admin_users'
  | 'admin_plans'
  | 'admin_jobs'
  | 'admin_ports'
  | 'admin_webhooks'
  | 'admin_audit';

interface QuotaUsage {
  webTunnelsUsed: number;
  maxWebTunnels: number;
  portTunnelsUsed: number;
  maxPortTunnels: number;
  agentsUsed: number;
  maxAgents: number;
  customDomainsUsed: number;
  maxCustomDomains: number;
  canCreateWebTunnel: boolean;
  canCreatePortTunnel: boolean;
  canCreateAgent: boolean;
  canCreateCustomDomain: boolean;
}

interface AppContextType {
  // Current session & view
  currentUser: User;
  setCurrentUser: (user: User) => void;
  allUsers: User[];
  isCustomerView: boolean;
  setIsCustomerView: (isCustomer: boolean) => void;
  activeCustomerTab: CustomerTab;
  setActiveCustomerTab: (tab: CustomerTab) => void;
  activeAdminTab: AdminTab;
  setActiveAdminTab: (tab: AdminTab) => void;

  // Data Collections
  plans: Plan[];
  subscriptions: Subscription[];
  agents: Agent[];
  tunnels: Tunnel[];
  customDomains: CustomDomain[];
  invoices: Invoice[];
  jobs: ProvisioningJob[];
  auditLogs: AuditLog[];
  paymentEvents: PaymentEvent[];

  // Computed & helpers
  currentSubscription?: Subscription;
  currentPlan?: Plan;
  quotaUsage: QuotaUsage;

  // Web Tunnel Actions
  createWebTunnel: (
    name: string,
    subdomain: string,
    localPort: number,
    agentId: string
  ) => { success: boolean; error?: string };
  updateWebTunnel: (id: string, name: string, localPort: number) => boolean;
  deleteWebTunnel: (id: string) => { success: boolean; error?: string };
  checkSubdomainAvailable: (subdomain: string, currentTunnelId?: string) => {
    available: boolean;
    reason?: string;
  };

  // Port Tunnel Actions
  createPortTunnel: (
    name: string,
    protocol: TunnelProtocol,
    localPort: number,
    agentId: string
  ) => { success: boolean; error?: string; publicPort?: number };
  deletePortTunnel: (id: string) => boolean;
  getNextAvailablePort: () => number;

  // Agent Actions
  generateEnrollmentToken: () => { token: string; expiresAt: string };
  addAgent: (name: string, platform: AgentPlatform) => Agent;
  revokeAgent: (agentId: string) => void;
  simulateHeartbeat: (agentId: string) => void;
  toggleAgentOnlineOffline: (agentId: string) => void;

  // Custom Domain Actions
  addCustomDomain: (
    hostname: string,
    tunnelId: string
  ) => { success: boolean; error?: string };
  verifyCustomDomainDns: (domainId: string) => Promise<{ success: boolean; error?: string }>;
  deleteCustomDomain: (domainId: string) => void;

  // Billing Actions
  changePlan: (planId: string) => Invoice;
  payInvoice: (
    invoiceId: string,
    method: PaymentMethod
  ) => Promise<{ success: boolean; eventId: string }>;

  // Admin Actions
  suspendUser: (userId: string, reason: string) => void;
  resumeUser: (userId: string, reason: string) => void;
  updatePlanAdmin: (updatedPlan: Plan) => void;
  retryJob: (jobId: string) => void;

  // Reset to default
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_PREFIX = 'aksester_saas_v1_';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(STORAGE_PREFIX + key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // Ignore storage quota
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() =>
    loadFromStorage('users', INITIAL_USERS)
  );
  const [currentUserId, setCurrentUserId] = useState<string>(() =>
    loadFromStorage('currentUserId', INITIAL_USERS[0].id)
  );
  const [isCustomerView, setIsCustomerView] = useState<boolean>(() =>
    loadFromStorage('isCustomerView', true)
  );
  const [activeCustomerTab, setActiveCustomerTab] = useState<CustomerTab>('overview');
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('admin_overview');

  const [plans, setPlans] = useState<Plan[]>(() =>
    loadFromStorage('plans', INITIAL_PLANS)
  );
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() =>
    loadFromStorage('subscriptions', INITIAL_SUBSCRIPTIONS)
  );
  const [agents, setAgents] = useState<Agent[]>(() =>
    loadFromStorage('agents', INITIAL_AGENTS)
  );
  const [tunnels, setTunnels] = useState<Tunnel[]>(() =>
    loadFromStorage('tunnels', INITIAL_TUNNELS)
  );
  const [customDomains, setCustomDomains] = useState<CustomDomain[]>(() =>
    loadFromStorage('customDomains', INITIAL_CUSTOM_DOMAINS)
  );
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    loadFromStorage('invoices', INITIAL_INVOICES)
  );
  const [jobs, setJobs] = useState<ProvisioningJob[]>(() =>
    loadFromStorage('jobs', INITIAL_JOBS)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    loadFromStorage('auditLogs', INITIAL_AUDIT_LOGS)
  );
  const [paymentEvents, setPaymentEvents] = useState<PaymentEvent[]>(() =>
    loadFromStorage('paymentEvents', INITIAL_PAYMENT_EVENTS)
  );

  // Sync to localStorage
  useEffect(() => saveToStorage('users', users), [users]);
  useEffect(() => saveToStorage('currentUserId', currentUserId), [currentUserId]);
  useEffect(() => saveToStorage('isCustomerView', isCustomerView), [isCustomerView]);
  useEffect(() => saveToStorage('plans', plans), [plans]);
  useEffect(() => saveToStorage('subscriptions', subscriptions), [subscriptions]);
  useEffect(() => saveToStorage('agents', agents), [agents]);
  useEffect(() => saveToStorage('tunnels', tunnels), [tunnels]);
  useEffect(() => saveToStorage('customDomains', customDomains), [customDomains]);
  useEffect(() => saveToStorage('invoices', invoices), [invoices]);
  useEffect(() => saveToStorage('jobs', jobs), [jobs]);
  useEffect(() => saveToStorage('auditLogs', auditLogs), [auditLogs]);
  useEffect(() => saveToStorage('paymentEvents', paymentEvents), [paymentEvents]);

  const currentUser = useMemo(() => {
    return users.find((u) => u.id === currentUserId) || users[0];
  }, [users, currentUserId]);

  const currentSubscription = useMemo(() => {
    return subscriptions.find((s) => s.userId === currentUser.id);
  }, [subscriptions, currentUser.id]);

  const currentPlan = useMemo(() => {
    if (!currentSubscription) {
      return plans.find((p) => p.code === 'free') || plans[0];
    }
    return plans.find((p) => p.id === currentSubscription.planId) || plans[0];
  }, [plans, currentSubscription]);

  // Quota Usage calculation
  const quotaUsage: QuotaUsage = useMemo(() => {
    const userWebTunnels = tunnels.filter(
      (t) => t.userId === currentUser.id && t.type === 'web'
    ).length;
    const userPortTunnels = tunnels.filter(
      (t) => t.userId === currentUser.id && t.type === 'port'
    ).length;
    const userAgents = agents.filter(
      (a) => a.userId === currentUser.id && a.status !== 'revoked'
    ).length;
    const userCustomDomains = customDomains.filter(
      (d) => d.userId === currentUser.id && d.status !== 'disabled'
    ).length;

    const maxWeb = currentPlan.maxWebTunnels;
    const maxPort = currentPlan.maxPortTunnels;
    const maxAgt = currentPlan.maxAgents;
    const maxDom = currentPlan.maxCustomDomains;

    return {
      webTunnelsUsed: userWebTunnels,
      maxWebTunnels: maxWeb,
      portTunnelsUsed: userPortTunnels,
      maxPortTunnels: maxPort,
      agentsUsed: userAgents,
      maxAgents: maxAgt,
      customDomainsUsed: userCustomDomains,
      maxCustomDomains: maxDom,
      canCreateWebTunnel: userWebTunnels < maxWeb,
      canCreatePortTunnel: userPortTunnels < maxPort,
      canCreateAgent: userAgents < maxAgt,
      canCreateCustomDomain: userCustomDomains < maxDom,
    };
  }, [tunnels, agents, customDomains, currentUser.id, currentPlan]);

  const appendAuditLog = (
    action: string,
    resourceType: string,
    resourceId: string,
    metadataRedacted?: string
  ) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorUserId: currentUser.id,
      actorName: currentUser.name,
      action,
      resourceType,
      resourceId,
      ipRedacted: '180.252.xxx.xxx',
      metadataRedacted,
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Subdomain availability check
  const checkSubdomainAvailable = (
    rawSubdomain: string,
    currentTunnelId?: string
  ): { available: boolean; reason?: string } => {
    const slug = rawSubdomain.trim().toLowerCase();
    if (!slug) {
      return { available: false, reason: 'Subdomain tidak boleh kosong' };
    }
    if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(slug)) {
      return {
        available: false,
        reason: 'Hanya huruf kecil (a-z), angka (0-9), tanda minus (-), minimal 3 karakter',
      };
    }
    if (RESERVED_SUBDOMAINS.includes(slug)) {
      return { available: false, reason: `Subdomain '${slug}' adalah nama sistem terlarang` };
    }
    const collision = tunnels.find(
      (t) => t.type === 'web' && t.subdomain?.toLowerCase() === slug && t.id !== currentTunnelId
    );
    if (collision) {
      return { available: false, reason: `Subdomain '${slug}.aksester.us' sudah digunakan` };
    }
    return { available: true };
  };

  // Create Web Tunnel
  const createWebTunnel = (
    name: string,
    rawSubdomain: string,
    localPort: number,
    agentId: string
  ): { success: boolean; error?: string } => {
    if (!quotaUsage.canCreateWebTunnel) {
      return {
        success: false,
        error: `Kuota Web Tunnel paket ${currentPlan.name} telah tercapai (${quotaUsage.webTunnelsUsed}/${quotaUsage.maxWebTunnels}). Silakan upgrade paket.`,
      };
    }

    const check = checkSubdomainAvailable(rawSubdomain);
    if (!check.available) {
      return { success: false, error: check.reason };
    }

    if (!localPort || localPort < 1 || localPort > 65535) {
      return { success: false, error: 'Port target lokal harus antara 1 dan 65535' };
    }

    const agent = agents.find((a) => a.id === agentId && a.userId === currentUser.id);
    if (!agent) {
      return { success: false, error: 'Agent yang dipilih tidak valid' };
    }

    const slug = rawSubdomain.trim().toLowerCase();
    const newTunnelId = `tun_web_${Date.now()}`;
    const newTunnel: Tunnel = {
      id: newTunnelId,
      userId: currentUser.id,
      agentId,
      type: 'web',
      name: name.trim() || `Web Tunnel ${slug}`,
      status: 'active',
      localHost: '127.0.0.1', // Strictly loopback as per PRD Section 6.3/15
      localPort,
      protocol: 'http',
      subdomain: slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bytesIn: 0,
      bytesOut: 0,
    };

    setTunnels((prev) => [newTunnel, ...prev]);

    // Background Provisioning Job
    const newJob: ProvisioningJob = {
      id: `job_p_${Date.now()}`,
      jobType: 'create_web_tunnel',
      resourceType: 'tunnel',
      resourceId: newTunnelId,
      payloadJson: {
        subdomain: slug,
        localHost: '127.0.0.1',
        localPort,
        agentId,
        caddyUpstream: `http://127.0.0.1:${localPort}`,
      },
      status: 'completed',
      attempts: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setJobs((prev) => [newJob, ...prev]);

    appendAuditLog(
      'CREATE_WEB_TUNNEL',
      'tunnel',
      newTunnelId,
      `subdomain=${slug}, port=${localPort}, agent=${agent.name}`
    );

    return { success: true };
  };

  const updateWebTunnel = (id: string, name: string, localPort: number): boolean => {
    setTunnels((prev) =>
      prev.map((t) => {
        if (t.id === id && t.userId === currentUser.id) {
          return {
            ...t,
            name: name.trim() || t.name,
            localPort,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
    appendAuditLog('UPDATE_WEB_TUNNEL', 'tunnel', id, `name=${name}, port=${localPort}`);
    return true;
  };

  const deleteWebTunnel = (id: string): { success: boolean; error?: string } => {
    // Check if linked custom domain
    const linkedDomain = customDomains.find((d) => d.tunnelId === id && d.status !== 'disabled');
    if (linkedDomain) {
      return {
        success: false,
        error: `Tunnel terhubung dengan Custom Domain '${linkedDomain.hostname}'. Harap hapus custom domain terlebih dahulu.`,
      };
    }

    const target = tunnels.find((t) => t.id === id);
    if (!target) return { success: false, error: 'Tunnel tidak ditemukan' };

    setTunnels((prev) => prev.filter((t) => t.id !== id));

    // Provisioning Job to revoke routing
    const newJob: ProvisioningJob = {
      id: `job_del_${Date.now()}`,
      jobType: 'revoke_routing',
      resourceType: 'tunnel',
      resourceId: id,
      payloadJson: { subdomain: target.subdomain },
      status: 'completed',
      attempts: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setJobs((prev) => [newJob, ...prev]);

    appendAuditLog('DELETE_WEB_TUNNEL', 'tunnel', id, `subdomain=${target.subdomain}`);
    return { success: true };
  };

  // Atomic Port Allocation for Port Tunnel
  const getNextAvailablePort = (): number => {
    const allocatedPorts = new Set(
      tunnels.filter((t) => t.type === 'port' && t.publicPort).map((t) => t.publicPort!)
    );
    // Port range for Aksester gateway: 2000 - 2099
    for (let port = 2000; port <= 2099; port++) {
      if (!allocatedPorts.has(port)) {
        return port;
      }
    }
    return 2100;
  };

  const createPortTunnel = (
    name: string,
    protocol: TunnelProtocol,
    localPort: number,
    agentId: string
  ): { success: boolean; error?: string; publicPort?: number } => {
    if (!quotaUsage.canCreatePortTunnel) {
      return {
        success: false,
        error: `Kuota Port Tunnel paket ${currentPlan.name} telah tercapai (${quotaUsage.portTunnelsUsed}/${quotaUsage.maxPortTunnels}). Silakan upgrade paket.`,
      };
    }

    if (!localPort || localPort < 1 || localPort > 65535) {
      return { success: false, error: 'Port target lokal harus antara 1 dan 65535' };
    }

    const agent = agents.find((a) => a.id === agentId && a.userId === currentUser.id);
    if (!agent) {
      return { success: false, error: 'Agent yang dipilih tidak valid' };
    }

    const publicPort = getNextAvailablePort();
    const newTunnelId = `tun_port_${Date.now()}`;
    const newTunnel: Tunnel = {
      id: newTunnelId,
      userId: currentUser.id,
      agentId,
      type: 'port',
      name: name.trim() || `Port Tunnel ${protocol.toUpperCase()}:${publicPort}`,
      status: 'active',
      localHost: '127.0.0.1',
      localPort,
      protocol,
      publicPort,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bytesIn: 0,
      bytesOut: 0,
    };

    setTunnels((prev) => [newTunnel, ...prev]);

    // Provisioning job
    const newJob: ProvisioningJob = {
      id: `job_prt_${Date.now()}`,
      jobType: 'create_port_tunnel',
      resourceType: 'tunnel',
      resourceId: newTunnelId,
      payloadJson: {
        publicPort,
        localHost: '127.0.0.1',
        localPort,
        protocol,
        agentId,
      },
      status: 'completed',
      attempts: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setJobs((prev) => [newJob, ...prev]);

    appendAuditLog(
      'CREATE_PORT_TUNNEL',
      'tunnel',
      newTunnelId,
      `allocated_port=${publicPort}, proto=${protocol}, local_port=${localPort}`
    );

    return { success: true, publicPort };
  };

  const deletePortTunnel = (id: string): boolean => {
    const target = tunnels.find((t) => t.id === id);
    if (!target) return false;

    setTunnels((prev) => prev.filter((t) => t.id !== id));
    appendAuditLog(
      'DELETE_PORT_TUNNEL',
      'tunnel',
      id,
      `released_port=${target.publicPort}`
    );
    return true;
  };

  // Agent Management
  const generateEnrollmentToken = () => {
    const rand = Math.random().toString(36).substring(2, 10);
    const token = `akst_enroll_${Date.now().toString(36)}_${rand}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    return { token, expiresAt };
  };

  const addAgent = (name: string, platform: AgentPlatform): Agent => {
    const newAgent: Agent = {
      id: `agt_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      userId: currentUser.id,
      name: name.trim() || `Agent-${platform === 'windows' ? 'PC' : 'Server'}`,
      platform,
      agentVersion: 'v1.4.2',
      credentialHash: `sha256_${Math.random().toString(36).substring(2, 12)}...`,
      status: 'online',
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      ipAddress: '103.111.45.12',
      hostname: platform === 'windows' ? 'DESKTOP-AKSESTER' : 'srv-node-linux',
    };

    setAgents((prev) => [newAgent, ...prev]);
    appendAuditLog('ENROLL_AGENT', 'agent', newAgent.id, `platform=${platform}, name=${newAgent.name}`);
    return newAgent;
  };

  const revokeAgent = (agentId: string) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, status: 'revoked', revokedAt: new Date().toISOString() } : a))
    );
    // Mark tunnels under this agent as offline
    setTunnels((prev) =>
      prev.map((t) => (t.agentId === agentId ? { ...t, status: 'offline' } : t))
    );
    appendAuditLog('REVOKE_AGENT', 'agent', agentId, 'credential revoked from dashboard');
  };

  const simulateHeartbeat = (agentId: string) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, status: 'online', lastSeenAt: new Date().toISOString() } : a))
    );
  };

  const toggleAgentOnlineOffline = (agentId: string) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id === agentId) {
          const nextStatus = a.status === 'online' ? 'offline' : 'online';
          // Cascade to tunnels
          setTunnels((tPrev) =>
            tPrev.map((t) => (t.agentId === agentId ? { ...t, status: nextStatus === 'online' ? 'active' : 'offline' } : t))
          );
          return {
            ...a,
            status: nextStatus,
            lastSeenAt: nextStatus === 'online' ? new Date().toISOString() : a.lastSeenAt,
          };
        }
        return a;
      })
    );
  };

  // Custom Domain Management
  const addCustomDomain = (
    rawHostname: string,
    tunnelId: string
  ): { success: boolean; error?: string } => {
    if (!quotaUsage.canCreateCustomDomain) {
      return {
        success: false,
        error: `Paket ${currentPlan.name} memiliki batas ${currentPlan.maxCustomDomains} custom domain. Silakan upgrade paket Pro atau Business.`,
      };
    }

    const hostname = rawHostname.trim().toLowerCase();
    if (!hostname || !hostname.includes('.')) {
      return { success: false, error: 'Hostname tidak valid (contoh: app.tokosaya.com)' };
    }

    // Check collision
    const existing = customDomains.find(
      (d) => d.hostname === hostname && d.status !== 'disabled'
    );
    if (existing) {
      return { success: false, error: `Domain '${hostname}' telah digunakan oleh tenant lain.` };
    }

    const tunnel = tunnels.find((t) => t.id === tunnelId && t.userId === currentUser.id);
    if (!tunnel) {
      return { success: false, error: 'Web Tunnel tidak ditemukan' };
    }

    const randToken = `akst_vfy_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    const newDomain: CustomDomain = {
      id: `dom_${Date.now()}`,
      userId: currentUser.id,
      tunnelId,
      hostname,
      verificationToken: randToken,
      verificationExpiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      tlsStatus: 'pending',
      routingStatus: 'pending',
      status: 'pending_dns',
      createdAt: new Date().toISOString(),
    };

    setCustomDomains((prev) => [newDomain, ...prev]);
    appendAuditLog('ADD_CUSTOM_DOMAIN', 'custom_domain', newDomain.id, `hostname=${hostname}`);

    return { success: true };
  };

  const verifyCustomDomainDns = async (
    domainId: string
  ): Promise<{ success: boolean; error?: string }> => {
    const domain = customDomains.find((d) => d.id === domainId);
    if (!domain) return { success: false, error: 'Domain tidak ditemukan' };

    // Simulate DNS check delay
    setCustomDomains((prev) =>
      prev.map((d) => (d.id === domainId ? { ...d, status: 'pending_verification' } : d))
    );

    await new Promise((r) => setTimeout(r, 1200));

    // Update to pending_tls then active
    const verifiedTime = new Date().toISOString();
    setCustomDomains((prev) =>
      prev.map((d) =>
        d.id === domainId
          ? {
              ...d,
              status: 'active',
              verifiedAt: verifiedTime,
              tlsStatus: 'active',
              routingStatus: 'active',
              lastDnsCheckAt: verifiedTime,
              dnsErrorMessage: undefined,
            }
          : d
      )
    );

    // Add provisioning job
    const newJob: ProvisioningJob = {
      id: `job_tls_${Date.now()}`,
      jobType: 'provision_tls',
      resourceType: 'custom_domain',
      resourceId: domainId,
      payloadJson: {
        hostname: domain.hostname,
        tunnelId: domain.tunnelId,
        caddyAutoHttps: true,
      },
      status: 'completed',
      attempts: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setJobs((prev) => [newJob, ...prev]);

    appendAuditLog('VERIFY_CUSTOM_DOMAIN', 'custom_domain', domainId, `hostname=${domain.hostname}, status=active`);
    return { success: true };
  };

  const deleteCustomDomain = (domainId: string) => {
    const target = customDomains.find((d) => d.id === domainId);
    if (!target) return;

    setCustomDomains((prev) => prev.filter((d) => d.id !== domainId));

    // Provisioning job to revoke routing
    const newJob: ProvisioningJob = {
      id: `job_dom_del_${Date.now()}`,
      jobType: 'revoke_routing',
      resourceType: 'custom_domain',
      resourceId: domainId,
      payloadJson: { hostname: target.hostname },
      status: 'completed',
      attempts: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setJobs((prev) => [newJob, ...prev]);

    appendAuditLog('DELETE_CUSTOM_DOMAIN', 'custom_domain', domainId, `hostname=${target.hostname}`);
  };

  // Change / Upgrade Plan
  const changePlan = (planId: string): Invoice => {
    const selectedPlan = plans.find((p) => p.id === planId) || plans[0];
    const invoiceNum = `INV-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      userId: currentUser.id,
      subscriptionId: currentSubscription?.id || `sub_${Date.now()}`,
      invoiceNumber: invoiceNum,
      amount: selectedPlan.priceAmount,
      currency: 'IDR',
      status: selectedPlan.priceAmount === 0 ? 'paid' : 'unpaid',
      dueAt: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
      paidAt: selectedPlan.priceAmount === 0 ? new Date().toISOString() : undefined,
      planName: `${selectedPlan.name} (1 Bulan)`,
      createdAt: new Date().toISOString(),
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    if (selectedPlan.priceAmount === 0) {
      // Free plan updates immediately
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.userId === currentUser.id
            ? { ...s, planId, status: 'active', updatedAt: new Date().toISOString() }
            : s
        )
      );
    }

    appendAuditLog('CHANGE_PLAN_REQUEST', 'subscription', selectedPlan.id, `plan=${selectedPlan.name}, invoice=${invoiceNum}`);
    return newInvoice;
  };

  // Pay Invoice with webhook simulation
  const payInvoice = async (
    invoiceId: string,
    method: PaymentMethod
  ): Promise<{ success: boolean; eventId: string }> => {
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (!invoice) return { success: false, eventId: '' };

    await new Promise((r) => setTimeout(r, 800));

    const paidTimestamp = new Date().toISOString();
    const eventId = `evt_sim_${Date.now()}`;

    // 1. Update invoice
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === invoiceId ? { ...i, status: 'paid', paidAt: paidTimestamp } : i
      )
    );

    // 2. Update subscription
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.userId === invoice.userId) {
          return {
            ...s,
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
            updatedAt: paidTimestamp,
          };
        }
        return s;
      })
    );

    // 3. Resume any suspended tunnels
    setTunnels((prev) =>
      prev.map((t) => (t.userId === invoice.userId && t.status === 'suspended' ? { ...t, status: 'active' } : t))
    );

    // 4. Record payment event (idempotent webhook record)
    const newEvent: PaymentEvent = {
      id: `pe_${Date.now()}`,
      provider: method,
      providerEventId: eventId,
      payloadRedacted: {
        invoice_number: invoice.invoiceNumber,
        gross_amount: invoice.amount,
        payment_method: method,
        status: 'settlement',
        signature: 'valid_hmac_sha256',
      },
      signatureValid: true,
      processedAt: paidTimestamp,
      createdAt: paidTimestamp,
      status: 'success',
    };
    setPaymentEvents((prev) => [newEvent, ...prev]);

    appendAuditLog(
      'PAYMENT_SUCCESS_WEBHOOK',
      'invoice',
      invoiceId,
      `amount=Rp${invoice.amount.toLocaleString('id-ID')}, method=${method}`
    );

    return { success: true, eventId };
  };

  // Admin Actions
  const suspendUser = (userId: string, reason: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'suspended' } : u))
    );
    // Suspends all user tunnels
    setTunnels((prev) =>
      prev.map((t) => (t.userId === userId ? { ...t, status: 'suspended' } : t))
    );
    appendAuditLog('SUSPEND_USER', 'user', userId, `reason=${reason}`);
  };

  const resumeUser = (userId: string, reason: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'active' } : u))
    );
    // Resumes user tunnels
    setTunnels((prev) =>
      prev.map((t) => (t.userId === userId ? { ...t, status: 'active' } : t))
    );
    appendAuditLog('RESUME_USER', 'user', userId, `reason=${reason}`);
  };

  const updatePlanAdmin = (updatedPlan: Plan) => {
    setPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
    appendAuditLog(
      'UPDATE_PLAN_CONFIG',
      'plan',
      updatedPlan.id,
      `price=${updatedPlan.priceAmount}, maxWeb=${updatedPlan.maxWebTunnels}, maxPort=${updatedPlan.maxPortTunnels}`
    );
  };

  const retryJob = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          return {
            ...j,
            status: 'completed',
            attempts: j.attempts + 1,
            lastErrorRedacted: undefined,
            updatedAt: new Date().toISOString(),
          };
        }
        return j;
      })
    );
    appendAuditLog('RETRY_PROVISIONING_JOB', 'job', jobId, 'manual retry by admin');
  };

  const resetDemoData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUserId(INITIAL_USERS[0].id);
    setPlans(INITIAL_PLANS);
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
    setAgents(INITIAL_AGENTS);
    setTunnels(INITIAL_TUNNELS);
    setCustomDomains(INITIAL_CUSTOM_DOMAINS);
    setInvoices(INITIAL_INVOICES);
    setJobs(INITIAL_JOBS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setPaymentEvents(INITIAL_PAYMENT_EVENTS);
    setIsCustomerView(true);
    setActiveCustomerTab('overview');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser: (u) => setCurrentUserId(u.id),
        allUsers: users,
        isCustomerView,
        setIsCustomerView,
        activeCustomerTab,
        setActiveCustomerTab,
        activeAdminTab,
        setActiveAdminTab,
        plans,
        subscriptions,
        agents,
        tunnels,
        customDomains,
        invoices,
        jobs,
        auditLogs,
        paymentEvents,
        currentSubscription,
        currentPlan,
        quotaUsage,
        createWebTunnel,
        updateWebTunnel,
        deleteWebTunnel,
        checkSubdomainAvailable,
        createPortTunnel,
        deletePortTunnel,
        getNextAvailablePort,
        generateEnrollmentToken,
        addAgent,
        revokeAgent,
        simulateHeartbeat,
        toggleAgentOnlineOffline,
        addCustomDomain,
        verifyCustomDomainDns,
        deleteCustomDomain,
        changePlan,
        payInvoice,
        suspendUser,
        resumeUser,
        updatePlanAdmin,
        retryJob,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
