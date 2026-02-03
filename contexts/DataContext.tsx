
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
    Client, Service, Transaction, Task,
    ServiceDefinition, PaymentMethod, Invoice, CompanyInfo
} from '../types';

interface DataContextType {
    clients: Client[];
    services: Service[];
    transactions: Transaction[];
    tasks: Task[];
    serviceDefinitions: ServiceDefinition[];
    paymentMethods: PaymentMethod[];
    invoices: Invoice[];
    companyInfo: CompanyInfo | null;
    loading: boolean;
    refreshData: () => Promise<void>;

    // Clients
    addClient: (client: Omit<Client, 'id'>) => Promise<void>;
    updateClient: (id: string, client: Partial<Client>) => Promise<void>;
    deleteClient: (id: string) => Promise<void>;

    // Services
    addService: (service: Omit<Service, 'id'>) => Promise<void>;
    updateService: (id: string, service: Partial<Service>) => Promise<void>;
    deleteService: (id: string) => Promise<void>;

    // Transactions
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;

    // Tasks
    addTask: (task: Omit<Task, 'id'>) => Promise<void>;
    updateTask: (id: string, task: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;

    // Payment Methods
    addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<void>;
    updatePaymentMethod: (id: string, method: Partial<PaymentMethod>) => Promise<void>;
    deletePaymentMethod: (id: string) => Promise<void>;

    // Service Definitions (Catalog)
    addServiceDefinition: (definition: Omit<ServiceDefinition, 'id'>) => Promise<void>;
    updateServiceDefinition: (id: string, definition: Partial<ServiceDefinition>) => Promise<void>;
    deleteServiceDefinition: (id: string) => Promise<void>;

    // Company Info
    updateCompanyInfo: (info: Partial<CompanyInfo>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [serviceDefinitions, setServiceDefinitions] = useState<ServiceDefinition[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [
                { data: clientsData },
                { data: servicesData },
                { data: transactionsData },
                { data: tasksData },
                { data: definitionsData },
                { data: paymentsData },
                { data: invoicesData },
                { data: companyData }
            ] = await Promise.all([
                supabase.from('clients').select('*').order('name'),
                supabase.from('services').select('*').order('entry_date', { ascending: false }),
                supabase.from('transactions').select('*').order('date', { ascending: false }),
                supabase.from('tasks').select('*').order('due_date'),
                supabase.from('service_definitions').select('*').order('display_order'),
                supabase.from('payment_methods').select('*').order('name'),
                supabase.from('invoices').select('*').order('issue_date', { ascending: false }),
                supabase.from('company_info').select('*').limit(1).maybeSingle()
            ]);

            if (clientsData) setClients(clientsData.map(c => ({
                id: c.id,
                name: c.name,
                contact: c.contact,
                email: c.email,
                cpf: c.cpf,
                cro: c.cro,
                address: c.address,
                specialty: c.specialty,
                status: c.status as any
            })));

            if (servicesData) setServices(servicesData.map(s => ({
                id: s.id,
                clientName: s.client_name,
                patientName: s.patient_name,
                type: s.type,
                material: s.material,
                quantity: s.quantity,
                unitValue: s.unit_value,
                discountValue: s.discount_value || 0,
                totalValue: s.total_value,
                entryDate: s.entry_date,
                deadline: s.deadline,
                status: s.status as any,
                paymentMethodId: s.payment_method_id,
                observations: s.observations
            })));

            if (transactionsData) setTransactions(transactionsData.map(t => ({
                id: t.id,
                description: t.description,
                type: t.type as any,
                amount: t.amount,
                date: t.date,
                category: t.category,
                status: t.status as any,
                serviceId: t.service_id,
                paymentMethodId: t.payment_method_id
            })));

            if (tasksData) setTasks(tasksData.map(t => ({
                id: t.id,
                title: t.title,
                description: t.description,
                priority: t.priority as any,
                completed: t.completed || false,
                dueDate: t.due_date,
                assignedTo: t.assigned_to
            })));

            if (definitionsData) setServiceDefinitions(definitionsData.map(d => ({
                id: d.id,
                code: d.code,
                name: d.name,
                basePrice: d.base_price,
                category: d.category,
                order: d.display_order
            })));

            if (paymentsData) setPaymentMethods(paymentsData.map(p => ({
                id: p.id,
                name: p.name,
                active: p.active || false,
                type: p.type as any,
                discount: p.discount,
                email: p.email,
                phone: p.phone,
                address: p.address
            })));

            if (invoicesData) setInvoices(invoicesData.map(i => ({
                id: i.id,
                serviceId: i.service_id,
                clientId: i.client_id,
                clientName: i.client_name,
                amount: i.amount,
                issueDate: i.issue_date,
                status: i.status as any
            })));

            if (companyData) setCompanyInfo({
                name: companyData.name,
                cnpj: companyData.cnpj,
                email: companyData.email,
                phone: companyData.phone,
                address: companyData.address,
                logoUrl: companyData.logo_url,
                globalDiscount: companyData.global_discount
            });

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Mutations
    const addClient = async (client: Omit<Client, 'id'>) => {
        const { error } = await supabase.from('clients').insert(client);
        if (error) throw error;
        await fetchData();
    };

    const updateClient = async (id: string, client: Partial<Client>) => {
        const { error } = await supabase.from('clients').update(client).eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const deleteClient = async (id: string) => {
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const addService = async (service: Omit<Service, 'id'>) => {
        const { error } = await supabase.from('services').insert({
            client_name: service.clientName,
            patient_name: service.patientName,
            type: service.type,
            material: service.material,
            quantity: service.quantity,
            unit_value: service.unitValue,
            discount_value: service.discountValue,
            total_value: service.totalValue,
            entry_date: service.entryDate,
            deadline: service.deadline,
            status: service.status,
            payment_method_id: service.paymentMethodId,
            observations: service.observations
        });
        if (error) throw error;
        await fetchData();
    };

    const updateService = async (id: string, service: Partial<Service>) => {
        const dbData: any = {};
        if (service.clientName) dbData.client_name = service.clientName;
        if (service.patientName) dbData.patient_name = service.patientName;
        if (service.type) dbData.type = service.type;
        if (service.material) dbData.material = service.material;
        if (service.quantity !== undefined) dbData.quantity = service.quantity;
        if (service.unitValue !== undefined) dbData.unit_value = service.unitValue;
        if (service.discountValue !== undefined) dbData.discount_value = service.discountValue;
        if (service.totalValue !== undefined) dbData.total_value = service.totalValue;
        if (service.entryDate) dbData.entry_date = service.entryDate;
        if (service.deadline) dbData.deadline = service.deadline;
        if (service.status) dbData.status = service.status;
        if (service.paymentMethodId !== undefined) dbData.payment_method_id = service.paymentMethodId;
        if (service.observations !== undefined) dbData.observations = service.observations;

        const { error } = await supabase.from('services').update(dbData).eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const deleteService = async (id: string) => {
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        const { error } = await supabase.from('transactions').insert({
            description: transaction.description,
            type: transaction.type,
            amount: transaction.amount,
            date: transaction.date,
            category: transaction.category,
            status: transaction.status,
            service_id: transaction.serviceId,
            payment_method_id: transaction.paymentMethodId
        });
        if (error) throw error;
        await fetchData();
    };

    const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
        const dbData: any = {};
        if (transaction.description) dbData.description = transaction.description;
        if (transaction.type) dbData.type = transaction.type;
        if (transaction.amount !== undefined) dbData.amount = transaction.amount;
        if (transaction.date) dbData.date = transaction.date;
        if (transaction.category) dbData.category = transaction.category;
        if (transaction.status) dbData.status = transaction.status;
        if (transaction.serviceId !== undefined) dbData.service_id = transaction.serviceId;
        if (transaction.paymentMethodId !== undefined) dbData.payment_method_id = transaction.paymentMethodId;

        const { error } = await supabase.from('transactions').update(dbData).eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const deleteTransaction = async (id: string) => {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const addTask = async (task: Omit<Task, 'id'>) => {
        const { error } = await supabase.from('tasks').insert({
            title: task.title,
            description: task.description,
            priority: task.priority,
            completed: task.completed,
            due_date: task.dueDate,
            assigned_to: task.assignedTo
        });
        if (error) throw error;
        await fetchData();
    };

    const updateTask = async (id: string, task: Partial<Task>) => {
        const dbData: any = {};
        if (task.title) dbData.title = task.title;
        if (task.description) dbData.description = task.description;
        if (task.priority) dbData.priority = task.priority;
        if (task.completed !== undefined) dbData.completed = task.completed;
        if (task.dueDate) dbData.due_date = task.dueDate;
        if (task.assignedTo !== undefined) dbData.assigned_to = task.assignedTo;

        const { error } = await supabase.from('tasks').update(dbData).eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const deleteTask = async (id: string) => {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const addPaymentMethod = async (method: Omit<PaymentMethod, 'id'>) => {
        const { error } = await supabase.from('payment_methods').insert(method);
        if (error) throw error;
        await fetchData();
    };

    const updatePaymentMethod = async (id: string, method: Partial<PaymentMethod>) => {
        const { error } = await supabase.from('payment_methods').update(method).eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const deletePaymentMethod = async (id: string) => {
        const { error } = await supabase.from('payment_methods').delete().eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const addServiceDefinition = async (definition: Omit<ServiceDefinition, 'id'>) => {
        const { error } = await supabase.from('service_definitions').insert({
            code: definition.code,
            name: definition.name,
            base_price: definition.basePrice,
            category: definition.category,
            display_order: definition.order
        });
        if (error) throw error;
        await fetchData();
    };

    const updateServiceDefinition = async (id: string, definition: Partial<ServiceDefinition>) => {
        const dbData: any = {};
        if (definition.code) dbData.code = definition.code;
        if (definition.name) dbData.name = definition.name;
        if (definition.basePrice !== undefined) dbData.base_price = definition.basePrice;
        if (definition.category) dbData.category = definition.category;
        if (definition.order !== undefined) dbData.display_order = definition.order;

        const { error } = await supabase.from('service_definitions').update(dbData).eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const deleteServiceDefinition = async (id: string) => {
        const { error } = await supabase.from('service_definitions').delete().eq('id', id);
        if (error) throw error;
        await fetchData();
    };

    const updateCompanyInfo = async (info: Partial<CompanyInfo>) => {
        const dbData: any = {};
        if (info.name) dbData.name = info.name;
        if (info.cnpj) dbData.cnpj = info.cnpj;
        if (info.email) dbData.email = info.email;
        if (info.phone) dbData.phone = info.phone;
        if (info.address) dbData.address = info.address;
        if (info.logoUrl) dbData.logo_url = info.logoUrl;
        if (info.globalDiscount !== undefined) dbData.global_discount = info.globalDiscount;

        // Assuming a single record for company info
        const { data: existing } = await supabase.from('company_info').select('id').limit(1).maybeSingle();

        if (existing) {
            const { error } = await supabase.from('company_info').update(dbData).eq('id', existing.id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('company_info').insert(dbData);
            if (error) throw error;
        }
        await fetchData();
    };

    return (
        <DataContext.Provider value={{
            clients, services, transactions, tasks,
            serviceDefinitions, paymentMethods, invoices, companyInfo,
            loading, refreshData: fetchData,
            addClient, updateClient, deleteClient,
            addService, updateService, deleteService,
            addTransaction, updateTransaction, deleteTransaction,
            addTask, updateTask, deleteTask,
            addPaymentMethod, updatePaymentMethod, deletePaymentMethod,
            addServiceDefinition, updateServiceDefinition, deleteServiceDefinition,
            updateCompanyInfo
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within DataProvider');
    return context;
};
