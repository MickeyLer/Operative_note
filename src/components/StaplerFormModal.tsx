'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  X, 
  Save, 
  Loader2, 
  Plus, 
  Trash2, 
  AlertCircle,
  FileText,
  User,
  Calendar,
  Layers,
  Activity
} from 'lucide-react';

export interface ReloadItem {
  id: string;
  color: string;
  length: string;
  quantity: number;
  tissue: string;
}

export interface StaplerRecord {
  id?: string;
  op_date: string;
  hn: string;
  procedure_name: string;
  surgeon: string;
  stapler_brand: string;
  reloads: ReloadItem[];
  total_reloads?: number;
  complications: string;
  notes: string;
}

interface StaplerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: StaplerRecord | null;
}

const STAPLER_BRANDS = [
  'Johnson & Johnson',
  'Medtronic'
];

const RELOAD_COLORS = [
  'Gray / Vascular (0.75-1.0 mm)',
  'White / Vascular (1.0 mm)',
  'Blue / Regular Tissue (1.5 mm)',
  'Gold / Medium-Thick (1.8 mm)',
  'Green / Thick Tissue (2.0 mm)',
  'Black / Extra Thick Tissue (2.3 mm)',
  'Tri-Staple Purple (Medium/Thick)',
  'Tri-Staple Black (Extra Thick)',
  'GST (Gentle Staple Tech) Green',
  'GST (Gentle Staple Tech) Blue',
  'อื่น ๆ (Other)'
];

const RELOAD_LENGTHS = [
  '30 mm',
  '45 mm',
  '60 mm',
  'อื่น ๆ (Other)'
];

const TISSUE_OPTIONS = [
  'Hepatic Vein (หลอดเลือดดำตับ)',
  'Portal Vein (หลอดเลือดดำพอร์ทัล)',
  'Hepatic Artery (หลอดเลือดแดงตับ)',
  'Bile Duct (ท่อน้ำดี)',
  'Liver Parenchyma (เนื้อตับ)',
  'Pancreatic Parenchyma (เนื้อตับอ่อน)',
  'Pancreatic Duct (ท่อตับอ่อน)',
  'Stomach / Duodenum (กระเพาะ/ลำไส้เล็กส่วนต้น)',
  'Jejunum / Ileum (ลำไส้เล็ก)',
  'Colon / Rectum (ลำไส้ใหญ่)',
  'Vessels / Mesentery (หลอดเลือด/พังผืดผูกลำไส้)',
  'อื่น ๆ (Other)'
];

const PROCEDURE_PRESETS = [
  'Open Hepatectomy (Major/Minor)',
  'Laparoscopic Hepatectomy',
  'Whipple Operation (Pancreaticoduodenectomy)',
  'Distal Pancreatectomy (± RAMPS)',
  'Laparoscopic Cholecystectomy',
  'Biliary Reconstruction / Hepaticojejunostomy',
  'Splenectomy',
  'อื่น ๆ (Other)'
];

const SURGEON_PRESETS = [
  'ประกาศิต',
  'เลอพงศ์',
  'ณภัทร',
  'ไชยวัฒน์',
  'นิติเทพ',
  'พรชัย',
  'สุรชัย'
];

