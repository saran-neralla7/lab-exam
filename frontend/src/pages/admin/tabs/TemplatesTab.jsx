import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, FileCode2, FileBox } from 'lucide-react';
import Modal from '../../../components/ui/Modal';

const TemplatesTab = () => {
  const [templates, setTemplates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', type: 'html', contentHtml: '' });
  const [pdfFile, setPdfFile] = useState(null);

  const fetchData = async () => {
    try {
      const { data } = await axios.get('/api/templates');
      setTemplates(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (formData.type === 'html') {
        await axios.post('/api/templates', formData);
      } else {
        const fd = new FormData();
        fd.append('name', formData.name);
        fd.append('type', 'pdf');
        fd.append('templatePdf', pdfFile);
        
        // For demonstration, map variable default positions
        const map = [
          { variableName: 'student_name', page: 0, x: 100, y: 500 },
          { variableName: 'date', page: 0, x: 400, y: 500 }
        ];
        fd.append('mappedVariables', JSON.stringify(map));
        
        await axios.post('/api/templates', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setFormData({ name: '', type: 'html', contentHtml: '' });
      setPdfFile(null);
      setIsModalOpen(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/templates/${id}`);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Templates</h2>
          <p className="text-slate-500 mt-1">Manage Rich-Text or PDF based document blueprints</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Plus size={18} />
          <span>New Template</span>
        </button>
      </div>

      <div className="bg-surface rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Template Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Engine Type</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {templates.map(tpl => (
              <tr key={tpl._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{tpl.name}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${tpl.type === 'html' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                    {tpl.type === 'html' ? <FileCode2 size={14}/> : <FileBox size={14}/>}
                    <span className="uppercase">{tpl.type}</span>
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(tpl._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {templates.length === 0 && (
              <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-500">No templates found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Template">
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Absentees Statement" required autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Engine Type</label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`border rounded-lg p-3 flex items-center cursor-pointer transition-colors ${formData.type === 'html' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600'}`}>
                <input type="radio" name="engine" className="hidden" checked={formData.type === 'html'} onChange={() => setFormData({...formData, type: 'html'})} />
                <FileCode2 size={18} className="mr-2" /> Rich-Text (HTML)
              </label>
              <label className={`border rounded-lg p-3 flex items-center cursor-pointer transition-colors ${formData.type === 'pdf' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600'}`}>
                <input type="radio" name="engine" className="hidden" checked={formData.type === 'pdf'} onChange={() => setFormData({...formData, type: 'pdf'})} />
                <FileBox size={18} className="mr-2" /> Existing PDF 
              </label>
            </div>
          </div>

          {formData.type === 'html' ? (
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">HTML Content & Variables</label>
              <textarea className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-mono text-sm h-48"
                value={formData.contentHtml} onChange={e => setFormData({...formData, contentHtml: e.target.value})} 
                placeholder={`<h1>Hello {{student_name}}</h1><br/>{{student_table}}`} required />
              <p className="text-xs text-slate-500 mt-1">Placeholders: {`{{variable}}`}. Eg: {`{{department_full_name}}`}, {`{{student_table}}`}</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Upload Base PDF Form</label>
              <input type="file" accept="application/pdf" className="w-full text-sm text-slate-500" onChange={e => setPdfFile(e.target.files[0])} required />
              <p className="text-xs text-slate-500 mt-2">Uploading will auto-map variables via coordinate defaults in this demo.</p>
            </div>
          )}

          <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors">
            Save Template
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default TemplatesTab;
