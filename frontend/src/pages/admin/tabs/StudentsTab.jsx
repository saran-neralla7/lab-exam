import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Trash2, Download, Upload, FileSpreadsheet } from 'lucide-react';
import Modal from '../../../components/ui/Modal';

const StudentsTab = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ rollNumber: '', name: '', departmentId: '', sectionId: '', year: '1', semester: '1' });

  const [importResult, setImportResult] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleDownloadTemplate = async () => {
    try {
      const res = await axios.get('/api/admin/students/template');
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'student_template.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) { alert('Error downloading template'); }
  };

  const handleExport = async () => {
    try {
      const res = await axios.get('/api/admin/students/export');
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'students_export.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) { alert('Error exporting students'); }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      setImporting(true);
      setImportResult(null);
      try {
        const res = await axios.post('/api/admin/students/import', { csvData: evt.target.result });
        setImportResult(res.data);
        setIsImportModalOpen(true);
        fetchData();
      } catch (err) {
        setImportResult({ created: 0, skipped: 0, errors: [err.response?.data?.message || 'Import failed'] });
        setIsImportModalOpen(true);
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const availableSections = sections.filter(s => s.department?._id === formData.departmentId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Students</h2>
          <p className="text-slate-500 mt-1">Manage student directory for attendance generation</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleDownloadTemplate}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg font-medium flex items-center space-x-1.5 transition-colors text-sm"
          >
            <FileSpreadsheet size={16} />
            <span>Template</span>
          </button>
          <label 
            className={`bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg font-medium flex items-center space-x-1.5 transition-colors text-sm cursor-pointer ${importing ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <Upload size={16} />
            <span>{importing ? 'Importing...' : 'Import CSV'}</span>
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImportFile} />
          </label>
          <button 
            onClick={handleExport}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg font-medium flex items-center space-x-1.5 transition-colors text-sm"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Plus size={18} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Roll No</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Department</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Section</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Year</th>
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
                <td className="px-6 py-4 text-slate-600">{stu.year}</td>
                <td className="px-6 py-4 text-slate-600">{stu.semester}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(stu._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-500">No students found</td></tr>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Year (1-4)</label>
              <input type="number" min="1" max="4" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                  value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Semester (1-2)</label>
              <input type="number" min="1" max="2" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none"
                  value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} required />
            </div>
          </div>
          <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors">
            Save Student
          </button>
        </form>
      </Modal>

      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import Results">
        {importResult && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{importResult.created}</p>
                <p className="text-sm text-green-600">Students Created</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-700">{importResult.skipped}</p>
                <p className="text-sm text-amber-600">Rows Skipped</p>
              </div>
            </div>
            {importResult.errors?.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-h-48 overflow-y-auto">
                <p className="text-sm font-semibold text-red-700 mb-2">Errors:</p>
                {importResult.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-600 mb-1">• {err}</p>
                ))}
              </div>
            )}
            <button onClick={() => setIsImportModalOpen(false)} className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors">
              Close
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentsTab;