export default function StaplerFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData
}: StaplerFormModalProps) {
  const [opDate, setOpDate] = useState(new Date().toISOString().split('T')[0]);
  const [hn, setHn] = useState('');
  const [procedureName, setProcedureName] = useState('');
  const [surgeon, setSurgeon] = useState('');
  const [staplerBrand, setStaplerBrand] = useState(STAPLER_BRANDS[0]);
  const [reloads, setReloads] = useState<ReloadItem[]>([
    {
      id: '1',
      color: RELOAD_COLORS[1], // White / Vascular (1.0 mm)
      length: RELOAD_LENGTHS[0], // 30 mm
      quantity: 1,
      tissue: TISSUE_OPTIONS[0] // Hepatic Vein (หลอดเลือดดำตับ)
    }
  ]);
  const [complications, setComplications] = useState('Normal (ไม่มีปัญหา)');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialData) {
      setOpDate(initialData.op_date || new Date().toISOString().split('T')[0]);
      setHn(initialData.hn || '');
      setProcedureName(initialData.procedure_name || '');
      setSurgeon(initialData.surgeon || '');
      
      if (STAPLER_BRANDS.includes(initialData.stapler_brand)) {
        setStaplerBrand(initialData.stapler_brand);
      } else {
        setStaplerBrand(STAPLER_BRANDS[0]);
      }

      setReloads(
        Array.isArray(initialData.reloads) && initialData.reloads.length > 0
          ? initialData.reloads
          : [
              {
                id: '1',
                color: RELOAD_COLORS[1], // White / Vascular (1.0 mm)
                length: RELOAD_LENGTHS[0], // 30 mm
                quantity: 1,
                tissue: TISSUE_OPTIONS[0] // Hepatic Vein (หลอดเลือดดำตับ)
              }
            ]
      );
      setComplications(initialData.complications || 'Normal (ไม่มีปัญหา)');
      setNotes(initialData.notes || '');
    } else {
      // Reset form
      setOpDate(new Date().toISOString().split('T')[0]);
      setHn('');
      setProcedureName('');
      setSurgeon('');
      setStaplerBrand(STAPLER_BRANDS[0]);
      setReloads([
        {
          id: Date.now().toString(),
          color: RELOAD_COLORS[1], // White / Vascular (1.0 mm)
          length: RELOAD_LENGTHS[0], // 30 mm
          quantity: 1,
          tissue: TISSUE_OPTIONS[0] // Hepatic Vein (หลอดเลือดดำตับ)
        }
      ]);
      setComplications('Normal (ไม่มีปัญหา)');
      setNotes('');
    }
    setErrorMessage('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;



  // Reload Management
  const addReload = () => {
    setReloads(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        color: RELOAD_COLORS[1], // White / Vascular (1.0 mm)
        length: RELOAD_LENGTHS[0], // 30 mm
        quantity: 1,
        tissue: TISSUE_OPTIONS[0] // Hepatic Vein (หลอดเลือดดำตับ)
      }
    ]);
  };

  const updateReload = (id: string, field: keyof ReloadItem, value: any) => {
    setReloads(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeReload = (id: string) => {
    if (reloads.length <= 1) return;
    setReloads(prev => prev.filter(item => item.id !== id));
  };

  const calculateTotalReloads = () => {
    return reloads.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  };

  // Save Record
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHn = hn.trim();

    if (!cleanHn || !procedureName.trim() || !surgeon.trim()) {
      setErrorMessage('กรุณากรอกข้อมูลที่จำเป็น (HN, ชื่อหัตถการ, และ ศัลยแพทย์) ให้ครบถ้วน');
      return;
    }

    if (!/^\d{8}$/.test(cleanHn)) {
      setErrorMessage(`เลข HN ของ รพ.ขอนแก่น ต้องเป็นตัวเลข 8 หลัก (ขณะนี้กรอก ${cleanHn.length} หลัก)`);
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');

      const totalReloadsCount = calculateTotalReloads();

      const payload = {
        op_date: opDate,
        patient_name: '',
        hn: hn.trim(),
        an: '',
        procedure_name: procedureName.trim(),
        surgeon: surgeon.trim(),
        stapler_brand: staplerBrand,
        reloads,
        total_reloads: totalReloadsCount,
        complications,
        notes: notes.trim()
      };

      let error;
      if (initialData?.id) {
        const res = await supabase
          .from('stapler_records')
          .update(payload)
          .eq('id', initialData.id);
        error = res.error;
      } else {
        const res = await supabase
          .from('stapler_records')
          .insert([payload]);
        error = res.error;
      }

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving stapler record:', err);
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-4 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600/50 p-2 rounded-lg">
              <Layers className="h-6 w-6 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {initialData ? 'แก้ไขข้อมูลการใช้ Stapler' : 'บันทึกข้อมูลการใช้ Stapler ใหม่'}
              </h2>
              <p className="text-xs text-blue-200">หน่วยศัลยศาสตร์ตับ ถุงน้ำดี และตับอ่อน รพ.ขอนแก่น</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-blue-200 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-sm">
          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3.5 rounded-r-lg text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}



          {/* Patient & Surgery General Information */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-sm flex items-center border-b pb-2">
              <User className="h-4 w-4 text-blue-600 mr-2" />
              <span>ข้อมูลเคสผ่าตัด</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  วันที่ผ่าตัด <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={opDate}
                  onChange={e => setOpDate(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    HN (Hospital Number) <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-[10px] font-mono font-medium ${hn.length === 8 ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {hn.length}/8 หลัก
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="เช่น 66123456 (ตัวเลข 8 หลัก)"
                  value={hn}
                  onChange={e => setHn(e.target.value.replace(/[^\d]/g, ''))}
                  required
                  className={`w-full border rounded-lg p-2 focus:ring-2 focus:outline-none text-xs font-mono tracking-wider ${
                    hn.length > 0 && hn.length !== 8
                      ? 'border-amber-400 focus:ring-amber-400 bg-amber-50/20'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  ชื่อหัตถการ / การผ่าตัด <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="พิมพ์ หรือ เลือก preset ด้านล่าง..."
                  value={procedureName}
                  onChange={e => setProcedureName(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs mb-1.5"
                />
                <div className="flex flex-wrap gap-1">
                  {PROCEDURE_PRESETS.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setProcedureName(p)}
                      className="bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-800 text-[11px] px-2 py-0.5 rounded transition">
                      + {p.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  ศัลยแพทย์ผู้ทำหัตถการ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  list="stapler-surgeon-list"
                  placeholder="พิมพ์ค้นชื่อแพทย์..."
                  value={surgeon}
                  onChange={e => setSurgeon(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                />
                <datalist id="stapler-surgeon-list">
                  {SURGEON_PRESETS.map((s, i) => (
                    <option key={i} value={s} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Stapler Model & Brand Selection */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-bold text-gray-800 text-sm flex items-center border-b pb-2">
              <Layers className="h-4 w-4 text-indigo-600 mr-2" />
              <span>อุปกรณ์และยี่ห้อ Stapler ที่ใช้</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ยี่ห้อ Stapler <span className="text-red-500">*</span>
              </label>
              <select
                value={staplerBrand}
                onChange={e => setStaplerBrand(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs bg-white">
                {STAPLER_BRANDS.map((b, i) => (
                  <option key={i} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reload Items List */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-gray-800 text-sm flex items-center">
                <Activity className="h-4 w-4 text-emerald-600 mr-2" />
                <span>รายการตลับ Stapler Reloads ที่ใช้</span>
                <span className="ml-2 bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                  รวม {calculateTotalReloads()} ตลับ
                </span>
              </h3>
              <button
                type="button"
                onClick={addReload}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-1 rounded-lg flex items-center space-x-1 shadow-xs transition">
                <Plus className="h-3.5 w-3.5" />
                <span>เพิ่มรายการตลับ</span>
              </button>
            </div>

            <div className="space-y-3">
              {reloads.map((reload, index) => (
                <div 
                  key={reload.id} 
                  className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-3 relative hover:border-gray-300 transition">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-700 bg-white px-2 py-0.5 rounded border">
                      ตลับที่ #{index + 1}
                    </span>
                    {reloads.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeReload(reload.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition"
                        title="ลบตลับนี้">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    {/* Color / Height */}
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        สี/ความสูงลวด (Reload Color)
                      </label>
                      <select
                        value={reload.color}
                        onChange={e => updateReload(reload.id, 'color', e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-1.5 text-xs bg-white">
                        {RELOAD_COLORS.map((c, i) => (
                          <option key={i} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Length */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        ความยาวตลับ (Length)
                      </label>
                      <select
                        value={reload.length}
                        onChange={e => updateReload(reload.id, 'length', e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-1.5 text-xs bg-white">
                        {RELOAD_LENGTHS.map((l, i) => (
                          <option key={i} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        จำนวน (ตลับ)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={reload.quantity}
                        onChange={e => updateReload(reload.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full border border-gray-300 rounded-md p-1.5 text-xs bg-white"
                      />
                    </div>

                    {/* Target Tissue */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        อวัยวะ/ท่อ/หลอดเลือด
                      </label>
                      <select
                        value={reload.tissue}
                        onChange={e => updateReload(reload.id, 'tissue', e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-1.5 text-xs bg-white">
                        {TISSUE_OPTIONS.map((t, i) => (
                          <option key={i} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outcome & Complications */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-bold text-gray-800 text-sm flex items-center border-b pb-2">
              <FileText className="h-4 w-4 text-purple-600 mr-2" />
              <span>ผลการใช้งาน & หมายเหตุเพิ่มเติม</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  ผลการเย็บ/ตัด (Stapler Function & Complication)
                </label>
                <select
                  value={complications}
                  onChange={e => setComplications(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs bg-white">
                  <option value="Normal (ไม่มีปัญหา)">Normal (ทำงานสมบูรณ์ ไม่มีปัญหา/เลือดออก)</option>
                  <option value="Minor Oozing (เลือดซึมตามรอยเย็บ)">Minor Oozing (เลือดซึมตามแนวเย็บ หยุดได้ด้วยเย็บซ่อม/cautery)</option>
                  <option value="Bleeding (เลือดออกต้องเย็บซ่อม)">Bleeding (เลือดออกจากแนวเย็บ ต้องเย็บซ่อมเพิ่มเติม)</option>
                  <option value="Incomplete Staple Line (แนวเย็บไม่สมบูรณ์)">Incomplete Staple Line (แนวเย็บไม่สมบูรณ์)</option>
                  <option value="Stapler Misfire / Jammed (เครื่องขัดข้อง/ติดขัด)">Stapler Misfire / Jammed (เครื่องขัดข้อง/ยิงไม่ออก)</option>
                  <option value="Tissue Shear / Tear (ฉีกขาด)">Tissue Shear / Tear (เนื้อเยื่อหรือหลอดเลือดฉีกขาด)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  หมายเหตุเพิ่มเติม (Notes)
                </label>
                <textarea
                  rows={2}
                  placeholder="ระบุข้อสังเกต หรือหมายเหตุเพิ่มเติม..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs resize-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="border-t pt-4 flex justify-end space-x-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-md flex items-center space-x-2 transition disabled:opacity-50">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>บันทึกข้อมูล</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
