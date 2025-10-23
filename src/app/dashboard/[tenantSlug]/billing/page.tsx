'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Types
interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  exp_month?: number;
  exp_year?: number;
  bank_name?: string;
  is_default: boolean;
}

interface Invoice {
  id: string;
  invoice_number: string;
  date: string;
  due_date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  pdf_url: string;
  line_items: {
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }[];
}

interface Subscription {
  id: string;
  plan_name: string;
  plan_tier: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  amount: number;
  interval: 'month' | 'year';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
}

interface UsageCost {
  resource_type: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_cost: number;
}

interface BillingData {
  subscription: Subscription;
  payment_methods: PaymentMethod[];
  invoices: Invoice[];
  current_usage: UsageCost[];
  estimated_monthly_cost: number;
  billing_email: string;
  next_billing_date: string;
}

interface PlanOption {
  id: string;
  name: string;
  tier: 'starter' | 'professional' | 'enterprise';
  description: string;
  monthly_price: number;
  annual_price: number;
  features: string[];
  limits: {
    api_keys: number;
    users: number;
    api_calls_monthly: number;
    tokens_monthly: number;
  };
  popular?: boolean;
}

export default function BillingPage() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = params.tenantSlug as string;
  
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payment' | 'usage'>('overview');
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState<string | null>(null);
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState<'month' | 'year'>('month');
  const [changingPlan, setChangingPlan] = useState(false);

  useEffect(() => {
    loadBillingData();
  }, [tenantSlug]);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      // const response = await api.getTenantBilling(tenantSlug);
      const mockData: BillingData = {
        subscription: {
          id: 'sub_1234567890',
          plan_name: 'Professional Plan',
          plan_tier: 'professional',
          status: 'active',
          amount: 99.00,
          interval: 'month',
          current_period_start: '2025-10-01',
          current_period_end: '2025-10-31',
          cancel_at_period_end: false,
        },
        payment_methods: [
          {
            id: 'pm_1',
            type: 'card',
            last4: '4242',
            brand: 'Visa',
            exp_month: 12,
            exp_year: 2026,
            is_default: true,
          },
          {
            id: 'pm_2',
            type: 'card',
            last4: '5555',
            brand: 'Mastercard',
            exp_month: 6,
            exp_year: 2027,
            is_default: false,
          },
        ],
        invoices: [
          {
            id: 'inv_1',
            invoice_number: 'INV-2025-10-001',
            date: '2025-10-01',
            due_date: '2025-10-15',
            amount: 156.50,
            status: 'paid',
            pdf_url: '/invoices/inv_1.pdf',
            line_items: [
              { description: 'Professional Plan - Monthly', quantity: 1, unit_price: 99.00, amount: 99.00 },
              { description: 'API Calls (overage)', quantity: 15000, unit_price: 0.002, amount: 30.00 },
              { description: 'Token Usage (overage)', quantity: 2750000, unit_price: 0.00001, amount: 27.50 },
            ],
          },
          {
            id: 'inv_2',
            invoice_number: 'INV-2025-09-001',
            date: '2025-09-01',
            due_date: '2025-09-15',
            amount: 99.00,
            status: 'paid',
            pdf_url: '/invoices/inv_2.pdf',
            line_items: [
              { description: 'Professional Plan - Monthly', quantity: 1, unit_price: 99.00, amount: 99.00 },
            ],
          },
          {
            id: 'inv_3',
            invoice_number: 'INV-2025-08-001',
            date: '2025-08-01',
            due_date: '2025-08-15',
            amount: 134.25,
            status: 'paid',
            pdf_url: '/invoices/inv_3.pdf',
            line_items: [
              { description: 'Professional Plan - Monthly', quantity: 1, unit_price: 99.00, amount: 99.00 },
              { description: 'API Calls (overage)', quantity: 10000, unit_price: 0.002, amount: 20.00 },
              { description: 'Token Usage (overage)', quantity: 1525000, unit_price: 0.00001, amount: 15.25 },
            ],
          },
        ],
        current_usage: [
          {
            resource_type: 'api_calls',
            description: 'API Calls',
            quantity: 45250,
            unit: 'calls',
            unit_price: 0.002,
            total_cost: 0.00, // Within quota
          },
          {
            resource_type: 'tokens',
            description: 'Token Processing',
            quantity: 8543210,
            unit: 'tokens',
            unit_price: 0.00001,
            total_cost: 0.00, // Within quota
          },
          {
            resource_type: 'storage',
            description: 'Data Storage',
            quantity: 15.7,
            unit: 'GB',
            unit_price: 0.10,
            total_cost: 1.57,
          },
        ],
        estimated_monthly_cost: 100.57,
        billing_email: 'billing@acme-college.com',
        next_billing_date: '2025-10-31',
      };
      
      setBillingData(mockData);
    } catch (error) {
      console.error('Failed to load billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      trialing: 'bg-blue-100 text-blue-800',
      past_due: 'bg-red-100 text-red-800',
      canceled: 'bg-gray-100 text-gray-800',
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
    };
    
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  const downloadReceipt = async (invoiceId?: string) => {
    try {
      setDownloadingReceipt(invoiceId || 'current');
      
      // Determine which invoice/receipt to download
      let invoice: Invoice | null = null;
      let filename: string;
      
      if (invoiceId) {
        // Download specific invoice
        invoice = billingData?.invoices.find(inv => inv.id === invoiceId) || null;
        filename = invoice ? `${invoice.invoice_number}.pdf` : 'invoice.pdf';
      } else {
        // Download current period receipt (most recent invoice)
        invoice = billingData?.invoices[0] || null;
        filename = 'receipt.pdf';
      }

      if (!invoice) {
        alert('Receipt not available');
        return;
      }

      // In production, this would call the backend API:
      // const response = await fetch(`/api/tenants/${tenantSlug}/invoices/${invoice.id}/pdf`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      
      // For now, generate a mock PDF-like receipt
      const receiptContent = generateReceiptHTML(invoice);
      
      // Create a printable receipt
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(receiptContent);
        printWindow.document.close();
        
        // Trigger print dialog after a short delay
        setTimeout(() => {
          printWindow.print();
        }, 250);
      } else {
        // Fallback: download as HTML
        const blob = new Blob([receiptContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.replace('.pdf', '.html');
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to download receipt:', error);
      alert('Failed to download receipt. Please try again.');
    } finally {
      setDownloadingReceipt(null);
    }
  };

  const generateReceiptHTML = (invoice: Invoice): string => {
    if (!billingData) return '';
    
    const org = billingData;
    const subtotal = invoice.line_items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.0; // No tax for now
    const total = subtotal + tax;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${invoice.invoice_number}</title>
  <style>
    @media print {
      @page { margin: 0.5in; }
      body { margin: 0; }
      .no-print { display: none; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .company-info h1 {
      margin: 0;
      color: #2563eb;
      font-size: 28px;
    }
    .company-info p {
      margin: 5px 0;
      color: #666;
    }
    .invoice-info {
      text-align: right;
    }
    .invoice-info h2 {
      margin: 0;
      font-size: 32px;
      color: #333;
    }
    .invoice-info p {
      margin: 5px 0;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      background: #d1fae5;
      color: #065f46;
    }
    .billing-section {
      display: flex;
      justify-content: space-between;
      margin: 30px 0;
    }
    .billing-box {
      flex: 1;
      margin-right: 20px;
    }
    .billing-box:last-child {
      margin-right: 0;
    }
    .billing-box h3 {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .billing-box p {
      margin: 3px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    thead {
      background: #f3f4f6;
    }
    th {
      text-align: left;
      padding: 12px;
      font-weight: 600;
      color: #374151;
      text-transform: uppercase;
      font-size: 12px;
    }
    th.right, td.right {
      text-align: right;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    tbody tr:hover {
      background: #f9fafb;
    }
    .totals {
      margin-top: 30px;
      text-align: right;
    }
    .totals table {
      margin-left: auto;
      width: 300px;
    }
    .totals td {
      border: none;
      padding: 8px 12px;
    }
    .totals .total-row {
      font-weight: bold;
      font-size: 18px;
      border-top: 2px solid #333;
      color: #2563eb;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .footer p {
      margin: 5px 0;
    }
    .notes {
      margin-top: 30px;
      padding: 15px;
      background: #f3f4f6;
      border-radius: 8px;
    }
    .notes h4 {
      margin: 0 0 10px 0;
      color: #374151;
    }
    .notes p {
      margin: 5px 0;
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <h1>NextCore AI Cloud</h1>
      <p>123 AI Boulevard, Suite 100</p>
      <p>San Francisco, CA 94102</p>
      <p>support@nextcore.ai</p>
      <p>Tax ID: 12-3456789</p>
    </div>
    <div class="invoice-info">
      <h2>RECEIPT</h2>
      <p><strong>${invoice.invoice_number}</strong></p>
      <p>Date: ${formatDate(invoice.date)}</p>
      <p>Due: ${formatDate(invoice.due_date)}</p>
      <p class="status-badge">${invoice.status.toUpperCase()}</p>
    </div>
  </div>

  <div class="billing-section">
    <div class="billing-box">
      <h3>Billed To</h3>
      <p><strong>Acme Training College</strong></p>
      <p>Organization ID: ${tenantSlug}</p>
      <p>${org.billing_email}</p>
    </div>
    <div class="billing-box">
      <h3>Payment Details</h3>
      <p>Method: ${billingData.payment_methods.find(pm => pm.is_default)?.brand || 'Card'} •••• ${billingData.payment_methods.find(pm => pm.is_default)?.last4 || '****'}</p>
      <p>Billing Period: ${formatDate(billingData.subscription.current_period_start)} - ${formatDate(billingData.subscription.current_period_end)}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="right">Quantity</th>
        <th class="right">Unit Price</th>
        <th class="right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.line_items.map(item => `
        <tr>
          <td>${item.description}</td>
          <td class="right">${item.quantity.toLocaleString()}</td>
          <td class="right">${formatCurrency(item.unit_price)}</td>
          <td class="right">${formatCurrency(item.amount)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr>
        <td>Subtotal:</td>
        <td class="right">${formatCurrency(subtotal)}</td>
      </tr>
      ${tax > 0 ? `
      <tr>
        <td>Tax (0%):</td>
        <td class="right">${formatCurrency(tax)}</td>
      </tr>
      ` : ''}
      <tr class="total-row">
        <td>Total:</td>
        <td class="right">${formatCurrency(total)}</td>
      </tr>
    </table>
  </div>

  <div class="notes">
    <h4>Payment Information</h4>
    <p>Thank you for your payment! This receipt confirms your subscription to NextCore AI Cloud.</p>
    <p>If you have any questions about this receipt, please contact us at billing@nextcore.ai</p>
  </div>

  <div class="footer">
    <p><strong>NextCore AI Cloud</strong></p>
    <p>This is an automatically generated receipt. For questions, contact support@nextcore.ai</p>
    <p>© ${new Date().getFullYear()} NextCore AI Cloud. All rights reserved.</p>
  </div>

  <div class="no-print" style="margin-top: 30px; text-align: center;">
    <button onclick="window.print()" style="padding: 12px 24px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
      Print Receipt
    </button>
  </div>
</body>
</html>
    `.trim();
  };

  const emailInvoice = async (invoiceId: string) => {
    try {
      const invoice = billingData?.invoices.find(inv => inv.id === invoiceId);
      if (!invoice) return;

      // In production, call API:
      // await api.emailInvoice(tenantSlug, invoiceId);
      
      alert(`Invoice ${invoice.invoice_number} will be sent to ${billingData?.billing_email}`);
    } catch (error) {
      console.error('Failed to email invoice:', error);
      alert('Failed to send invoice. Please try again.');
    }
  };

  // Available plan options
  const availablePlans: PlanOption[] = [
    {
      id: 'starter',
      name: 'Starter',
      tier: 'starter',
      description: 'Perfect for individuals and small projects',
      monthly_price: 29,
      annual_price: 290,
      features: [
        '5 API Keys',
        '5 Team Members',
        '25K API Calls/month',
        '2.5M Tokens/month',
        'Email Support',
        'Basic Analytics',
        'Community Access',
      ],
      limits: {
        api_keys: 5,
        users: 5,
        api_calls_monthly: 25000,
        tokens_monthly: 2500000,
      },
    },
    {
      id: 'professional',
      name: 'Professional',
      tier: 'professional',
      description: 'For growing teams and production applications',
      monthly_price: 99,
      annual_price: 990,
      features: [
        '10 API Keys',
        '25 Team Members',
        '50K API Calls/month',
        '10M Tokens/month',
        'Priority Email Support',
        'Advanced Analytics',
        'Custom Domains',
        'Webhook Integration',
        'Audit Logs (90 days)',
      ],
      limits: {
        api_keys: 10,
        users: 25,
        api_calls_monthly: 50000,
        tokens_monthly: 10000000,
      },
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      tier: 'enterprise',
      description: 'For large organizations with advanced needs',
      monthly_price: 499,
      annual_price: 4990,
      features: [
        'Unlimited API Keys',
        'Unlimited Team Members',
        'Unlimited API Calls',
        'Unlimited Tokens',
        '24/7 Phone & Email Support',
        'Enterprise Analytics',
        'Custom Domains',
        'Advanced Webhooks',
        'Audit Logs (Unlimited)',
        'SSO / SAML',
        'SLA Guarantee',
        'Dedicated Account Manager',
        'Custom Integrations',
      ],
      limits: {
        api_keys: -1,
        users: -1,
        api_calls_monthly: -1,
        tokens_monthly: -1,
      },
    },
  ];

  const changePlan = async (planId: string, interval: 'month' | 'year') => {
    try {
      setChangingPlan(true);
      const selectedPlan = availablePlans.find(p => p.id === planId);
      if (!selectedPlan) return;

      // In production, call API:
      // await api.updateSubscription(tenantSlug, { plan_id: planId, interval });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update local state
      if (billingData) {
        setBillingData({
          ...billingData,
          subscription: {
            ...billingData.subscription,
            plan_name: `${selectedPlan.name} Plan`,
            plan_tier: selectedPlan.tier,
            amount: interval === 'month' ? selectedPlan.monthly_price : selectedPlan.annual_price,
            interval,
          },
        });
      }

      setShowChangePlan(false);
      alert(`Successfully changed to ${selectedPlan.name} Plan (${interval === 'month' ? 'Monthly' : 'Annual'})`);
    } catch (error) {
      console.error('Failed to change plan:', error);
      alert('Failed to change plan. Please try again.');
    } finally {
      setChangingPlan(false);
    }
  };

  const getCurrentPlan = (): PlanOption | undefined => {
    return availablePlans.find(p => p.tier === billingData?.subscription.plan_tier);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  if (!billingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load billing data</p>
          <button onClick={loadBillingData} className="mt-4 text-blue-600 hover:underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href={`/dashboard/${tenantSlug}`} className="hover:text-gray-700">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-900">Billing</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
              <p className="mt-2 text-gray-600">
                Manage your subscription, payment methods, and invoices
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Billing Email</p>
              <p className="text-lg font-semibold text-gray-900">{billingData.billing_email}</p>
            </div>
          </div>
        </div>

        {/* Subscription Overview Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{billingData.subscription.plan_name}</h2>
              <p className="text-blue-100 mt-1">
                Billed {billingData.subscription.interval === 'month' ? 'monthly' : 'annually'}
              </p>
            </div>
            {getStatusBadge(billingData.subscription.status)}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-blue-100 text-sm">Current Amount</p>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency(billingData.subscription.amount)}
                <span className="text-lg font-normal text-blue-100">/{billingData.subscription.interval}</span>
              </p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Estimated This Month</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(billingData.estimated_monthly_cost)}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Next Billing Date</p>
              <p className="text-xl font-semibold mt-1">{formatDate(billingData.next_billing_date)}</p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button 
              onClick={() => setShowChangePlan(true)}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              Change Plan
            </button>
            <button 
              onClick={() => downloadReceipt()}
              disabled={downloadingReceipt === 'current'}
              className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloadingReceipt === 'current' ? 'Downloading...' : 'Download Receipt'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'invoices'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Invoices
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'payment'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Payment Methods
              </button>
              <button
                onClick={() => setActiveTab('usage')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'usage'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Usage & Costs
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Subscription Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan</span>
                      <span className="font-medium text-gray-900">{billingData.subscription.plan_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      {getStatusBadge(billingData.subscription.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Billing Cycle</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(billingData.subscription.current_period_start)} - {formatDate(billingData.subscription.current_period_end)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Renewal</span>
                      <span className="font-medium text-gray-900">
                        {billingData.subscription.cancel_at_period_end ? 'Cancels at period end' : 'Auto-renew enabled'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Invoices */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
                    <button onClick={() => setActiveTab('invoices')} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {billingData.invoices.slice(0, 3).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
                            <p className="text-sm text-gray-600">{formatDate(invoice.date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(invoice.status)}
                          <span className="font-semibold text-gray-900">{formatCurrency(invoice.amount)}</span>
                          <button 
                            onClick={() => downloadReceipt(invoice.id)}
                            disabled={downloadingReceipt === invoice.id}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {downloadingReceipt === invoice.id ? 'Downloading...' : 'Download'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Default Payment Method</h3>
                    <button onClick={() => setActiveTab('payment')} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Manage
                    </button>
                  </div>
                  {billingData.payment_methods.filter(pm => pm.is_default).map((pm) => (
                    <div key={pm.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-gray-300 rounded flex items-center justify-center text-xs font-bold text-gray-700">
                          {pm.brand?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {pm.brand} •••• {pm.last4}
                          </p>
                          <p className="text-sm text-gray-600">
                            Expires {pm.exp_month}/{pm.exp_year}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        Default
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Invoice History</h3>
                  <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    Export All
                  </button>
                </div>
                
                <div className="space-y-4">
                  {billingData.invoices.map((invoice) => (
                    <div key={invoice.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{invoice.invoice_number}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Issued: {formatDate(invoice.date)} • Due: {formatDate(invoice.due_date)}
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(invoice.status)}
                          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(invoice.amount)}</p>
                        </div>
                      </div>

                      {/* Line Items */}
                      <div className="border-t border-gray-200 pt-4">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-600">
                              <th className="pb-2">Description</th>
                              <th className="pb-2 text-right">Qty</th>
                              <th className="pb-2 text-right">Unit Price</th>
                              <th className="pb-2 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-900">
                            {invoice.line_items.map((item, idx) => (
                              <tr key={idx} className="border-t border-gray-100">
                                <td className="py-2">{item.description}</td>
                                <td className="py-2 text-right">{item.quantity.toLocaleString()}</td>
                                <td className="py-2 text-right">{formatCurrency(item.unit_price)}</td>
                                <td className="py-2 text-right font-medium">{formatCurrency(item.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4 flex gap-3">
                        <button 
                          onClick={() => downloadReceipt(invoice.id)}
                          disabled={downloadingReceipt === invoice.id}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {downloadingReceipt === invoice.id ? 'Downloading...' : 'Download PDF'}
                        </button>
                        <button 
                          onClick={() => emailInvoice(invoice.id)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          Email Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                  <button 
                    onClick={() => setShowAddPayment(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Add Payment Method
                  </button>
                </div>

                <div className="space-y-4">
                  {billingData.payment_methods.map((pm) => (
                    <div key={pm.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded flex items-center justify-center text-xs font-bold text-white">
                          {pm.type === 'card' ? pm.brand?.toUpperCase() : 'BANK'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {pm.type === 'card' 
                              ? `${pm.brand} •••• ${pm.last4}` 
                              : `${pm.bank_name} •••• ${pm.last4}`
                            }
                          </p>
                          <p className="text-sm text-gray-600">
                            {pm.type === 'card' && `Expires ${pm.exp_month}/${pm.exp_year}`}
                            {pm.type === 'bank_account' && 'Bank Account'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {pm.is_default ? (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            Default
                          </span>
                        ) : (
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Set as Default
                          </button>
                        )}
                        <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Payment Modal (simplified) */}
                {showAddPayment && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Payment Method</h3>
                      <p className="text-gray-600 mb-4">
                        This would integrate with Stripe or another payment processor
                      </p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setShowAddPayment(false)}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Add Card
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Usage & Costs Tab */}
            {activeTab === 'usage' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Billing Period</h3>
                  <p className="text-gray-600">
                    {formatDate(billingData.subscription.current_period_start)} - {formatDate(billingData.subscription.current_period_end)}
                  </p>
                </div>

                {/* Usage Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Estimated Total This Period</p>
                      <p className="text-3xl font-bold text-blue-900 mt-1">
                        {formatCurrency(billingData.estimated_monthly_cost)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-700">Base Subscription</p>
                      <p className="text-xl font-semibold text-blue-900">{formatCurrency(billingData.subscription.amount)}</p>
                    </div>
                  </div>
                </div>

                {/* Usage Breakdown */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Usage Details</h4>
                  {billingData.current_usage.map((usage, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{usage.description}</h5>
                        <span className="text-lg font-bold text-gray-900">
                          {usage.total_cost > 0 ? formatCurrency(usage.total_cost) : 'Included'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                          {usage.quantity.toLocaleString()} {usage.unit} × {formatCurrency(usage.unit_price)}/{usage.unit}
                        </span>
                        {usage.total_cost === 0 && (
                          <span className="text-green-600 font-medium">Within quota</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cost Breakdown Chart */}
                <div className="mt-8 border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Cost Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-blue-600 rounded"></div>
                        <span className="text-gray-700">Base Subscription</span>
                      </div>
                      <span className="font-medium text-gray-900">{formatCurrency(billingData.subscription.amount)}</span>
                    </div>
                    {billingData.current_usage.filter(u => u.total_cost > 0).map((usage, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span className="text-gray-700">{usage.description}</span>
                        </div>
                        <span className="font-medium text-gray-900">{formatCurrency(usage.total_cost)}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Total Estimated</span>
                      <span className="text-xl font-bold text-gray-900">{formatCurrency(billingData.estimated_monthly_cost)}</span>
                    </div>
                  </div>
                </div>

                {/* Usage Alerts */}
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h5 className="font-medium text-yellow-900">Usage Alert</h5>
                      <p className="text-sm text-yellow-700 mt-1">
                        You've used 90% of your included API calls. Additional usage will be billed at ${billingData.current_usage.find(u => u.resource_type === 'api_calls')?.unit_price}/call.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Billing Preferences */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Invoices</p>
                <p className="text-sm text-gray-600">Receive invoices via email at {billingData.billing_email}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Usage Alerts</p>
                <p className="text-sm text-gray-600">Get notified when approaching quota limits</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Auto-pay</p>
                <p className="text-sm text-gray-600">Automatically charge payment method on due date</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Change Plan Modal */}
        {showChangePlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Change Your Plan</h2>
                  <p className="text-gray-600 mt-1">Choose the plan that best fits your needs</p>
                </div>
                <button 
                  onClick={() => setShowChangePlan(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                {/* Billing Interval Toggle */}
                <div className="flex items-center justify-center mb-8">
                  <div className="bg-gray-100 rounded-lg p-1 inline-flex">
                    <button
                      onClick={() => setSelectedInterval('month')}
                      className={`px-6 py-2 rounded-md font-medium transition-colors ${
                        selectedInterval === 'month'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setSelectedInterval('year')}
                      className={`px-6 py-2 rounded-md font-medium transition-colors ${
                        selectedInterval === 'year'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Annual
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        Save 17%
                      </span>
                    </button>
                  </div>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {availablePlans.map((plan) => {
                    const isCurrentPlan = plan.tier === billingData?.subscription.plan_tier;
                    const price = selectedInterval === 'month' ? plan.monthly_price : plan.annual_price;
                    const displayPrice = selectedInterval === 'month' ? price : price / 12;

                    return (
                      <div
                        key={plan.id}
                        className={`relative border-2 rounded-lg p-6 ${
                          isCurrentPlan
                            ? 'border-blue-600 bg-blue-50'
                            : plan.popular
                            ? 'border-blue-300 shadow-lg'
                            : 'border-gray-200'
                        }`}
                      >
                        {plan.popular && !isCurrentPlan && (
                          <div className="absolute top-0 right-6 transform -translate-y-1/2">
                            <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1 rounded-full text-sm font-semibold">
                              Most Popular
                            </span>
                          </div>
                        )}

                        {isCurrentPlan && (
                          <div className="absolute top-0 right-6 transform -translate-y-1/2">
                            <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                              Current Plan
                            </span>
                          </div>
                        )}

                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                        </div>

                        <div className="mb-6">
                          <div className="flex items-baseline">
                            <span className="text-4xl font-bold text-gray-900">
                              ${displayPrice.toFixed(0)}
                            </span>
                            <span className="text-gray-600 ml-2">/month</span>
                          </div>
                          {selectedInterval === 'year' && (
                            <p className="text-sm text-gray-600 mt-1">
                              ${price}/year (billed annually)
                            </p>
                          )}
                        </div>

                        <div className="mb-6 space-y-3">
                          <div className="text-sm font-semibold text-gray-700 border-b pb-2">
                            Included Features:
                          </div>
                          {plan.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => changePlan(plan.id, selectedInterval)}
                          disabled={isCurrentPlan || changingPlan}
                          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                            isCurrentPlan
                              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                              : plan.popular
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {changingPlan
                            ? 'Processing...'
                            : isCurrentPlan
                            ? 'Current Plan'
                            : `Switch to ${plan.name}`}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Plan Comparison Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h5 className="font-medium text-blue-900">Plan Change Information</h5>
                      <p className="text-sm text-blue-700 mt-1">
                        • Upgrades take effect immediately and you'll be charged a prorated amount
                      </p>
                      <p className="text-sm text-blue-700">
                        • Downgrades will take effect at the end of your current billing period
                      </p>
                      <p className="text-sm text-blue-700">
                        • You can cancel or change your plan at any time
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enterprise Custom Option */}
                <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Need a Custom Plan?</h4>
                      <p className="text-gray-600 mt-1">
                        Contact our sales team for custom pricing, volume discounts, or specialized requirements.
                      </p>
                    </div>
                    <button className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap">
                      Contact Sales
                    </button>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Questions? Contact <a href="mailto:billing@nextcore.ai" className="text-blue-600 hover:underline">billing@nextcore.ai</a>
                </div>
                <button
                  onClick={() => setShowChangePlan(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
