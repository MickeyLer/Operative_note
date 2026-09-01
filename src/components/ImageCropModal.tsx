'use client';

import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { RotateCw, RotateCcw, ZoomIn, Check, X, RefreshCw } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropSave: (croppedBlob: Blob) => void;
  currentIndex?: number;
  totalCount?: number;
  onSkip?: () => void;
}

const ASPECT_RATIOS = [
  { label: 'Free', value: undefined },
  { label: '1:1', value: 1 / 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
];

/**
 * Creates an Image element from a source URL
 */
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

/**
 * Helper to calculate rotated bounding box dimensions
 */
function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = (rotation * Math.PI) / 180;
  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/**
 * Crop & rotate canvas helper function
 */
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2D canvas context available');
  }

  const rotRad = (rotation * Math.PI) / 180;

  // Calculate bounding box of rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  // Set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Translate canvas center to image center on canvas
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Draw rotated image
  ctx.drawImage(image, 0, 0);

  // Create cropped canvas
  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    throw new Error('No 2D canvas context for cropped output');
  }

  // Set the size of the cropped canvas
  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  // Draw the cropped image onto the new canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Return as Blob
  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (file) => {
        if (file) {
          resolve(file);
        } else {
          reject(new Error('Canvas is empty'));
        }
      },
      'image/jpeg',
      0.9
    );
  });
}

export default function ImageCropModal({
  isOpen,
  imageSrc,
  onClose,
  onCropSave,
  currentIndex,
  totalCount,
  onSkip,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setRotation(0);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setAspect(undefined);
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );
      onCropSave(croppedBlob);
    } catch (err) {
      console.error('Error generating cropped image:', err);
      alert('Failed to crop image. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="flex flex-col w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gray-900 text-white">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-base">Crop & Rotate Image (หมุนและตัดรูป)</h3>
            {totalCount && totalCount > 1 && (
              <span className="bg-blue-600 text-white text-xs px-2.5 py-0.5 rounded-full font-medium">
                {currentIndex} / {totalCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative w-full h-[360px] sm:h-[420px] bg-gray-950">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
          />
        </div>

        {/* Controls Section */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3 text-sm">
          {/* Rotation & Zoom Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Rotation Buttons */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-gray-600 mr-1">Rotate:</span>
              <button
                type="button"
                onClick={handleRotateLeft}
                className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-medium text-gray-700 shadow-xs transition"
                title="Rotate Left 90°"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-xs">90° Left</span>
              </button>
              <button
                type="button"
                onClick={handleRotateRight}
                className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-medium text-gray-700 shadow-xs transition"
                title="Rotate Right 90°"
              >
                <RotateCw className="w-4 h-4" />
                <span className="text-xs">90° Right</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center space-x-1 px-2.5 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-gray-600 transition"
                title="Reset controls"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Zoom Slider */}
            <div className="flex items-center space-x-2 min-w-[180px]">
              <ZoomIn className="w-4 h-4 text-gray-500" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-xs text-gray-500 font-mono w-8">{zoom.toFixed(1)}x</span>
            </div>
          </div>

          {/* Aspect Ratio Presets */}
          <div className="flex items-center space-x-2 pt-1">
            <span className="text-xs font-semibold text-gray-600 mr-1">Aspect Ratio:</span>
            <div className="flex items-center space-x-1.5 overflow-x-auto">
              {ASPECT_RATIOS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setAspect(item.value)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                    aspect === item.value
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 bg-white border-t border-gray-200">
          <div>
            {onSkip && totalCount && totalCount > 1 && (
              <button
                type="button"
                onClick={onSkip}
                className="text-xs text-gray-500 hover:text-gray-800 underline font-medium"
              >
                Skip this image (ข้ามรูปนี้)
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={processing}
              className="flex items-center space-x-1.5 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md transition"
            >
              <Check className="w-4 h-4" />
              <span>{processing ? 'Processing...' : 'Apply & Save (ใช้รูปนี้)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
