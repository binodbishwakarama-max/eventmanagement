import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, SwitchCamera, Upload, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export function QrCameraScannerModal({ isOpen, onClose, onScan, isProcessing }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) | 'user' (front)
  const [scanning, setScanning] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState('');
  const lastScanTimeRef = useRef(0);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setCameraError('');
    setScanning(true);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        startDetectionLoop();
      }
    } catch (err) {
      console.warn('Camera stream error:', err);
      let message = 'Unable to access camera. Please allow camera permissions or enter code manually.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission denied. Please grant permission in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera found on this device.';
      }
      setCameraError(message);
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const startDetectionLoop = () => {
    const hasBarcodeDetector = 'BarcodeDetector' in window;
    let detector = null;

    if (hasBarcodeDetector) {
      try {
        detector = new window.BarcodeDetector({ formats: ['qr_code', 'code_128', 'code_39'] });
      } catch (e) {
        console.warn('BarcodeDetector instantiation failed:', e);
      }
    }

    const checkFrame = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(checkFrame);
        return;
      }

      const now = Date.now();
      // Throttle scanning to once every 250ms
      if (now - lastScanTimeRef.current > 250 && detector) {
        lastScanTimeRef.current = now;
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            const rawVal = barcodes[0].rawValue?.trim();
            if (rawVal && rawVal !== lastScannedCode) {
              setLastScannedCode(rawVal);
              onScan(rawVal);
              // Wait 2.5s before allowing next auto-scan of the same code
              setTimeout(() => setLastScannedCode(''), 2500);
            }
          }
        } catch {
          // Ignore individual frame detection errors
        }
      }

      animFrameRef.current = requestAnimationFrame(checkFrame);
    };

    animFrameRef.current = requestAnimationFrame(checkFrame);
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Allow uploading pass screenshot / image file
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!('BarcodeDetector' in window)) {
      toast.error('Image QR scanning requires Chrome or Edge browser. Please enter ticket code manually.');
      return;
    }

    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await img.decode();
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const barcodes = await detector.detect(img);
      URL.revokeObjectURL(img.src);

      if (barcodes && barcodes.length > 0) {
        const val = barcodes[0].rawValue?.trim();
        if (val) {
          toast.success('QR Code detected from image!');
          onScan(val);
        }
      } else {
        toast.error('No QR code detected in this photo. Please try another image.');
      }
    } catch (err) {
      toast.error('Failed to parse image QR code');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#002B55] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Camera className="w-5 h-5 text-[#D9A521]" />
            <div>
              <h3 className="font-bold text-sm tracking-wide">DSU Gate Pass Scanner</h3>
              <p className="text-[11px] text-slate-300">Harohalli Campus Verification Point</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
            aria-label="Close scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Viewport / Viewfinder */}
        <div className="relative bg-black aspect-4/3 flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-8 text-center text-white max-w-sm">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <p className="text-xs font-medium text-slate-200 leading-relaxed mb-4">{cameraError}</p>
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Camera Access
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />

              {/* Viewfinder Target & Laser Scan Animation */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-56 h-56 rounded-2xl border-2 border-white/50 shadow-2xl">
                  {/* Corner Target Markers */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#D9A521] rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#D9A521] rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#D9A521] rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#D9A521] rounded-br-lg" />

                  {/* Animated Laser Scanline */}
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#D9A521] to-transparent animate-pulse shadow-[0_0_12px_#D9A521]" />
                </div>
              </div>

              {/* Processing Overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                  <div className="w-8 h-8 border-3 border-[#D9A521] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold tracking-wider font-mono">Verifying Hall Pass...</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleCameraFacing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium transition shadow-xs"
              title="Flip camera (front/back)"
            >
              <SwitchCamera className="w-3.5 h-3.5 text-slate-600" />
              <span>Flip Camera</span>
            </button>

            <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium transition shadow-xs cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>Upload Pass Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#002B55] hover:bg-[#001B36] text-white font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
