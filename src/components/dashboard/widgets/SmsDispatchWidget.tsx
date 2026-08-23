import React from 'react';
import { useApp } from '../../../context/AppContext';
import { useDashboardSystem } from '../../../context/DashboardSystemContext';
import { 
  MessageSquare, 
  Send, 
  CheckCheck, 
  Clock, 
  Smartphone,
  CheckCircle2
} from 'lucide-react';

export const SmsDispatchWidget: React.FC = () => {
  const { clients, showToast } = useApp();
  const { realtimeEvents } = useDashboardSystem();

  const smsLogs = [
    {
      id: 'sms-1',
      recipient: 'Jessica Vance (Bella)',
      phone: '+1 (555) 234-5678',
      text: 'PawGroom Update: Bella is smelling wonderful! Her Hydro-Bath is complete and she is on styling table 1.',
      time: '12 mins ago',
      status: 'delivered'
    },
    {
      id: 'sms-2',
      recipient: 'Michael Chang (Charlie)',
      phone: '+1 (555) 876-5432',
      text: 'PawGroom Reminder: Charlie has an appointment booked for today at 2:00 PM.',
      time: '45 mins ago',
      status: 'delivered'
    },
    {
      id: 'sms-3',
      recipient: 'David Miller (Thor)',
      phone: '+1 (555) 345-6789',
      text: 'PawGroom Alert: Thor is looking fabulous and ready for pickup!',
      time: '1 hr ago',
      status: 'delivered'
    }
  ];

  return (
    <div id="widget-sms-dispatch" className="card-box flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-theme-subtle">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-theme-primary" />
            <h3 className="text-sm font-bold text-theme-ink font-display">
              Automated Client SMS Dispatcher
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-theme-light text-theme-primary border border-theme-subtle">
              Twilio Gateway Active
            </span>
          </div>
          <p className="text-xs text-theme-muted mt-0.5">
            Real-time pickup alerts, arrival check-ins, and health reminders
          </p>
        </div>
      </div>

      {/* SMS Queue list */}
      <div className="mt-3 space-y-2.5">
        {smsLogs.map((sms) => (
          <div
            key={sms.id}
            className="p-2.5 rounded-xl bg-theme-light border border-theme-subtle flex items-start gap-2.5 hover:border-theme-primary transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-theme-canvas text-theme-primary flex items-center justify-center border border-theme-subtle shrink-0 mt-0.5">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-theme-ink truncate">
                  {sms.recipient}
                </span>
                <span className="text-[10px] text-theme-muted shrink-0 flex items-center gap-1">
                  <CheckCheck className="w-3 h-3 text-emerald-500" /> {sms.time}
                </span>
              </div>
              <p className="text-[11px] text-theme-muted mt-0.5 line-clamp-2 leading-relaxed">
                "{sms.text}"
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2.5 border-t border-theme-subtle flex items-center justify-between text-xs">
        <span className="text-emerald-500 font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> 99.8% SMS Delivery Rate
        </span>
        <button
          onClick={() => showToast('Dispatched test broadcast SMS to current salon clients', 'success')}
          className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1"
        >
          <Send className="w-3 h-3" /> Quick SMS Broadcast
        </button>
      </div>
    </div>
  );
};
