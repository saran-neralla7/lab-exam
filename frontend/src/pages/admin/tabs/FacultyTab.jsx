import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Key } from 'lucide-react';
import Modal from '../../../components/ui/Modal';

const FacultyTab = () => {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ username: '', password: '', departmentId: '' });

  const fetchData = async () => {
    try {
      const [facRes, depRes] = await Promise.all([
        axios.get('/api/admin/faculty'),
        axios.get('/api/admin/departments')
      ]);
      setFaculty(facRes.data);
      setDepartments(depRes.data);
      if (depRes.data.length > 0) setFormData(prev => ({...prev, departmentId: depRes.data[0]._id}));
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/faculty', formData);
      setFormData({ ...formData, username: '', password: '' });
      setIsModalOpen(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/admin/faculty/${id}`);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Faculty Accounts</h2>
          <p className="text-slate-500 mt-1">Manage user access and department boundaries</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Plus size={18} />
          <span>Add User</span>
        </button>
      </div>

      <div className="bg-surface rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Username</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Department</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Role</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {faculty.map(f => (
              <tr key={f._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">{f.username.charAt(0).toUpperCase()}</div>
                    <span>{f.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{f.department?.name || 'N/A'}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">Faculty</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(f._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {faculty.length === 0 && (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No faculty members found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Faculty Account">
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="johndoe" required autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label>
            <div className="relative">
              <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
              <Key size={16} className="absolute right-3 top-3 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 mt-1">This will be hashed securely during creation.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Department</label>
            <select className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none bg-white"
              value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} required>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            <p className="text-xs text-slate-500 mt-1">Limits visibility to students/labs within this department.</p>
          </div>
          <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors">
            Create Account
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default FacultyTab;
