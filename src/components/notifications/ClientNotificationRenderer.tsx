import React from 'react';
import { ClientNotificationPopup } from './ClientNotificationPopup';
import { ClientNotificationBanner } from './ClientNotificationBanner';
import { ClientNotificationSheet } from './ClientNotificationSheet';
import { ClientNotificationFloatingWidget } from './ClientNotificationFloatingWidget';
import { ClientNotificationToastStack } from './ClientNotificationToastStack';
import { ClientNotificationTicker } from './ClientNotificationTicker';
import { ClientNotificationTakeover } from './ClientNotificationTakeover';
import { ClientNotificationSpotlight } from './ClientNotificationSpotlight';
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

      {/* 3. In-App Spotlight Card Banner */}
      <ClientNotificationSpotlight />

      {/* 4. Center Pop-up Modal */}
      <ClientNotificationPopup />

      {/* 5. Slide-Up Bottom Action Sheet / Drawer */}
      <ClientNotificationSheet />

      {/* 6. Floating Bottom-Right Action Widget */}
      <ClientNotificationFloatingWidget />

      {/* 7. Corner Interactive Toast Stack */}
      <ClientNotificationToastStack />

      {/* 8. Fullscreen Immersive Announcement Takeover */}
      <ClientNotificationTakeover />

      {/* 9. 10+ Delivery Formats (WhatsApp, Dock, Voice TTS, SMS, Telegram, Discord, Slack, Teams, FCM, Digest) */}
      <ClientNotificationNewFormats />

      {/* 10. Remote Logout Alert Modal */}
      <RemoteLogoutNoticeModal
        isOpen={remoteLogoutNotice.isOpen}
        reason={remoteLogoutNotice.reason}
        onClose={() => setRemoteLogoutNotice({ isOpen: false, reason: 'admin_logout' })}
      />
    </>
  );
};

