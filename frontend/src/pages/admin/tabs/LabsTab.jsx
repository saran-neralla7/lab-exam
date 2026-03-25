import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import Modal from '../../../components/ui/Modal';

const LabsTab = () => {
  const [labs, setLabs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', departmentId: '', enabled: true, checklists: '' });

  const fetchData = async () => {
    try {
      const [labRes, depRes] = await Promise.all([
        axios.get('/api/admin/labs'),
        axios.get('/api/admin/departments')
      ]);
      setLabs(labRes.data);
      setDepartments(depRes.data);
      if (depRes.data.length > 0) setFormData(prev => ({...prev, departmentId: depRes.data[0]._id}));
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        checklists: formData.checklists.split(',').map(s => s.trim()).filter(Boolean)
      };
      await axios.post('/api/admin/labs', data);
      setFormData({ ...formData, name: '', checklists: '' });
      setIsModalOpen(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/admin/labs/${id}`);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Laboratories</h2>
          <p className="text-slate-500 mt-1">Manage labs and their required documents checklist</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Plus size={18} />
          <span>Add Lab</span>
        </button>
      </div>

      <div className="bg-surface rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Lab Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Department</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Checklist Docs</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {labs.map(lab => (
              <tr key={lab._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{lab.name}</td>
                <td className="px-6 py-4 text-slate-600">{lab.department?.name || 'N/A'}</td>
                <td className="px-6 py-4">
                  {lab.enabled ? <CheckCircle className="text-green-500 w-5 h-5" /> : <XCircle className="text-red-500 w-5 h-5" />}
                </td>
                <td className="px-6 py-4 text-slate-600 text-sm">
                  {lab.checklists?.join(', ') || 'None'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(lab._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {labs.length === 0 && (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No labs found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Laboratory">
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lab Name</label>
            <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Physics Lab" required autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
            <select className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none bg-white"
              value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} required>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Required Documents (Comma-separated)</label>
            <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              value={formData.checklists} onChange={e => setFormData({...formData, checklists: e.target.value})} placeholder="Attendance sheet, Bills, Order copy" />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" className="w-4 h-4 rounded text-primary-600" id="labEnable"
              checked={formData.enabled} onChange={e => setFormData({...formData, enabled: e.target.checked})} />
            <label htmlFor="labEnable" className="text-sm text-slate-700">Enable this lab for faculty view</label>
          </div>
          <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors">
            Save Lab
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default LabsTab;
