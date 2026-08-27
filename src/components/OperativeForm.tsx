'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  FileText, 
  ArrowLeft, 
  Printer, 
  Camera, 
  X, 
  Save, 
  Loader2, 
  Check,
  User, 
  Clock, 
  Activity, 
  Info,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Maximize2,
  Minimize2,
  GripVertical
} from 'lucide-react';

type OpKey = 'open_hepatectomy' | 'lap_hepatectomy' | 'whipple' | 'lap_lar' | 'lap_chole';

interface OperationPreset {
  title: string;
  position: string;
  incision: string;
  icg_flr?: boolean;
  pd_size?: boolean;
  ln_options: string[];
  procedures: string[];
  is_laparoscopic?: boolean;
}

interface UserTemplate {
  id: string;
  name: string;
  title: string;
  position: string;
  incision: string;
  icg_flr: boolean;
  pd_size: boolean;
  ln_options: string[];
  procedures: string[];
  is_laparoscopic: boolean;
}

const OPERATION_PRESETS: Record<OpKey, OperationPreset> = {
  open_hepatectomy: {
    title: "Operative Note (Hepatectomy)",
    position: "Supine",
    incision: "Mirror-L incision",
    icg_flr: true,
    ln_options: ["gr8", "gr12", "gr13"],
    procedures: [
      "A skin incision was made and the abdomen was entered.",
      "A thorough exploration of the abdominal cavity was performed.",
      "The hepatoduodenal ligament was skeletonized; the CHA, HAP, RHA, LHA, MHA, MPV, RPV, and LPV were identified.",
      "A Glissonean approach was utilized for vascular inflow control.",
      "A cholecystectomy was performed.",
      "Resection of the distal common bile duct (CBD) was performed at its intrapancreatic portion.",
      "The vascular inflow vessels were individually ligated and divided.",
      "Mobilization of the liver was completed.",
      "Parenchymal transection was performed using <CUSA/Thunderbeat/Harmonic/cautery> under <Pringle maneuver (clamping for 15 minutes, followed by a 5-minute release)/inflow occlusion>.",
      "The hepatic vein was divided using a <vascular stapler/Hem-o-lok clips/ligatures>.",
      "The proximal bile duct was divided with a margin of at least 1 cm from the tumor, and ductoplasty was performed.",
      "A Roux-en-Y hepaticojejunostomy was constructed using <5-0 PDS/4-0 PDS/4-0 vicryl/4-0 monocryl> sutures.",
      "Hemostasis was verified and secured.",
      "JP drains were placed in the <subhepatic and right subphrenic/subhepatic/right subphrenic> spaces.",
      "The abdomen was closed in layers using a <PDS loop/Monocryl/Prolene> suture, and the skin was approximated with <staples/nylon/subcuticular monocryl>."
    ]
  },
  lap_hepatectomy: {
    title: "Operative Note (Laparoscopic Hepatectomy)",
    position: "Supine with legs split (French position)",
    incision: "Laparoscopic port sites (12 mm camera port, 10 mm and 5 mm working ports)",
    icg_flr: true,
    ln_options: ["gr8", "gr12", "gr13"],
    procedures: [
      "Pneumoperitoneum was established at 12 mmHg via the Veress needle or Hasson technique.",
      "Diagnostic laparoscopy and thorough abdominal cavity exploration were performed.",
      "Intraoperative ultrasound was used to localize the lesion and identify key vascular landmarks.",
      "A Glissonean approach or individual hilar dissection was performed.",
      "A laparoscopic Pringle maneuver <was prepared/was not required> for inflow control.",
      "Laparoscopic parenchymal transection was carried out using <CUSA/Thunderbeat/Harmonic scalpel>.",
      "Vascular and biliary structures were controlled using <Hem-o-lok clips/an Endo-GIA stapler/sutures>.",
      "The specimen was retrieved in an extraction bag (Endo-bag) via a <Pfannenstiel incision/mini-laparotomy>.",
      "Hemostasis was verified, and a drain was placed at the surgical bed.",
      "The port sites were closed in layers."
    ]
  },
  whipple: {
    title: "Operative Note (Whipple Procedure)",
    position: "Supine",
    incision: "Midline incision",
    pd_size: true,
    ln_options: ["gr8", "gr12", "gr13", "gr14", "gr15", "gr16"],
    procedures: [
      "A skin incision was made and the abdomen was entered.",
      "A thorough exploration of the abdominal cavity was performed.",
      "An extended Kocher maneuver (kocherization) was performed.",
      "The lesser sac was opened to identify the middle colic vein (MCV), superior mesenteric vein (SMV), and portal vein (PV).",
      "The hepatoduodenal ligament was skeletonized; the CHA, HAP, RHA, LHA, MHA, MPV, RPV, and LPV were identified.",
      "A cholecystectomy was performed.",
      "The common hepatic duct (CHD) was divided, and a Bulldog clamp was applied to the proximal side.",
      "The gastroduodenal artery (GDA) was ligated and divided.",
      "An antrectomy was performed using a GIA stapler in a classical pancreaticoduodenectomy (PD) fashion.",
      "A tunnel was created posterior to the pancreatic neck, which was then divided.",
      "The proximal jejunum was divided using a GIA stapler.",
      "Finally, the uncinate process was dissected from the SMV and PV.",
      "Hemostasis was verified and secured.",
      "Pancreaticojejunostomy (PJ) anastomosis was constructed using the modified Blumgart technique (duct-to-mucosa) with <5-0 PDS/4-0 PDS/5-0 Prolene> sutures.",
      "Hepaticojejunostomy (HJ) anastomosis was constructed using <4-0 Monocryl/5-0 Monocryl/4-0 PDS> sutures (interrupted or continuous).",
      "Gastrojejunostomy (GJ) and jejunojejunostomy (JJ) anastomoses were constructed using <3-0 Monocryl/4-0 Monocryl/3-0 Vicryl> sutures.",
      "A feeding jejunostomy was performed.",
      "JP drains were placed in the <subhepatic and right subphrenic/subhepatic/right subphrenic> spaces.",
      "The abdomen was closed in layers using a <PDS loop/Prolene/Monocryl> suture, and the skin was approximated with <staples/nylon>."
    ]
  },
  lap_lar: {
    title: "Operative Note (Laparoscopic Low Anterior Resection with Anastomosis)",
    position: "Modified lithotomy position",
    incision: "Laparoscopic port sites and mini-laparotomy for extraction",
    ln_options: ["IMA origin", "IMV level", "Pelvic LN"],
    procedures: [
      "Pneumoperitoneum was established, and the camera and working ports were inserted.",
      "A thorough inspection of the abdominal and pelvic cavities was performed.",
      "The patient was placed in the Trendelenburg position with a right lateral tilt.",
      "A medial-to-lateral dissection was performed along Toldt's fascia.",
      "High ligation of the inferior mesenteric artery (IMA) and inferior mesenteric vein (IMV) was performed using <Hem-o-lok clips/Endo-GIA stapler/ligatures>.",
      "Mobilization of the splenic flexure was performed as needed.",
      "Total mesorectal excision (TME) was performed with preservation of the autonomic nerves.",
      "The distal rectum was transected using a <laparoscopic linear stapler/linear cutter>.",
      "The specimen was exteriorized and resected, and the anvil was inserted into the proximal colon.",
      "A double-stapled end-to-end colorectal anastomosis was constructed using a <circular stapler (29 mm)/circular stapler (25 mm)/circular stapler (33 mm)>.",
      "An air leak test was performed and was negative.",
      "A pelvic drain was placed, and the port sites and extraction wound were closed."
    ]
  },
  lap_chole: {
    title: "Operative Note (Laparoscopic Cholecystectomy)",
    position: "Supine / Reverse Trendelenburg with left tilt",
    incision: "4-port technique (10 mm umbilical, 10 mm epigastric, and two 5 mm RUQ ports)",
    ln_options: ["Calot LN"],
    procedures: [
      "Pneumoperitoneum was established at 12 mmHg.",
      "The gallbladder was retracted superiorly over the liver.",
      "Dissection of Calot's triangle was performed to achieve the Critical View of Safety (CVS).",
      "The cystic duct and cystic artery were clearly identified.",
      "The cystic duct was clipped with <Hem-o-lok clips/titanium clips> (2 clips distally, 1 clip proximally) and divided.",
      "The cystic artery was clipped with <Hem-o-lok clips/titanium clips> and divided.",
      "The gallbladder was dissected off the liver bed using <an electrocautery hook/Harmonic scalpel>.",
      "Hemostasis of the gallbladder fossa was verified.",
      "The gallbladder was extracted in an extraction bag (Endo-bag) via the umbilical port.",
      "The abdomen was deflated, and the port sites were closed."
    ]
  }
};

interface TextareaAutosizeProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
}

const TextareaAutosize = ({ value, onChange, placeholder, className, disabled, ...props }: TextareaAutosizeProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
    const timer = setTimeout(adjustHeight, 50);
    window.addEventListener('resize', adjustHeight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', adjustHeight);
    };
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        if (onChange) onChange(e);
        adjustHeight();
      }}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      rows={1}
      style={{ resize: 'none', overflowY: 'hidden' }}
      {...props}
    />
  );
};

interface OperativeFormProps {
  noteId?: string;
  initialPrint?: boolean;
}

