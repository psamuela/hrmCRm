export type Role = 
  | 'super_admin' 
  | 'company_admin' 
  | 'hr_manager' 
  | 'sales_manager' 
  | 'employee' 
  | 'sales_rep' 
  | 'accountant' 
  | 'customer';

export type SubscriptionPlan = 'hrm_only' | 'crm_only' | 'enterprise';

export interface Company {
  id: number;
  name: string;
  code: string;
  currency: string;
  currency_symbol: string;
  tax_id: string | null;
  plan: SubscriptionPlan;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string;
  logo_url: string | null;
  settings?: {
    timezone?: string;
    pension_rate_employee?: number;
    pension_rate_employer?: number;
    nhf_rate?: number;
    vat_rate?: number;
    paystack_enabled?: boolean;
    flutterwave_enabled?: boolean;
  };
  branches?: Branch[];
}

export interface Branch {
  id: number;
  company_id: number;
  name: string;
  code: string;
  city: string | null;
  address: string | null;
  is_headquarters: boolean;
}

export interface Department {
  id: number;
  company_id: number;
  branch_id?: number;
  name: string;
  code: string;
  manager_name?: string;
  description?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  company_id: number;
  branch_id?: number;
  phone?: string;
  avatar?: string;
  is_active: boolean;
  company?: Company;
  branch?: Branch;
  employee?: Employee;
}

export interface Employee {
  id: number;
  company_id: number;
  branch_id?: number;
  department_id?: number;
  user_id?: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  designation: string;
  employment_type: 'full-time' | 'part-time' | 'contract' | 'intern';
  employment_status: 'active' | 'on_leave' | 'terminated' | 'resigned';
  joining_date: string;
  basic_salary: number;
  bank_name?: string;
  bank_account_number?: string;
  tax_bvn_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_relationship?: string;
  avatar_url?: string;
  department?: Department;
  branch?: Branch;
}

export interface Attendance {
  id: number;
  company_id: number;
  employee_id: number;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: 'present' | 'late' | 'half_day' | 'absent' | 'on_leave';
  work_mode: 'office' | 'remote';
  working_hours: number;
  overtime_hours: number;
  notes?: string;
  employee?: Employee;
}

export interface LeaveRequest {
  id: number;
  company_id: number;
  employee_id: number;
  leave_type: 'annual' | 'sick' | 'casual' | 'maternity' | 'paternity' | 'unpaid' | 'study';
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  rejection_reason?: string;
  employee?: Employee;
}

export interface Payroll {
  id: number;
  company_id: number;
  employee_id: number;
  month: string;
  year: number;
  payslip_number: string;
  basic_salary: number;
  housing_allowance: number;
  transport_allowance: number;
  other_allowances: number;
  bonuses: number;
  gross_salary: number;
  tax_paye: number;
  pension_employee: number;
  pension_employer: number;
  nhf_deduction: number;
  other_deductions: number;
  net_salary: number;
  payment_status: 'draft' | 'pending_approval' | 'approved' | 'paid';
  payment_method: string;
  payment_date?: string | null;
  employee?: Employee;
}

export interface JobOpening {
  id: number;
  company_id: number;
  department_id?: number;
  title: string;
  employment_type: string;
  location: string;
  salary_range?: string;
  positions_count: number;
  closing_date?: string;
  description?: string;
  requirements?: string;
  status: 'open' | 'interviewing' | 'closed' | 'on_hold';
  department?: Department;
  candidates?: Candidate[];
}

export interface Candidate {
  id: number;
  company_id: number;
  job_opening_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  stage: 'applied' | 'screening' | 'interview' | 'assessment' | 'offer' | 'hired' | 'rejected';
  rating: number;
  ai_match_score: number;
  ai_summary?: string;
  interview_scheduled_at?: string;
  notes?: string;
  job_opening?: JobOpening;
}

export interface Lead {
  id: number;
  company_id: number;
  assigned_to?: number;
  first_name: string;
  last_name: string;
  company_name?: string;
  email: string;
  phone?: string;
  source: 'website' | 'social_media' | 'referral' | 'whatsapp' | 'cold_outreach' | 'event';
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'converted' | 'lost';
  lead_score: number;
  estimated_value: number;
  notes?: string;
  assigned_user?: User;
}

