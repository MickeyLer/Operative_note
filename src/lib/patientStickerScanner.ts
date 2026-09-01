// ===== 🔑 Gemini API Keys List =====
const GEMINI_API_KEYS = [
  'AIzaSyDNXDVW82LXzmYP5TjOw6U5bqebPv1XR6E',  // lerpongKKH
  'AIzaSyDZpwXNZI2k5FP3Ym7RU4KSwkIFaoLmISM',  // lerpongKKH
  'AIzaSyAeUtg_Mz6Xrotzrac8IjrwCGMniJrSY-A',  // lerpongKKH
  'AIzaSyB5nC2KGSFQx-Jzl9UynvyrmV-egjwQgkU',  // sathaporn
  'AIzaSyDOWlhMv4CcuxbnBL3O8cX_QfJYMrLrg5w',  // sathaporn
  'AIzaSyA2tPLxrgFKKyEddHdfaJxvD4dYswDwLIA',  // sathaporn
  'AIzaSyC2hq5EmxHgsDiGuybZLO211cUxGUXcIzw',  // lerpong1989
  'AIzaSyDDJmNAEMtm7X50p6LM-UCMS39f34o19Lw',  // lerpong1989
];

interface KeyStatus {
  index: number;
  failures: number;
  lastError: string | null;
  lastUsed: number | null;
  isBlocked: boolean;
  blockUntil: number | null;
}

class APIKeyManager {
  private keys: string[];
  private currentIndex: number;
  private keyStatus: Map<string, KeyStatus>;

  constructor(keys: string[]) {
    this.keys = keys;
    this.currentIndex = Math.floor(Math.random() * keys.length);
    this.keyStatus = new Map();

    keys.forEach((key, index) => {
      this.keyStatus.set(key, {
        index,
        failures: 0,
        lastError: null,
        lastUsed: null,
        isBlocked: false,
        blockUntil: null
      });
    });
  }

  getCurrentKey(): string {
    for (let i = 0; i < this.keys.length; i++) {
      const actualIndex = (this.currentIndex + i) % this.keys.length;
      const key = this.keys[actualIndex];
      const status = this.keyStatus.get(key)!;

      if (status.isBlocked) {
        if (status.blockUntil && Date.now() > status.blockUntil) {
          status.isBlocked = false;
          status.failures = 0;
        } else {
          continue;
        }
      }

      status.lastUsed = Date.now();
      this.currentIndex = actualIndex;
      return key;
    }

    throw new Error('🚫 API Keys ทั้งหมดถูกบลอก กรุณารอสักครู่แล้วลองใหม่อีกครั้ง');
  }

  reportError(key: string, error: Error) {
    const status = this.keyStatus.get(key);
    if (!status) return;

    status.failures++;
    status.lastError = error.message;

    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      status.isBlocked = true;
      status.blockUntil = Date.now() + (5 * 60 * 1000);
      this.rotateKey();
    } else if (errorMessage.includes('api_key_invalid') || errorMessage.includes('invalid_api_key')) {
      status.isBlocked = true;
      status.blockUntil = null;
      this.rotateKey();
    } else if (status.failures >= 3) {
      status.isBlocked = true;
      status.blockUntil = Date.now() + (1 * 60 * 1000);
      this.rotateKey();
    }
  }

  rotateKey() {
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
  }

  reportSuccess(key: string) {
    const status = this.keyStatus.get(key);
    if (status) {
      status.failures = 0;
      status.lastError = null;
    }
  }

  getCurrentKeyIndex(): number {
    return this.currentIndex + 1;
  }
}

const apiKeyManager = new APIKeyManager(GEMINI_API_KEYS);

// ===== 🔧 Downscaling Utility =====
export const resizeImage = (file: File, maxWidth = 1024): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!file.type.match(/image.*/)) {
        reject(new Error("ไฟล์ไม่ใช่รูปภาพ"));
        return;
      }

      if (typeof window !== 'undefined' && typeof window.createImageBitmap === 'function') {
        createImageBitmap(file)
          .then(imgBitmap => {
            let width = imgBitmap.width;
            let height = imgBitmap.height;

            if (width > maxWidth) {
              height = Math.round(height * (maxWidth / width));
              width = maxWidth;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(imgBitmap, 0, 0, width, height);
            }
            imgBitmap.close();

            canvas.toBlob((blob) => {
              canvas.width = 0;
              canvas.height = 0;
              if (blob) resolve(blob);
              else reject(new Error("Resize image failed"));
            }, 'image/jpeg', 0.85);
          })
          .catch(err => {
            console.warn("createImageBitmap failed, falling back to FileReader", err);
            fallbackResize(file, maxWidth, resolve, reject);
          });
      } else {
        fallbackResize(file, maxWidth, resolve, reject);
      }
    }, 50);
  });
};

const fallbackResize = (
  file: File, 
  maxWidth: number, 
  resolve: (blob: Blob) => void, 
  reject: (reason: Error) => void
) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target?.result as string;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round(height * (maxWidth / width));
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
      }

      canvas.toBlob((blob) => {
        canvas.width = 0;
        canvas.height = 0;
        if (blob) resolve(blob);
        else reject(new Error("Fallback resize image failed"));
      }, 'image/jpeg', 0.85);
    };
    img.onerror = () => reject(new Error("Failed to load image for resize"));
  };
  reader.onerror = () => reject(new Error("Failed to read image file"));
};

export interface PatientStickerData {
  patientName: string;
  hn: string;
  an: string;
  ward: string;
  patientAge: string;
}

