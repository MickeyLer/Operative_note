'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  FileText, 
  Plus, 
  Search, 
  Printer, 
  Edit, 
  Trash2, 
  Loader2, 
  Calendar, 
  User, 
  Clock, 
  Filter
} from 'lucide-react';

interface OperativeNote {
  id: string;
  created_at: string;
  op_date: string;
  surgeon: string;
  operative_procedure: string;
  patient_name: string;
  hn: string;
  an: string;
  op_type: string;
  ebl: string;
}

const OP_LABEL_MAP: Record<string, string> = {
  open_hepatectomy: 'Open Hepatectomy',
  lap_hepatectomy: 'Laparoscopic Hepatectomy',
  whipple: 'Whipple Operation',
  lap_lar: 'Laparoscopic LAR',
  lap_chole: 'Laparoscopic Cholecystectomy',
  ramps: 'Distal Pancreatosplenectomy with RAMPS',
};

export default function Dashboard() {
  const [notes, setNotes] = useState<OperativeNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOpType, setSelectedOpType] = useState('all');
  const [userTemplates, setUserTemplates] = useState<{ id: string; name: string }[]>([]);

  // Fetch notes from Supabase
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('operative_notes')
        .select('id, created_at, op_date, surgeon, operative_procedure, patient_name, hn, an, op_type, ebl')
        .order('op_date', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user templates
  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('operative_templates')
        .select('id, name')
        .order('name');
      if (error) throw error;
      setUserTemplates(data || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotes();
    fetchTemplates();
  }, []);

  const getOpLabel = (opType: string) => {
    if (OP_LABEL_MAP[opType]) return OP_LABEL_MAP[opType];
    const tpl = userTemplates.find(t => t.id === opType);
    return tpl ? tpl.name : opType;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this operative note?')) return;
    try {
      const { error } = await supabase
        .from('operative_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (err) {
      console.error('Error deleting note:', err);
      alert('Failed to delete note');
    }
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      note.patient_name.toLowerCase().includes(query) ||
      note.hn.toLowerCase().includes(query) ||
      note.an.toLowerCase().includes(query) ||
      note.surgeon.toLowerCase().includes(query) ||
      note.operative_procedure.toLowerCase().includes(query);

    const matchesType = selectedOpType === 'all' || note.op_type === selectedOpType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-blue-800 text-white px-6 py-4 shadow-md flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-yellow-300" />
          <div>
            <h1 className="font-bold text-lg leading-tight">KKH Digital Op Note</h1>
            <p className="text-xs text-blue-200">Khon Kaen Hospital Operative Note System</p>
          </div>
        </div>
        <Link 
          href="/new" 
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md flex items-center space-x-2 transition text-sm">
          <Plus className="h-4 w-4" />
          <span>New Note</span>
        </Link>
      </header>

      {/* Main Dashboard Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Filters Box */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search bar */}
          <div className="relative md:col-span-7">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Patient Name, HN, Surgeon, or Procedure..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Operation Filter */}
          <div className="relative md:col-span-5 flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400 shrink-0" />
            <select
              value={selectedOpType}
              onChange={e => setSelectedOpType(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Procedures</option>
              <optgroup label="Default Presets (เทมเพลตมาตรฐาน)">
                <option value="open_hepatectomy">Open Hepatectomy</option>
                <option value="lap_hepatectomy">Laparoscopic Hepatectomy</option>
                <option value="whipple">Whipple Operation</option>
                <option value="lap_lar">Laparoscopic LAR</option>
                <option value="lap_chole">Laparoscopic Cholecystectomy</option>
                <option value="ramps">Distal Pancreatosplenectomy with RAMPS</option>
              </optgroup>
              {userTemplates.length > 0 && (
                <optgroup label="My Templates (เทมเพลตของฉัน)">
                  {userTemplates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
        </div>

        {/* Notes list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-2">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Loading operative notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center space-y-4">
            <FileText className="h-12 w-12 text-gray-300 mx-auto" />
            <div>
              <h3 className="font-semibold text-gray-700 text-base">No Operative Notes Found</h3>
              <p className="text-xs text-gray-400 mt-1">Get started by creating a new patient operative record.</p>
            </div>
            <Link 
              href="/new" 
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm shadow transition">
              <Plus className="h-4 w-4" />
              <span>Create First Note</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.map(note => (
              <div 
                key={note.id} 
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <div className="space-y-3">
                  {/* Note header */}
                  <div className="flex justify-between items-start">
                    <span className="bg-blue-50 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded">
                      {getOpLabel(note.op_type)}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {note.op_date}
                    </span>
                  </div>

                  {/* Patient Info */}
                  <div>
                    <h3 className="font-bold text-gray-800 text-base">{note.patient_name}</h3>
                    <div className="flex space-x-3 text-xs text-gray-500 mt-1">
                      <span><strong>HN:</strong> {note.hn}</span>
                      <span><strong>AN:</strong> {note.an}</span>
                    </div>
                  </div>

                  {/* Operational details */}
                  <div className="border-t pt-2.5 space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center">
                      <User className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                      <span>Surgeon: <strong>{note.surgeon}</strong></span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                      <span>Procedure: <strong>{note.operative_procedure}</strong></span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold text-amber-600">EBL: {note.ebl} ml</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2 border-t pt-3 mt-4">
                  <Link
                    href={`/new?id=${note.id}&print=true`}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md transition"
                    title="Print Preview">
                    <Printer className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/edit/${note.id}`}
                    className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded-md transition"
                    title="Edit Record">
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-md transition"
                    title="Delete Record">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
