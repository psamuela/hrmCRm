import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  CreditCard, 
  Calendar,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { Employee, Department } from '../../types';

export const EmployeesView: React.FC = () => {
  const { company } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Employee Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    designation: '',
    department_id: '',
    employment_type: 'full-time',
    joining_date: new Date().toISOString().split('T')[0],
    basic_salary: '',
    bank_name: 'Access Bank Plc',
    bank_account_number: '',
    tax_bvn_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  const fetchEmployees = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get('/hrm/employees'),
        api.get('/departments'),
      ]);
      if (empRes.data.success) setEmployees(empRes.data.data);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
    } catch (e) {
      console.error('Failed to load employees:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);
    try {
      const res = await api.post('/hrm/employees', {
        ...formData,
        basic_salary: parseFloat(formData.basic_salary) || 500000,
        department_id: parseInt(formData.department_id) || (departments[0]?.id || 1),
      });
      if (res.data.success) {
        setFormMsg({ type: 'success', text: 'Employee registered successfully!' });
        setTimeout(() => {
          setShowAddModal(false);
          setFormMsg(null);
          fetchEmployees();
        }, 1200);
      }
    } catch (err: any) {
      setFormMsg({ type: 'error', text: err.response?.data?.message || 'Failed to register employee' });
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = 
      emp.first_name.toLowerCase().includes(search.toLowerCase()) ||
      emp.last_name.toLowerCase().includes(search.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(search.toLowerCase()) ||
      emp.designation.toLowerCase().includes(search.toLowerCase());

    const matchesDept = selectedDept === 'all' || emp.department_id === parseInt(selectedDept);
    return matchesSearch && matchesDept;
  });

  const currencySymbol = company?.currency_symbol || '₦';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            1.1 Employee Management & Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage employee onboarding, profiles, compensation, designations, and department assignments.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Onboard New Employee
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, designation..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 text-slate-700"
          >
            <option value="all">All Departments ({employees.length})</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
            Showing {filteredEmployees.length} staff
          </span>
        </div>
      </div>

      {/* Employees Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading directory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              onClick={() => setSelectedEmployee(emp)}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-400/80 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatar_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"}
                      alt={emp.first_name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-blue-200 transition-all"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {emp.first_name} {emp.last_name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{emp.designation}</p>
                      <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                        {emp.employee_code}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    emp.employment_status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {emp.employment_status}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{emp.department?.name || 'General Dept'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{emp.phone || '+234 800 000 0000'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Basic Salary:</span>
                <span className="font-bold text-slate-800">{currencySymbol}{Number(emp.basic_salary).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Employee Detail Drawer */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-800">Employee Comprehensive Profile</h3>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar & Header */}
            <div className="flex items-center gap-4">
              <img
                src={selectedEmployee.avatar_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"}
                alt={selectedEmployee.first_name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-50"
              />
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  {selectedEmployee.first_name} {selectedEmployee.last_name}
                </h4>
                <p className="text-xs text-blue-600 font-semibold">{selectedEmployee.designation}</p>
                <p className="text-xs text-slate-500 mt-0.5">Code: {selectedEmployee.employee_code} · {selectedEmployee.employment_type}</p>
              </div>
            </div>

            {/* Department & Branch */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-800">{selectedEmployee.department?.name || 'Engineering'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Branch Office:</span>
                <span className="font-semibold text-slate-800">{selectedEmployee.branch?.name || 'Lagos Head Office'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Joining Date:</span>
                <span className="font-semibold text-slate-800">{selectedEmployee.joining_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-emerald-600 capitalize">{selectedEmployee.employment_status}</span>
              </div>
            </div>

            {/* Compensation & Nigerian Statutory Details */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                Compensation & Nigerian Bank Details
              </h5>
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Basic Monthly Salary:</span>
                  <span className="font-bold text-slate-900">{currencySymbol}{Number(selectedEmployee.basic_salary).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Bank Name:</span>
                  <span className="font-semibold text-slate-800">{selectedEmployee.bank_name || 'Access Bank Plc'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">NUBAN Account:</span>
                  <span className="font-mono text-slate-800 font-semibold">{selectedEmployee.bank_account_number || '0123456789'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax / BVN Identifier:</span>
                  <span className="font-mono text-slate-800">{selectedEmployee.tax_bvn_number || '22334455667'}</span>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Emergency Contact Details
              </h5>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Name:</span>
                  <span className="font-semibold text-slate-800">{selectedEmployee.emergency_contact_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-semibold text-slate-800">{selectedEmployee.emergency_contact_phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Relationship:</span>
                  <span className="font-semibold text-slate-800">{selectedEmployee.emergency_relationship || 'Spouse'}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-all"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Employee Onboarding Registration
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formMsg && (
              <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                formMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {formMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {formMsg.text}
              </div>
            )}

            <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Tunde"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Alabi"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Corporate Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="tunde.alabi@innowise.com"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="+234 803 000 1122"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Job Title / Designation *</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department *</label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Monthly Basic Salary (₦) *</label>
                  <input
                    type="number"
                    required
                    value={formData.basic_salary}
                    onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="650000"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Employment Type</label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="full-time">Full-Time</option>
                    <option value="contract">Contract</option>
                    <option value="part-time">Part-Time</option>
                    <option value="intern">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">NUBAN Account Number</label>
                  <input
                    type="text"
                    value={formData.bank_account_number}
                    onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="10 digits NUBAN"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Save & Complete Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
