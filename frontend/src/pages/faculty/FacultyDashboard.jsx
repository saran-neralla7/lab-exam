import React, { useState, useEffect } from 'react';
import { LogOut, BookOpen, Download, CheckCircle2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import axios from 'axios';
import Modal from '../../components/ui/Modal';

const FacultyDashboard = () => {
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);

  const [labs, setLabs] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [templates, setTemplates] = useState([]);

  const [selectedLab, setSelectedLab] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  
  // Checklist states
  const [checklistProgress, setChecklistProgress] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(null);
  
  // Dynamic form
  const [formValues, setFormValues] = useState({});
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [labRes, secRes, tplRes] = await Promise.all([
          axios.get('/api/faculty/labs'),
          axios.get('/api/faculty/sections'),
          axios.get('/api/templates')
        ]);
        setLabs(labRes.data);
        setSections(secRes.data);
        setTemplates(tplRes.data);

        // Init checklist locally.
        const saved = localStorage.getItem(`checklist_${user._id}`);
        if(saved) setChecklistProgress(JSON.parse(saved));

      } catch (err) { console.error(err); }
    };
    fetchInit();
  }, [user._id]);

  useEffect(() => {
    if (selectedSection) {
      axios.get(`/api/faculty/students?sectionId=${selectedSection}`).then(res => setStudents(res.data));
    }
  }, [selectedSection]);

  const activeLabObj = labs.find(l => l._id === selectedLab);

  const openTemplateForm = (templateName) => {
    const tpl = templates.find(t => t.name.toLowerCase() === templateName.toLowerCase());
    if (!tpl) {
       alert(`Template for '${templateName}' not found in system.`);
       return;
    }
    setActiveTemplate(tpl);
    
    // Auto-fill some variables
    setFormValues({
      department_full_name: user?.department?.name || '',
      date: new Date().toLocaleDateString(),
      section: sections.find(s => s._id === selectedSection)?.name || '',
      lab_name: activeLabObj?.name || '',
      student_table: generateStudentTableHTML(students)
    });
    
    setIsModalOpen(true);
  };

  const generateStudentTableHTML = (stuArray) => {
     if(stuArray.length === 0) return '<i>No students found for this section.</i>';
     let html = '<table><thead><tr><th>Roll No</th><th>Student Name</th><th>Signature</th></tr></thead><tbody>';
     stuArray.forEach(stu => {
        html += `<tr><td>${stu.rollNumber}</td><td>${stu.name}</td><td></td></tr>`;
     });
     html += '</tbody></table>';
     return html;
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const response = await axios.post('/api/documents/generate', {
        templateId: activeTemplate._id,
        labId: selectedLab,
        variables: formValues
      }, { responseType: 'blob' });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeTemplate.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Update checklist
      const key = `${selectedLab}_${activeTemplate.name}`;
      const updated = { ...checklistProgress, [key]: true };
      setChecklistProgress(updated);
      localStorage.setItem(`checklist_${user._id}`, JSON.stringify(updated));

      setIsModalOpen(false);
    } catch (err) {
      alert('Error generating document');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-surface border-r border-slate-200 flex flex-col pt-8 shrink-0 shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-10">
        <div className="px-8 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 text-primary-600 font-bold text-xl">
             {user.username.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-slate-800">Faculty Portal</h2>
          <p className="text-sm text-slate-500 mt-1">{user?.department?.name}</p>
        </div>

        <div className="p-8 flex-1 overflow-y-auto space-y-6">
           <div>
             <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">Select Laboratory</label>
             <select 
                className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-shadow"
                value={selectedLab} onChange={e => setSelectedLab(e.target.value)}
             >
               <option value="">-- Choose Lab --</option>
               {labs.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
             </select>
           </div>
           
           {selectedLab && (
             <div className="animate-in fade-in slide-in-from-top-2 duration-300">
               <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">Select Section</label>
               <select 
                  className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-shadow"
                  value={selectedSection} onChange={e => setSelectedSection(e.target.value)}
               >
                 <option value="">-- Choose Section --</option>
                 {sections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
               </select>
             </div>
           )}
        </div>

        <div className="p-6 border-t border-slate-200">
          <button onClick={logout} className="flex flex-row items-center justify-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0">
            <LogOut className="mr-2 w-5 h-5" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-slate-50/50 p-8 lg:p-12">
        {!selectedLab ? (
           <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <BookOpen size={64} className="mb-4 text-slate-300" />
              <h3 className="text-2xl font-semibold text-slate-600">No Lab Selected</h3>
              <p className="mt-2 text-slate-500">Please select a laboratory from the sidebar to view documents.</p>
           </div>
        ) : !selectedSection ? (
           <div className="h-full flex flex-col items-center justify-center text-slate-400 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center mb-4"><CheckCircle2 size={32} className="text-slate-400"/></div>
              <h3 className="text-2xl font-semibold text-slate-600">Select a Section</h3>
              <p className="mt-2 text-slate-500">Choose a section to load student data and document checklists.</p>
           </div>
        ) : (
           <div className="max-w-4xl animate-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">{activeLabObj?.name}</h1>
                <p className="text-slate-500 mt-2 text-lg">Documents Checklist for Section {sections.find(s=>s._id===selectedSection)?.name}</p>
              </div>

              <div className="bg-surface rounded-2xl shadow-modal border border-slate-100 overflow-hidden divide-y divide-slate-100">
                 {activeLabObj?.checklists?.map((docName, idx) => {
                    const isDone = checklistProgress[`${selectedLab}_${docName}`];
                    return (
                      <div key={idx} className={`p-6 flex items-center justify-between transition-colors ${isDone ? 'bg-slate-50/50' : 'hover:bg-slate-50'}`}>
                        <div className="flex items-center space-x-4">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDone ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                              <CheckCircle2 size={18} />
                           </div>
                           <div>
                             <h3 className={`text-lg font-medium transition-colors ${isDone ? 'text-slate-800' : 'text-slate-700'}`}>{docName}</h3>
                             {isDone && <p className="text-xs text-green-600 mt-1 font-medium">Downloaded successfully</p>}
                           </div>
                        </div>
                        <button 
                           onClick={() => openTemplateForm(docName)}
                           className={`px-5 py-2.5 rounded-xl font-medium flex items-center space-x-2 transition-all active:scale-95 ${isDone ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-primary-600 text-white shadow-md hover:bg-primary-700 hover:shadow-lg'}`}
                        >
                           <Download size={18} />
                           <span>Generate PDF</span>
                        </button>
                      </div>
                    )
                 })}
                 {(!activeLabObj?.checklists || activeLabObj.checklists.length === 0) && (
                   <div className="p-8 text-center text-slate-500">No documents defined in checklist. Contact Admin.</div>
                 )}
              </div>
           </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Generate: ${activeTemplate?.name}`}>
         <form onSubmit={handleGenerate} className="space-y-4 pt-2">
            <p className="text-sm text-slate-500 mb-4">Please verify or fill the variables below to inject into the PDF.</p>
            
            {activeTemplate && activeTemplate.type === 'pdf' && activeTemplate.mappedVariables?.map((v, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">{v.variableName.replace(/_/g, ' ')}</label>
                <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  value={formValues[v.variableName] || ''} onChange={e => setFormValues({...formValues, [v.variableName]: e.target.value})} />
              </div>
            ))}

            {activeTemplate && activeTemplate.type === 'html' && (
              <>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      value={formValues.date || ''} onChange={e => setFormValues({...formValues, date: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Internal Examiner</label>
                    <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      value={formValues.internal_examiner || ''} onChange={e => setFormValues({...formValues, internal_examiner: e.target.value})} placeholder="Jane Doe" />
                 </div>
              </>
            )}

            <button type="submit" disabled={generating} className="w-full bg-primary-600 text-white py-3 mt-4 rounded-xl font-medium hover:bg-primary-700 transition-colors flex justify-center items-center h-12">
               {generating ? 'Generating A4 PDF...' : 'Download Perfectly Aligned PDF'}
            </button>
         </form>
      </Modal>

    </div>
  );
};

export default FacultyDashboard;
