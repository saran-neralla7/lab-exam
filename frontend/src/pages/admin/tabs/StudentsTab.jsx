import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../../../components/ui/Modal';

const StudentsTab = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ rollNumber: '', name: '', departmentId: '', sectionId: '', semester: '1' });

  const fetchData = async () => {
    try {
      const [stuRes, depRes, secRes] = await Promise.all([
        axios.get('/api/admin/students'),
        axios.get('/api/admin/departments'),
        axios.get('/api/admin/sections')
      ]);
      setStudents(stuRes.data);
      setDepartments(depRes.data);
      setSections(secRes.data);
      if (depRes.data.length > 0) setFormData(prev => ({...prev, departmentId: depRes.data[0]._id}));
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/students', formData);
      setFormData({ ...formData, rollNumber: '', name: '' });
      setIsModalOpen(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/admin/students/${id}`);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const availableSections = sections.filter(s => s.department?._id === formData.departmentId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Students</h2>
          <p className="text-slate-500 mt-1">Manage student directory for attendance generation</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Plus size={18} />
          <span>Add Student</span>
        </button>
      </div>

      <div className="bg-surface rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Roll No</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Department</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Section</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Sem</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map(stu => (
              <tr key={stu._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{stu.rollNumber}</td>
                <td className="px-6 py-4 text-slate-600">{stu.name}</td>
                <td className="px-6 py-4 text-slate-600">{stu.department?.name || 'N/A'}</td>
                <td className="px-6 py-4 text-slate-600">{stu.section?.name || 'N/A'}</td>
                <td className="px-6 py-4 text-slate-600">{stu.semester}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(stu._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No students found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Student">
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
           <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number</label>
              <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value})} required autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <select className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none bg-white"
                value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value, sectionId: ''})} required>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
              <select className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none bg-white"
                value={formData.sectionId} onChange={e => setFormData({...formData, sectionId: e.target.value})} required={availableSections.length > 0}>
                <option value="">-- Select Section --</option>
                {availableSections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Semester (1-8)</label>
            <input type="number" min="1" max="8" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} required />
          </div>
          <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors">
            Save Student
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default StudentsTab;