export default function OperativeForm({ noteId, initialPrint = false }: OperativeFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'checklist' | 'findings' | 'summary' | 'preview'>('info');
  const [selectedOpKey, setSelectedOpKey] = useState<string>('open_hepatectomy');
  const [loading, setLoading] = useState(!!noteId);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedPortSize, setSelectedPortSize] = useState<'5mm' | '10mm' | '12mm'>('10mm');

  // A4 Preview Scale States for mobile screens
  const [scale, setScale] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // User Templates State
  const [userTemplates, setUserTemplates] = useState<UserTemplate[]>([]);

  // Template Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateModalData, setTemplateModalData] = useState({
    name: "",
    title: "",
    position: "Supine",
    incision: "",
    icg_flr: false,
    pd_size: false,
    is_laparoscopic: false,
    ln_options_str: ""
  });

  // [P0] Unsaved changes guard
  const [isDirty, setIsDirty] = useState(false);
  const [confirmNavDest, setConfirmNavDest] = useState<string | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // [P2] Progressive disclosure - advanced findings
  const [showAdvancedFindings, setShowAdvancedFindings] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    opDate: new Date().toISOString().split('T')[0],
    timeStarted: "",
    timeEnded: "",
    surgeon: "",
    firstAssistant: "",
    secondAssistant: "",
    clinicalDiagnosis: "",
    postOpDiagnosis: "",
    operativeProcedure: "",
    anesthesia: "",
    anesthetist: "",
    surgicalNurse: "",
    
    // Findings JSONB
    icgR15: "",
    flr: "",
    pdSize: "",
    pancreaticConsistency: "",
    selectedLN: [] as string[],
    consistency: "", // hard, firm, soft
    adhesionHd: "No", // No / Yes
    adhesionDetail: "",
    vascularVariation: "No",
    vascularDetail: "",
    peritonealNodule: false,
    liverMetastasis: false,
    ascites: false,
    findingTextNotes: "",
    tumorSize: "",
    selectedSegments: [] as string[],
    customSegment: "",
    tumorInvasion: "No",
    invasionDetail: "",
    tumorMargin: "free",
    marginSize: "",
    customMarginDetail: "",
    
    // Summary
    ebl: "",
    complication: "",
    patho: "",
    
    // Patient Metadata Footer
    patientName: "",
    patientAge: "",
    hn: "",
    an: "",
    ward: "",
    department: "",
    
    // Storage Photo URLs
    photos: [] as string[],
    
    // Laparoscopic Port sites
    ports: [] as { id: string; x: number; y: number; size: string }[]
  });

  // Procedure Checklist State
  const [checklist, setChecklist] = useState<{ id: number; text: string; checked: boolean; templateText?: string; selections?: Record<number, string> }[]>([]);
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [lastDeletedItem, setLastDeletedItem] = useState<{ item: any; index: number } | null>(null);

  // Drag and Drop State & Refs
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const touchDragIndexRef = useRef<number | null>(null);

  // Swipe-to-Reveal Delete Action State & Refs
  const [swipedItemId, setSwipedItemId] = useState<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeThreshold = 40;

  // Handle closing swiped item when tapping/clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      // If we clicked outside the swiped item, reset it
      const itemEl = target.closest('[data-swipe-id]');
      if (itemEl) {
        const swipeId = parseInt(itemEl.getAttribute('data-swipe-id') || '', 10);
        if (swipeId === swipedItemId) {
          return;
        }
      }
      setSwipedItemId(null);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [swipedItemId]);



  const fetchUserTemplates = async (): Promise<UserTemplate[]> => {
    try {
      const { data, error } = await supabase
        .from('operative_templates')
        .select('*')
        .order('name');
      if (error) throw error;
      const templates = data || [];
      setUserTemplates(templates);
      return templates;
    } catch (err) {
      console.error('Error fetching user templates:', err);
      return [];
    }
  };

  const getPreset = (key: string, templatesList: UserTemplate[] = userTemplates) => {
    if (OPERATION_PRESETS[key as OpKey]) {
      return {
        ...OPERATION_PRESETS[key as OpKey],
        is_laparoscopic: key.startsWith('lap_')
      };
    }
    const userTpl = templatesList.find(t => t.id === key);
    if (userTpl) {
      return {
        title: userTpl.title,
        position: userTpl.position,
        incision: userTpl.incision,
        icg_flr: userTpl.icg_flr,
        pd_size: userTpl.pd_size,
        ln_options: userTpl.ln_options || [],
        procedures: userTpl.procedures || [],
        is_laparoscopic: userTpl.is_laparoscopic
      };
    }
    return undefined;
  };

  const syncChecklist = (opKey: string, templatesList: UserTemplate[] = userTemplates) => {
    const preset = OPERATION_PRESETS[opKey as OpKey];
    if (preset) {
      setChecklist(preset.procedures.map((proc, idx) => ({
        id: idx,
        text: proc,
        templateText: proc,
        checked: true,
        selections: {}
      })));
      return;
    }
    const userTpl = templatesList.find(t => t.id === opKey);
    if (userTpl) {
      setChecklist(userTpl.procedures.map((proc, idx) => ({
        id: idx,
        text: proc,
        templateText: proc,
        checked: true,
        selections: {}
      })));
    }
  };

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Warning before unload (browser level)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'คุณมีงานที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้หรือไม่?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const handleBackToDashboard = () => {
    if (isDirty) {
      setConfirmNavDest('/');
    } else {
      router.push('/');
    }
  };

  // Fetch note & templates on load
  useEffect(() => {
    const loadData = async () => {
      // 1. Fetch user templates first
      const templatesList = await fetchUserTemplates();

      if (!noteId) {
        syncChecklist('open_hepatectomy', templatesList);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('operative_notes')
          .select('*')
          .eq('id', noteId)
          .single();

        if (error) throw error;
        if (data) {
          const opKey = data.op_type;
          setSelectedOpKey(opKey);
          
          setFormData({
            opDate: data.op_date,
            timeStarted: data.time_started,
            timeEnded: data.time_ended,
            surgeon: data.surgeon,
            firstAssistant: data.first_assistant,
            secondAssistant: data.second_assistant || '',
            clinicalDiagnosis: data.clinical_diagnosis,
            postOpDiagnosis: data.post_op_diagnosis,
            operativeProcedure: data.operative_procedure,
            anesthesia: data.anesthesia,
            anesthetist: data.anesthetist,
            surgicalNurse: data.surgical_nurse,
            
            // Findings from JSONB
            icgR15: data.findings.icgR15 || '',
            flr: data.findings.flr || '',
            pdSize: data.findings.pdSize || '',
            pancreaticConsistency: data.findings.pancreaticConsistency || '',
            selectedLN: data.findings.selectedLN || [],
            consistency: data.findings.consistency || 'soft',
            adhesionHd: data.findings.adhesionHd || 'No',
            adhesionDetail: data.findings.adhesionDetail || '',
            vascularVariation: data.findings.vascularVariation || 'No',
            vascularDetail: data.findings.vascularDetail || '',
            peritonealNodule: !!data.findings.peritonealNodule,
            liverMetastasis: !!data.findings.liverMetastasis,
            ascites: !!data.findings.ascites,
            findingTextNotes: data.findings.findingTextNotes || '',
            tumorSize: data.findings.tumorSize || '',
            selectedSegments: data.findings.selectedSegments || [],
            customSegment: data.findings.customSegment || '',
            tumorInvasion: data.findings.tumorInvasion || 'No',
            invasionDetail: data.findings.invasionDetail || '',
            tumorMargin: data.findings.tumorMargin || 'free',
            marginSize: data.findings.marginSize || '',
            customMarginDetail: data.findings.customMarginDetail || '',
            
            // Summary
            ebl: data.ebl,
            complication: data.complication,
            patho: data.patho,
            
            // Patient Footer
            patientName: data.patient_name,
            patientAge: data.patient_age,
            hn: data.hn,
            an: data.an,
            ward: data.ward,
            department: data.department,
            
            // Photos
            photos: data.photos || [],
            
            // Ports
            ports: data.findings?.ports || []
          });

          // Checklist
          setChecklist(data.checklist || []);
        }
      } catch (err) {
        console.error('Error fetching note details:', err);
        alert('Failed to load note details');
      } finally {
        setLoading(false);
        if (initialPrint) {
          setActiveTab('preview');
        }
      }
    };

    loadData();
  }, [noteId, initialPrint]);


  // Switch Operation type & sync default details
  const handleOpChange = (key: string, templatesList: UserTemplate[] = userTemplates) => {
    setSelectedOpKey(key);
    syncChecklist(key, templatesList);
    
    // Sync default metadata / procedures
    const preset = getPreset(key, templatesList);
    if (preset) {
      setFormData(prev => ({
        ...prev,
        operativeProcedure: preset.title,
        // Clear fields not relevant to operation
        icgR15: "",
        flr: "",
        pdSize: "",
        pancreaticConsistency: "",
        selectedLN: [],
        ports: [],
        tumorSize: "",
        selectedSegments: [],
        customSegment: "",
        tumorInvasion: "No",
        invasionDetail: "",
        tumorMargin: "free",
        marginSize: "",
        customMarginDetail: ""
      }));
    }
  };

  // Template CRUD Handlers
  const openSaveTemplateModal = () => {
    const preset = getPreset(selectedOpKey);
    setTemplateModalData({
      name: `Clone of ${preset?.title || 'Procedure'}`,
      title: formData.operativeProcedure || preset?.title || "",
      position: preset?.position || "Supine",
      incision: preset?.incision || "",
      icg_flr: !!preset?.icg_flr,
      pd_size: !!preset?.pd_size,
      is_laparoscopic: !!preset?.is_laparoscopic,
      ln_options_str: preset?.ln_options.join(", ") || ""
    });
    setIsTemplateModalOpen(true);
  };

  const handleSaveNewTemplate = async () => {
    if (!templateModalData.name.trim()) {
      alert("Please enter a Template Name.");
      return;
    }
    if (!templateModalData.title.trim()) {
      alert("Please enter a Procedure Title.");
      return;
    }

    const ln_options = templateModalData.ln_options_str
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Save current steps in checklist
    const procedures = checklist.map(c => c.text);

    try {
      const { data, error } = await supabase
        .from('operative_templates')
        .insert({
          name: templateModalData.name,
          title: templateModalData.title,
          position: templateModalData.position,
          incision: templateModalData.incision,
          icg_flr: templateModalData.icg_flr,
          pd_size: templateModalData.pd_size,
          is_laparoscopic: templateModalData.is_laparoscopic,
          ln_options: ln_options,
          procedures: procedures
        })
        .select()
        .single();

      if (error) throw error;

      alert(`Template "${templateModalData.name}" saved successfully!`);
      setIsTemplateModalOpen(false);

      // Refresh template list
      const updatedTemplates = await fetchUserTemplates();
      
      // Select the new template
      if (data && data.id) {
        setSelectedOpKey(data.id);
      }
    } catch (err) {
      console.error("Error saving new template:", err);
      alert("Failed to save template. Check console for details.");
    }
  };

  const handleUpdateTemplate = async () => {
    const isUserTpl = !['open_hepatectomy', 'lap_hepatectomy', 'whipple', 'lap_lar', 'lap_chole'].includes(selectedOpKey);
    if (!isUserTpl) return;

    if (!confirm("Are you sure you want to update this template with current form steps and procedure name?")) return;

    const procedures = checklist.map(c => c.text);

    try {
      const { error } = await supabase
        .from('operative_templates')
        .update({
          title: formData.operativeProcedure,
          procedures: procedures
        })
        .eq('id', selectedOpKey);

      if (error) throw error;

      alert("Template updated successfully!");
      await fetchUserTemplates();
    } catch (err) {
      console.error("Error updating template:", err);
      alert("Failed to update template.");
    }
  };

  const handleDeleteTemplate = async () => {
    const isUserTpl = !['open_hepatectomy', 'lap_hepatectomy', 'whipple', 'lap_lar', 'lap_chole'].includes(selectedOpKey);
    if (!isUserTpl) return;

    if (!confirm("Are you sure you want to delete this template? Operative notes using this template will not be affected.")) return;

    try {
      const { error } = await supabase
        .from('operative_templates')
        .delete()
        .eq('id', selectedOpKey);

      if (error) throw error;

      alert("Template deleted successfully.");
      
      // Refresh templates
      const updatedList = await fetchUserTemplates();
      
      // Reset to default preset
      handleOpChange('open_hepatectomy', updatedList);
    } catch (err) {
      console.error("Error deleting template:", err);
      alert("Failed to delete template.");
    }
  };

  // Photo Uploader to Supabase Storage
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('operative-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('operative-photos')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...uploadedUrls]
      }));
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async (index: number) => {
    const photoUrl = formData.photos[index];
    if (!photoUrl) return;

    try {
      // Extract filename from public URL (e.g. from the last path segment before any query params)
      // Standard public URL format: https://[project-id].supabase.co/storage/v1/object/public/operative-photos/filename.jpg
      const urlWithoutParams = photoUrl.split('?')[0];
      const fileName = urlWithoutParams.substring(urlWithoutParams.lastIndexOf('/') + 1);

      if (fileName) {
        const { error } = await supabase.storage
          .from('operative-photos')
          .remove([fileName]);
        
        if (error) {
          console.error('Error deleting photo from Supabase storage:', error);
        } else {
          console.log(`Successfully deleted ${fileName} from Supabase storage`);
        }
      }
    } catch (err) {
      console.error('Failed to delete photo from storage:', err);
    }

    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const toggleLN = (ln: string) => {
    setFormData(prev => {
      const exists = prev.selectedLN.includes(ln);
      return {
        ...prev,
        selectedLN: exists 
          ? prev.selectedLN.filter(item => item !== ln)
          : [...prev.selectedLN, ln]
      };
    });
  };

  const toggleChecklist = (id: number) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleTextChange = (id: number, newText: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, text: newText } : item
    ));
  };

  const addChecklistItem = () => {
    setChecklist(prev => [
      ...prev,
      {
        id: prev.length > 0 ? Math.max(...prev.map(i => i.id)) + 1 : 0,
        text: "New surgical step...",
        templateText: "New surgical step...",
        checked: true,
        selections: {}
      }
    ]);
  };

  const deleteChecklistItem = (id: number) => {
    const item = checklist.find(i => i.id === id);
    if (!item) return;
    const idx = checklist.findIndex(i => i.id === id);
    if (idx !== -1) {
      setLastDeletedItem({ item, index: idx });
      setChecklist(prev => prev.filter(i => i.id !== id));
      showToast('ลบขั้นตอนผ่าตัดแล้ว', 'info');
    }
  };

  const undoDeleteChecklistItem = () => {
    if (lastDeletedItem) {
      setChecklist(prev => {
        const newList = [...prev];
        newList.splice(lastDeletedItem.index, 0, lastDeletedItem.item);
        return newList;
      });
      setLastDeletedItem(null);
      showToast('คืนค่าขั้นตอนผ่าตัดเรียบร้อยแล้ว', 'success');
    }
  };

  const getPlaceholders = (text: string) => {
    const regex = /<([^>]+)>/g;
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        full: match[0],
        content: match[1],
        index: match.index
      });
    }
    return matches;
  };

  const selectOption = (itemId: number, placeholderIndex: number, optionValue: string) => {
    setChecklist(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      
      const tplText = item.templateText || item.text;
      const placeholders = getPlaceholders(tplText);
      if (placeholders.length === 0) return item;
      
      const newSelections = { ...(item.selections || {}), [placeholderIndex]: optionValue };
      
      let index = 0;
      const newText = tplText.replace(/<([^>]+)>/g, (match: string) => {
        const val = newSelections[index] !== undefined ? newSelections[index] : match;
        index++;
        return val;
      });
      
      return {
        ...item,
        text: newText,
        selections: newSelections,
        templateText: tplText
      };
    }));
  };

  const isChecklistValid = checklist
    .filter(item => item.checked)
    .every(item => !item.text.includes('<') && !item.text.includes('>'));

  const handleTabClick = (tab: 'info' | 'checklist' | 'findings' | 'summary' | 'preview') => {
    if (tab !== 'info' && tab !== 'checklist' && !isChecklistValid) {
      alert('กรุณาเลือกตัวเลือกในขั้นตอนผ่าตัด (เช่น ชนิดของไหม หรือเครื่องมือ) ให้ครบถ้วนก่อนข้ามไปขั้นตอนถัดไป');
      return;
    }
    setActiveTab(tab);
  };

  const moveChecklistItem = (index: number, direction: 'up' | 'down') => {
    setChecklist(prev => {
      const newList = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (targetIndex >= 0 && targetIndex < newList.length) {
        const temp = newList[index];
        newList[index] = newList[targetIndex];
        newList[targetIndex] = temp;
      }
      return newList;
    });
  };

  // Desktop Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index.toString());
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    setChecklist(prev => {
      const newList = [...prev];
      const item = newList[draggedIndex];
      newList.splice(draggedIndex, 1);
      newList.splice(index, 0, item);
      return newList;
    });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Mobile Touch Drag Handlers (Reordering)
  const handleTouchDragStart = (e: React.TouchEvent, index: number) => {
    touchDragIndexRef.current = index;
    setDraggedIndex(index);
  };

  const handleTouchDragMove = (e: React.TouchEvent, index: number) => {
    if (touchDragIndexRef.current === null) return;
    const touch = e.touches[0];
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!targetElement) return;

    const itemEl = targetElement.closest('[data-index]');
    if (itemEl) {
      const targetIndex = parseInt(itemEl.getAttribute('data-index') || '', 10);
      const currentIndex = touchDragIndexRef.current;

      if (!isNaN(targetIndex) && targetIndex !== currentIndex) {
        setChecklist(prev => {
          const newList = [...prev];
          const item = newList[currentIndex];
          newList.splice(currentIndex, 1);
          newList.splice(targetIndex, 0, item);
          return newList;
        });
        touchDragIndexRef.current = targetIndex;
        setDraggedIndex(targetIndex);
      }
    }
  };

  const handleTouchDragEnd = () => {
    touchDragIndexRef.current = null;
    setDraggedIndex(null);
  };

  // Mobile Touch Swipe Handlers (Swipe-to-Delete)
  const handleTouchStart = (e: React.TouchEvent, itemId: number) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent, itemId: number) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      if (e.cancelable) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent, itemId: number) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < -swipeThreshold) {
        setSwipedItemId(itemId);
      } else if (deltaX > swipeThreshold) {
        if (swipedItemId === itemId) {
          setSwipedItemId(null);
        }
      }
    }
    touchStartRef.current = null;
  };

  const handleAbdomenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newPort = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      x,
      y,
      size: selectedPortSize
    };
    
    setFormData(prev => ({
      ...prev,
      ports: [...(prev.ports || []), newPort]
    }));
  };

  const removePort = (portId: string) => {
    setFormData(prev => ({
      ...prev,
      ports: (prev.ports || []).filter(p => p.id !== portId)
    }));
  };

  // Save to database
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        op_date: formData.opDate,
        time_started: formData.timeStarted,
        time_ended: formData.timeEnded,
        surgeon: formData.surgeon,
        first_assistant: formData.firstAssistant,
        second_assistant: formData.secondAssistant || null,
        clinical_diagnosis: formData.clinicalDiagnosis,
        post_op_diagnosis: formData.postOpDiagnosis,
        operative_procedure: formData.operativeProcedure,
        anesthesia: formData.anesthesia,
        anesthetist: formData.anesthetist,
        surgical_nurse: formData.surgicalNurse,
        op_type: selectedOpKey,
        findings: {
          icgR15: formData.icgR15,
          flr: formData.flr,
          pdSize: formData.pdSize,
          pancreaticConsistency: formData.pancreaticConsistency,
          selectedLN: formData.selectedLN,
          consistency: formData.consistency,
          adhesionHd: formData.adhesionHd,
          adhesionDetail: formData.adhesionDetail,
          vascularVariation: formData.vascularVariation,
          vascularDetail: formData.vascularDetail,
          peritonealNodule: formData.peritonealNodule,
          liverMetastasis: formData.liverMetastasis,
          ascites: formData.ascites,
          findingTextNotes: formData.findingTextNotes,
          ports: formData.ports || [],
          tumorSize: formData.tumorSize,
          selectedSegments: formData.selectedSegments,
          customSegment: formData.customSegment,
          tumorInvasion: formData.tumorInvasion,
          invasionDetail: formData.invasionDetail,
          tumorMargin: formData.tumorMargin,
          marginSize: formData.marginSize,
          customMarginDetail: formData.customMarginDetail
        },
        checklist: checklist,
        ebl: formData.ebl,
        complication: formData.complication,
        patho: formData.patho,
        patient_name: formData.patientName,
        patient_age: formData.patientAge,
        hn: formData.hn,
        an: formData.an,
        ward: formData.ward,
        department: formData.department,
        photos: formData.photos
      };

      if (noteId) {
        // Edit mode
        const { error } = await supabase
          .from('operative_notes')
          .update(payload)
          .eq('id', noteId);

        if (error) throw error;
        alert('Operative Note updated successfully!');
      } else {
        // Create mode
        const { error } = await supabase
          .from('operative_notes')
          .insert(payload);

        if (error) throw error;
        alert('Operative Note saved successfully!');
      }

      router.push('/');
    } catch (err) {
      console.error('Error saving note:', err);
      alert('Failed to save operative note. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-2">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-sm text-gray-500 font-medium font-sans">Loading operative note details...</p>
      </div>
    );
  }

  const activePreset = getPreset(selectedOpKey);
  const currentPreset = activePreset || {
    title: formData.operativeProcedure || "",
    position: "Supine",
    incision: "",
    icg_flr: false,
    pd_size: false,
    ln_options: [] as string[],
    procedures: [] as string[],
    is_laparoscopic: false
  };
  const isLaparoscopic = selectedOpKey.startsWith('lap_') || !!currentPreset.is_laparoscopic;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Top sticky app header (Hidden when printing) */}
      <header className="bg-blue-800 text-white px-4 py-3 shadow-md flex justify-between items-center no-print sticky top-0 z-50">
        <button 
          onClick={handleBackToDashboard} 
          className="flex items-center space-x-1 hover:text-blue-200 transition text-sm cursor-pointer no-toggle">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline font-semibold">Dashboard</span>
        </button>

        <div className="flex items-center space-x-2 text-center">
          <FileText className="h-5 w-5 text-yellow-300" />
          <span className="font-bold text-sm tracking-wide">
            {noteId ? 'Edit Operative Note' : 'Create Operative Note'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'preview' && (
            <button 
              onClick={() => window.print()} 
              className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow flex items-center space-x-1 transition">
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>
          )}
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-blue-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow flex items-center space-x-1 transition">
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{noteId ? 'Save Edit' : 'Save Note'}</span>
          </button>
        </div>
      </header>

      {/* Mobile-Native tab switcher (Hidden when printing) */}
      <div className="bg-white border-b border-gray-200 flex no-print sticky top-[48px] z-40 shadow-sm text-xs font-bold overflow-x-auto">
        <button 
          className={`mobile-tab-btn flex-shrink-0 ${activeTab === 'info' ? 'active' : 'text-gray-600'}`}
          onClick={() => handleTabClick('info')}>
          1. Patient & Team
        </button>
        <button 
          className={`mobile-tab-btn flex-shrink-0 ${activeTab === 'checklist' ? 'active' : 'text-gray-600'}`}
          onClick={() => handleTabClick('checklist')}>
          2. Operation & Steps
        </button>
        <button 
          className={`mobile-tab-btn flex-shrink-0 ${activeTab === 'findings' ? 'active' : 'text-gray-600'}`}
          onClick={() => handleTabClick('findings')}>
          3. Findings & Photos
        </button>
        <button 
          className={`mobile-tab-btn flex-shrink-0 ${activeTab === 'summary' ? 'active' : 'text-gray-600'}`}
          onClick={() => handleTabClick('summary')}>
          4. Summary
        </button>
        <button 
          className={`mobile-tab-btn flex-shrink-0 ${activeTab === 'preview' ? 'active' : 'text-gray-600'}`}
          onClick={() => handleTabClick('preview')}>
          5. A4 Print Preview
        </button>
      </div>

      {/* Form Content Area */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:py-6">
        
        {/* Form Fields Section */}
        <div className="no-print">
          
          {/* TAB 1: Patient & Surgical Team Info */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4">
                <h2 className="font-bold text-gray-800 text-sm border-b pb-2 flex items-center text-blue-800">
                  <User className="h-4.5 w-4.5 mr-2" />
                  Patient Demographics (ข้อมูลผู้ป่วย)
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Patient Name (ชื่อผู้ป่วย)</label>
                    <input 
                      type="text" 
                      value={formData.patientName} 
                      onChange={e => setFormData({...formData, patientName: e.target.value})} 
                      className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Age (อายุ)</label>
                    <input 
                      type="text" 
                      value={formData.patientAge} 
                      onChange={e => setFormData({...formData, patientAge: e.target.value})} 
                      className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Hospital Number (HN)</label>
                    <input 
                      type="text" 
                      value={formData.hn} 
                      onChange={e => setFormData({...formData, hn: e.target.value})} 
                      className="w-full border rounded-lg p-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Admission Number (AN)</label>
                    <input 
                      type="text" 
                      value={formData.an} 
                      onChange={e => setFormData({...formData, an: e.target.value})} 
                      className="w-full border rounded-lg p-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Ward (หอผู้ป่วย)</label>
                    <input 
                      type="text" 
                      value={formData.ward} 
                      onChange={e => setFormData({...formData, ward: e.target.value})} 
                      className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Department (แผนก)</label>
                    <input 
                      type="text" 
                      value={formData.department} 
                      onChange={e => setFormData({...formData, department: e.target.value})} 
                      className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4">
                <h2 className="font-bold text-gray-800 text-sm border-b pb-2 flex items-center text-blue-800">
                  <Activity className="h-4.5 w-4.5 mr-2" />
                  Surgical Team & Diagnoses (ข้อมูลทีม & การวินิจฉัย)
                </h2>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
                    <input 
                      type="date" 
                      value={formData.opDate} 
                      onChange={e => setFormData({...formData, opDate: e.target.value})} 
                      className="w-full border rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Start Time</label>
                    <input 
                      type="time" 
                      value={formData.timeStarted} 
                      onChange={e => setFormData({...formData, timeStarted: e.target.value})} 
                      className="w-full border rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">End Time</label>
                    <input 
                      type="time" 
                      value={formData.timeEnded} 
                      onChange={e => setFormData({...formData, timeEnded: e.target.value})} 
                      className="w-full border rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Surgeon (ศัลยแพทย์ผู้ทำผ่าตัด)</label>
                    <input 
                      type="text" 
                      value={formData.surgeon} 
                      onChange={e => setFormData({...formData, surgeon: e.target.value})} 
                      className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">First Assistant (ผู้ช่วยคนที่ 1)</label>
                      <input 
                        type="text" 
                        value={formData.firstAssistant} 
                        onChange={e => setFormData({...formData, firstAssistant: e.target.value})} 
                        className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Second Assistant (ผู้ช่วยคนที่ 2)</label>
                      <input 
                        type="text" 
                        value={formData.secondAssistant} 
                        onChange={e => setFormData({...formData, secondAssistant: e.target.value})} 
                        className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Anesthesia (วิธีดมยา)</label>
                      <input 
                        type="text" 
                        value={formData.anesthesia} 
                        onChange={e => setFormData({...formData, anesthesia: e.target.value})} 
                        className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Anesthetist (วิสัญญีแพทย์)</label>
                      <input 
                        type="text" 
                        value={formData.anesthetist} 
                        onChange={e => setFormData({...formData, anesthetist: e.target.value})} 
                        className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Surgical Nurse (พยาบาลส่งเครื่องมือ)</label>
                      <input 
                        type="text" 
                        value={formData.surgicalNurse} 
                        onChange={e => setFormData({...formData, surgicalNurse: e.target.value})} 
                        className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Clinical Diagnosis (การวินิจฉัยก่อนผ่าตัด)</label>
                    <input 
                      type="text" 
                      value={formData.clinicalDiagnosis} 
                      onChange={e => setFormData({...formData, clinicalDiagnosis: e.target.value})} 
                      className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Post-operative Diagnosis (การวินิจฉัยหลังผ่าตัด)</label>
                    <input 
                      type="text" 
                      value={formData.postOpDiagnosis} 
                      onChange={e => setFormData({...formData, postOpDiagnosis: e.target.value})} 
                      className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => handleTabClick('checklist')}
                  className="bg-blue-600 text-white font-bold px-5 py-3 rounded-xl flex items-center justify-center space-x-2 text-sm shadow hover:bg-blue-700 transition w-full sm:w-auto">
                  <span>Next: Operation Type</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Operation & Steps Checklist */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              {/* Select Operation Preset */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center">
                  <Info className="h-4 w-4 text-blue-600 mr-1.5" />
                  เลือกประเภทการผ่าตัด (Operation Type)
                </label>
                <select 
                  value={selectedOpKey} 
                  onChange={(e) => handleOpChange(e.target.value)}
                  className="w-full bg-blue-50 border border-blue-300 text-blue-900 font-semibold rounded-lg p-3 text-base focus:ring-2 focus:ring-blue-500">
                  <optgroup label="Default Presets (เทมเพลตมาตรฐาน)">
                    <option value="open_hepatectomy">Open Hepatectomy</option>
                    <option value="lap_hepatectomy">Laparoscopic Hepatectomy</option>
                    <option value="whipple">Whipple Operation</option>
                    <option value="lap_lar">Laparoscopic LAR with anastomosis</option>
                    <option value="lap_chole">Laparoscopic Cholecystectomy</option>
                  </optgroup>
                  {userTemplates.length > 0 && (
                    <optgroup label="My Templates (เทมเพลตของฉัน)">
                      {userTemplates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={openSaveTemplateModal}
                    className="bg-green-600 hover:bg-green-750 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Save as New Template (บันทึกเป็นเทมเพลตใหม่)</span>
                  </button>

                  {!['open_hepatectomy', 'lap_hepatectomy', 'whipple', 'lap_lar', 'lap_chole'].includes(selectedOpKey) && (
                    <>
                      <button
                        type="button"
                        onClick={handleUpdateTemplate}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm flex items-center space-x-1.5 transition cursor-pointer"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>Update Selected Template (อัปเดตเทมเพลตนี้)</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteTemplate}
                        className="bg-red-600 hover:bg-red-750 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm flex items-center space-x-1.5 transition cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete Selected Template (ลบเทมเพลตนี้)</span>
                      </button>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Operative Procedure Name (for template)</label>
                  <input 
                    type="text" 
                    value={formData.operativeProcedure} 
                    onChange={e => setFormData({...formData, operativeProcedure: e.target.value})} 
                    className="w-full border rounded-lg p-2.5 text-sm font-semibold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Steps Checklist */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <h2 className="font-bold text-gray-800 text-sm flex items-center text-blue-800">
                    <Check className="h-5 w-5 mr-1" />
                    Procedure Steps Checklist
                  </h2>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                    {checklist.filter(c => c.checked).length}/{checklist.length} Steps
                  </span>
                </div>
                
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {checklist.map((item, index) => {
                    const placeholders = getPlaceholders(item.templateText || item.text);
                    const isExpanded = expandedItemId === item.id;
                    const hasUnresolvedPlaceholders = item.checked && (item.text.includes('<') || item.text.includes('>'));

                    return (
                      <div 
                        key={item.id} 
                        data-index={index}
                        data-swipe-id={item.id}
                        className={`group relative overflow-hidden rounded-lg border transition-all ${
                          draggedIndex === index 
                            ? 'opacity-50 border-blue-500 bg-blue-50/20' 
                            : isExpanded
                              ? 'border-blue-300 bg-blue-50/10 shadow-sm'
                              : 'border-gray-250 bg-gray-50 hover:border-gray-300'
                        }`}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => e.preventDefault()}
                      >
                        {/* Swipe Action Background (Delete Button - revealed on swipe left on mobile) */}
                        <div className="absolute right-0 top-0 bottom-0 flex items-center justify-end z-0">
                          <button
                            type="button"
                            onClick={() => {
                              deleteChecklistItem(item.id);
                              setSwipedItemId(null);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white h-full px-5 flex items-center space-x-1.5 font-bold text-xs select-none cursor-pointer transition-colors"
                            title="Delete step"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>ลบ (Delete)</span>
                          </button>
                        </div>

                        {/* Foreground Row Content */}
                        <div
                          className="relative z-10 bg-white flex flex-col p-3 transition-transform duration-200 ease-out"
                          style={{
                            transform: swipedItemId === item.id ? 'translateX(-110px)' : 'translateX(0)',
                            touchAction: 'pan-y'
                          }}
                          onTouchStart={(e) => handleTouchStart(e, item.id)}
                          onTouchMove={(e) => handleTouchMove(e, item.id)}
                          onTouchEnd={(e) => handleTouchEnd(e, item.id)}
                        >
                          <div 
                            className="flex items-start space-x-2.5 cursor-pointer"
                            onClick={(e) => {
                              // If they clicked a control (checkbox, buttons, inputs, drag handle), don't toggle expansion
                              const target = e.target as HTMLElement;
                              if (target.closest('.no-toggle')) return;
                              setExpandedItemId(isExpanded ? null : item.id);
                            }}
                          >
                            {/* Drag Handle (for Desktop & Mobile drag-and-drop) */}
                            <div
                              draggable
                              onDragStart={(e) => handleDragStart(e, index)}
                              onDragEnd={handleDragEnd}
                              onTouchStart={(e) => handleTouchDragStart(e, index)}
                              onTouchMove={(e) => handleTouchDragMove(e, index)}
                              onTouchEnd={handleTouchDragEnd}
                              className="no-toggle text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1 shrink-0 select-none touch-none mt-0.5"
                              title="Drag to reorder"
                            >
                              <GripVertical className="h-4 w-4" />
                            </div>

                            {/* Checkbox */}
                            <input 
                              type="checkbox" 
                              checked={item.checked} 
                              onChange={() => toggleChecklist(item.id)}
                              className="no-toggle h-4.5 w-4.5 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0 mt-0.5"
                            />

                            {/* Wrapping and Auto-resizing Textarea */}
                            <div className="flex-1 min-w-0">
                              <TextareaAutosize
                                value={item.text}
                                onChange={(e) => handleTextChange(item.id, e.target.value)}
                                placeholder="Describe the surgical step..."
                                className={`no-toggle w-full bg-transparent border-0 border-b border-dashed border-gray-205 hover:border-gray-400 focus:border-blue-500 focus:ring-0 p-1 text-xs focus:bg-blue-50/30 rounded transition leading-relaxed min-h-[1.75rem] break-words break-all whitespace-pre-wrap ${
                                  item.checked ? 'text-gray-900 font-medium' : 'text-gray-400 line-through'
                                }`}
                              />

                              {/* Warnings when collapsed */}
                              {!isExpanded && hasUnresolvedPlaceholders && (
                                <div className="mt-1 pl-1">
                                  <span className="bg-red-50 text-red-700 text-[10px] px-2 py-0.5 rounded font-bold border border-red-150 animate-pulse inline-flex items-center">
                                    ⚠️ มีตัวเลือกที่ยังไม่ได้ระบุ (คลิกที่นี่)
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Desktop-only delete button (hidden on mobile, reveals on hover on desktop) */}
                            <button
                              type="button"
                              onClick={() => deleteChecklistItem(item.id)}
                              className="no-toggle text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-gray-100 transition shrink-0 hidden md:block md:opacity-0 group-hover:opacity-100 duration-150"
                              title="Delete step"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Expanded Options Panel */}
                          {isExpanded && item.checked && placeholders.length > 0 && (
                            <div className="no-toggle mt-3 pt-3 border-t border-gray-100 space-y-3 text-xs bg-gray-50/50 p-2.5 rounded-lg">
                              {placeholders.map((ph, phIdx) => {
                                const options = ph.content.split(/[\/|]/).map(o => o.trim());
                                const selectedValue = item.selections?.[phIdx];
                                const isCustomSelected = selectedValue !== undefined && selectedValue !== '' && !options.includes(selectedValue) && selectedValue !== 'Custom...';

                                return (
                                  <div key={phIdx} className="space-y-1.5 border-b border-gray-100 pb-2.5 last:border-0 last:pb-0">
                                    <div className="text-[11px] font-bold text-gray-700 flex items-center">
                                      <span className="bg-blue-100 text-blue-800 text-[10px] w-4.5 h-4.5 rounded-full inline-flex items-center justify-center mr-1.5 font-bold shrink-0">
                                        {phIdx + 1}
                                      </span>
                                      <span>เลือกตัวเลือก (Select option):</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {options.map(opt => {
                                        const isSelected = selectedValue === opt;
                                        return (
                                          <button
                                            key={opt}
                                            type="button"
                                            onClick={() => selectOption(item.id, phIdx, opt)}
                                            className={`px-2.5 py-1 rounded border text-[11px] font-semibold transition-all cursor-pointer ${
                                              isSelected 
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                                : 'bg-white text-gray-700 border-gray-250 hover:bg-gray-100'
                                            }`}
                                          >
                                            {opt}
                                          </button>
                                        );
                                      })}
                                      <button
                                        type="button"
                                        onClick={() => selectOption(item.id, phIdx, isCustomSelected ? '' : 'Custom...')}
                                        className={`px-2.5 py-1 rounded border text-[11px] font-semibold transition-all cursor-pointer ${
                                          isCustomSelected || selectedValue === 'Custom...'
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                            : 'bg-white text-gray-700 border-gray-250 hover:bg-gray-100'
                                        }`}
                                      >
                                        {isCustomSelected || selectedValue === 'Custom...' ? 'ระบุเอง (Custom)' : '✏️ อื่นๆ...'}
                                      </button>
                                    </div>
                                    {(isCustomSelected || selectedValue === 'Custom...') && (
                                      <input
                                        type="text"
                                        value={selectedValue === 'Custom...' ? '' : selectedValue}
                                        onChange={(e) => selectOption(item.id, phIdx, e.target.value)}
                                        placeholder="พิมพ์ระบุข้อความที่ต้องการ..."
                                        className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={addChecklistItem}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1 p-1 hover:underline bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-2 transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Custom Step (เพิ่มขั้นตอนผ่าตัด)</span>
                  </button>
                </div>
              </div>

              {/* Validation Warning Message Box */}
              {!isChecklistValid && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-pulse no-print">
                  <span>⚠️ กรุณาเลือกตัวเลือก (เช่น ชนิดไหมเย็บ หรือเครื่องมือแพทย์) สำหรับขั้นตอนที่ยังมีเครื่องหมายคำเตือนให้ครบถ้วนก่อนไปต่อ</span>
                </div>
              )}

              <div className="flex justify-between pt-2 gap-3">
                <button 
                  onClick={() => handleTabClick('info')}
                  className="bg-gray-200 text-gray-700 font-bold px-5 py-3 rounded-xl flex items-center justify-center space-x-2 text-sm shadow hover:bg-gray-300 transition w-full sm:w-auto">
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <button 
                  disabled={!isChecklistValid}
                  onClick={() => handleTabClick('findings')}
                  className={`font-bold px-5 py-3 rounded-xl flex items-center justify-center space-x-2 text-sm shadow transition w-full sm:w-auto ${
                    isChecklistValid 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                  }`}
                >
                  <span>Next: Findings</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Findings & Photos */}
          {activeTab === 'findings' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4">
                <h2 className="font-bold text-gray-800 text-sm border-b pb-2 flex items-center text-blue-800">
                  <Activity className="h-4.5 w-4.5 mr-2" />
                  Dynamic Surgery Findings
                </h2>

                {/* Operation Specific parameters */}
                {currentPreset.icg_flr && (
                  <>
                    <div className="grid grid-cols-2 gap-3 bg-blue-50/55 p-3 rounded-lg text-sm border border-blue-100">
                      <div>
                        <label className="block text-xs font-semibold text-blue-800 mb-1">ICG R-15</label>
                        <input 
                          type="text" 
                          value={formData.icgR15} 
                          onChange={e => setFormData({...formData, icgR15: e.target.value})} 
                          className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-blue-800 mb-1">FLR (Future Liver Remnant)</label>
                        <input 
                          type="text" 
                          value={formData.flr} 
                          onChange={e => setFormData({...formData, flr: e.target.value})} 
                          className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="border border-blue-100 rounded-xl p-4 bg-blue-50/20 space-y-4">
                      <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider border-b pb-1.5 border-blue-200 flex items-center">
                        <Activity className="h-4 w-4 text-blue-600 mr-1.5" />
                        Tumor Findings (สิ่งตรวจพบเนื้องอก)
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Tumor Size */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Tumor Size (cm):</label>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="text" 
                              placeholder="e.g., 5 or 3x4"
                              value={formData.tumorSize}
                              onChange={e => setFormData({...formData, tumorSize: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                            />
                            <span className="text-xs font-bold text-gray-500">cm</span>
                          </div>
                        </div>

                        {/* Margin */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Surgical Margin:</label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {[
                              { label: 'Free margin', value: 'free' },
                              { label: 'Positive margin', value: 'positive' },
                              { label: 'Close margin', value: 'close' },
                              { label: 'Custom', value: 'custom' }
                            ].map(opt => (
                              <label key={opt.value} className="inline-flex items-center cursor-pointer text-xs font-semibold text-gray-700">
                                <input 
                                  type="radio" 
                                  name="tumorMargin" 
                                  checked={formData.tumorMargin === opt.value} 
                                  onChange={() => setFormData({...formData, tumorMargin: opt.value})}
                                  className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer mr-1"
                                />
                                {opt.label}
                              </label>
                            ))}
                          </div>
                          
                          {(formData.tumorMargin === 'free' || formData.tumorMargin === 'close') && (
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500 font-medium">Margin size:</span>
                              <input 
                                type="text" 
                                placeholder="e.g. 1"
                                value={formData.marginSize}
                                onChange={e => setFormData({...formData, marginSize: e.target.value})}
                                className="w-20 border border-gray-300 rounded-lg p-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                              />
                              <span className="text-xs font-bold text-gray-500">cm</span>
                            </div>
                          )}

                          {formData.tumorMargin === 'custom' && (
                            <input 
                              type="text" 
                              placeholder="Specify margin details..." 
                              value={formData.customMarginDetail}
                              onChange={e => setFormData({...formData, customMarginDetail: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white mt-1"
                            />
                          )}
                        </div>
                      </div>

                      {/* Liver Segment Selection */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Liver Segment(s) (Select all that apply):</label>
                        <div className="flex flex-wrap gap-1">
                          {['I', 'II', 'III', 'IVa', 'IVb', 'V', 'VI', 'VII', 'VIII'].map(seg => {
                            const isSelected = formData.selectedSegments?.includes(seg);
                            return (
                              <button
                                key={seg}
                                type="button"
                                onClick={() => {
                                  const prevSegs = formData.selectedSegments || [];
                                  const nextSegs = isSelected 
                                    ? prevSegs.filter(s => s !== seg)
                                    : [...prevSegs, seg];
                                  setFormData({...formData, selectedSegments: nextSegs});
                                }}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition select-none cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                Segment {seg}
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-2">
                          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Other Segment / Custom details (ระบุเซกเมนต์หรือรายละเอียดเพิ่มเติม):</label>
                          <input 
                            type="text"
                            placeholder="e.g. Left lobe, Right lobe, Caudate lobe"
                            value={formData.customSegment}
                            onChange={e => setFormData({...formData, customSegment: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          />
                        </div>
                      </div>

                      {/* Invasion */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Invasion (การลุกลาม):</label>
                        <div className="flex items-center space-x-4 mb-2">
                          <label className="inline-flex items-center cursor-pointer text-xs font-semibold text-gray-700">
                            <input 
                              type="radio" 
                              name="tumorInvasion" 
                              checked={formData.tumorInvasion === 'No'} 
                              onChange={() => setFormData({...formData, tumorInvasion: 'No'})}
                              className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer mr-1"
                            />
                            No (ไม่มี)
                          </label>
                          <label className="inline-flex items-center cursor-pointer text-xs font-semibold text-gray-700">
                            <input 
                              type="radio" 
                              name="tumorInvasion" 
                              checked={formData.tumorInvasion === 'Yes'} 
                              onChange={() => setFormData({...formData, tumorInvasion: 'Yes'})}
                              className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer mr-1"
                            />
                            Yes (ลุกลาม)
                          </label>
                        </div>
                        {formData.tumorInvasion === 'Yes' && (
                          <div className="space-y-2 bg-white/50 p-2.5 rounded-lg border border-gray-250">
                            <div className="flex flex-wrap gap-1">
                              {['Portal vein', 'Hepatic vein', 'Bile duct', 'Gallbladder', 'Diaphragm'].map(invTarget => {
                                const currentInvDetails = formData.invasionDetail?.split(',').map(s => s.trim()).filter(Boolean) || [];
                                const isSelected = currentInvDetails.includes(invTarget);
                                return (
                                  <button
                                    key={invTarget}
                                    type="button"
                                    onClick={() => {
                                      const nextDetails = isSelected
                                        ? currentInvDetails.filter(d => d !== invTarget)
                                        : [...currentInvDetails, invTarget];
                                      setFormData({...formData, invasionDetail: nextDetails.join(', ')});
                                    }}
                                    className={`px-2 py-1 rounded border text-[11px] font-semibold transition cursor-pointer select-none ${
                                      isSelected
                                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                                        : 'bg-white text-gray-700 border-gray-250 hover:bg-gray-100'
                                    }`}
                                  >
                                    {invTarget}
                                  </button>
                                );
                              })}
                            </div>
                            <input 
                              type="text" 
                              placeholder="Specify other invaded structures / details..." 
                              value={formData.invasionDetail} 
                              onChange={e => setFormData({...formData, invasionDetail: e.target.value})} 
                              className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {currentPreset.pd_size && (
                  <div className="grid grid-cols-2 gap-3 bg-blue-50/55 p-3 rounded-lg text-sm border border-blue-100">
                    <div>
                      <label className="block text-xs font-semibold text-blue-800 mb-1">PD size (mm)</label>
                      <input 
                        type="text" 
                        value={formData.pdSize} 
                        onChange={e => setFormData({...formData, pdSize: e.target.value})} 
                        className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-blue-800 mb-1">Pancreatic consistency</label>
                      <input 
                        type="text" 
                        value={formData.pancreaticConsistency} 
                        onChange={e => setFormData({...formData, pancreaticConsistency: e.target.value})} 
                        className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Lymph Node Enlargement Selection Chips */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-2">Lymph Node Enlargement (Select all that apply):</label>
                  <div className="flex flex-wrap gap-2">
                    {currentPreset.ln_options.map(ln => {
                      const isSelected = formData.selectedLN.includes(ln);
                      return (
                        <button
                          key={ln}
                          type="button"
                          onClick={() => toggleLN(ln)}
                          className={`px-4 py-2 rounded-full text-xs font-semibold border transition flex items-center space-x-1 cursor-pointer select-none ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                          }`}>
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                          <span>{ln}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Consistency Buttons */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-2 font-sans">Tissue/Tumor Consistency:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['hard', 'firm', 'soft'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormData({...formData, consistency: c})}
                        className={`py-2.5 text-xs font-semibold capitalize rounded-xl border text-center transition cursor-pointer select-none ${
                          formData.consistency === c
                            ? 'bg-amber-500 text-white border-amber-600 shadow-sm font-bold'
                            : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Adhesion & Vascular Checkboxes */}
                <div className="space-y-3 text-xs font-semibold text-gray-700">
                  <div className="p-3 border rounded-xl bg-gray-50/50 space-y-2 border-gray-200">
                    <div className="flex justify-between items-center">
                      <span>Adhesion around HD ligament:</span>
                      <div className="space-x-4">
                        <label className="inline-flex items-center cursor-pointer">
                          <input 
                            type="radio" 
                            name="adhesion" 
                            checked={formData.adhesionHd === 'No'} 
                            onChange={() => setFormData({...formData, adhesionHd: 'No'})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="ml-1 text-xs font-medium text-gray-700">No</span>
                        </label>
                        <label className="inline-flex items-center cursor-pointer">
                          <input 
                            type="radio" 
                            name="adhesion" 
                            checked={formData.adhesionHd === 'Yes'} 
                            onChange={() => setFormData({...formData, adhesionHd: 'Yes'})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="ml-1 text-xs font-medium text-gray-700">Yes</span>
                        </label>
                      </div>
                    </div>
                    {formData.adhesionHd === 'Yes' && (
                      <input 
                        type="text" 
                        placeholder="Specify details of adhesion..." 
                        value={formData.adhesionDetail} 
                        onChange={e => setFormData({...formData, adhesionDetail: e.target.value})} 
                        className="w-full border rounded-lg p-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>

                  <div className="p-3 border rounded-xl bg-gray-50/50 space-y-2 border-gray-200">
                    <div className="flex justify-between items-center">
                      <span>Vascular variation:</span>
                      <div className="space-x-4">
                        <label className="inline-flex items-center cursor-pointer">
                          <input 
                            type="radio" 
                            name="vascular" 
                            checked={formData.vascularVariation === 'No'} 
                            onChange={() => setFormData({...formData, vascularVariation: 'No'})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="ml-1 text-xs font-medium text-gray-700">No</span>
                        </label>
                        <label className="inline-flex items-center cursor-pointer">
                          <input 
                            type="radio" 
                            name="vascular" 
                            checked={formData.vascularVariation === 'Yes'} 
                            onChange={() => setFormData({...formData, vascularVariation: 'Yes'})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="ml-1 text-xs font-medium text-gray-700">Yes</span>
                        </label>
                      </div>
                    </div>
                    {formData.vascularVariation === 'Yes' && (
                      <input 
                        type="text" 
                        placeholder="Specify details of vascular variation..." 
                        value={formData.vascularDetail} 
                        onChange={e => setFormData({...formData, vascularDetail: e.target.value})} 
                        className="w-full border rounded-lg p-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>

                  {/* Metastasis Checkbox Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                    <label className="flex items-center space-x-2 border border-gray-200 p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100 transition cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={formData.peritonealNodule} 
                        onChange={e => setFormData({...formData, peritonealNodule: e.target.checked})}
                        className="h-4.5 w-4.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="font-medium text-gray-700">Peritoneal nodule</span>
                    </label>
                    <label className="flex items-center space-x-2 border border-gray-200 p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100 transition cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={formData.liverMetastasis} 
                        onChange={e => setFormData({...formData, liverMetastasis: e.target.checked})}
                        className="h-4.5 w-4.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="font-medium text-gray-700">Liver metastasis</span>
                    </label>
                    <label className="flex items-center space-x-2 border border-gray-200 p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100 transition cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={formData.ascites} 
                        onChange={e => setFormData({...formData, ascites: e.target.checked})}
                        className="h-4.5 w-4.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="font-medium text-gray-700">Ascites</span>
                    </label>
                  </div>
                </div>

                {/* Laparoscopic Port Placement Map */}
                {isLaparoscopic && (
                  <div className="border border-blue-100 rounded-xl p-4 bg-blue-50/20 space-y-3">
                    <h3 className="font-bold text-gray-800 text-sm flex items-center">
                      <Info className="h-4.5 w-4.5 text-blue-600 mr-2 shrink-0" />
                      Laparoscopic Port Placement (ตำแหน่ง Port ผ่าตัดผ่านกล้อง)
                    </h3>
                    <p className="text-xs text-gray-505">
                      เลือกขนาดพอร์ตด้านล่าง แล้วคลิกบนรูปท้องเพื่อวางตำแหน่งพอร์ต (คลิกที่พอร์ตเดิมเพื่อลบออก)
                    </p>
                    
                    {/* Port Size Selectors */}
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-semibold text-gray-600">Select Port Size:</span>
                      {(['5mm', '10mm', '12mm'] as const).map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedPortSize(size)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center space-x-1.5 cursor-pointer ${
                            selectedPortSize === size
                              ? size === '5mm' ? 'bg-green-600 text-white border-green-600 shadow-sm' :
                                size === '10mm' ? 'bg-orange-500 text-white border-orange-500 shadow-sm' :
                                'bg-red-600 text-white border-red-600 shadow-sm'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            size === '5mm' ? 'bg-green-300' :
                            size === '10mm' ? 'bg-orange-300' :
                            'bg-red-300'
                          }`} />
                          <span>{size}</span>
                        </button>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, ports: [] }))}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold ml-auto hover:underline p-1"
                      >
                        Clear All Ports
                      </button>
                    </div>

                    {/* Abdomen Diagram Canvas */}
                    <div className="flex justify-center pt-2">
                      <div 
                        onClick={handleAbdomenClick}
                        className="relative w-80 h-[350px] bg-white overflow-hidden cursor-crosshair select-none"
                      >
                        <div 
                          className="absolute inset-0 bg-contain bg-no-repeat bg-center" 
                          style={{ backgroundImage: "url('/abdomen.jpg')" }}
                        />
                        {formData.ports && formData.ports.map(port => (
                          <div
                            key={port.id}
                            style={{ left: `${port.x}%`, top: `${port.y}%` }}
                            onClick={(e) => {
                              e.stopPropagation();
                              removePort(port.id);
                            }}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-white flex items-center justify-center text-[8px] font-bold text-white shadow-md cursor-pointer transition transform hover:scale-110 ${
                              port.size === '5mm' ? 'bg-green-600' :
                              port.size === '10mm' ? 'bg-orange-500' :
                              'bg-red-600'
                            }`}
                            title={`Click to remove ${port.size} port`}
                          >
                            {port.size}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Text Findings */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Additional Text Findings (ข้อความตรวจพบเพิ่มเติม):</label>
                  <textarea 
                    rows={3} 
                    value={formData.findingTextNotes} 
                    onChange={e => setFormData({...formData, findingTextNotes: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe specific details of tumor, liver lobes, anatomical landmarks, margin size, etc.">
                  </textarea>
                </div>
              </div>

              {/* Camera Upload Section */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4">
                <h2 className="font-bold text-gray-800 text-sm border-b pb-2 flex items-center text-blue-800">
                  <Camera className="h-5 w-5 mr-2" />
                  Finding Photos (รูปภาพสิ่งตรวจพบ)
                </h2>
                <p className="text-xs text-gray-400">
                  Click below to capture a photo with your mobile camera or pick a file. Files are uploaded directly to secure Supabase storage.
                </p>

                <div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    multiple
                    onChange={handlePhotoUpload} 
                    className="hidden" 
                    id="camera-photo-upload"
                  />
                  <label 
                    htmlFor="camera-photo-upload" 
                    className="w-full bg-blue-50 border-2 border-dashed border-blue-300 hover:bg-blue-100 text-blue-700 font-semibold py-4 px-4 rounded-2xl flex items-center justify-center space-x-2 cursor-pointer transition select-none shadow-sm">
                    {uploading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5" />
                    )}
                    <span>{uploading ? 'Uploading finding photos...' : 'Take Photo / Upload Image'}</span>
                  </label>
                </div>

                {/* Photo Previews */}
                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {formData.photos.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-100 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Finding photo ${idx + 1}`} className="w-full h-full object-cover"/>
                        <button 
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs shadow-md transition">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-2 gap-3">
                <button 
                  onClick={() => handleTabClick('checklist')}
                  className="bg-gray-200 text-gray-700 font-bold px-5 py-3 rounded-xl flex items-center justify-center space-x-2 text-sm shadow hover:bg-gray-300 transition w-full sm:w-auto">
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <button 
                  onClick={() => handleTabClick('summary')}
                  className="bg-blue-600 text-white font-bold px-5 py-3 rounded-xl flex items-center justify-center space-x-2 text-sm shadow hover:bg-blue-700 transition w-full sm:w-auto">
                  <span>Next: Summary</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Summary */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4">
                <h2 className="font-bold text-gray-800 text-sm border-b pb-2 flex items-center text-blue-800">
                  <FileText className="h-4.5 w-4.5 mr-2" />
                  Operative Summary & Complications
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">EBL (Estimated Blood Loss - ml)</label>
                    <input 
                      type="text" 
                      value={formData.ebl} 
                      onChange={e => setFormData({...formData, ebl: e.target.value})} 
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Complication (ภาวะแทรกซ้อน)</label>
                    <input 
                      type="text" 
                      value={formData.complication} 
                      onChange={e => setFormData({...formData, complication: e.target.value})} 
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Specimen for Patho (สิ่งส่งตรวจทางพยาธิวิทยา)</label>
                  <input 
                    type="text" 
                    value={formData.patho} 
                    onChange={e => setFormData({...formData, patho: e.target.value})} 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-2 gap-3">
                <button 
                  onClick={() => handleTabClick('findings')}
                  className="bg-gray-200 text-gray-700 font-bold px-5 py-3 rounded-xl flex items-center justify-center space-x-2 text-sm shadow hover:bg-gray-300 transition w-full sm:w-auto">
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <button 
                  onClick={() => handleTabClick('preview')}
                  className="bg-blue-600 text-white font-bold px-5 py-3 rounded-xl flex items-center justify-center space-x-2 text-sm shadow hover:bg-blue-700 transition w-full sm:w-auto">
                  <span>Next: Preview A4 Page</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* TAB 5: PREVIEW TAB (Strictly Matched to Hospital Form Layout) */}
        <div className={activeTab === 'preview' ? 'block' : 'hidden no-print'}>
          <div className="no-print mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-blue-50 border border-blue-200 p-4 rounded-xl gap-3">
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <button 
                onClick={() => handleTabClick('summary')}
                className="text-xs bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold px-3 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm transition">
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Back to Edit Form</span>
              </button>
              <button 
                onClick={() => setIsZoomed(!isZoomed)}
                className="max-[820px]:inline-flex hidden text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-2 rounded-lg items-center space-x-1.5 shadow-sm transition"
              >
                {isZoomed ? (
                  <>
                    <Minimize2 className="h-3.5 w-3.5" />
                    <span>Fit to Screen (ย่อขนาดพอดีจอ)</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span>Full Size / Scroll (ขยายเต็มจอ)</span>
                  </>
                )}
              </button>
            </div>
            <span className="text-xs text-gray-500 font-medium">Standard A4 Document Simulation (Click Print / PDF above to save or print)</span>
          </div>

          {/* EXACT A4 PAGE PRINTABLE DOCUMENT */}
          <div 
            ref={previewContainerRef}
            className="w-full overflow-x-auto no-scrollbar"
          >
            <div 
              className="a4-preview-container relative flex justify-center"
              style={{
                width: isZoomed ? '794px' : '100%',
                height: isZoomed ? 'auto' : `${1123 * scale}px`,
                overflow: isZoomed ? 'visible' : 'hidden',
                margin: isZoomed ? '0 auto' : undefined,
              }}
            >
              <div 
                className="a4-preview-scaler origin-top"
                style={{
                  transform: isZoomed ? 'none' : `scale(${scale})`,
                  width: '794px',
                  position: isZoomed ? 'relative' : 'absolute',
                  top: 0,
                  left: isZoomed ? 'auto' : '50%',
                  marginLeft: isZoomed ? '0' : '-397px'
                }}
              >
                <div className="a4-page shadow-xl">
            <div>
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm font-semibold">Khon Kaen Hospital</div>
                <div className="text-lg font-bold underline">{formData.operativeProcedure}</div>
                <div className="w-24"></div>
              </div>

              {/* Meta Header Lines */}
              <div className="space-y-1 mb-2 text-[13.5px]">
                <div className="flex justify-between">
                  <div>Date of operative: <span className="dot-line min-w-[120px]">{formData.opDate}</span></div>
                  <div>Time started: <span className="dot-line min-w-[70px]">{formData.timeStarted}</span></div>
                  <div>Time ended: <span className="dot-line min-w-[70px]">{formData.timeEnded}</span></div>
                </div>
                
                <div className="grid grid-cols-12 gap-1">
                  <div className="col-span-5 flex items-baseline">
                    <span className="shrink-0">Surgeon:</span>
                    <span className="dot-line grow ml-1">{formData.surgeon}</span>
                  </div>
                  <div className="col-span-4 flex items-baseline">
                    <span className="shrink-0">First assistant:</span>
                    <span className="dot-line grow ml-1">{formData.firstAssistant}</span>
                  </div>
                  <div className="col-span-3 flex items-baseline">
                    <span className="shrink-0">Second assistant:</span>
                    <span className="dot-line grow ml-1">{formData.secondAssistant || ' - '}</span>
                  </div>
                </div>

                <div className="flex">
                  <div className="shrink-0">Clinical diagnosis:</div>
                  <div className="grow ml-1 dot-line font-bold">{formData.clinicalDiagnosis}</div>
                </div>
                <div className="flex">
                  <div className="shrink-0">Post-operative diagnosis:</div>
                  <div className="grow ml-1 dot-line font-bold">{formData.postOpDiagnosis}</div>
                </div>
                <div className="flex">
                  <div className="shrink-0">Operative Procedure:</div>
                  <div className="grow ml-1 dot-line font-bold">{formData.operativeProcedure}</div>
                </div>

                <div className="grid grid-cols-12 gap-1">
                  <div className="col-span-4 flex items-baseline">
                    <span className="shrink-0">Anesthesia:</span>
                    <span className="dot-line grow ml-1">{formData.anesthesia}</span>
                  </div>
                  <div className="col-span-4 flex items-baseline">
                    <span className="shrink-0">Anesthetist:</span>
                    <span className="dot-line grow ml-1">{formData.anesthetist}</span>
                  </div>
                  <div className="col-span-4 flex items-baseline">
                    <span className="shrink-0">Surgical nurse:</span>
                    <span className="dot-line grow ml-1">{formData.surgicalNurse}</span>
                  </div>
                </div>
              </div>

              {/* Center Section Title */}
              <div className="text-center font-bold my-2 text-sm">Description of Operation</div>

              {/* Two Columns: Left Findings | Right Procedure */}
              <div className="grid grid-cols-12 gap-3 items-start border-t border-b border-black py-2.5">
                
                {/* Left Column - Findings (5 cols) */}
                <div className="col-span-5 space-y-2 pr-2 border-r border-gray-300 min-h-[460px] text-xs">
                  <div><strong>Position:</strong> {currentPreset.position}</div>
                  <div><strong>Incision:</strong> {currentPreset.incision}</div>

                  {currentPreset.icg_flr && (
                    <div>
                      <strong>ICG R-15:</strong> <span className="underline font-semibold">{formData.icgR15 || '.....'}</span> , 
                      <strong> FLR:</strong> <span className="underline font-semibold">{formData.flr || '.........'}</span>
                    </div>
                  )}

                  {currentPreset.pd_size && (
                    <div>
                      <strong>PD size:</strong> <span className="underline font-semibold">{formData.pdSize || '....'}</span> mm , 
                      <strong> Pancreatic consistency:</strong> <span className="underline font-semibold">{formData.pancreaticConsistency || '......'}</span>
                    </div>
                  )}

                  {isLaparoscopic && formData.ports && formData.ports.length > 0 && (
                    <div className="my-2 p-1 bg-white flex flex-col items-center">
                      <div className="font-bold text-[10px] mb-1">Laparoscopic Ports:</div>
                      <div className="relative w-36 h-[155px] bg-white overflow-hidden">
                        <div 
                          className="absolute inset-0 bg-contain bg-no-repeat bg-center" 
                          style={{ backgroundImage: "url('/abdomen.jpg')" }}
                        />
                        {formData.ports.map(port => (
                          <div
                            key={port.id}
                            style={{ left: `${port.x}%`, top: `${port.y}%` }}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center text-[6px] font-bold text-white shadow ${
                              port.size === '5mm' ? 'bg-green-600' :
                              port.size === '10mm' ? 'bg-orange-500' :
                              'bg-red-600'
                            }`}
                          >
                            {port.size.replace('mm', '')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <strong>Findings:</strong>
                    {currentPreset.icg_flr && (
                      <p className="text-black font-semibold mb-2 leading-relaxed bg-blue-50/10 p-1.5 rounded border border-dashed border-blue-200 text-xs">
                        • Tumor size <span className="underline">{formData.tumorSize || '......'}</span> cm at liver segment <span className="underline">{(() => {
                          const segs = formData.selectedSegments || [];
                          const parts = [];
                          if (segs.length > 0) parts.push(segs.join(', '));
                          if (formData.customSegment) parts.push(formData.customSegment);
                          return parts.join(' ') || '........';
                        })()}</span>, invade: <span className="underline">{formData.tumorInvasion === 'Yes' ? formData.invasionDetail || 'yes' : 'no'}</span>, surgical margin: <span className="underline">{
                          formData.tumorMargin === 'free' ? `free margin ${formData.marginSize || '.....'} cm` :
                          formData.tumorMargin === 'positive' ? 'positive margin' :
                          formData.tumorMargin === 'close' ? `close margin ${formData.marginSize || '.....'} cm` :
                          formData.customMarginDetail || 'free margin?'
                        }</span>
                      </p>
                    )}
                    {formData.findingTextNotes && (
                      <p className="whitespace-pre-line text-black font-semibold mt-1 bg-gray-50/50 p-1.5 rounded">{formData.findingTextNotes}</p>
                    )}
                  </div>

                  {/* Uploaded Photos Preview in Note */}
                  {formData.photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-1.5 my-2">
                      {formData.photos.slice(0, 4).map((img, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={img} alt={`Finding photo ${i+1}`} className="max-h-24 w-full object-contain border border-black/35 rounded p-0.5"/>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 space-y-1.5 text-[11px] leading-tight">
                    <div>
                      <strong>Enlarge LN:</strong> {currentPreset.ln_options.map(ln => (
                        <span key={ln} className="ml-1.5 inline-block font-semibold">
                          {formData.selectedLN.includes(ln) ? '☑' : '□'} {ln}
                        </span>
                      ))}
                    </div>

                    <div className="font-semibold">
                      <strong>Consistency:</strong>
                      <span className="ml-2">{formData.consistency === 'hard' ? '●' : '○'} hard</span>
                      <span className="ml-2">{formData.consistency === 'firm' ? '●' : '○'} firm</span>
                      <span className="ml-2">{formData.consistency === 'soft' ? '●' : '○'} soft</span>
                    </div>

                    <div>
                      <strong>Adhesion around HD:</strong>
                      <span className="ml-2">{formData.adhesionHd === 'No' ? '●' : '○'} No</span>
                      <span className="ml-2">{formData.adhesionHd === 'Yes' ? '●' : '○'} Yes</span>
                      {formData.adhesionHd === 'Yes' && formData.adhesionDetail && (
                        <div className="pl-4 text-gray-800 italic underline decoration-dotted">{formData.adhesionDetail}</div>
                      )}
                    </div>

                    <div>
                      <strong>Vascular variation:</strong>
                      <span className="ml-2">{formData.vascularVariation === 'No' ? '●' : '○'} No</span>
                      <span className="ml-2">{formData.vascularVariation === 'Yes' ? '●' : '○'} Yes</span>
                      {formData.vascularVariation === 'Yes' && formData.vascularDetail && (
                        <div className="pl-4 text-gray-800 italic underline decoration-dotted">{formData.vascularDetail}</div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-1 font-semibold">
                      <div>{formData.peritonealNodule ? '☑' : '□'} Peritoneal nodule</div>
                      <div>{formData.liverMetastasis ? '☑' : '□'} Liver metastasis</div>
                      <div>{formData.ascites ? '☑' : '□'} Ascites</div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Procedure Steps (7 cols) */}
                <div className="col-span-7 pl-1.5 text-xs space-y-1.5">
                  <div className="font-bold border-b pb-0.5 border-black">Procedure Steps Completed:</div>
                  {checklist.filter(item => item.checked).map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-[12px] leading-tight">
                      <span className="font-bold shrink-0">{idx + 1}.</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* EBL Box & Signature Row */}
              <div className="flex justify-between items-end mt-4">
                {/* EBL Box */}
                <div className="border border-black p-2.5 w-[58%] text-xs space-y-1">
                  <div>EBL: <span className="font-bold text-sm">{formData.ebl}</span> ml &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Complication: <span className="font-bold">{formData.complication}</span></div>
                  <div>Patho: <span className="font-bold">{formData.patho}</span></div>
                </div>

                {/* Signature */}
                <div className="text-right text-xs pr-2 pb-1">
                  <div>Signature ................................................................</div>
                  <div className="mt-1 font-semibold text-center">({formData.surgeon})</div>
                </div>
              </div>
            </div>

            {/* Patient Info Footer Grid Table */}
            <div className="mt-4 border-t-2 border-black pt-1">
              <table className="w-full border-collapse border border-black text-xs">
                <tbody>
                  <tr>
                    <td className="border border-black p-2 w-[45%]">
                      Name of patient: <strong className="text-sm">{formData.patientName}</strong>
                    </td>
                    <td className="border border-black p-2 w-[15%]">
                      Age: <strong className="text-sm">{formData.patientAge}</strong>
                    </td>
                    <td className="border border-black p-2 w-[40%]">
                      HN: <strong className="font-mono text-sm">{formData.hn}</strong> &nbsp;&nbsp;&nbsp;&nbsp; AN: <strong className="font-mono text-sm">{formData.an}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2">
                      Surgeon: <strong className="text-sm">{formData.surgeon}</strong>
                    </td>
                    <td className="border border-black p-2">
                      Ward: <strong className="text-sm">{formData.ward}</strong>
                    </td>
                    <td className="border border-black p-2">
                      Department: <strong className="text-sm">{formData.department}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Template Modal Dialog */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-blue-800 text-white px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <Save className="h-5 w-5 text-yellow-300" />
                <span>Save as New Template (บันทึกเทมเพลตใหม่)</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setIsTemplateModalOpen(false)}
                className="text-white/80 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-sm text-gray-700">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Template Name (ชื่อเทมเพลต เช่น Hilar Resection)</label>
                <input 
                  type="text"
                  value={templateModalData.name}
                  onChange={e => setTemplateModalData({...templateModalData, name: e.target.value})}
                  placeholder="e.g. Hilar Resection"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Procedure Title (หัวข้อเอกสารใบผ่าตัด)</label>
                <input 
                  type="text"
                  value={templateModalData.title}
                  onChange={e => setTemplateModalData({...templateModalData, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Patient Position (ท่าผู้ป่วย)</label>
                  <input 
                    type="text"
                    value={templateModalData.position}
                    onChange={e => setTemplateModalData({...templateModalData, position: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Incision (แนวแผลผ่าตัด)</label>
                  <input 
                    type="text"
                    value={templateModalData.incision}
                    onChange={e => setTemplateModalData({...templateModalData, incision: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Lymph Node options */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Lymph Node Options (ตัวเลือกต่อมน้ำเหลือง คั่นด้วยจุลภาค `,` )</label>
                <input 
                  type="text"
                  value={templateModalData.ln_options_str}
                  onChange={e => setTemplateModalData({...templateModalData, ln_options_str: e.target.value})}
                  placeholder="e.g. gr8, gr12, gr13"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              {/* Toggle configurations */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-gray-500 mb-1">Findings Page Config (การกำหนดค่าฟิลด์ที่จะแสดง)</label>
                
                <label className="flex items-center space-x-2 py-1 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={templateModalData.is_laparoscopic}
                    onChange={e => setTemplateModalData({...templateModalData, is_laparoscopic: e.target.checked})}
                    className="h-4.5 w-4.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="font-semibold text-xs text-gray-700">Laparoscopic Procedure (เป็นการผ่าตัดผ่านกล้อง)</span>
                </label>

                <label className="flex items-center space-x-2 py-1 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={templateModalData.icg_flr}
                    onChange={e => setTemplateModalData({...templateModalData, icg_flr: e.target.checked})}
                    className="h-4.5 w-4.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="font-semibold text-xs text-gray-700">Show ICG R-15 & FLR inputs</span>
                </label>

                <label className="flex items-center space-x-2 py-1 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={templateModalData.pd_size}
                    onChange={e => setTemplateModalData({...templateModalData, pd_size: e.target.checked})}
                    className="h-4.5 w-4.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="font-semibold text-xs text-gray-700">Show PD Size & Pancreatic Consistency inputs</span>
                </label>
              </div>

              {/* Steps Preview */}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <div className="font-bold text-xs text-gray-600 mb-1">Checklist Steps Preview ({checklist.length} steps):</div>
                <div className="max-h-24 overflow-y-auto text-[11px] font-mono text-gray-500 space-y-1">
                  {checklist.map((c, i) => (
                    <div key={i} className="truncate">{i+1}. {c.text}</div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-gray-50 border-t px-5 py-4 flex justify-end space-x-2">
              <button 
                type="button" 
                onClick={() => setIsTemplateModalOpen(false)}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-lg text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleSaveNewTemplate}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow transition cursor-pointer"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
