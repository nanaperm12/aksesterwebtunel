export type UserRole = 'customer' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  avatarUrl?: string;
  companyName?: string;
}

export type BillingPeriod = 'monthly' | 'yearly';

export interface Plan {
  id: string;
  code: 'free' | 'basic' | 'pro' | 'business';
  name: string;
  priceAmount: number; // in IDR (integer rupiah)
  billingPeriod: BillingPeriod;
  maxWebTunnels: number;
  maxPortTunnels: number;
  maxAgents: number;
  maxCustomDomains: number;
  maxConnections?: number;
  bandwidthLimitMbps?: number;
  monthlyTransferGb?: number;
  isActive: boolean;
  features: string[];
  targetAudience: string;
}

export type SubscriptionStatus =
  | 'active'
  | 'pending_payment'
  | 'past_due'
  | 'suspended'
  | 'cancelled'
  | 'expired';

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  gracePeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId: string;
  invoiceNumber: string;
  amount: number; // integer rupiah
  currency: string;
  status: InvoiceStatus;
  dueAt: string;
  paidAt?: string;
  planName: string;
  createdAt: string;
}

export type PaymentMethod = 'qris' | 'bca_va' | 'mandiri_va' | 'credit_card';

export interface Payment {
  id: string;
  invoiceId: string;
  provider: string;
  providerTransactionId: string;
  amount: number;
  status: 'settlement' | 'pending' | 'failed';
  paidAt: string;
  paymentMethod: PaymentMethod;
}

export interface PaymentEvent {
  id: string;
  provider: string;
  providerEventId: string;
  payloadRedacted: Record<string, unknown>;
  signatureValid: boolean;
  processedAt: string;
  createdAt: string;
  status: 'success' | 'duplicate_ignored' | 'invalid_signature';
}

export type AgentPlatform = 'windows' | 'linux';
export type AgentStatus = 'online' | 'offline' | 'connecting' | 'error' | 'revoked';

export interface Agent {
  id: string;
  userId: string;
  name: string;
  platform: AgentPlatform;
  agentVersion: string;
  credentialHash: string;
  status: AgentStatus;
  lastSeenAt: string;
  revokedAt?: string;
  createdAt: string;
  ipAddress?: string;
  hostname?: string;
}

export interface AgentEnrollmentToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  usedAt?: string;
  createdAt: string;
}

export type TunnelType = 'web' | 'port';
export type TunnelStatus = 'active' | 'provisioning' | 'offline' | 'suspended' | 'error';
export type TunnelProtocol = 'http' | 'tcp' | 'udp';

export interface Tunnel {
  id: string;
  userId: string;
  agentId: string;
  type: TunnelType;
  name: string;
  status: TunnelStatus;
  localHost: string; // Strictly loopback 127.0.0.1
  localPort: number;
  protocol: TunnelProtocol;
  subdomain?: string; // For Web Tunnel: <subdomain>.aksester.us
  publicPort?: number; // For Port Tunnel: aksester.us:<publicPort>
  createdAt: string;
  updatedAt: string;
  bytesIn?: number;
  bytesOut?: number;
}

export type CustomDomainStatus =
  | 'pending_dns'
  | 'pending_verification'
  | 'pending_tls'
  | 'active'
  | 'error'
  | 'disabled';

export interface CustomDomain {
  id: string;
  userId: string;
  tunnelId: string;
  hostname: string;
  verificationToken: string;
  verificationExpiresAt: string;
  verifiedAt?: string;
  tlsStatus: 'pending' | 'active' | 'error';
  routingStatus: 'pending' | 'active' | 'revoked';
  status: CustomDomainStatus;
  createdAt: string;
  lastDnsCheckAt?: string;
  dnsErrorMessage?: string;
}

export type JobType =
  | 'create_web_tunnel'
  | 'create_port_tunnel'
  | 'provision_tls'
  | 'verify_dns'
  | 'suspend_tunnel'
  | 'resume_tunnel'
  | 'revoke_routing'
  | 'sync_agent_config';

export type JobStatus = 'completed' | 'pending' | 'failed' | 'retrying';

export interface ProvisioningJob {
  id: string;
  jobType: JobType;
  resourceType: 'tunnel' | 'custom_domain' | 'agent' | 'user';
  resourceId: string;
  payloadJson: Record<string, unknown>;
  status: JobStatus;
  attempts: number;
  nextAttemptAt?: string;
  lastErrorRedacted?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  actorName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipRedacted: string;
  metadataRedacted?: string;
  createdAt: string;
}
