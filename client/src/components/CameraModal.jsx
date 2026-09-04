import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';

export default function CameraModal({ isOpen, onClose, onCapture }) {
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fallbackInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, facingMode, capturedImage]);

  const startCamera = async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported in this browser.');
      }

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraError('Unable to open camera stream. You can capture using your device camera below.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleFallbackFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onCapture(reader.result);
      onClose();
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="camera-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="camera-modal-header">
          <div className="camera-modal-title">
            <Camera size={20} color="var(--primary-blue)" />
            <span>Live Camera</span>
          </div>
          <button className="share-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {cameraError ? (
          <div className="camera-fallback-box">
            <p style={{ fontSize: '13px', color: '#dc2626', marginBottom: '14px', textAlign: 'center' }}>
              {cameraError}
            </p>
            <button
              type="button"
              className="auth-submit-btn"
              onClick={() => fallbackInputRef.current?.click()}
            >
              <Camera size={18} /> Open Device Camera
            </button>
            <input
              type="file"
              ref={fallbackInputRef}
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleFallbackFile}
            />
          </div>
        ) : (
          <div className="camera-viewport-wrapper">
            {!capturedImage ? (
              <div className="video-container">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="camera-video-preview"
                />
                <button
                  type="button"
                  className="camera-switch-btn"
                  title="Switch Camera"
                  onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            ) : (
              <div className="video-container">
                <img src={capturedImage} alt="Captured" className="camera-video-preview" />
              </div>
            )}

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Camera Controls */}
            <div className="camera-controls-bar">
              {!capturedImage ? (
                <button
                  type="button"
                  className="camera-shutter-btn"
                  onClick={takeSnapshot}
                  title="Take Photo"
                >
                  <div className="shutter-inner" />
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="camera-action-btn secondary"
                    onClick={handleRetake}
                  >
                    <RefreshCw size={16} /> Retake
                  </button>
                  <button
                    type="button"
                    className="camera-action-btn primary"
                    onClick={handleConfirm}
                  >
                    <Check size={16} /> Use Photo
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