export interface CustomerAccount {
  id: number;
  company_id: number;
  account_manager_id?: number;
  name: string;
  account_code: string;
  industry?: string;
  type: 'corporate' | 'individual';
  tier: 'starter' | 'growth' | 'enterprise' | 'vip';
  email?: string;
  phone?: string;
  website?: string;
  billing_address?: string;
  lifetime_revenue: number;
  status: 'active' | 'inactive' | 'churn_risk';
  contacts?: Contact[];
  deals?: Deal[];
  account_manager?: User;
}

export interface Contact {
  id: number;
  company_id: number;
  customer_account_id?: number;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  is_primary: boolean;
}

export type PipelineStage = 'lead' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface Deal {
  id: number;
  company_id: number;
  customer_account_id?: number;
  lead_id?: number;
  assigned_to?: number;
  title: string;
  pipeline_stage: PipelineStage;
  deal_value: number;
  currency: string;
  probability_percent: number;
  expected_closing_date?: string;
  lost_reason?: string;
  notes?: string;
  customer_account?: CustomerAccount;
  assigned_user?: User;
}

export interface Product {
  id: number;
  company_id: number;
  name: string;
  sku: string;
  category: string;
  type: 'product' | 'service';
  unit_price: number;
  cost_price: number;
  tax_rate: number;
  stock_quantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  description?: string;
}

export interface Quotation {
  id: number;
  company_id: number;
  customer_account_id: number;
  quotation_number: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  grand_total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted';
  valid_until?: string;
  terms_and_conditions?: string;
  items?: Array<{ name: string; qty: number; unit_price: number; total: number }>;
  customer_account?: CustomerAccount;
}

export interface Invoice {
  id: number;
  company_id: number;
  customer_account_id: number;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  payment_status: 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
  payment_gateway: 'paystack' | 'flutterwave' | 'bank_transfer' | 'cash';
  payment_reference?: string;
  items?: Array<{ name: string; qty: number; price: number }>;
  customer_account?: CustomerAccount;
}

export interface CrmTask {
  id: number;
  company_id: number;
  assigned_to?: number;
  title: string;
  type: 'call' | 'email' | 'meeting' | 'follow_up' | 'demo';
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}

export interface SupportTicket {
  id: number;
  company_id: number;
  customer_account_id: number;
  assigned_to?: number;
  ticket_number: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_on_client' | 'resolved' | 'closed';
  category: string;
  sla_deadline?: string;
  customer_rating?: number;
  description?: string;
  messages?: Array<{ sender: 'client' | 'support'; name: string; time: string; text: string }>;
  customer_account?: CustomerAccount;
}

export interface CrmCampaign {
  id: number;
  company_id: number;
  name: string;
  channel: 'email' | 'sms' | 'whatsapp';
  target_segment: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed';
  recipients_count: number;
  sent_count: number;
  open_rate: number;
  click_rate: number;
  message_body?: string;
}

export interface ExpenseClaim {
  id: number;
  company_id: number;
  employee_id: number;
  title: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  employee?: Employee;
}

export interface PerformanceReview {
  id: number;
  company_id: number;
  employee_id: number;
  reviewer_id?: number;
  review_period: string;
  kpi_score: number;
  goals_achievement: number;
  overall_score: number;
  manager_feedback?: string;
  employee_self_assessment?: string;
  promotion_recommendation: boolean;
  status: 'draft' | 'submitted' | 'completed';
  employee?: Employee;
}

export interface Training {
  id: number;
  company_id: number;
  title: string;
  trainer?: string;
  type: 'internal' | 'external' | 'online_lms';
  start_date: string;
  end_date?: string;
  capacity: number;
  enrolled_count: number;
  status: 'upcoming' | 'in_progress' | 'completed';
  description?: string;
}

export interface DisciplinaryCase {
  id: number;
  company_id: number;
  employee_id: number;
  case_number: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  incident_date: string;
  description?: string;
  status: 'reported' | 'under_investigation' | 'hearing_scheduled' | 'action_taken' | 'closed';
  action_taken?: string;
  employee?: Employee;
}

export interface AuditLog {
  id: number;
  company_id: number;
  user_name: string;
  module: string;
  action: string;
  details: string;
  ip_address?: string;
  created_at: string;
}

export interface Notification {
  id: number;
  company_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  module: 'hrm' | 'crm' | 'system';
  is_read: boolean;
  created_at: string;
}

export interface WorkflowAutomation {
  id: number;
  company_id: number;
  title: string;
  trigger_event: string;
  action_type: string;
  description?: string;
  is_active: boolean;
  execution_count: number;
}
