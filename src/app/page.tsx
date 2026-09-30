'use client';

import { useEffect, useState, useMemo } from 'react';
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
  Filter,
  Activity,
  Award,
  Layers,
  CheckCircle2,
  X
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
  open_hilar_hepatectomy: 'Open Hilar Hepatectomy',
  lap_hepatectomy: 'Laparoscopic Hepatectomy',
  whipple: 'Whipple Operation',
  lap_lar: 'Laparoscopic LAR',
  lap_chole: 'Laparoscopic Cholecystectomy',
  ramps: 'Distal Pancreatosplenectomy with RAMPS',
};

const SHORT_OP_LABEL_MAP: Record<string, string> = {
  lap_chole: 'LC (Lap Chole)',
  open_hepatectomy: 'Open Hepatectomy',
  whipple: 'Whipple Operation',
  lap_hepatectomy: 'Lap Hepatectomy',
  open_hilar_hepatectomy: 'Open Hilar Hepatectomy',
  lap_lar: 'Lap LAR',
  ramps: 'RAMPS',
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
        .order('created_at', { ascending: false })
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

  const getOpShortLabel = (opType: string) => {
    if (SHORT_OP_LABEL_MAP[opType]) return SHORT_OP_LABEL_MAP[opType];
    if (OP_LABEL_MAP[opType]) return OP_LABEL_MAP[opType];
    const tpl = userTemplates.find(t => t.id === opType);
    return tpl ? tpl.name : opType;
  };

  // Calculate operation counts for summary cards
  const opStats = useMemo(() => {
    const counts: Record<string, number> = {};
    notes.forEach(note => {
      const type = note.op_type || 'other';
      counts[type] = (counts[type] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .map(([opType, count]) => ({
        opType,
        label: getOpShortLabel(opType),
        fullLabel: getOpLabel(opType),
        count,
      }))
      .sort((a, b) => b.count - a.count);

    // Pick top 4-5 operations
    const topOps = sorted.slice(0, 5);

    return {
      total: notes.length,
      topOps,
    };
  }, [notes, userTemplates]);

  const handleDelete = async (id: string) => {
    const password = prompt('กรุณากรอกรหัสผ่านเพื่อลบข้อมูล:');
    if (password === null) return;
    if (password !== '1111') {
      alert('รหัสผ่านไม่ถูกต้อง');
      return;
    }

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
        
        {/* Operation Summary Cards Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
              <Activity className="h-4 w-4 text-blue-600" />
              <span>สรุปจำนวน Operation ที่บันทึก (Frequent Procedures)</span>
            </h2>
            {selectedOpType !== 'all' && (
              <button
                onClick={() => setSelectedOpType('all')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded-md transition">
                <X className="h-3 w-3" />
                <span>ล้างตัวกรอง ({getOpShortLabel(selectedOpType)})</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Card 0: Total Cases */}
            <button
              onClick={() => setSelectedOpType('all')}
              className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                selectedOpType === 'all'
                  ? 'bg-blue-900 text-white border-blue-900 shadow-md ring-2 ring-blue-400'
                  : 'bg-white text-gray-800 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 shadow-xs'
              }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-semibold uppercase tracking-wide ${selectedOpType === 'all' ? 'text-blue-200' : 'text-gray-500'}`}>
                  เคสทั้งหมด
                </span>
                <Layers className={`h-4 w-4 ${selectedOpType === 'all' ? 'text-yellow-300' : 'text-blue-600'}`} />
              </div>
              <div>
                <span className="text-2xl font-black">{opStats.total}</span>
                <span className={`text-xs ml-1 font-medium ${selectedOpType === 'all' ? 'text-blue-200' : 'text-gray-500'}`}>cases</span>
              </div>
            </button>

            {/* Top 5 Operation Cards */}
            {opStats.topOps.map((op, idx) => {
              const isSelected = selectedOpType === op.opType;
              const cardColors = [
                'hover:border-emerald-300 text-emerald-700 bg-emerald-50 border-emerald-200',
                'hover:border-amber-300 text-amber-700 bg-amber-50 border-amber-200',
                'hover:border-indigo-300 text-indigo-700 bg-indigo-50 border-indigo-200',
                'hover:border-purple-300 text-purple-700 bg-purple-50 border-purple-200',
                'hover:border-teal-300 text-teal-700 bg-teal-50 border-teal-200',
              ];
              const activeBg = 'bg-blue-700 text-white border-blue-700 shadow-md ring-2 ring-blue-400';
              const colorClass = cardColors[idx % cardColors.length];

              return (
                <button
                  key={op.opType}
                  onClick={() => setSelectedOpType(isSelected ? 'all' : op.opType)}
                  title={`คลิกเพื่อกรองเคส ${op.fullLabel}`}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? activeBg
                      : `bg-white text-gray-800 border-gray-200 hover:bg-gray-50 shadow-xs`
                  }`}>
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <span 
                      className={`text-xs font-bold leading-tight line-clamp-2 ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                      {op.label}
                    </span>
                    {isSelected ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-yellow-300 shrink-0" />
                    ) : (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colorClass} shrink-0`}>
                        #{idx + 1}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className={`text-2xl font-black ${isSelected ? 'text-white' : 'text-blue-900'}`}>
                      {op.count}
                    </span>
                    <span className={`text-xs ml-1 font-medium ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                      cases
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

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
                <option value="open_hilar_hepatectomy">Open Hilar Hepatectomy</option>
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
