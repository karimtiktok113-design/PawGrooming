import React from 'react';
import { ClientNotificationPopup } from './ClientNotificationPopup';
import { ClientNotificationBanner } from './ClientNotificationBanner';
import { ClientNotificationSheet } from './ClientNotificationSheet';
import { ClientNotificationFloatingWidget } from './ClientNotificationFloatingWidget';
import { ClientNotificationToastStack } from './ClientNotificationToastStack';
import { ClientNotificationTicker } from './ClientNotificationTicker';
import { ClientNotificationTakeover } from './ClientNotificationTakeover';
import { ClientNotificationNewFormats } from './ClientNotificationNewFormats';
import { RemoteLogoutNoticeModal } from './RemoteLogoutNoticeModal';
import { useAuth } from '../../context/AuthContext';

export const ClientNotificationRenderer: React.FC = () => {
  const { remoteLogoutNotice, setRemoteLogoutNotice } = useAuth();

  return (
    <>
      {/* 1. Live Breaking News Ticker / Marquee */}
      <ClientNotificationTicker />

      {/* 2. Top Announcement Banners */}
      <ClientNotificationBanner />

      {/* 3. Center Pop-up Modal */}
      <ClientNotificationPopup />

      {/* 4. Slide-Up Bottom Action Sheet / Drawer */}
      <ClientNotificationSheet />

      {/* 5. Floating Bottom-Right Action Widget */}
      <ClientNotificationFloatingWidget />

      {/* 6. Corner Interactive Toast Stack */}
      <ClientNotificationToastStack />

      {/* 7. Fullscreen Immersive Announcement Takeover */}
      <ClientNotificationTakeover />

      {/* 8. 10+ New Delivery Formats (WhatsApp, Floating Dock, Voice Audio, SMS, Digest) */}
      <ClientNotificationNewFormats />

      {/* 9. Remote Logout Alert Modal */}
      <RemoteLogoutNoticeModal
        isOpen={remoteLogoutNotice.isOpen}
        reason={remoteLogoutNotice.reason}
        onClose={() => setRemoteLogoutNotice({ isOpen: false, reason: 'admin_logout' })}
      />
    </>
  );
};

