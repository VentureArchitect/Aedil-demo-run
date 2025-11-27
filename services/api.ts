
import { Email, SapFormState } from '../types';

/**
 * API Service Layer
 * 
 * This file defines the interfaces for the Real Backend.
 * In a production environment, these functions would make fetch() calls 
 * to your Python/Node.js backend.
 */

export interface IOutlookService {
  getEmails: () => Promise<Email[]>;
  markAsRead: (id: string) => Promise<void>;
  sendDraft: (to: string, subject: string, body: string) => Promise<void>;
}

export interface ISapService {
  getServiceOrder: (id: string) => Promise<any>;
  createServiceOrder: (data: SapFormState) => Promise<{ orderId: string }>;
  checkEquipment: (id: string) => Promise<{ isValid: boolean; model: string }>;
}

export interface IFsmService {
  getTechnicians: (location: string) => Promise<any[]>;
  assignJob: (jobId: string, techId: string) => Promise<void>;
}

// Mock Implementations for the Hybrid Prototype
// These allow the app to function without a backend server while keeping the structure clean.

export const MockOutlookService: IOutlookService = {
  getEmails: async () => [], // In real app, fetch from Graph API
  markAsRead: async () => {},
  sendDraft: async () => console.log('Draft sent via Graph API'),
};

export const MockSapService: ISapService = {
  getServiceOrder: async () => ({}),
  createServiceOrder: async (data) => {
    console.log('POST /sap/odata/ServiceOrders', data);
    return { orderId: 'SO-' + Math.floor(Math.random() * 100000) };
  },
  checkEquipment: async (id) => {
    // Simulate API latency
    await new Promise(r => setTimeout(r, 500));
    return { isValid: true, model: 'EJC 220' };
  }
};
