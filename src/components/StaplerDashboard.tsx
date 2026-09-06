'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import StaplerFormModal, { StaplerRecord, ReloadItem } from '@/components/StaplerFormModal';
import { 
  Plus, 
  Search, 
  Download, 
  Trash2, 
  Edit3, 
  Eye, 
  Loader2, 
  Calendar, 
  Layers, 
  Activity, 
  User, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Filter,
  X,
  FileSpreadsheet
} from 'lucide-react';

export default function StaplerDashboard() {
  const [records, setRecords] = useState<StaplerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedSurgeon, setSelectedSurgeon] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StaplerRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<StaplerRecord | null>(null);

  // Fetch stapler records from Supabase
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stapler_records')
        .select('*')
        .order('op_date', { ascending: false });

      if (error) {
        console.error('Error fetching stapler records:', error);
      } else {
        setRecords(data || []);
      }
    } catch (err) {
      console.error('Error fetching stapler records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Delete Record
  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการบันทึก Stapler นี้?')) return;

    try {
      const { error } = await supabase
        .from('stapler_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRecords(prev => prev.filter(r => r.id !== id));
      if (viewingRecord?.id === id) setViewingRecord(null);
    } catch (err) {
      console.error('Error deleting record:', err);
      alert('ไม่สามารถลบรายการได้');
    }
  };

  // Open edit modal
  const handleEdit = (record: StaplerRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  // Open add new modal
  const handleAddNew = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  // Filter Unique Options
  const uniqueBrands = useMemo(() => {
    const brands = new Set(records.map(r => r.stapler_brand).filter(Boolean));
    return Array.from(brands);
  }, [records]);

  const uniqueSurgeons = useMemo(() => {
    const surgeons = new Set(records.map(r => r.surgeon).filter(Boolean));
    return Array.from(surgeons);
  }, [records]);

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        r.hn.toLowerCase().includes(query) ||
        r.procedure_name.toLowerCase().includes(query) ||
        r.surgeon.toLowerCase().includes(query) ||
        r.stapler_brand.toLowerCase().includes(query);

      const matchesBrand = selectedBrand === 'all' || r.stapler_brand === selectedBrand;
      const matchesSurgeon = selectedSurgeon === 'all' || r.surgeon === selectedSurgeon;

      return matchesSearch && matchesBrand && matchesSurgeon;
    });
  }, [records, searchQuery, selectedBrand, selectedSurgeon]);

  // Summary Metrics Calculation
  const totalCases = records.length;

  const totalReloadsFired = useMemo(() => {
    return records.reduce((acc, r) => {
      if (r.total_reloads !== undefined && r.total_reloads !== null) {
        return acc + Number(r.total_reloads);
      }
      if (Array.isArray(r.reloads)) {
        return acc + r.reloads.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      }
      return acc;
    }, 0);
  }, [records]);

  const topBrand = useMemo(() => {
    if (records.length === 0) return 'ยังไม่มีข้อมูล';
    const counts: Record<string, number> = {};
    records.forEach(r => {
      counts[r.stapler_brand] = (counts[r.stapler_brand] || 0) + 1;
    });
    let maxBrand = '';
    let maxCount = 0;
    Object.entries(counts).forEach(([brand, cnt]) => {
      if (cnt > maxCount) {
        maxCount = cnt;
        maxBrand = brand;
      }
    });
    return maxBrand || 'ยังไม่มีข้อมูล';
  }, [records]);

  const normalSuccessRate = useMemo(() => {
    if (records.length === 0) return 100;
    const normalCount = records.filter(r => !r.complications || r.complications.startsWith('Normal')).length;
    return Math.round((normalCount / records.length) * 100);
  }, [records]);

  // CSV Export Function
  const exportToCSV = () => {
    if (filteredRecords.length === 0) {
      alert('ไม่มีข้อมูลสำหรับส่งออก CSV');
      return;
    }

    const headers = [
      'วันที่ผ่าตัด',
      'HN',
      'หัตถการ',
      'ศัลยแพทย์',
      'ยี่ห้อ Stapler',
      'จำนวนตลับรวม',
      'รายละเอียดตลับ (Reloads)',
      'ผลการใช้งาน',
      'หมายเหตุ'
    ];

    const csvRows = filteredRecords.map(r => {
      const reloadSummary = Array.isArray(r.reloads)
        ? r.reloads.map(i => `${i.color} (${i.length}) x${i.quantity} [${i.tissue}]`).join(' | ')
        : '';

      return [
        `"${r.op_date}"`,
        `"${r.hn}"`,
        `"${r.procedure_name.replace(/"/g, '""')}"`,
        `"${r.surgeon.replace(/"/g, '""')}"`,
        `"${r.stapler_brand.replace(/"/g, '""')}"`,
        `"${r.total_reloads || 0}"`,
        `"${reloadSummary.replace(/"/g, '""')}"`,
        `"${(r.complications || '').replace(/"/g, '""')}"`,
        `"${(r.notes || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `HPB_KKH_Stapler_Records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Actions & Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Layers className="h-6 w-6 text-blue-700 mr-2.5" />
            <span>ระบบบันทึกและติดตามการใช้ Stapler</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            หน่วยศัลยศาสตร์ตับ ถุงน้ำดี และตับอ่อน โรงพยาบาลขอนแก่น (HPB KKH Unit)
          </p>
        </div>

        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          <button
            onClick={exportToCSV}
            className="flex-1 sm:flex-initial bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition">
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleAddNew}
            className="flex-1 sm:flex-initial bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-xl shadow-md text-xs flex items-center justify-center space-x-2 transition">
            <Plus className="h-4 w-4" />
            <span>บันทึกการใช้ Stapler ใหม่</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Cases */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-100 text-blue-600">
            <User className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">เคสใช้ Stapler ทั้งหมด</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{totalCases} <span className="text-xs font-normal text-gray-500">เคส</span></h3>
          </div>
        </div>

        {/* Card 2: Total Reloads */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-100 text-emerald-600">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">ตลับ Reloads ที่ใช้รวม</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{totalReloadsFired} <span className="text-xs font-normal text-gray-500">ตลับ</span></h3>
          </div>
        </div>

        {/* Card 3: Top Brand */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-100 text-purple-600">
            <Layers className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-500">ยี่ห้อที่ใช้บ่อยที่สุด</p>
            <h3 className="text-sm font-bold text-gray-900 mt-1 truncate" title={topBrand}>{topBrand}</h3>
          </div>
        </div>

        {/* Card 4: Function Rate */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-100 text-amber-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">อัตราทำงานปกติ (Normal)</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{normalSuccessRate}%</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search bar */}
          <div className="relative md:col-span-6">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหา HN, หัตถการ, ศัลยแพทย์, หรือ ยี่ห้อ..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Brand Filter */}
          <div className="md:col-span-3 flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400 shrink-0" />
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">ทุกยี่ห้อ Stapler</option>
              {uniqueBrands.map((b, i) => (
                <option key={i} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Surgeon Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedSurgeon}
              onChange={e => setSelectedSurgeon(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">ศัลยแพทย์ทุกคน</option>
              {uniqueSurgeons.map((s, i) => (
                <option key={i} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Data Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-gray-800 text-sm">ตารางข้อมูลการบันทึก Stapler</h3>
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              {filteredRecords.length} รายการ
            </span>
          </div>
          <button
            onClick={fetchRecords}
            className="text-xs text-gray-500 hover:text-blue-600 flex items-center space-x-1 transition">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>รีเฟรชข้อมูล</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-xs text-gray-500 font-medium">กำลังโหลดข้อมูล Stapler...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Layers className="h-12 w-12 text-gray-300 mx-auto" />
            <h4 className="font-semibold text-gray-700 text-sm">ไม่พบรายการบันทึก Stapler</h4>
            <p className="text-xs text-gray-400">เริ่มต้นบันทึกข้อมูลการใช้ Stapler ของหน่วยงานได้โดยคลิกปุ่มด้านล่าง</p>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow transition">
              <Plus className="h-4 w-4" />
              <span>บันทึกเคสแรก</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 border-collapse">
              <thead className="bg-gray-100/70 text-gray-700 uppercase font-semibold text-[11px] border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">วันที่ผ่าตัด</th>
                  <th className="py-3 px-4">HN</th>
                  <th className="py-3 px-4">หัตถการ</th>
                  <th className="py-3 px-4">ศัลยแพทย์</th>
                  <th className="py-3 px-4">ยี่ห้อ Stapler</th>
                  <th className="py-3 px-4 text-center">ตลับ Reloads</th>
                  <th className="py-3 px-4">ผลการใช้งาน</th>
                  <th className="py-3 px-4 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecords.map(record => {
                  const totalReloads = record.total_reloads !== undefined && record.total_reloads !== null
                    ? record.total_reloads
                    : (Array.isArray(record.reloads) ? record.reloads.reduce((s, i) => s + (Number(i.quantity) || 0), 0) : 0);

                  const isNormal = !record.complications || record.complications.startsWith('Normal');

                  return (
                    <tr 
                      key={record.id} 
                      className="hover:bg-blue-50/40 transition group">
                      {/* Date */}
                      <td className="py-3.5 px-4 font-medium text-gray-800 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span>{record.op_date}</span>
                        </div>
                      </td>

                      {/* HN */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          {record.hn}
                        </span>
                      </td>

                      {/* Procedure */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-medium text-gray-800 block truncate" title={record.procedure_name}>
                          {record.procedure_name}
                        </span>
                      </td>

                      {/* Surgeon */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="bg-gray-100 text-gray-800 font-medium px-2 py-0.5 rounded">
                          {record.surgeon}
                        </span>
                      </td>

                      {/* Stapler Brand */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="bg-blue-50 text-blue-900 font-semibold px-2 py-0.5 rounded border border-blue-200/60 block truncate" title={record.stapler_brand}>
                          {record.stapler_brand}
                        </span>
                      </td>

                      {/* Reloads Count */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-full">
                          {totalReloads} ตลับ
                        </span>
                      </td>

                      {/* Complication Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isNormal ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-medium text-[11px]">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>ปกติ (Normal)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-medium text-[11px]">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="truncate max-w-[120px]" title={record.complications}>
                              {record.complications}
                            </span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setViewingRecord(record)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="ดูรายละเอียด">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(record)}
                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="แก้ไข">
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="ลบ">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Details Modal / Drawer */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 my-auto">
            <div className="bg-blue-900 px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">รายละเอียดการใช้ Stapler</h3>
                <p className="text-xs text-blue-200">HN: {viewingRecord.hn}</p>
              </div>
              <button
                onClick={() => setViewingRecord(null)}
                className="text-blue-200 hover:text-white p-1 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-gray-700 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <span className="text-gray-500 font-semibold block">วันที่ผ่าตัด:</span>
                  <span className="text-sm font-bold text-gray-800">{viewingRecord.op_date}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block">ศัลยแพทย์:</span>
                  <span className="text-sm font-bold text-gray-800">{viewingRecord.surgeon}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block">หัตถการ:</span>
                  <span className="font-medium text-gray-900">{viewingRecord.procedure_name}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block">ยี่ห้อ Stapler:</span>
                  <span className="font-bold text-blue-800">{viewingRecord.stapler_brand}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2 border-b pb-1">รายการตลับ Reloads ที่ใช้ ({viewingRecord.reloads?.length || 0} ชนิด)</h4>
                <div className="space-y-2">
                  {Array.isArray(viewingRecord.reloads) && viewingRecord.reloads.length > 0 ? (
                    viewingRecord.reloads.map((item, idx) => (
                      <div key={idx} className="bg-emerald-50/60 border border-emerald-200 p-3 rounded-lg flex justify-between items-center">
                        <div>
                          <div className="font-bold text-emerald-950">
                            {item.color} - {item.length}
                          </div>
                          <div className="text-[11px] text-emerald-700">
                            ตำแหน่ง/อวัยวะ: {item.tissue}
                          </div>
                        </div>
                        <span className="bg-emerald-700 text-white font-bold px-3 py-1 rounded-full text-xs">
                          {item.quantity} ตลับ
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 italic">ไม่มีข้อมูลตลับรายละเอียด</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-3">
                <span className="text-gray-500 font-semibold block">ผลการใช้งาน / Complications:</span>
                <p className="font-semibold text-amber-800 mt-1">{viewingRecord.complications}</p>
              </div>

              {viewingRecord.notes && (
                <div className="border-t pt-3">
                  <span className="text-gray-500 font-semibold block">หมายเหตุเพิ่มเติม:</span>
                  <p className="text-gray-700 mt-1 bg-gray-50 p-2.5 rounded-lg border">{viewingRecord.notes}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-3 border-t flex justify-end space-x-2">
              <button
                onClick={() => {
                  const rec = viewingRecord;
                  setViewingRecord(null);
                  handleEdit(rec);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-1.5 rounded-lg text-xs flex items-center space-x-1">
                <Edit3 className="h-3.5 w-3.5" />
                <span>แก้ไขรายการนี้</span>
              </button>
              <button
                onClick={() => setViewingRecord(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-1.5 rounded-lg text-xs">
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stapler Create/Edit Form Modal */}
      <StaplerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchRecords}
        initialData={editingRecord}
      />
    </div>
  );
}