export interface ScanStickerResult {
  success: boolean;
  data?: PatientStickerData;
  error?: string;
  usedApiKeyIndex?: number;
}

// ===== 🤖 Gemini AI Sticker Extractor =====
export const scanPatientSticker = async (
  imageFile: File,
  onProgress?: (progress: number, message: string) => void,
  maxRetries = GEMINI_API_KEYS.length
): Promise<ScanStickerResult> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const apiKey = apiKeyManager.getCurrentKey();

      if (onProgress) onProgress(15, "กำลังย่อขนาดรูปภาพ...");

      const resizedBlob = await resizeImage(imageFile, 1024);

      if (onProgress) onProgress(35, "กำลังแปลงข้อมูลรูปภาพ...");

      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(resizedBlob);
      });

      if (onProgress) onProgress(55, `กำลังส่งข้อมูลให้ AI วิเคราะห์ (Key #${apiKeyManager.getCurrentKeyIndex()})...`);

      const AVAILABLE_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
      const MODEL_NAME = AVAILABLE_MODELS[attempt % AVAILABLE_MODELS.length];

      const textPrompt = `วิเคราะห์สติ๊กเกอร์ป้ายชื่อผู้ป่วยประจำโรงพยาบาลในประเทศไทยจากรูปถ่าย และตอบกลับในรูปแบบ JSON เท่านั้น

ข้อมูลที่ต้องการสกัด:
{
  "patientName": "ชื่อ-นามสกุลผู้ป่วย (รวมคำนำหน้าชื่อ เช่น นาย/นาง/นางสาว/ด.ช./ด.ญ. ถ้ามี)",
  "hn": "เลข HN (ตัวเลขเท่านั้น ไม่มีข้อความอื่น)",
  "an": "เลข AN (ตัวเลขเท่านั้น ไม่มีข้อความอื่น)",
  "ward": "ชื่อหอผู้ป่วย/วอร์ด (หากมีเครื่องหมายจุลภาค , ให้ตัดข้อความตั้งแต่ , เป็นต้นไปออก เช่น จาก 'ศัลยกรรมชาย2, 80' ให้ตอบเฉพาะ 'ศัลยกรรมชาย2')",
  "patientAge": "อายุผู้ป่วย (ตัวเลขเท่านั้น เช่น '61' ห้ามใส่ ป. หรือ ปี)"
}

กฎการสกัดข้อมูล (Strict Rules):
1. **hn:** ให้ดึงเฉพาะตัวเลขหลังคำว่า HN: หรือ HN (เช่น "69009992")
2. **an:** ให้ดึงเฉพาะตัวเลขหลังคำว่า AN: หรือ AN (เช่น "6953058")
3. **patientName:** ให้ดึงชื่อ-นามสกุลหลังคำว่า "ชื่อ:" หรือ "ชื่อ" (เช่น "นายทองศูนย์ ศรีษะเกตุ")
4. **ward:** ให้ดึงข้อความหลังคำว่า "Ward:" หรือ "วอร์ด:" และตัดข้อความตั้งแต่เครื่องหมาย , เป็นต้นไปออก (เช่น "ศัลยกรรมชาย2")
5. **patientAge:** ให้ดึงเฉพาะตัวเลขของอายุเท่านั้น เช่น "61" (ตัดคำว่า ป., ปี, yrs ออก)
6. หากไม่พบข้อมูล field ใด ให้ใส่ค่าเป็นข้อความว่าง "" ( empty string )
7. ตอบเฉพาะ JSON object เท่านั้น ไม่ต้องมี markdown, code block หรือคำอธิบายเพิ่มเติม`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey.trim()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: textPrompt },
                  {
                    inline_data: {
                      mime_type: resizedBlob.type || "image/jpeg",
                      data: base64Image,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              topK: 32,
              topP: 1,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (onProgress) onProgress(85, "กำลังประมวลผลคำตอบจาก AI...");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error?.message || `HTTP ${response.status}`);
        apiKeyManager.reportError(apiKey, error);
        lastError = error;

        if (error.message.includes('429') || error.message.includes('quota')) {
          continue;
        }
        throw error;
      }

      const data = await response.json();

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("ไม่สามารถอ่านข้อมูลสติ๊กเกอร์ได้");
      }

      let jsonText = data.candidates[0].content.parts[0].text.trim();
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      const extracted: PatientStickerData = JSON.parse(jsonText);

      // Post-processing cleanup for strict formatting
      const cleanAge = (extracted.patientAge || "").replace(/[^\d]/g, '');
      const cleanWard = (extracted.ward || "").split(',')[0].trim();

      apiKeyManager.reportSuccess(apiKey);

      if (onProgress) onProgress(100, "สแกนสติ๊กเกอร์สำเร็จ!");

      return {
        success: true,
        data: {
          patientName: extracted.patientName ? extracted.patientName.trim() : "",
          hn: extracted.hn ? extracted.hn.trim() : "",
          an: extracted.an ? extracted.an.trim() : "",
          ward: cleanWard,
          patientAge: cleanAge
        },
        usedApiKeyIndex: apiKeyManager.getCurrentKeyIndex()
      };

    } catch (err: any) {
      console.error(`❌ สแกนสติ๊กเกอร์ล้มเหลว (ครั้งที่ ${attempt + 1}):`, err.message);
      lastError = err;

      if (attempt < maxRetries - 1) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 3000);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || "ไม่สามารถสแกนสติ๊กเกอร์ได้ กรุณาลองใหม่อีกครั้ง"
  };
};
