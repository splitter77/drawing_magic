import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already in standalone display mode (installed)
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // Listen for Chrome/Edge/Android beforeinstallprompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSPrompt(true);
    }
  };

  if (isStandalone || isDismissed || (!deferredPrompt && !isIOS)) {
    return null;
  }

  return (
    <div style={{
      margin: '0 16px 16px',
      padding: '14px 16px',
      borderRadius: '16px',
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(14, 165, 233, 0.1) 100%)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: '#10b981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Download size={18} color="#ffffff" />
        </div>
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
            Installer TableFlip (PWA)
          </h4>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Fonctionne 100% hors-ligne et plein écran sans barre d'adresse
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={handleInstallClick}
          className="btn-primary"
          style={{ padding: '8px 14px', fontSize: '0.75rem', borderRadius: '10px' }}
        >
          Installer
        </button>

        <button
          onClick={() => setIsDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            padding: '6px',
            cursor: 'pointer',
          }}
          aria-label="Fermer"
        >
          <X size={16} />
        </button>
      </div>

      {/* iOS instruction modal/tooltip */}
      {showIOSPrompt && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          right: '20px',
          background: '#0f172a',
          padding: '18px',
          borderRadius: '18px',
          border: '1px solid #334155',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
          zIndex: 100,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Installation sur iPhone / iPad :</h4>
            <button onClick={() => setShowIOSPrompt(false)} style={{ background: 'none', border: 'none', color: '#94a3b8' }}>
              <X size={16} />
            </button>
          </div>
          <ol style={{ fontSize: '0.8rem', color: '#cbd5e1', paddingLeft: '18px', lineHeight: '1.6' }}>
            <li>Appuyez sur le bouton de <strong>Partage</strong> <Share size={12} style={{ display: 'inline' }} /> dans Safari</li>
            <li>Faites défiler vers le bas et sélectionnez <strong>Sur l'écran d'accueil</strong> <PlusSquare size={12} style={{ display: 'inline' }} /></li>
          </ol>
        </div>
      )}
    </div>
  );
}
