
export type ServiceStatus = 'Pendente' | 'Em Produção' | 'Finalizado' | 'Entregue';

export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ServiceDefinition {
  id: string;
  code: string;
  name: string;
  basePrice: number;
  category?: string;
  order: number;
}

export interface Service {
  id: string;
  clientName: string; 
  patientName: string;
  type: string; 
  material: string;
  quantity: number;
  unitValue: number;
  discountValue: number;
  totalValue: number;
  entryDate: string;
  deadline: string;
  status: ServiceStatus;
  paymentMethodId?: string;
  observations?: string;
}

export interface Transaction {
  id: string;
  description: string;
  type: 'Receita' | 'Despesa';
  amount: number;
  date: string;
  category: string;
  status: 'Pago' | 'Pendente';
  serviceId?: string;
  paymentMethodId?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Baixa' | 'Média' | 'Alta';
  completed: boolean;
  dueDate: string;
  assignedTo?: string;
}

export interface Client {
  id: string;
  name: string;
  contact: string;
  email: string;
  cpf?: string;
  cro?: string;
  address?: string;
  specialty?: string;
  status: 'Ativo' | 'Inativo';
}

export interface CompanyInfo {
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  logoUrl?: string;
  globalDiscount?: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  active: boolean;
  type: 'pix' | 'credit' | 'debit' | 'cash' | 'transfer';
  discount?: number;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Invoice {
  id: string;
  serviceId: string;
  clientId: string;
  clientName: string;
  amount: number;
  issueDate: string;
  status: 'Paga' | 'Pendente' | 'Cancelada';
}
