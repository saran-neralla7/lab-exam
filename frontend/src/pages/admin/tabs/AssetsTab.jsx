import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, Image as ImageIcon } from 'lucide-react';

const AssetsTab = () => {
  const [assets, setAssets] = useState([]);
  const [headerFile, setHeaderFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const fetchAssets = async () => {
    try {
      const { data } = await axios.get('/api/assets');
      setAssets(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchAssets(); }, []);

  const handleUpload = async (type, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append(type, file);
    try {
      await axios.post(`/api/assets/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchAssets();
      if(type === 'header') setHeaderFile(null);
      if(type === 'logo') setLogoFile(null);
      alert(`${type} uploaded successfully`);
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    }
  };

  const headerAsset = assets.find(a => a.type === 'HeaderPDF');
  const logoAsset = assets.find(a => a.type === 'LogoPNG');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">College Assets</h2>
        <p className="text-slate-500 mt-1">Upload the official college header (PDF) and uniform logo (PNG) to strictly enforce branding on all PDFs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Header Upload */}
        <div className="bg-surface p-6 rounded-2xl shadow-soft border border-slate-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={24} /></div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Header PDF</h3>
              <p className="text-sm text-slate-500">Stamps onto top-center page 1</p>
            </div>
          </div>
          {headerAsset && (
            <div className="mb-4 text-sm text-green-600 font-medium bg-green-50 p-3 rounded-lg flex items-center">
              ✓ Currently active header found.
            </div>
          )}
          <input 
            type="file" 
            accept="application/pdf"
            onChange={e => setHeaderFile(e.target.files[0])}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 mb-4"
          />
          <button 
            onClick={() => handleUpload('header', headerFile)}
            disabled={!headerFile}
            className="w-full bg-slate-900 disabled:bg-slate-300 text-white py-2 rounded-lg font-medium transition-colors"
          >
            Upload Header
          </button>
        </div>

        {/* Logo Upload */}
        <div className="bg-surface p-6 rounded-2xl shadow-soft border border-slate-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><ImageIcon size={24} /></div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Logo background (PNG)</h3>
              <p className="text-sm text-slate-500">Serves as a 10% opacity watermark</p>
            </div>
          </div>
          {logoAsset && (
            <div className="mb-4 text-sm text-green-600 font-medium bg-green-50 p-3 rounded-lg flex items-center">
               ✓ Currently active logo found.
            </div>
          )}
          <input 
            type="file" 
            accept="image/png, image/jpeg"
            onChange={e => setLogoFile(e.target.files[0])}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 mb-4"
          />
          <button 
            onClick={() => handleUpload('logo', logoFile)}
            disabled={!logoFile}
            className="w-full bg-slate-900 disabled:bg-slate-300 text-white py-2 rounded-lg font-medium transition-colors"
          >
            Upload Logo
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssetsTab;
