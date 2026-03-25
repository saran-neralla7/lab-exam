import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../../../components/ui/Modal';

const SectionsTab = () => {
  const [sections, setSections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newSectionName, setNewSectionName] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  const fetchData = async () => {
    try {
      const [secRes, depRes] = await Promise.all([
        axios.get('/api/admin/sections'),
        axios.get('/api/admin/departments')
      ]);
      setSections(secRes.data);
      setDepartments(depRes.data);
      if (depRes.data.length > 0) setSelectedDept(depRes.data[0]._id);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/sections', { name: newSectionName, departmentId: selectedDept });
      setNewSectionName('');
      setIsModalOpen(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/admin/sections/${id}`);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sections</h2>
          <p className="text-slate-500 mt-1">Manage sub-sections per department</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Plus size={18} />
          <span>Add Section</span>
        </button>
      </div>

      <div className="bg-surface rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Section Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sections.map(sec => (
              <tr key={sec._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{sec.name}</td>
                <td className="px-6 py-4 text-slate-600">{sec.department?.name || 'N/A'}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(sec._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {sections.length === 0 && (
              <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-500">No sections found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Section">
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Section Name</label>
            <input 
              type="text" 
              autoFocus
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="e.g. A, B, C..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
            <select 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              required
            >
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors">
            Save Section
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default SectionsTab;
