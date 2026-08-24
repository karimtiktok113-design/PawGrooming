import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PurchasedRetailItem } from '../../types';
import { X, Check, Calendar, Phone, Mail, Award, AlertTriangle, Send, Trash2, Printer, FileText, Receipt, Scissors, ShieldAlert, Copy, Gift, Sparkles, Share2, MessageCircle, Upload, Image as ImageIcon, Camera, RefreshCw, Download, Plus, Minus, ShoppingBag, DollarSign } from 'lucide-react';
import confetti from 'canvas-confetti';
import { openWhatsAppInvoice, generateWhatsAppInvoiceText } from '../../utils/whatsapp';
import { formatShortInvoiceNumber, calculateAppointmentInvoice } from '../../utils/invoice';
import { downloadElementAsPng, copyElementImageToClipboard, shareElementImage } from '../../utils/imageShare';
import { compressImageFile } from '../../utils/imageCompressor';
import { InvoiceQRCode } from '../common/InvoiceQRCode';

export const ModalContainer: React.FC = () => {
  const { 
    activeModal, 
    modalData, 
    closeModal, 
    clients, 
    services, 
    staff, 
    inventory, 
    addAppointment, 
    updateAppointment, 
    addClient, 
    updateClient, 
    addService, 
    updateService, 
    addPackage, 
    addStaff, 
    updateStaff, 
    addInventoryItem, 
    updateInventoryItem, 
    addGiftCard, 
    addExpense, 
    addWaitlist, 
    addTransformation, 
    redeemPoints, 
    updateAppointmentStatus,
    addVaccineRecord,
    showToast 
  } = useApp();

  if (!activeModal) return null;

  const isWideModal = activeModal === 'printScheduleModal' || activeModal === 'invoiceModal' || activeModal === 'clientHistory' || activeModal === 'transformationForm';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 flex items-start sm:items-center justify-center min-h-screen modal-overlay print:bg-white print:p-0 print:static print:block">
      <div className={`bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-h-[88dvh] sm:max-h-[90vh] flex flex-col p-4 sm:p-6 relative border border-[#D8D3C4] my-auto animate-in fade-in zoom-in-95 duration-150 modal-box print:max-h-none print:shadow-none print:border-none print:max-w-none print:w-full print:m-0 print:p-0 ${
        isWideModal ? 'max-w-3xl' : 'max-w-lg'
      }`}>
        {/* Close button - Pinned at top right with clear background & high z-index */}
        <button
          onClick={closeModal}
          className="no-print absolute top-3 right-3 sm:top-4 sm:right-4 z-30 p-2 text-[#5C716C] hover:text-[#240C0B] rounded-xl bg-white/90 border border-[#E8E1D1] shadow-2xs hover:bg-[#F1EEE6] transition-colors cursor-pointer"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Modal Content Body */}
        <div className="overflow-y-auto pr-1 sm:pr-2 flex-1 space-y-4 text-[#240C0B]">
          {/* Modal 1: Appointment Booking / Edit Form */}
          {activeModal === 'appointmentForm' && (
            <AppointmentFormModal data={modalData} onClose={closeModal} />
          )}

          {/* Modal 2: Appointment Detail & Quick Checkout */}
          {activeModal === 'appointmentDetail' && (
            <AppointmentDetailModal data={modalData} onClose={closeModal} />
          )}

          {/* Modal 3: Client & Pet Record Form */}
          {activeModal === 'clientForm' && (
            <ClientFormModal data={modalData} onClose={closeModal} />
          )}

          {/* Modal 4: Client Grooming History */}
          {activeModal === 'clientHistory' && (
            <ClientHistoryModal data={modalData} onClose={closeModal} />
          )}

          {/* Modal 5: Service Form */}
          {activeModal === 'serviceForm' && (
            <ServiceFormModal data={modalData} onClose={closeModal} />
          )}

          {/* Modal 6: Package Form */}
          {activeModal === 'packageForm' && (
            <PackageFormModal onClose={closeModal} />
          )}

          {/* Modal 7: Staff Form */}
          {activeModal === 'staffForm' && (
            <StaffFormModal data={modalData} onClose={closeModal} />
          )}

          {/* Modal 8: Inventory Product Form */}
          {activeModal === 'inventoryForm' && (
            <InventoryFormModal data={modalData} onClose={closeModal} />
          )}

          {/* Modal 9: Gift Card Form */}
          {activeModal === 'giftCardForm' && (
            <GiftCardFormModal onClose={closeModal} />
          )}

          {/* Modal 10: Expense Form */}
          {activeModal === 'expenseForm' && (
            <ExpenseFormModal onClose={closeModal} />
          )}

          {/* Modal 11: Waitlist Form */}
          {activeModal === 'waitlistForm' && (
            <WaitlistFormModal onClose={closeModal} />
          )}

          {/* Modal 12: Transformation Gallery Form */}
          {activeModal === 'transformationForm' && (
            <TransformationFormModal onClose={closeModal} />
          )}

          {/* Modal 13: Redeem Points Modal */}
          {activeModal === 'redeemModal' && (
            <RedeemModal data={modalData} onClose={closeModal} />
          )}

          {/* Modal 14: Send Reminder Modal */}
          {activeModal === 'reminderModal' && (
            <ReminderModal data={modalData} onClose={closeModal} />
          )}

          {/* Modal 15: Generic Confirmation Modal */}
          {activeModal === 'confirmModal' && (
            <ConfirmModal data={modalData} onClose={closeModal} />
          )}

          {/* Modal 16: Print Daily Schedule Modal */}
          {activeModal === 'printScheduleModal' && (
            <PrintScheduleModal data={modalData} onClose={closeModal} />
          )}

          {/* Modal 17: Official Invoice / Receipt Modal */}
          {(activeModal === 'invoiceModal' || activeModal === 'invoice') && (
            <InvoiceModal data={modalData} onClose={closeModal} />
          )}

          {/* Modal 18: Vaccination Schedule Form Modal */}
          {activeModal === 'vaccineScheduleForm' && (
            <VaccineScheduleFormModal data={modalData} onClose={closeModal} />
          )}
        </div>
      </div>
    </div>
  );
};

/* --- Sub-Components for Modals --- */

// 1. Appointment Form Modal
const AppointmentFormModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const { clients, services, packages, staff, settings, addAppointment, updateAppointment, formatPrice } = useApp();

  const getTodayISO = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const appt = data?.appointment;
  const initialPkgId = data?.packageId || appt?.packageId;
  const initialPkg = initialPkgId ? packages.find(p => p.id === initialPkgId) : null;

  const [bookingType, setBookingType] = useState<'service' | 'package'>(initialPkg ? 'package' : 'service');
  const [clientId, setClientId] = useState(data?.clientId || appt?.clientId || clients[0]?.id || '');
  const [serviceId, setServiceId] = useState(data?.serviceId || appt?.serviceId || services[0]?.id || '');
  const [selectedPackageId, setSelectedPackageId] = useState<string>(initialPkg ? initialPkg.id : packages[0]?.id || '');
  const [staffId, setStaffId] = useState(data?.staffId || appt?.staffId || staff[0]?.id || '');
  const [date, setDate] = useState(data?.date || appt?.date || getTodayISO());
  const [start, setStart] = useState(data?.start || appt?.start || '10:00');
  const [retail, setRetail] = useState(appt?.retail || 0);
  const [notes, setNotes] = useState(data?.notes || appt?.notes || '');

  const selectedSvc = services.find((s) => s.id === serviceId);
  const selectedPkg = packages.find((p) => p.id === selectedPackageId);

  const openHour = settings?.open ?? 8;
  const closeHour = settings?.close ?? 18;
  const slotMins = settings?.slot ?? 30;

  const timeSlots = React.useMemo(() => {
    const slots: string[] = [];
    for (let h = openHour; h < closeHour; h++) {
      const hStr = h < 10 ? `0${h}` : `${h}`;
      slots.push(`${hStr}:00`);
      if (slotMins === 30) {
        slots.push(`${hStr}:30`);
      }
    }
    return slots.length ? slots : ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  }, [openHour, closeHour, slotMins]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (bookingType === 'package' && selectedPkg) {
      // Find main service or fallback
      const primarySvcId = selectedPkg.serviceIds[0] || services[0]?.id || 'sv1';
      
      if (appt) {
        updateAppointment(appt.id, {
          clientId,
          serviceId: primarySvcId,
          packageId: selectedPkg.id,
          packageName: selectedPkg.name,
          staffId,
          date,
          start,
          duration: selectedPkg.duration,
          price: selectedPkg.price,
          retail,
          notes: notes ? notes : `Spa Package: ${selectedPkg.name}`,
        });
      } else {
        addAppointment({
          clientId,
          serviceId: primarySvcId,
          packageId: selectedPkg.id,
          packageName: selectedPkg.name,
          staffId,
          date,
          start,
          duration: selectedPkg.duration,
          price: selectedPkg.price,
          status: 'booked',
          retail,
          notes: notes ? notes : `Spa Package: ${selectedPkg.name}`,
        });
      }
      onClose();
      return;
    }

    if (!selectedSvc) return;

    if (appt) {
      updateAppointment(appt.id, {
        clientId,
        serviceId,
        packageId: undefined,
        packageName: undefined,
        staffId,
        date,
        start,
        duration: selectedSvc.duration,
        price: selectedSvc.price,
        retail,
        notes,
      });
    } else {
      addAppointment({
        clientId,
        serviceId,
        staffId,
        date,
        start,
        duration: selectedSvc.duration,
        price: selectedSvc.price,
        status: 'booked',
        retail,
        notes,
      });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-display font-bold text-xl text-[#173E39]">Book Grooming Appointment</h3>

      {/* Booking Type Toggle: Single Service vs Spa Package */}
      <div className="flex items-center bg-[#EAE7DC] p-1 rounded-xl gap-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => setBookingType('service')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
            bookingType === 'service' ? 'bg-[#173E39] text-white shadow-2xs' : 'text-[#5C716C]'
          }`}
        >
          Single Service
        </button>
        <button
          type="button"
          onClick={() => setBookingType('package')}
          className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
            bookingType === 'package' ? 'bg-[#173E39] text-white shadow-2xs' : 'text-[#5C716C]'
          }`}
        >
          ✨ Spa Package Bundle ({packages.length})
        </button>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <label className="font-bold text-[#173E39]">Select Dog / Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full mt-1 p-2 border rounded-xl bg-white outline-none"
            required
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.breed}) — Owner: {c.owner}
              </option>
            ))}
          </select>
        </div>

        {bookingType === 'service' ? (
          <div>
            <label className="font-bold text-[#173E39]">Grooming Service</label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full mt-1 p-2 border rounded-xl bg-white outline-none"
              required
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({formatPrice(s.price)} • {s.duration}m)
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="font-bold text-[#173E39]">Select Spa Package</label>
            <select
              value={selectedPackageId}
              onChange={(e) => setSelectedPackageId(e.target.value)}
              className="w-full mt-1 p-2 border rounded-xl bg-white font-bold text-[#173E39] outline-none"
              required
            >
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} — {formatPrice(pkg.price)} ({pkg.duration} mins)
                </option>
              ))}
            </select>
            {selectedPkg && (
              <p className="mt-1 text-[11px] text-[#5C716C]">
                Includes: {selectedPkg.serviceIds.map(sid => services.find(s => s.id === sid)?.name).filter(Boolean).join(' + ')}
              </p>
            )}
          </div>
        )}

        <div>
          <label className="font-bold text-[#173E39]">Assigned Stylist</label>
          <select
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            className="w-full mt-1 p-2 border rounded-xl bg-white outline-none"
            required
          >
            {staff.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name} ({st.role})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-[#173E39]">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1 p-2 border rounded-xl bg-white outline-none"
              required
            />
          </div>
          <div>
            <label className="font-bold text-[#173E39]">Time Slot</label>
            <select
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full mt-1 p-2 border rounded-xl bg-white outline-none"
            >
              {timeSlots.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="font-bold text-[#173E39]">Groomer Cut / Style Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., #4 body, scissored teddy head..."
            className="w-full mt-1 p-2 border rounded-xl h-16 bg-white outline-none"
          />
        </div>
      </div>

      <div className="pt-2 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl cursor-pointer">
          Cancel
        </button>
        <button type="submit" className="btn-primary text-xs px-5 py-2 rounded-xl font-bold cursor-pointer shadow-md">
          Confirm Booking
        </button>
      </div>
    </form>
  );
};

// 2. Appointment Detail & Checkout Modal
const AppointmentDetailModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const { 
    clients, 
    services, 
    packages,
    staff, 
    inventory, 
    redemptions,
    settings,
    createPromoCode,
    applyVoucherCode,
    markVoucherAsUsed,
    updateAppointmentStatus, 
    updateAppointment,
    deleteAppointment, 
    confirmDelete, 
    showToast, 
    openModal,
    formatPrice 
  } = useApp();
  
  const appt = data?.appointment || (data?.id ? data : null);
  if (!appt) return null;

  const client = clients.find((c) => c.id === appt.clientId);
  const service = services.find((s) => s.id === appt.serviceId);
  const groomer = staff.find((st) => st.id === appt.staffId);

  // Look up spa package if selected
  const pkg = appt.packageId 
    ? packages.find((p) => p.id === appt.packageId)
    : (appt.packageName ? packages.find(p => p.name.toLowerCase() === appt.packageName?.toLowerCase()) : null);

  // Multi-retail items state
  const initialPurchasedItems = useMemo<PurchasedRetailItem[]>(() => {
    if (appt.purchasedItems && appt.purchasedItems.length > 0) {
      return appt.purchasedItems;
    }
    if (appt.retail && appt.retail > 0) {
      // Find matching inventory item by price or fallback
      const matchingInv = inventory.find((i) => i.price === appt.retail);
      return [{
        itemId: matchingInv?.id || 'legacy_retail',
        name: matchingInv?.name || 'Retail Care Add-on',
        price: appt.retail,
        quantity: 1
      }];
    }
    return [];
  }, [appt.purchasedItems, appt.retail, inventory]);

  const [purchasedProducts, setPurchasedProducts] = useState<PurchasedRetailItem[]>(initialPurchasedItems);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string>('');

  React.useEffect(() => {
    setPurchasedProducts(initialPurchasedItems);
  }, [appt.id]);

  const retailAddon = useMemo(() => {
    return purchasedProducts.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 1), 0);
  }, [purchasedProducts]);

  const handleAddProduct = (itemToAdd?: { id: string; name: string; price: number; stock?: number }) => {
    const targetItem = itemToAdd || inventory.find((i) => i.id === selectedInventoryId);
    if (!targetItem) return;

    if (targetItem.stock !== undefined && targetItem.stock <= 0) {
      showToast(`${targetItem.name} is currently out of stock!`, 'warning');
      return;
    }

    const existingIdx = purchasedProducts.findIndex((p) => p.itemId === targetItem.id);
    if (existingIdx !== -1) {
      const currentQty = purchasedProducts[existingIdx].quantity || 1;
      if (targetItem.stock !== undefined && currentQty >= targetItem.stock) {
        showToast(`Only ${targetItem.stock} in stock for ${targetItem.name}`, 'warning');
        return;
      }
      setPurchasedProducts((prev) => {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: currentQty + 1,
        };
        return next;
      });
    } else {
      setPurchasedProducts((prev) => [
        ...prev,
        {
          itemId: targetItem.id,
          name: targetItem.name,
          price: Number(targetItem.price || 0),
          quantity: 1,
        },
      ]);
    }
    setSelectedInventoryId('');
  };

  const handleUpdateProductQuantity = (itemId: string, delta: number) => {
    const prod = purchasedProducts.find((p) => p.itemId === itemId);
    if (!prod) return;

    const newQty = (prod.quantity || 1) + delta;
    const invItem = inventory.find((i) => i.id === itemId);
    if (delta > 0 && invItem && invItem.stock !== undefined && newQty > invItem.stock) {
      showToast(`Cannot exceed current stock level (${invItem.stock}) for ${prod.name}`, 'warning');
      return;
    }

    setPurchasedProducts((prev) => {
      return prev
        .map((p) => {
          if (p.itemId === itemId) {
            const nextQty = (p.quantity || 1) + delta;
            return nextQty > 0 ? { ...p, quantity: nextQty } : null;
          }
          return p;
        })
        .filter(Boolean) as PurchasedRetailItem[];
    });
  };

  const handleRemoveProduct = (itemId: string) => {
    setPurchasedProducts((prev) => prev.filter((p) => p.itemId !== itemId));
  };

  // Filter promo codes strictly for THIS specific client or dog
  const clientPromoCodes = useMemo(() => {
    if (!appt.clientId) return [];
    return redemptions.filter((r) => r.clientId === appt.clientId && r.status !== 'used');
  }, [redemptions, appt.clientId]);

  // Find initial applied promo code for this dog/client
  const defaultPromo = useMemo(() => {
    if (appt.discountCode) {
      return clientPromoCodes.find((r) => r.code === appt.discountCode) || null;
    }
    return clientPromoCodes.find((r) => r.status === 'applied' || r.isAutoApplied) || null;
  }, [clientPromoCodes, appt.discountCode]);

  const [selectedPromoCode, setSelectedPromoCode] = useState<string>(
    defaultPromo ? defaultPromo.code : (appt.discountCode || '')
  );
  const [showCreatePromo, setShowCreatePromo] = useState(false);
  const [newPromoTitle, setNewPromoTitle] = useState('15% Off VIP Session');
  const [newPromoType, setNewPromoType] = useState<'percent' | 'fixed'>('percent');
  const [newPromoVal, setNewPromoVal] = useState<number>(15);

  const servicePrice = pkg ? pkg.price : (service?.price || appt.price || 0);
  const grossSubtotal = servicePrice + retailAddon;

  // Selected promo calculation
  const activeVoucher = clientPromoCodes.find((r) => r.code === selectedPromoCode);
  let discountAmount = 0;
  let discountTitle = '';

  if (activeVoucher) {
    discountTitle = activeVoucher.rewardTitle;
    if (activeVoucher.discountType === 'percent') {
      discountAmount = Math.round(grossSubtotal * (activeVoucher.discountValue / 100) * 100) / 100;
    } else {
      discountAmount = Math.min(grossSubtotal, activeVoucher.discountValue);
    }
  } else if (selectedPromoCode && (selectedPromoCode === appt.discountCode || !clientPromoCodes.length)) {
    // If the promo was already applied to this appointment (and archived from active rewards)
    discountTitle = appt.discountTitle || 'Applied Promo Voucher';
    if (appt.discountAmount !== undefined && appt.discountAmount > 0) {
      discountAmount = appt.discountAmount;
    } else if (appt.discountValue) {
      discountAmount = appt.discountType === 'percent'
        ? Math.round(grossSubtotal * (appt.discountValue / 100) * 100) / 100
        : Math.min(grossSubtotal, appt.discountValue);
    }
  }

  const chosenCode = selectedPromoCode ? (activeVoucher ? activeVoucher.code : (appt.discountCode || selectedPromoCode)) : undefined;
  const chosenTitle = selectedPromoCode ? (activeVoucher ? activeVoucher.rewardTitle : (discountTitle || appt.discountTitle)) : undefined;
  const chosenDiscAmount = selectedPromoCode ? discountAmount : 0;

  const taxableSubtotal = Math.max(0, grossSubtotal - chosenDiscAmount);
  const taxRate = settings.taxRate !== undefined ? settings.taxRate : 8.5;
  const taxAmount = Math.round(taxableSubtotal * (taxRate / 100) * 100) / 100;
  const finalTotal = taxableSubtotal + taxAmount;

  const handleQuickCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    const created = createPromoCode(
      client.id,
      newPromoTitle,
      newPromoType,
      newPromoVal,
      0,
      true // set to applied in checkout
    );
    if (created) {
      setSelectedPromoCode(created.code);
      setShowCreatePromo(false);
    }
  };

  const handleComplete = () => {
    // Save invoice, items, discount details and mark status completed atomically
    updateAppointment(appt.id, {
      status: 'completed',
      retail: retailAddon,
      purchasedItems: purchasedProducts,
      discountAmount: chosenDiscAmount,
      discountCode: chosenCode,
      discountTitle: chosenTitle,
      taxRate,
      taxAmount,
      totalAmount: finalTotal,
      packageId: pkg?.id || appt.packageId,
      packageName: pkg?.name || appt.packageName,
    });

    if (activeVoucher) {
      markVoucherAsUsed(activeVoucher.code, appt.id);
    }

    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    showToast(
      `Appointment completed! Total: ${formatPrice(finalTotal)} (Tax: ${taxRate}%${chosenDiscAmount > 0 ? `, Promo: -${formatPrice(chosenDiscAmount)}` : ''})`,
      'success'
    );
    onClose();
  };

  const handleShareWhatsApp = () => {
    if (!client) return;
    const invoiceNum = formatShortInvoiceNumber(appt);
    const ok = openWhatsAppInvoice({
      invoiceNum,
      client,
      appointment: { 
        ...appt, 
        retail: retailAddon,
        purchasedItems: purchasedProducts,
        discountAmount: chosenDiscAmount,
        discountCode: chosenCode,
        discountTitle: chosenTitle,
      },
      clinicSettings: settings,
      serviceName: service?.name,
      packageName: pkg?.name || appt.packageName,
      groomerName: groomer?.name,
      servicePrice,
      retailAddon,
      purchasedItems: purchasedProducts,
      discountAmount: chosenDiscAmount,
      discountCode: chosenCode,
      discountTitle: chosenTitle,
      taxRate,
      tax: taxAmount,
      total: finalTotal,
      pointsEarned: Math.floor(finalTotal),
      isPaid: appt.status === 'completed'
    });
    if (ok) {
      showToast(`Redirecting to WhatsApp for ${client.owner}...`, 'success');
    }
  };

  const handleDelete = () => {
    confirmDelete({
      title: 'Cancel Appointment',
      message: `Are you sure you want to cancel and delete the appointment for ${client?.name || 'this pet'} on ${appt.date} at ${appt.start}?`,
      confirmLabel: 'Cancel & Delete',
      onConfirm: () => {
        deleteAppointment(appt.id);
        onClose();
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <h3 className="font-display font-bold text-xl text-[#173E39]">
            Grooming Session & Checkout
          </h3>
          <p className="text-[11px] text-[#5C716C]">
            Review service, client-specific promo codes, and US tax calculation
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase bg-[#E1ECF0] text-[#3A6B7C]">
          {appt.status}
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#FAF8F5] p-3 rounded-2xl border border-[#D8D3C4]">
          <div>
            <span className="font-bold text-[#173E39]">Pet: </span>
            <span className="text-[#2E8A81] font-bold text-sm">{client?.name} ({client?.breed})</span>
          </div>
          <div>
            <span className="font-bold text-[#173E39]">Owner: </span>
            <span>{client?.owner} • {client?.phone}</span>
          </div>
          <div>
            <span className="font-bold text-[#173E39]">Service / Package: </span>
            {pkg ? (
              <span className="font-bold text-[#FF6B00]">✨ {pkg.name} ({formatPrice(pkg.price)})</span>
            ) : (
              <span className="font-semibold text-[#173E39]">{service?.name} ({formatPrice(service?.price || appt.price)})</span>
            )}
          </div>
          <div>
            <span className="font-bold text-[#173E39]">Stylist: </span>
            <span>{groomer?.name || 'Assigned Stylist'}</span>
          </div>
          <div>
            <span className="font-bold text-[#173E39]">Date & Time: </span>
            <span>{appt.date} @ {appt.start}</span>
          </div>
          <div>
            <span className="font-bold text-[#173E39]">Client Points: </span>
            <span className="font-bold text-[#FF6B00]">{client?.points || 0} pts</span>
          </div>
        </div>

        {pkg && (
          <div className="p-2.5 rounded-xl bg-[#FFF8E7] border border-[#FFE7B3] text-[11px] text-[#331D00]">
            <span className="font-bold block text-[#FF6B00]">✨ Luxury Spa Package Bundle:</span>
            <span>Includes: {pkg.serviceIds.map(sid => services.find(s => s.id === sid)?.name).filter(Boolean).join(' + ')}</span>
          </div>
        )}

        {client?.sensitivities && (
          <div className="bg-[#FEF2F2] p-2 rounded-xl text-[#991B1B] font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Sensitivity Alert: {client.sensitivities}</span>
          </div>
        )}

        {/* Add-on Retail Sales (Multiple Products & Stock Deduction) */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#D8D3C4] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-[#173E39]">
              <ShoppingBag className="w-4 h-4 text-[#2E8A81]" />
              <span>Add-on Retail Products & Care Items</span>
            </div>
            {purchasedProducts.length > 0 && (
              <span className="text-[11px] font-bold text-[#FF6B00] bg-[#FFF8E7] px-2 py-0.5 rounded-full border border-[#FFE7B3]">
                {purchasedProducts.reduce((s, p) => s + (p.quantity || 1), 0)} items ({formatPrice(retailAddon)})
              </span>
            )}
          </div>

          {/* Product Picker Row */}
          <div className="flex items-center gap-2">
            <select
              value={selectedInventoryId}
              onChange={(e) => setSelectedInventoryId(e.target.value)}
              className="flex-1 p-2 border border-[#D8D3C4] rounded-xl bg-white text-xs outline-none focus:border-[#2E8A81]"
            >
              <option value="">Select product to add...</option>
              {inventory.map((i) => {
                const isOutOfStock = i.stock !== undefined && i.stock <= 0;
                return (
                  <option key={i.id} value={i.id} disabled={isOutOfStock}>
                    {i.name} — {formatPrice(i.price || 0)} {i.stock !== undefined ? `(${i.stock} in stock${isOutOfStock ? ' - OUT' : ''})` : ''}
                  </option>
                );
              })}
            </select>
            <button
              type="button"
              disabled={!selectedInventoryId}
              onClick={() => handleAddProduct()}
              className="px-3 py-2 bg-[#2E8A81] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1F6660] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Quick-Add Popular Retail Items Badges */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[10px] text-[#5C716C] font-semibold">Quick add:</span>
            {inventory.slice(0, 4).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleAddProduct(item)}
                disabled={item.stock !== undefined && item.stock <= 0}
                className="text-[10px] font-bold px-2 py-1 bg-[#FAF8F5] hover:bg-[#EAE7DC] text-[#173E39] border border-[#D8D3C4] rounded-lg cursor-pointer transition-all flex items-center gap-1 disabled:opacity-40"
              >
                <span>+ {item.name.split(' ')[0]}</span>
                <span className="text-[#FF6B00]">({formatPrice(item.price)})</span>
              </button>
            ))}
          </div>

          {/* Selected Products List */}
          {purchasedProducts.length > 0 ? (
            <div className="space-y-1.5 pt-1.5 border-t border-[#EAE7DC]">
              {purchasedProducts.map((prod) => {
                const invItem = inventory.find((i) => i.id === prod.itemId || i.name.toLowerCase() === prod.name.toLowerCase());
                const currentStock = invItem ? invItem.stock : undefined;
                const lineTotal = (prod.price || 0) * (prod.quantity || 1);

                return (
                  <div
                    key={prod.itemId}
                    className="p-2 bg-[#FAF8F5] rounded-xl border border-[#D8D3C4] flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[#173E39] truncate">{prod.name}</div>
                      <div className="text-[10px] text-[#5C716C] flex items-center gap-2">
                        <span>{formatPrice(prod.price)} each</span>
                        {currentStock !== undefined && (
                          <span className={`font-semibold ${currentStock < 5 ? 'text-[#C9503A]' : 'text-[#2E8A81]'}`}>
                            • Stock: {currentStock}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 bg-white border border-[#D8D3C4] rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateProductQuantity(prod.itemId, -1)}
                        className="w-6 h-6 flex items-center justify-center text-[#5C716C] hover:text-[#173E39] hover:bg-[#F1EEE6] rounded cursor-pointer"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-xs text-[#173E39]">
                        {prod.quantity || 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateProductQuantity(prod.itemId, 1)}
                        className="w-6 h-6 flex items-center justify-center text-[#5C716C] hover:text-[#173E39] hover:bg-[#F1EEE6] rounded cursor-pointer"
                        title="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[60px]">
                      <div className="font-bold text-[#173E39]">{formatPrice(lineTotal)}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(prod.itemId)}
                      className="p-1 text-[#A08E8B] hover:text-[#C9503A] hover:bg-[#FEF2F2] rounded-lg transition-colors cursor-pointer"
                      title="Remove product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-[11px] text-[#7A6865] italic bg-[#FAF8F5] p-2 rounded-xl border border-dashed border-[#D8D3C4] text-center">
              No retail items added to this appointment.
            </div>
          )}
        </div>

        {/* Dog/Client Specific Promo Codes & Discounts */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#2E8A81]/40 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-[#173E39]">
              <Gift className="w-4 h-4 text-[#FF6B00]" />
              <span>Promo Code for {client?.name || 'Client'}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowCreatePromo(!showCreatePromo)}
              className="text-[11px] font-extrabold text-[#2E8A81] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#FF6B00]" />
              {showCreatePromo ? 'Close Form' : `+ Create Promo for ${client?.name || 'Pet'}`}
            </button>
          </div>

          {showCreatePromo && (
            <form onSubmit={handleQuickCreatePromo} className="p-3 bg-[#FAF8F5] border border-[#E7C0B5] rounded-xl space-y-2">
              <div className="font-bold text-xs text-[#240C0B]">
                Issue Promo Code for {client?.name} (Auto-Applied to Checkout)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-1">
                  <label className="text-[10px] font-bold text-[#7A6865]">Discount Type</label>
                  <select
                    value={newPromoType}
                    onChange={(e) => setNewPromoType(e.target.value as 'percent' | 'fixed')}
                    className="w-full mt-0.5 p-1.5 border border-[#D8D3C4] rounded-lg bg-white font-bold"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Dollar ($)</option>
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <label className="text-[10px] font-bold text-[#7A6865]">Value ({newPromoType === 'percent' ? '%' : '$'})</label>
                  <input
                    type="number"
                    min="1"
                    max={newPromoType === 'percent' ? 100 : 500}
                    value={newPromoVal}
                    onChange={(e) => setNewPromoVal(parseFloat(e.target.value) || 0)}
                    className="w-full mt-0.5 p-1.5 border border-[#D8D3C4] rounded-lg bg-white font-bold text-center"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="text-[10px] font-bold text-[#7A6865]">Promo Description</label>
                  <input
                    type="text"
                    value={newPromoTitle}
                    onChange={(e) => setNewPromoTitle(e.target.value)}
                    className="w-full mt-0.5 p-1.5 border border-[#D8D3C4] rounded-lg bg-white text-xs"
                    placeholder="e.g. VIP Promo"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-[#2E8A81] font-bold">
                  ✓ Automatically set to APPLIED in this checkout
                </span>
                <button type="submit" className="btn-primary text-xs px-3 py-1 rounded-lg font-bold">
                  Create & Apply
                </button>
              </div>
            </form>
          )}

          {/* List/Select Promo Codes Specific to this Client */}
          {clientPromoCodes.length === 0 && !appt.discountCode ? (
            <div className="text-[11px] text-[#7A6865] bg-[#FAF8F5] p-2.5 rounded-xl border border-dashed border-[#D8D3C4]">
              No active promo codes issued for {client?.name}. Click "+ Create Promo" above to generate a client-specific code.
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#7A6865]">
                Promo Codes for {client?.name} (Client-specific voucher discounts):
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                <div
                  onClick={() => setSelectedPromoCode('')}
                  className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                    !selectedPromoCode 
                      ? 'bg-[#FAF8F5] border-[#240C0B] font-bold text-[#240C0B]' 
                      : 'bg-white border-[#D8D3C4] text-[#7A6865] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span>No promo code applied</span>
                  {!selectedPromoCode && <Check className="w-3.5 h-3.5 text-[#240C0B]" />}
                </div>

                {/* Previously applied promo code for this invoice (e.g. single-use redeemed) */}
                {appt.discountCode && !clientPromoCodes.some((p) => p.code.toUpperCase() === appt.discountCode?.toUpperCase()) && (
                  <div
                    onClick={() => setSelectedPromoCode(appt.discountCode!)}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                      selectedPromoCode === appt.discountCode
                        ? 'bg-[#ECFDF5] border-[#10B981] ring-1 ring-[#10B981] text-[#065F46] font-bold shadow-xs'
                        : 'bg-white border-[#D8D3C4] text-[#173E39] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs bg-white px-2 py-0.5 rounded-md border border-[#D8D3C4]">
                        {appt.discountCode}
                      </span>
                      <div>
                        <div className="font-bold text-xs">{appt.discountTitle || 'Applied Promo Voucher'}</div>
                        <div className="text-[10px] text-[#5C716C]">
                          Applied to this invoice {appt.discountAmount ? `(-${formatPrice(appt.discountAmount)})` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-[#10B981] text-white rounded-full">
                        Applied
                      </span>
                      {selectedPromoCode === appt.discountCode && <Check className="w-4 h-4 text-[#10B981]" />}
                    </div>
                  </div>
                )}

                {clientPromoCodes.map((promo) => {
                  const isSelected = selectedPromoCode === promo.code;
                  return (
                    <div
                      key={promo.id}
                      onClick={() => setSelectedPromoCode(promo.code)}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#ECFDF5] border-[#10B981] ring-1 ring-[#10B981] text-[#065F46] font-bold shadow-xs'
                          : 'bg-white border-[#D8D3C4] text-[#173E39] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs bg-white px-2 py-0.5 rounded-md border border-[#D8D3C4]">
                          {promo.code}
                        </span>
                        <div>
                          <div className="font-bold text-xs">{promo.rewardTitle}</div>
                          <div className="text-[10px] text-[#5C716C]">
                            {promo.discountType === 'percent' ? `${promo.discountValue}% Off Invoice` : `$${promo.discountValue} Off`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {promo.status === 'applied' && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-[#FF6B00] text-white rounded-full">
                            Applied
                          </span>
                        )}
                        {isSelected && <Check className="w-4 h-4 text-[#10B981]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Real-Time Checkout Invoice Calculation Breakdown */}
        <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#D8D3C4] space-y-1.5 text-xs">
          <div className="font-display font-bold text-xs text-[#173E39] border-b border-[#D8D3C4]/60 pb-1 flex justify-between">
            <span>Invoice Breakdown</span>
            <span className="text-[10px] text-[#7A6865] font-normal">US Tax Setting: {taxRate}%</span>
          </div>

          <div className="flex justify-between text-[#5C716C]">
            <span>{pkg ? `Spa Package (${pkg.name}):` : `Grooming Service (${service?.name || 'Service'}):`}</span>
            <span className="font-bold text-[#173E39]">{formatPrice(servicePrice)}</span>
          </div>

          {purchasedProducts.length > 0 ? (
            <div className="space-y-1 pt-0.5">
              <div className="flex justify-between text-[#5C716C]">
                <span>Retail Products ({purchasedProducts.reduce((s, p) => s + (p.quantity || 1), 0)} items):</span>
                <span className="font-bold text-[#173E39]">+{formatPrice(retailAddon)}</span>
              </div>
              {purchasedProducts.map((p) => (
                <div key={p.itemId} className="flex justify-between text-[#7A6865] text-[10px] pl-2">
                  <span className="truncate max-w-[200px]">• {p.name} ({p.quantity || 1}x)</span>
                  <span>{formatPrice((p.price || 0) * (p.quantity || 1))}</span>
                </div>
              ))}
            </div>
          ) : retailAddon > 0 ? (
            <div className="flex justify-between text-[#5C716C]">
              <span>Retail Add-ons:</span>
              <span className="font-bold text-[#173E39]">+{formatPrice(retailAddon)}</span>
            </div>
          ) : null}

          <div className="flex justify-between text-[#5C716C] pt-0.5 border-t border-[#D8D3C4]/40">
            <span>Gross Subtotal:</span>
            <span className="font-bold text-[#173E39]">{formatPrice(grossSubtotal)}</span>
          </div>

          {chosenDiscAmount > 0 && (
            <div className="flex justify-between text-[#059669] font-bold">
              <span className="flex items-center gap-1">
                <Gift className="w-3 h-3" />
                Promo Discount ({chosenCode || 'Promo'} - {chosenTitle || 'Promo Voucher'}):
              </span>
              <span>-{formatPrice(chosenDiscAmount)}</span>
            </div>
          )}

          <div className="flex justify-between text-[#5C716C]">
            <span>Taxable Subtotal:</span>
            <span className="font-bold text-[#173E39]">{formatPrice(taxableSubtotal)}</span>
          </div>

          <div className="flex justify-between text-[#5C716C]">
            <span>US Sales Tax ({taxRate}%):</span>
            <span className="font-bold text-[#FF6B00]">+{formatPrice(taxAmount)}</span>
          </div>

          <div className="flex justify-between items-center text-sm font-display font-extrabold text-[#240C0B] pt-1.5 border-t-2 border-[#240C0B]">
            <span>Total Payable:</span>
            <span className="text-base text-[#FF6B00]">{formatPrice(finalTotal)}</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDelete}
            className="p-2 text-[#5C716C] hover:text-[#C9503A] rounded-xl hover:bg-[#FEF2F2] transition-colors flex items-center gap-1 text-xs font-bold"
            title="Delete Appointment"
          >
            <Trash2 className="w-4 h-4" /> Cancel/Delete
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Share on WhatsApp Button */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="px-3.5 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-extrabold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Share receipt directly to client on WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => {
              // Persist invoice & promo code data to appointment state so reopening always has it!
              updateAppointment(appt.id, {
                retail: retailAddon,
                purchasedItems: purchasedProducts,
                discountAmount: chosenDiscAmount,
                discountCode: chosenCode,
                discountTitle: chosenTitle,
                taxRate,
                taxAmount,
                totalAmount: finalTotal,
                packageId: pkg?.id || appt.packageId,
                packageName: pkg?.name || appt.packageName,
              });

              if (activeVoucher) {
                markVoucherAsUsed(activeVoucher.code, appt.id);
              }

              openModal('invoiceModal', { 
                appointment: {
                  ...appt,
                  retail: retailAddon,
                  purchasedItems: purchasedProducts,
                  discountAmount: chosenDiscAmount,
                  discountCode: chosenCode,
                  discountTitle: chosenTitle,
                  taxRate,
                  taxAmount,
                  totalAmount: finalTotal,
                  packageId: pkg?.id || appt.packageId,
                  packageName: pkg?.name || appt.packageName,
                }, 
                retailAddon,
                purchasedItems: purchasedProducts,
                discountAmount: chosenDiscAmount,
                discountCode: chosenCode,
                discountTitle: chosenTitle,
                packageId: pkg?.id || appt.packageId,
                packageName: pkg?.name || appt.packageName,
              });
            }}
            className="btn-ghost text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 hover:bg-[#EAE7DC] text-[#173E39] cursor-pointer"
            title="Print Client Invoice / Receipt"
          >
            <Printer className="w-4 h-4 text-[#2E8A81]" />
            <span>Print Invoice</span>
          </button>

          {appt.status !== 'completed' && (
            <button
              onClick={handleComplete}
              className="btn-primary text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4" /> Complete & Checkout ({formatPrice(finalTotal)})
            </button>
          )}
          <button onClick={onClose} className="btn-ghost text-xs px-3 py-2 rounded-xl cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Client & Pet Form Modal
const ClientFormModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const { addClient, updateClient } = useApp();
  const existing = data?.client;

  const [name, setName] = useState(existing?.name || '');
  const [owner, setOwner] = useState(existing?.owner || '');
  const [phone, setPhone] = useState(existing?.phone || '555-0188');
  const [email, setEmail] = useState(existing?.email || 'client@mail.com');
  const [breed, setBreed] = useState(existing?.breed || 'Golden Retriever');
  const [size, setSize] = useState(existing?.size || 'medium');
  const [coat, setCoat] = useState(existing?.coat || 'Dense coat');
  const [freqWeeks, setFreqWeeks] = useState(existing?.freqWeeks || 6);
  const [rabiesExpiry, setRabiesExpiry] = useState(existing?.rabiesExpiry || '2027-01-15');
  const [lastCut, setLastCut] = useState(existing?.lastCut || '');
  const [sensitivities, setSensitivities] = useState(
    Array.isArray(existing?.sensitivities) 
      ? existing.sensitivities.join(', ') 
      : existing?.sensitivities || ''
  );
  const [allergies, setAllergies] = useState(existing?.allergies || '');
  const [careNotes, setCareNotes] = useState(existing?.careNotes || '');
  const [medicalNotes, setMedicalNotes] = useState(existing?.medicalNotes || '');
  const [behaviorNotesStr, setBehaviorNotesStr] = useState(
    Array.isArray(existing?.behaviorNotes)
      ? existing.behaviorNotes.join(', ')
      : existing?.behaviorNotes || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBehaviorNotes = behaviorNotesStr
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const clientPayload = {
      name,
      owner,
      phone,
      email,
      breed,
      size,
      coat,
      freqWeeks,
      rabiesExpiry,
      lastCut,
      sensitivities,
      allergies,
      careNotes,
      medicalNotes,
      behaviorNotes: parsedBehaviorNotes,
    };

    if (existing) {
      updateClient(existing.id, clientPayload);
    } else {
      addClient({
        ...clientPayload,
        staffId: 'st1',
        fav: 'sv1',
      });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <h3 className="font-display font-bold text-xl text-[#173E39]">
        {existing ? 'Edit Pet Record' : 'Add New Client & Pet'}
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-bold text-[#173E39]">Dog Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full mt-1 p-2 border rounded-xl" />
        </div>
        <div>
          <label className="font-bold text-[#173E39]">Owner Name</label>
          <input type="text" value={owner} onChange={(e) => setOwner(e.target.value)} required className="w-full mt-1 p-2 border rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-bold text-[#173E39]">Phone</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full mt-1 p-2 border rounded-xl" />
        </div>
        <div>
          <label className="font-bold text-[#173E39]">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full mt-1 p-2 border rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-bold text-[#173E39]">Dog Breed</label>
          <input type="text" value={breed} onChange={(e) => setBreed(e.target.value)} required className="w-full mt-1 p-2 border rounded-xl" />
        </div>
        <div>
          <label className="font-bold text-[#173E39]">Size</label>
          <select value={size} onChange={(e) => setSize(e.target.value as any)} className="w-full mt-1 p-2 border rounded-xl">
            <option value="toy">Toy (&lt;10 lbs)</option>
            <option value="small">Small (10-25 lbs)</option>
            <option value="medium">Medium (25-50 lbs)</option>
            <option value="large">Large (50-80 lbs)</option>
            <option value="giant">Giant (80+ lbs)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-bold text-[#173E39]">Cycle Frequency (Weeks)</label>
          <input type="number" value={freqWeeks} onChange={(e) => setFreqWeeks(parseInt(e.target.value))} className="w-full mt-1 p-2 border rounded-xl" />
        </div>
        <div>
          <label className="font-bold text-[#173E39]">Rabies Expiry Date</label>
          <input type="date" value={rabiesExpiry} onChange={(e) => setRabiesExpiry(e.target.value)} className="w-full mt-1 p-2 border rounded-xl" />
        </div>
      </div>

      <div>
        <label className="font-bold text-[#173E39]">Coat & Blade Cut Notes</label>
        <input type="text" value={lastCut} onChange={(e) => setLastCut(e.target.value)} placeholder="e.g. #4 body, teddy head" className="w-full mt-1 p-2 border rounded-xl" />
      </div>

      {/* Special Care & Sensitivities */}
      <div className="bg-[#FFF3EB] border border-[#FFD0B3] p-3 rounded-2xl space-y-2.5">
        <div className="font-bold text-[#541900] flex items-center gap-1.5">
          <span>🛡️ Pet Care, Sensitivities & Medical</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="font-bold text-[#541900] text-[11px]">Sensitivities (e.g. paws, ears)</label>
            <input 
              type="text" 
              value={sensitivities} 
              onChange={(e) => setSensitivities(e.target.value)} 
              placeholder="e.g. Sensitive paws, tail" 
              className="w-full mt-0.5 p-2 bg-white border border-[#FFD0B3] rounded-xl outline-none" 
            />
          </div>
          <div>
            <label className="font-bold text-[#541900] text-[11px]">Allergies (shampoos, scents)</label>
            <input 
              type="text" 
              value={allergies} 
              onChange={(e) => setAllergies(e.target.value)} 
              placeholder="e.g. Lavender shampoo allergy" 
              className="w-full mt-0.5 p-2 bg-white border border-[#FFD0B3] rounded-xl outline-none" 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="font-bold text-[#541900] text-[11px]">Care Instructions</label>
            <input 
              type="text" 
              value={careNotes} 
              onChange={(e) => setCareNotes(e.target.value)} 
              placeholder="e.g. Low heat dryer only" 
              className="w-full mt-0.5 p-2 bg-white border border-[#FFD0B3] rounded-xl outline-none" 
            />
          </div>
          <div>
            <label className="font-bold text-[#541900] text-[11px]">Medical Notes</label>
            <input 
              type="text" 
              value={medicalNotes} 
              onChange={(e) => setMedicalNotes(e.target.value)} 
              placeholder="e.g. Hip dysplasia, gentle handling" 
              className="w-full mt-0.5 p-2 bg-white border border-[#FFD0B3] rounded-xl outline-none" 
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-[#541900] text-[11px]">Behavioral Warnings (comma separated)</label>
          <input 
            type="text" 
            value={behaviorNotesStr} 
            onChange={(e) => setBehaviorNotesStr(e.target.value)} 
            placeholder="e.g. Table anxious, hates ear cleaning" 
            className="w-full mt-0.5 p-2 bg-white border border-[#FFD0B3] rounded-xl outline-none" 
          />
        </div>
      </div>

      <div className="pt-2 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
        <button type="submit" className="btn-primary text-xs px-5 py-2 rounded-xl font-bold">Save Pet Record</button>
      </div>
    </form>
  );
};

// 4. Client Grooming History Modal
const ClientHistoryModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const { appointments, services, packages, staff, settings, redemptions, openModal, formatPrice } = useApp();
  const client = data?.client;
  if (!client) return null;

  const history = appointments.filter((a) => a.clientId === client.id && a.status === 'completed');
  const vaxList = client.vaccinationSchedule || [];

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-[#E8E1D1] pb-2">
        <div>
          <h3 className="font-display font-bold text-xl text-[#240C0B]">
            Medical & Grooming Record — {client.name}
          </h3>
          <p className="text-[11px] text-[#A08E8B]">
            Owner: <strong className="text-[#240C0B]">{client.owner}</strong> • Shop: {settings.salonName || 'PawBook Studio'} ({settings.name || 'Owner'})
          </p>
        </div>
        <button
          onClick={() => openModal('vaccineScheduleForm', { clientId: client.id })}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#FF6B00] hover:bg-[#E55C00] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>+ Schedule Vaccine</span>
        </button>
      </div>

      {/* Vaccination Schedule Section */}
      <div className="bg-[#FFF8E7] border border-[#FFE7B3] p-3 rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#240C0B] flex items-center gap-1">
            <ShieldAlert className="w-4 h-4 text-[#FF6B00]" />
            <span>Vaccination Schedule & Immunizations</span>
          </span>
          <span className="text-[10px] text-[#A08E8B]">
            Rabies Expiry: <strong className="text-[#240C0B]">{client.rabiesExpiry}</strong>
          </span>
        </div>

        {vaxList.length === 0 ? (
          <p className="text-[#A08E8B] text-[11px] italic">No specific vaccine records attached yet.</p>
        ) : (
          <div className="space-y-1.5 pt-1">
            {vaxList.map((v: any) => (
              <div key={v.id} className="bg-white/80 p-2 rounded-xl border border-[#FFE7B3] flex justify-between items-center text-[11px]">
                <div>
                  <div className="font-bold text-[#240C0B]">{v.vaccineName}</div>
                  <div className="text-[#A08E8B]">Administered: {v.dateAdministered || 'N/A'} • Vet: {v.veterinarian || 'N/A'}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#FF6B00]">Due: {v.nextDueDate}</div>
                  {v.batchNo && <div className="text-[10px] text-[#A08E8B]">Lot #{v.batchNo}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grooming Sessions */}
      <div>
        <h4 className="font-bold text-[#240C0B] mb-2 text-sm">Grooming History ({history.length})</h4>
        {history.length === 0 ? (
          <p className="text-[#5C716C]">No prior completed grooming sessions recorded for this pet.</p>
        ) : (
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1 divide-y divide-[#D8D3C4]">
            {history.map((a) => {
              const inv = calculateAppointmentInvoice(a, { services, packages, settings, redemptions });
              const st = staff.find((s) => s.id === a.staffId);
              return (
                <div key={a.id} className="pt-2.5 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-[#240C0B]">
                      <span>{a.date} @ {a.start}</span>
                      <span className="text-[#FF6B00] font-black">{formatPrice(inv.totalAmount)}</span>
                      <span className="text-[10px] text-[#A08E8B] font-medium">(incl. {inv.taxRate}% tax)</span>
                    </div>
                    <div className="text-[#5C716C] mt-0.5">{inv.serviceOrPackageName} • Stylist: {st?.name || 'Assigned Stylist'}</div>
                    {a.notes && <div className="text-[#5C716C] italic mt-0.5">"{a.notes}"</div>}
                  </div>

                  <button
                    onClick={() => openModal('invoiceModal', { appointment: a })}
                    className="btn-ghost text-[11px] px-2.5 py-1 rounded-xl flex items-center gap-1 font-bold text-[#240C0B] shrink-0 hover:bg-[#EAE7DC]"
                    title="Print Invoice"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#FF6B00]" /> Invoice
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-2 flex justify-end">
        <button onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Close</button>
      </div>
    </div>
  );
};

// 5. Service Form Modal
const ServiceFormModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const { addService, updateService, staff } = useApp();
  const existing = data?.service;

  const [name, setName] = useState(existing?.name || '');
  const [category, setCategory] = useState(existing?.category || 'fullgroom');
  const [duration, setDuration] = useState(existing?.duration || 60);
  const [price, setPrice] = useState(existing?.price || 50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existing) {
      updateService(existing.id, { name, category, duration, price });
    } else {
      addService({ name, category, duration, price, buffer: 15, staffIds: staff.map((s) => s.id) });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <h3 className="font-display font-bold text-xl text-[#173E39]">{existing ? 'Edit Service' : 'Add New Service'}</h3>
      <div>
        <label className="font-bold text-[#173E39]">Service Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full mt-1 p-2 border rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-bold text-[#173E39]">Price ($)</label>
          <input type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} required className="w-full mt-1 p-2 border rounded-xl" />
        </div>
        <div>
          <label className="font-bold text-[#173E39]">Duration (mins)</label>
          <input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} required className="w-full mt-1 p-2 border rounded-xl" />
        </div>
      </div>
      <div className="pt-2 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
        <button type="submit" className="btn-primary text-xs px-5 py-2 rounded-xl font-bold">Save Service</button>
      </div>
    </form>
  );
};

// 6. Package Form Modal
const PackageFormModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addPackage, services } = useApp();
  const [name, setName] = useState('');
  const [price, setPrice] = useState(100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPackage({ name, serviceIds: [services[0]?.id || 'sv1'], price, duration: 120 });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <h3 className="font-display font-bold text-xl text-[#173E39]">Create Spa Package</h3>
      <div>
        <label className="font-bold text-[#173E39]">Package Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. The Deluxe Spa Bundle" className="w-full mt-1 p-2 border rounded-xl" />
      </div>
      <div>
        <label className="font-bold text-[#173E39]">Package Price ($)</label>
        <input type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} required className="w-full mt-1 p-2 border rounded-xl" />
      </div>
      <div className="pt-2 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
        <button type="submit" className="btn-primary text-xs px-5 py-2 rounded-xl font-bold">Save Package</button>
      </div>
    </form>
  );
};

// 7. Staff Form Modal
const StaffFormModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const { addStaff, updateStaff, services } = useApp();
  const existing = data?.staff;

  const [name, setName] = useState(existing?.name || '');
  const [role, setRole] = useState(existing?.role || 'Senior Stylist');
  const [commission, setCommission] = useState(existing?.commission ?? 45);
  const [salary, setSalary] = useState(existing?.salary ?? 0);
  const [color, setColor] = useState(existing?.color || '#2E8A81');
  const [selectedServices, setSelectedServices] = useState<string[]>(
    existing?.services || services.map((s) => s.id)
  );

  const defaultAvail: Record<number, [number, number] | null> = {
    1: [8, 17],
    2: [8, 17],
    3: [8, 17],
    4: [8, 18],
    5: [8, 17],
    6: [9, 15],
    0: null,
  };

  const [avail, setAvail] = useState<Record<number, [number, number] | null>>(
    existing?.avail ? { ...existing.avail } : defaultAvail
  );

  const colorSwatches = [
    '#2E8A81', // Teal
    '#E8734A', // Coral
    '#8B6D9C', // Purple
    '#5E90A8', // Slate Blue
    '#D97706', // Amber
    '#059669', // Emerald
    '#D946EF', // Fuchsia
  ];

  const daysList = [
    { idx: 1, label: 'Mon' },
    { idx: 2, label: 'Tue' },
    { idx: 3, label: 'Wed' },
    { idx: 4, label: 'Thu' },
    { idx: 5, label: 'Fri' },
    { idx: 6, label: 'Sat' },
    { idx: 0, label: 'Sun' },
  ];

  const handleDayToggle = (idx: number) => {
    setAvail((prev) => {
      const copy = { ...prev };
      if (copy[idx]) {
        copy[idx] = null;
      } else {
        copy[idx] = [8, 17];
      }
      return copy;
    });
  };

  const handleHourChange = (idx: number, startOrEnd: 'start' | 'end', val: number) => {
    setAvail((prev) => {
      const copy = { ...prev };
      const current = copy[idx] || [8, 17];
      if (startOrEnd === 'start') {
        copy[idx] = [val, current[1]];
      } else {
        copy[idx] = [current[0], val];
      }
      return copy;
    });
  };

  const handleServiceToggle = (svcId: string) => {
    setSelectedServices((prev) =>
      prev.includes(svcId) ? prev.filter((id) => id !== svcId) : [...prev, svcId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existing) {
      updateStaff(existing.id, {
        name,
        role,
        commission,
        salary,
        color,
        services: selectedServices,
        avail,
      });
    } else {
      addStaff({
        name,
        role,
        commission,
        salary,
        color,
        services: selectedServices,
        avail,
      });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs max-h-[85vh] overflow-y-auto pr-1">
      <h3 className="font-display font-bold text-xl text-[#173E39] border-b pb-2">
        {existing ? 'Edit Groomer Profile' : 'Add Groomer Stylist'}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-bold text-[#173E39]">Groomer Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full mt-1 p-2 border border-[#D8D3C4] rounded-xl font-medium focus:border-[#2E8A81] outline-none"
            placeholder="e.g. Alex Morgan"
          />
        </div>

        <div>
          <label className="font-bold text-[#173E39]">Role / Title</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="w-full mt-1 p-2 border border-[#D8D3C4] rounded-xl font-medium focus:border-[#2E8A81] outline-none"
            placeholder="e.g. Lead Groomer & Bather"
          />
        </div>

        <div>
          <label className="font-bold text-[#173E39]">Commission Rate (%)</label>
          <input
            type="number"
            value={commission}
            onChange={(e) => setCommission(parseInt(e.target.value) || 0)}
            required
            min={0}
            max={100}
            className="w-full mt-1 p-2 border border-[#D8D3C4] rounded-xl font-medium focus:border-[#2E8A81] outline-none"
          />
        </div>

        <div>
          <label className="font-bold text-[#173E39]">Base Monthly Salary ($)</label>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
            min={0}
            className="w-full mt-1 p-2 border border-[#D8D3C4] rounded-xl font-medium focus:border-[#2E8A81] outline-none"
          />
        </div>
      </div>

      {/* Theme Avatar Color */}
      <div>
        <label className="font-bold text-[#173E39] block mb-1">Groomer Theme Color</label>
        <div className="flex items-center gap-2">
          {colorSwatches.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-xl transition-all border-2 ${
                color === c ? 'border-[#173E39] scale-110 shadow-sm' : 'border-transparent opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Qualified Services Selection */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="font-bold text-[#173E39]">Qualified Services ({selectedServices.length}/{services.length})</label>
          <button
            type="button"
            onClick={() => {
              if (selectedServices.length === services.length) {
                setSelectedServices([]);
              } else {
                setSelectedServices(services.map((s) => s.id));
              }
            }}
            className="text-[11px] font-bold text-[#2E8A81] hover:underline"
          >
            {selectedServices.length === services.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#F1EEE6]/60 p-2.5 rounded-xl border border-[#D8D3C4]/60 max-h-32 overflow-y-auto">
          {services.map((s) => {
            const isChecked = selectedServices.includes(s.id);
            return (
              <label key={s.id} className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleServiceToggle(s.id)}
                  className="rounded text-[#2E8A81] focus:ring-0"
                />
                <span className="truncate">{s.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Weekly Operating Hours / Schedule */}
      <div>
        <label className="font-bold text-[#173E39] block mb-1">Weekly Groomer Schedule</label>
        <div className="space-y-1.5 bg-[#F1EEE6]/60 p-2.5 rounded-xl border border-[#D8D3C4]/60">
          {daysList.map(({ idx, label }) => {
            const daySlot = avail[idx];
            const isWorking = !!daySlot;
            return (
              <div key={idx} className="flex items-center justify-between gap-2 text-[11px]">
                <label className="flex items-center gap-1.5 min-w-[70px] cursor-pointer font-bold text-[#173E39]">
                  <input
                    type="checkbox"
                    checked={isWorking}
                    onChange={() => handleDayToggle(idx)}
                    className="rounded text-[#2E8A81]"
                  />
                  <span>{label}</span>
                </label>

                {isWorking && daySlot ? (
                  <div className="flex items-center gap-1.5">
                    <select
                      value={daySlot[0]}
                      onChange={(e) => handleHourChange(idx, 'start', parseInt(e.target.value))}
                      className="p-1 border border-[#D8D3C4] rounded-lg bg-white"
                    >
                      {[6, 7, 8, 9, 10, 11, 12].map((h) => (
                        <option key={h} value={h}>{h === 12 ? '12 PM' : `${h} AM`}</option>
                      ))}
                    </select>
                    <span className="text-[#5C716C]">to</span>
                    <select
                      value={daySlot[1]}
                      onChange={(e) => handleHourChange(idx, 'end', parseInt(e.target.value))}
                      className="p-1 border border-[#D8D3C4] rounded-lg bg-white"
                    >
                      {[13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((h) => (
                        <option key={h} value={h}>{h > 12 ? `${h - 12} PM` : '12 PM'}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="text-[#5C716C] italic text-[10px]">Off / Not Available</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2 flex justify-end gap-2 border-t border-[#D8D3C4]">
        <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">
          Cancel
        </button>
        <button type="submit" className="btn-primary text-xs px-5 py-2 rounded-xl font-bold shadow-sm">
          Save Groomer Profile
        </button>
      </div>
    </form>
  );
};

// 8. Inventory Form Modal
const InventoryFormModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const { addInventoryItem, updateInventoryItem } = useApp();
  const existing = data?.item;

  const [name, setName] = useState(existing?.name || '');
  const [price, setPrice] = useState(existing?.price || 15);
  const [cost, setCost] = useState(existing?.cost || 6);
  const [stock, setStock] = useState(existing?.stock || 10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existing) {
      updateInventoryItem(existing.id, { name, price, cost, stock });
    } else {
      addInventoryItem({ name, price, cost, stock, lowAt: 5 });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <h3 className="font-display font-bold text-xl text-[#173E39]">{existing ? 'Edit Product' : 'Add Product'}</h3>
      <div>
        <label className="font-bold text-[#173E39]">Product Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full mt-1 p-2 border rounded-xl" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="font-bold text-[#173E39]">Price ($)</label>
          <input type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} required className="w-full mt-1 p-2 border rounded-xl" />
        </div>
        <div>
          <label className="font-bold text-[#173E39]">Cost ($)</label>
          <input type="number" value={cost} onChange={(e) => setCost(parseFloat(e.target.value))} required className="w-full mt-1 p-2 border rounded-xl" />
        </div>
        <div>
          <label className="font-bold text-[#173E39]">Stock Qty</label>
          <input type="number" value={stock} onChange={(e) => setStock(parseInt(e.target.value))} required className="w-full mt-1 p-2 border rounded-xl" />
        </div>
      </div>
      <div className="pt-2 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
        <button type="submit" className="btn-primary text-xs px-5 py-2 rounded-xl font-bold">Save Product</button>
      </div>
    </form>
  );
};

// 9. Gift Card Form Modal
const GiftCardFormModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addGiftCard } = useApp();
  const [code, setCode] = useState('GC-PAWS' + Math.floor(10 + Math.random() * 90));
  const [amount, setAmount] = useState(50);
  const [note, setNote] = useState('Gift voucher');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addGiftCard({ code, amount, balance: amount, note });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <h3 className="font-display font-bold text-xl text-[#173E39]">Issue Gift Card</h3>
      <div>
        <label className="font-bold text-[#173E39]">Voucher Code</label>
        <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required className="w-full mt-1 p-2 border rounded-xl font-mono font-bold" />
      </div>
      <div>
        <label className="font-bold text-[#173E39]">Amount ($)</label>
        <input type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value))} required className="w-full mt-1 p-2 border rounded-xl" />
      </div>
      <div>
        <label className="font-bold text-[#173E39]">Note</label>
        <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="w-full mt-1 p-2 border rounded-xl" />
      </div>
      <div className="pt-2 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
        <button type="submit" className="btn-primary text-xs px-5 py-2 rounded-xl font-bold">Issue Voucher</button>
      </div>
    </form>
  );
};

// 10. Expense Form Modal
const ExpenseFormModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addExpense } = useApp();
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState<number>(45);
  const [category, setCategory] = useState<'supplies' | 'equipment' | 'vehicle' | 'insurance' | 'marketing' | 'other'>('supplies');
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) return;
    addExpense({ desc: desc.trim(), amount: Number(amount) || 0, category, date: date || new Date().toISOString().slice(0, 10) });
    onClose();
  };

  const setPresetDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setDate(d.toISOString().slice(0, 10));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-[#D8D3C4]/60 pb-3">
        <div>
          <h3 className="font-display font-black text-xl text-[#173E39]">Log Studio Expense</h3>
          <p className="text-[#5C716C] text-[11px] mt-0.5">Record salon overhead, inventory purchases, or operational costs for any specific date</p>
        </div>
        <div className="p-2 rounded-2xl bg-[#FEF2F2] text-[#C9503A]">
          <DollarSign className="w-5 h-5" />
        </div>
      </div>

      <div>
        <label className="font-bold text-[#173E39] block mb-1">Expense Description *</label>
        <input 
          type="text" 
          value={desc} 
          onChange={(e) => setDesc(e.target.value)} 
          required 
          placeholder="e.g. Organic Oatmeal Shampoo 5L Restock, Scissor Sharpening" 
          className="w-full p-2.5 bg-white border border-[#D8D3C4] rounded-xl text-xs focus:border-[#173E39] outline-none" 
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-bold text-[#173E39] block mb-1">Amount ($) *</label>
          <input 
            type="number" 
            step="0.01"
            min="0"
            value={amount} 
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} 
            required 
            className="w-full p-2.5 bg-white border border-[#D8D3C4] rounded-xl text-xs font-bold text-[#C9503A] focus:border-[#173E39] outline-none" 
          />
        </div>
        <div>
          <label className="font-bold text-[#173E39] block mb-1">Cost Category</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value as any)} 
            className="w-full p-2.5 bg-white border border-[#D8D3C4] rounded-xl text-xs font-medium focus:border-[#173E39] outline-none"
          >
            <option value="supplies">🧴 Supplies & Shampoos</option>
            <option value="equipment">✂️ Equipment & Blades</option>
            <option value="vehicle">🚐 Vehicle / Mobile Van</option>
            <option value="insurance">🛡️ Insurance & Permits</option>
            <option value="marketing">📣 Marketing & Promos</option>
            <option value="other">📦 Other Studio Overhead</option>
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="font-bold text-[#173E39]">Expense Date *</label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPresetDate(0)}
              className={`px-2 py-0.5 text-[10px] rounded-lg font-bold transition-all cursor-pointer ${
                date === new Date().toISOString().slice(0, 10)
                  ? 'bg-[#173E39] text-white'
                  : 'bg-[#EAE7DC] text-[#5C716C] hover:text-[#173E39]'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setPresetDate(1)}
              className="px-2 py-0.5 text-[10px] rounded-lg font-bold bg-[#EAE7DC] text-[#5C716C] hover:text-[#173E39] transition-all cursor-pointer"
            >
              Yesterday
            </button>
          </div>
        </div>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          required 
          className="w-full p-2.5 bg-white border border-[#D8D3C4] rounded-xl text-xs font-semibold text-[#173E39] focus:border-[#173E39] outline-none" 
        />
      </div>

      <div className="pt-3 border-t border-[#D8D3C4]/60 flex items-center justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
        <button type="submit" className="btn-primary text-xs px-5 py-2.5 rounded-xl font-bold shadow-md cursor-pointer">
          Record Expense
        </button>
      </div>
    </form>
  );
};

// 11. Waitlist Form Modal
const WaitlistFormModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addWaitlist, clients, services } = useApp();
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  const [pref, setPref] = useState('Weekday morning preferred');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addWaitlist({ clientId, serviceId, staffId: '', pref });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <h3 className="font-display font-bold text-xl text-[#173E39]">Add to Waitlist</h3>
      <div>
        <label className="font-bold text-[#173E39]">Select Client & Pet</label>
        <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-full mt-1 p-2 border rounded-xl">
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.breed})</option>)}
        </select>
      </div>
      <div>
        <label className="font-bold text-[#173E39]">Preferred Service</label>
        <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="w-full mt-1 p-2 border rounded-xl">
          {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div>
        <label className="font-bold text-[#173E39]">Preference / Schedule Note</label>
        <input type="text" value={pref} onChange={(e) => setPref(e.target.value)} className="w-full mt-1 p-2 border rounded-xl" />
      </div>
      <div className="pt-2 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
        <button type="submit" className="btn-primary text-xs px-5 py-2 rounded-xl font-bold">Add to Waitlist</button>
      </div>
    </form>
  );
};

// 12. Transformation Gallery Form Modal (Dual Real Image Upload: Before & After)
const TransformationFormModal: React.FC<{ data?: any; onClose: () => void }> = ({ data, onClose }) => {
  const { addTransformation, staff, clients, services, showToast } = useApp();
  
  const [selectedClientId, setSelectedClientId] = useState<string>(data?.clientId || '');
  const [petName, setPetName] = useState(data?.petName || '');
  const [breed, setBreed] = useState(data?.breed || 'Cockapoo');
  const [ownerName, setOwnerName] = useState(data?.ownerName || '');
  const [serviceName, setServiceName] = useState(data?.serviceName || 'Full Grooming & Spa Treatment');
  const [groomerName, setGroomerName] = useState(data?.groomerName || staff[0]?.name || 'Dani Brooks');
  const [styleNotes, setStyleNotes] = useState(data?.styleNotes || '#4F body cut, scissored teddy bear head, fluffy legs & clean sanitary trim');
  const [date, setDate] = useState(data?.date || new Date().toISOString().split('T')[0]);

  // Dual Image states (Data URL or Image URL)
  const [beforeImg, setBeforeImg] = useState<string>(
    data?.beforeImg || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'
  );
  const [afterImg, setAfterImg] = useState<string>(
    data?.afterImg || 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80'
  );

  // Handle client selection change to auto-fill
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    if (!clientId) return;
    const cl = clients.find(c => c.id === clientId);
    if (cl) {
      setPetName(cl.name);
      setBreed(cl.breed);
      setOwnerName(cl.owner);
      if (cl.lastCut) {
        setStyleNotes(cl.lastCut);
      }
    }
  };

  // Convert uploaded file to base64 DataURL
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP)', 'error');
      return;
    }

    try {
      const compressed = await compressImageFile(file, 600, 600, 0.75);
      if (target === 'before') {
        setBeforeImg(compressed);
        showToast('Uploaded & optimized Before Transformation photo!', 'success');
      } else {
        setAfterImg(compressed);
        showToast('Uploaded & optimized After Groom photo!', 'success');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      showToast('Could not process selected image', 'error');
    }
  };

  // Realistic Pre-packaged Dog Transformation Presets
  const PRESETS = [
    {
      name: 'Cockapoo Teddy Cut',
      breed: 'Cockapoo',
      before: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
      after: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
      notes: '#4F body, round teddy bear scissored face, fluffy bevelled paws',
    },
    {
      name: 'Shih Tzu Topknot & Silk',
      breed: 'Shih Tzu',
      before: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80',
      after: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80',
      notes: '#7 body, hand-blended face, red silk ribbon topknot, ear fringe tidy',
    },
    {
      name: 'Golden Retriever De-shed',
      breed: 'Golden Retriever',
      before: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
      after: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=600&q=80',
      notes: 'High-velocity undercoat blowout, foot feather trimming, coat conditioning',
    },
    {
      name: 'Frenchie Skin & Fold Spa',
      breed: 'French Bulldog',
      before: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
      after: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&w=600&q=80',
      notes: 'Hypoallergenic fold treatment, organic nose balm, dremel nail grind',
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName || !ownerName) {
      showToast('Please provide the pet name and owner name', 'error');
      return;
    }
    addTransformation({
      petName,
      breed,
      ownerName,
      serviceName,
      date,
      groomerName,
      styleNotes,
      beforeImg,
      afterImg,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {/* Modal Header */}
      <div className="border-b border-[#E6DFD5] pb-3 flex items-start justify-between">
        <div>
          <h3 className="font-display font-black text-xl sm:text-2xl text-[#240C0B] flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#FF6B00]" />
            <span>Upload Dog Transformation</span>
          </h3>
          <p className="text-xs text-[#6E5B58] mt-0.5">
            Upload genuine Before and After dog grooming photos to showcase real styling craftsmanship.
          </p>
        </div>
      </div>

      {/* Dual Image Upload Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-bold text-xs text-[#240C0B] flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-[#FF6B00]" />
            <span>Transformation Photos (Before & After)</span>
          </label>
          <span className="text-[11px] text-[#A08E8B]">Click or Drag & Drop to Upload</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. BEFORE Transformation Box */}
          <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border-2 border-dashed border-[#D8D3C4] hover:border-[#FF6B00] transition-all space-y-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-[#240C0B] text-white">
                1. Before Grooming
              </span>
              <label className="text-[11px] text-[#FF6B00] hover:underline font-bold cursor-pointer flex items-center gap-1">
                <Upload className="w-3 h-3" /> Change File
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileUpload(e, 'before')} 
                  className="hidden" 
                />
              </label>
            </div>

            <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-[#EAE7DC] border border-[#D8D3C4] group">
              {beforeImg ? (
                <>
                  <img 
                    src={beforeImg} 
                    alt="Before grooming" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="px-3 py-1.5 bg-white text-[#240C0B] text-xs font-extrabold rounded-lg shadow-md cursor-pointer flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5 text-[#FF6B00]" /> Replace Photo
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, 'before')} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center p-4 cursor-pointer text-center text-[#7A6865]">
                  <Upload className="w-8 h-8 text-[#A08E8B] mb-2" />
                  <span className="font-bold text-xs text-[#240C0B]">Upload Before Photo</span>
                  <span className="text-[10px] text-[#A08E8B] mt-0.5">Supports PNG, JPG, WebP</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload(e, 'before')} 
                    className="hidden" 
                  />
                </label>
              )}
            </div>

            <input 
              type="text" 
              placeholder="Or paste image URL..." 
              value={beforeImg} 
              onChange={(e) => setBeforeImg(e.target.value)} 
              className="w-full text-[11px] p-2 bg-white border border-[#D8D3C4] rounded-lg outline-none"
            />
          </div>

          {/* 2. AFTER Transformation Box */}
          <div className="p-3.5 bg-[#F4F9F6] rounded-2xl border-2 border-dashed border-[#A7F3D0] hover:border-[#059669] transition-all space-y-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-[#059669] text-white">
                2. After Transformation
              </span>
              <label className="text-[11px] text-[#059669] hover:underline font-bold cursor-pointer flex items-center gap-1">
                <Upload className="w-3 h-3" /> Change File
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileUpload(e, 'after')} 
                  className="hidden" 
                />
              </label>
            </div>

            <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-[#D1FAE5] border border-[#A7F3D0] group">
              {afterImg ? (
                <>
                  <img 
                    src={afterImg} 
                    alt="After grooming" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="px-3 py-1.5 bg-white text-[#240C0B] text-xs font-extrabold rounded-lg shadow-md cursor-pointer flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5 text-[#059669]" /> Replace Photo
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, 'after')} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center p-4 cursor-pointer text-center text-[#065F46]">
                  <Upload className="w-8 h-8 text-[#059669] mb-2" />
                  <span className="font-bold text-xs text-[#065F46]">Upload After Photo</span>
                  <span className="text-[10px] text-[#059669]/70 mt-0.5">Supports PNG, JPG, WebP</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileUpload(e, 'after')} 
                    className="hidden" 
                  />
                </label>
              )}
            </div>

            <input 
              type="text" 
              placeholder="Or paste image URL..." 
              value={afterImg} 
              onChange={(e) => setAfterImg(e.target.value)} 
              className="w-full text-[11px] p-2 bg-white border border-[#A7F3D0] rounded-lg outline-none"
            />
          </div>
        </div>

        {/* Quick Transformation Sample Presets */}
        <div className="pt-1">
          <span className="text-[10px] font-bold text-[#6E5B58] block mb-1">Quick Realistic Dog Presets:</span>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  setBreed(p.breed);
                  setBeforeImg(p.before);
                  setAfterImg(p.after);
                  setStyleNotes(p.notes);
                }}
                className="px-2.5 py-1 bg-white hover:bg-[#FAF8F5] border border-[#D8D3C4] rounded-lg text-[10px] font-bold text-[#240C0B] transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>🐕 {p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pet & Owner Information */}
      <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E6DFD5] space-y-3">
        <div>
          <label className="font-bold text-[#240C0B] block mb-1">Select Registered Dog (Optional)</label>
          <select 
            value={selectedClientId} 
            onChange={(e) => handleClientSelect(e.target.value)}
            className="w-full p-2 bg-white border border-[#D8D3C4] rounded-xl text-xs outline-none font-bold"
          >
            <option value="">-- Choose from Registered Clients or Enter Below --</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.breed}) • Owner: {c.owner}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="font-bold text-[#240C0B] block mb-0.5">Pet Name</label>
            <input 
              type="text" 
              value={petName} 
              onChange={(e) => setPetName(e.target.value)} 
              placeholder="e.g. Bella" 
              required 
              className="w-full p-2 bg-white border border-[#D8D3C4] rounded-xl text-xs outline-none" 
            />
          </div>
          <div>
            <label className="font-bold text-[#240C0B] block mb-0.5">Breed</label>
            <input 
              type="text" 
              value={breed} 
              onChange={(e) => setBreed(e.target.value)} 
              placeholder="e.g. Cockapoo" 
              required 
              className="w-full p-2 bg-white border border-[#D8D3C4] rounded-xl text-xs outline-none" 
            />
          </div>
          <div>
            <label className="font-bold text-[#240C0B] block mb-0.5">Owner Name</label>
            <input 
              type="text" 
              value={ownerName} 
              onChange={(e) => setOwnerName(e.target.value)} 
              placeholder="e.g. Emma Clark" 
              required 
              className="w-full p-2 bg-white border border-[#D8D3C4] rounded-xl text-xs outline-none" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="font-bold text-[#240C0B] block mb-0.5">Groomer / Stylist</label>
            <select 
              value={groomerName} 
              onChange={(e) => setGroomerName(e.target.value)} 
              className="w-full p-2 bg-white border border-[#D8D3C4] rounded-xl text-xs outline-none font-bold"
            >
              {staff.map((s) => (
                <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-bold text-[#240C0B] block mb-0.5">Service Treatment</label>
            <select 
              value={serviceName} 
              onChange={(e) => setServiceName(e.target.value)} 
              className="w-full p-2 bg-white border border-[#D8D3C4] rounded-xl text-xs outline-none"
            >
              {services.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-bold text-[#240C0B] block mb-0.5">Date Completed</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="w-full p-2 bg-white border border-[#D8D3C4] rounded-xl text-xs outline-none font-bold" 
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-[#240C0B] block mb-0.5">Style Cut & Blade Length Notes</label>
          <textarea 
            value={styleNotes} 
            onChange={(e) => setStyleNotes(e.target.value)} 
            placeholder="e.g. #4F reverse body, hand-scissored teddy bear head, round paws, berry facial wash..." 
            rows={2} 
            className="w-full p-2 bg-white border border-[#D8D3C4] rounded-xl text-xs outline-none" 
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex justify-end gap-2 border-t border-[#E6DFD5]">
        <button 
          type="button" 
          onClick={onClose} 
          className="btn-ghost text-xs px-4 py-2.5 rounded-xl font-bold cursor-pointer"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn-primary text-xs px-6 py-2.5 rounded-xl font-black shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>Publish Dog Transformation</span>
        </button>
      </div>
    </form>
  );
};

// 13. Redeem Points & Promo Code Modal
const RedeemModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const { clients, redeemPoints, createPromoCode, showToast, formatPrice } = useApp();
  const reward = data?.reward || { title: '$10 Off Next Groom', pts: 100 };
  const [selectedClientId, setSelectedClientId] = useState(data?.client?.id || clients[0]?.id || '');
  const [mode, setMode] = useState<'points' | 'custom'>(data?.mode || 'points');
  const [customTitle, setCustomTitle] = useState('15% Off Grooming Voucher');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [autoApplyInCheckout, setAutoApplyInCheckout] = useState(true);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const client = clients.find((c) => c.id === selectedClientId);
  const clientPoints = client?.points || 0;
  const canRedeem = mode === 'custom' || clientPoints >= reward.pts;

  const handleRedeem = () => {
    if (!client) return;
    if (mode === 'points') {
      const code = redeemPoints(client.id, reward.title, reward.pts, autoApplyInCheckout);
      if (code) {
        setGeneratedCode(code);
      }
    } else {
      const created = createPromoCode(
        client.id,
        customTitle,
        discountType,
        discountValue,
        0,
        autoApplyInCheckout
      );
      if (created) {
        setGeneratedCode(created.code);
        showToast(`Promo code ${created.code} created for ${client.name}!`, 'success');
      }
    }
  };

  const handleCopy = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      showToast(`Copied voucher code ${generatedCode}!`, 'success');
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <h3 className="font-display font-bold text-xl text-[#173E39]">
            {generatedCode ? '🎉 Promo / Reward Code Issued!' : 'Client Promo & Loyalty Rewards'}
          </h3>
          <p className="text-[11px] text-[#5C716C]">
            Create client/dog-specific promo codes and redeem loyalty points
          </p>
        </div>
      </div>

      {!generatedCode ? (
        <>
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-[#F1EEE6] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('points')}
              className={`py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                mode === 'points'
                  ? 'bg-white text-[#173E39] shadow-xs'
                  : 'text-[#7A6865] hover:text-[#173E39]'
              }`}
            >
              Redeem Catalog Reward
            </button>
            <button
              type="button"
              onClick={() => setMode('custom')}
              className={`py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                mode === 'custom'
                  ? 'bg-white text-[#173E39] shadow-xs'
                  : 'text-[#7A6865] hover:text-[#173E39]'
              }`}
            >
              + Create Custom Promo Code
            </button>
          </div>

          <div>
            <label className="font-bold text-[#173E39]">Select Target Pet & Client</label>
            <select 
              value={selectedClientId} 
              onChange={(e) => setSelectedClientId(e.target.value)} 
              className="w-full mt-1 p-2.5 border border-[#D8D3C4] rounded-xl font-bold bg-white outline-none"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  🐾 {c.name} ({c.owner}) — {c.points || 0} pts available
                </option>
              ))}
            </select>
          </div>

          {mode === 'points' ? (
            <div className="bg-[#FFFBEB] p-3.5 rounded-2xl border border-[#E7A93C]/40 space-y-1">
              <div className="font-bold text-sm text-[#173E39]">{reward.title}</div>
              <div className="text-[#C98A22] font-bold">{reward.pts} Points Required</div>
              {!canRedeem && (
                <div className="p-2 bg-[#FEF2F2] border border-[#E7C0B5] text-[#991B1B] rounded-xl font-bold text-[11px] mt-2">
                  ⚠️ Not enough points. {client?.name} has {clientPoints} points, but {reward.pts} points are required.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#D8D3C4]">
              <div>
                <label className="font-bold text-[#173E39]">Promo Title / Description</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full mt-1 p-2 border border-[#D8D3C4] rounded-xl bg-white text-xs font-semibold"
                  placeholder="e.g. 15% VIP Fall Grooming"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#173E39]">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percent' | 'fixed')}
                    className="w-full mt-1 p-2 border border-[#D8D3C4] rounded-xl bg-white font-bold"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Dollar ($)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#173E39]">
                    Discount Value ({discountType === 'percent' ? '%' : '$'})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={discountType === 'percent' ? 100 : 500}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 p-2 border border-[#D8D3C4] rounded-xl bg-white font-bold text-center"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Set to Applied in Checkout Checkbox */}
          <div className="p-3 bg-[#E1F0E7]/60 border border-[#357A54]/30 rounded-xl flex items-start gap-2.5">
            <input
              type="checkbox"
              id="autoApplyInCheckout"
              checked={autoApplyInCheckout}
              onChange={(e) => setAutoApplyInCheckout(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#2E8A81] focus:ring-[#2E8A81]"
            />
            <label htmlFor="autoApplyInCheckout" className="cursor-pointer">
              <span className="font-bold text-[#173E39] block">
                Set to "Applied" in checkout
              </span>
              <span className="text-[11px] text-[#5C716C] block">
                When checking out {client?.name || 'this pet'}, this promo code will be automatically selected and applied to the invoice.
              </span>
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
            <button 
              onClick={handleRedeem} 
              disabled={!canRedeem}
              className="btn-primary text-xs px-5 py-2 rounded-xl font-bold disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {mode === 'points' ? 'Confirm Redemption & Issue Promo' : 'Create & Apply Promo Code'}
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-3 pt-1">
          <div className="bg-[#E1F0E7] border border-[#357A54]/40 p-4 rounded-2xl text-center space-y-2">
            <p className="text-xs font-bold text-[#1E5638]">
              Promo code successfully created & linked to {client?.name}!
            </p>
            <div className="text-2xl font-mono font-black tracking-widest text-[#173E39] bg-white p-2.5 rounded-xl border border-[#D8D3C4] inline-block shadow-xs">
              {generatedCode}
            </div>
            {autoApplyInCheckout && (
              <div className="inline-block bg-[#10B981] text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ✓ Set to APPLIED in checkout
              </div>
            )}
            <p className="text-[11px] text-[#2E8A81] font-semibold">
              This promo code will only show and apply during checkout for {client?.name} ({client?.owner}).
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Close</button>
            <button 
              onClick={handleCopy} 
              className="btn-primary text-xs px-5 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Code & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 14. Send Reminder Modal
const ReminderModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const { showToast } = useApp();
  const client = data?.client;
  const alertType = data?.alertType || 'overdue';

  const [msg, setMsg] = useState(
    alertType === 'vaccine'
      ? `Hi ${client?.owner}, Rabies vaccine record for ${client?.name} is due/expired. Please send updated record before your next groom!`
      : `Hi ${client?.owner}, ${client?.name} is due for their recurring grooming session at Bubbles & Barks! Reply to book or tap link.`
  );

  const handleSend = () => {
    showToast(`Automated ${alertType} reminder sent to ${client?.owner} (${client?.phone})!`, 'success');
    onClose();
  };

  return (
    <div className="space-y-4 text-xs">
      <h3 className="font-display font-bold text-xl text-[#173E39]">Send Client SMS Reminder</h3>
      <p className="text-[#5C716C]">To: {client?.owner} ({client?.phone})</p>
      <textarea value={msg} onChange={(e) => setMsg(e.target.value)} className="w-full p-2.5 border rounded-xl h-24 text-xs" />
      <div className="pt-2 flex justify-end gap-2">
        <button onClick={onClose} className="btn-ghost text-xs px-4 py-2 rounded-xl">Cancel</button>
        <button onClick={handleSend} className="btn-primary text-xs px-5 py-2 rounded-xl font-bold flex items-center gap-1">
          <Send className="w-3.5 h-3.5" /> Send Reminder
        </button>
      </div>
    </div>
  );
};

// 15. Generic Confirm Modal
const ConfirmModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const handleConfirm = () => {
    if (data?.onConfirm) {
      data.onConfirm();
    }
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-[#C9503A]">
        <div className="p-3 bg-[#FEF2F2] rounded-2xl">
          <Trash2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-display font-bold text-xl text-[#173E39]">
            {data?.title || 'Confirm Action'}
          </h3>
          <p className="text-xs text-[#5C716C] mt-0.5">
            Please confirm your action below.
          </p>
        </div>
      </div>

      <div className="bg-[#F1EEE6] p-3.5 rounded-2xl text-xs text-[#173E39] font-medium leading-relaxed border border-[#D8D3C4]">
        {data?.message || 'Are you sure you want to proceed with this deletion?'}
      </div>

      <div className="pt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="btn-ghost text-xs px-4 py-2 rounded-xl"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="bg-[#C9503A] hover:bg-[#B03E29] text-white font-bold text-xs px-5 py-2 rounded-xl shadow-sm transition-all"
        >
          {data?.confirmLabel || 'Delete'}
        </button>
      </div>
    </div>
  );
};

// Standalone print and PDF styling sheet for popup windows & downloads
const STANDALONE_PRINT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700;800;900&family=Nunito+Sans:wght@400;500;600;700;800;900&display=swap');
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  @page {
    size: A4 portrait;
    margin: 4mm 6mm;
  }

  html, body {
    font-family: "Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #240C0B;
    background: #ffffff !important;
    background-color: #ffffff !important;
    padding: 0;
    margin: 0 auto;
    width: 100%;
    max-width: 100%;
    line-height: 1.45;
    font-size: 12px;
    border: none !important;
    box-shadow: none !important;
  }

  h1, h2, h3, h4, .font-display {
    font-family: "Fredoka", "Nunito Sans", sans-serif;
  }

  .no-print { display: none !important; }

  /* Layout Primitives */
  .flex { display: flex !important; }
  .flex-col { flex-direction: column !important; }
  .flex-row { flex-direction: row !important; }
  .justify-between { justify-content: space-between !important; }
  .justify-end { justify-content: flex-end !important; }
  .items-start { align-items: flex-start !important; }
  .items-center { align-items: center !important; }
  .items-baseline { align-items: baseline !important; }
  .shrink-0 { flex-shrink: 0 !important; }
  .min-w-0 { min-width: 0 !important; }
  .flex-1 { flex: 1 1 0% !important; }
  .w-full { width: 100% !important; }
  .max-w-\\[62\\%\\] { max-width: 62% !important; }
  .max-w-\\[60\\%\\] { max-width: 60% !important; }

  .grid { display: flex !important; flex-wrap: wrap !important; gap: 16px !important; }
  .grid-cols-1 { width: 100% !important; }
  .grid-cols-2 > div, .grid-cols-1 > div { flex: 1 1 calc(50% - 16px) !important; min-width: 220px !important; }
  
  .gap-1 { gap: 4px !important; }
  .gap-1\\.5 { gap: 6px !important; }
  .gap-2 { gap: 8px !important; }
  .gap-2\\.5 { gap: 10px !important; }
  .gap-3 { gap: 12px !important; }
  .gap-3\\.5 { gap: 14px !important; }
  .gap-4 { gap: 16px !important; }
  .gap-5 { gap: 20px !important; }
  .gap-6 { gap: 24px !important; }
  .gap-8 { gap: 32px !important; }

  .block { display: block !important; }
  .inline-block { display: inline-block !important; }
  .inline-flex { display: inline-flex !important; }

  .text-left { text-align: left !important; }
  .text-center { text-align: center !important; }
  .text-right { text-align: right !important; }

  .font-medium { font-weight: 500 !important; }
  .font-semibold { font-weight: 600 !important; }
  .font-bold { font-weight: 700 !important; }
  .font-extrabold { font-weight: 800 !important; }
  .font-black { font-weight: 900 !important; }

  .text-\\[9px\\] { font-size: 9px !important; }
  .text-\\[10px\\] { font-size: 10px !important; }
  .text-\\[11px\\] { font-size: 11px !important; }
  .text-xs { font-size: 11.5px !important; }
  .text-sm { font-size: 13.5px !important; }
  .text-base { font-size: 15px !important; }
  .text-lg { font-size: 17px !important; }
  .text-xl { font-size: 20px !important; }
  .text-2xl { font-size: 24px !important; }
  .text-3xl { font-size: 28px !important; }

  .text-\\[\\#240C0B\\] { color: #240C0B !important; }
  .text-\\[\\#FF6B00\\] { color: #FF6B00 !important; }
  .text-\\[\\#2E7D32\\] { color: #2E7D32 !important; }
  .text-\\[\\#6E5B58\\] { color: #6E5B58 !important; }
  .text-\\[\\#7A6865\\] { color: #7A6865 !important; }
  .text-\\[\\#A08E8B\\] { color: #A08E8B !important; }
  .text-\\[\\#C9503A\\] { color: #C9503A !important; }
  .text-\\[\\#2E8A81\\] { color: #2E8A81 !important; }

  .bg-white { background-color: #ffffff !important; }
  .bg-\\[\\#FAF8F5\\] { background-color: #FAF8F5 !important; }
  .bg-\\[\\#E8F5E9\\] { background-color: #E8F5E9 !important; }
  .bg-\\[\\#FFF3E0\\] { background-color: #FFF3E0 !important; }
  .bg-\\[\\#240C0B\\] { background-color: #240C0B !important; }
  .bg-\\[\\#E8F5E9\\]\\/60 { background-color: #F1F8F3 !important; }

  .border { border: 1px solid #E6DFD5 !important; }
  .border-b { border-bottom: 1px solid #E6DFD5 !important; }
  .border-b-2 { border-bottom: 2px solid #240C0B !important; }
  .border-t { border-top: 1px solid #E6DFD5 !important; }
  .border-t-2 { border-top: 2px solid #240C0B !important; }
  .border-dashed { border-style: dashed !important; }
  .border-\\[\\#240C0B\\] { border-color: #240C0B !important; }
  .border-\\[\\#E6DFD5\\] { border-color: #E6DFD5 !important; }
  .border-\\[\\#A08E8B\\] { border-color: #A08E8B !important; }
  .border-\\[\\#C8E6C9\\] { border-color: #C8E6C9 !important; }
  .border-\\[\\#FFE0B2\\] { border-color: #FFE0B2 !important; }

  .rounded-3xl { border-radius: 20px !important; }
  .rounded-2xl { border-radius: 14px !important; }
  .rounded-xl { border-radius: 10px !important; }
  .rounded-lg { border-radius: 8px !important; }
  .rounded-md { border-radius: 6px !important; }
  .rounded-full { border-radius: 9999px !important; }

  .p-2 { padding: 8px !important; }
  .p-2\\.5 { padding: 10px !important; }
  .p-3 { padding: 12px !important; }
  .p-3\\.5 { padding: 14px !important; }
  .p-4 { padding: 16px !important; }
  .p-5 { padding: 20px !important; }
  .p-6 { padding: 24px !important; }
  .p-8 { padding: 32px !important; }
  .px-2 { padding-left: 8px !important; padding-right: 8px !important; }
  .px-2\\.5 { padding-left: 10px !important; padding-right: 10px !important; }
  .px-3 { padding-left: 12px !important; padding-right: 12px !important; }
  .px-3\\.5 { padding-left: 14px !important; padding-right: 14px !important; }
  .px-4 { padding-left: 16px !important; padding-right: 16px !important; }
  .px-5 { padding-left: 20px !important; padding-right: 20px !important; }
  .py-0\\.5 { padding-top: 2px !important; padding-bottom: 2px !important; }
  .py-1 { padding-top: 4px !important; padding-bottom: 4px !important; }
  .py-1\\.5 { padding-top: 6px !important; padding-bottom: 6px !important; }
  .py-2 { padding-top: 8px !important; padding-bottom: 8px !important; }
  .py-2\\.5 { padding-top: 10px !important; padding-bottom: 10px !important; }
  .py-3 { padding-top: 12px !important; padding-bottom: 12px !important; }
  .py-3\\.5 { padding-top: 14px !important; padding-bottom: 14px !important; }
  .py-4 { padding-top: 16px !important; padding-bottom: 16px !important; }
  .pb-0\\.5 { padding-bottom: 2px !important; }
  .pb-1 { padding-bottom: 4px !important; }
  .pb-1\\.5 { padding-bottom: 6px !important; }
  .pb-2 { padding-bottom: 8px !important; }
  .pb-3 { padding-bottom: 12px !important; }
  .pb-4 { padding-bottom: 16px !important; }
  .pb-5 { padding-bottom: 20px !important; }
  .pb-6 { padding-bottom: 24px !important; }
  .pb-8 { padding-bottom: 32px !important; }
  .pt-0\\.5 { padding-top: 2px !important; }
  .pt-1 { padding-top: 4px !important; }
  .pt-1\\.5 { padding-top: 6px !important; }
  .pt-2 { padding-top: 8px !important; }
  .pt-2\\.5 { padding-top: 10px !important; }
  .pt-3 { padding-top: 12px !important; }
  .pt-4 { padding-top: 16px !important; }
  .pt-5 { padding-top: 20px !important; }
  .pt-6 { padding-top: 24px !important; }
  .pt-8 { padding-top: 32px !important; }
  .pt-10 { padding-top: 40px !important; }

  .space-y-0\\.5 > * + * { margin-top: 2px !important; }
  .space-y-1 > * + * { margin-top: 4px !important; }
  .space-y-1\\.5 > * + * { margin-top: 6px !important; }
  .space-y-2 > * + * { margin-top: 8px !important; }
  .space-y-2\\.5 > * + * { margin-top: 10px !important; }
  .space-y-3 > * + * { margin-top: 12px !important; }
  .space-y-4 > * + * { margin-top: 16px !important; }
  .space-y-5 > * + * { margin-top: 20px !important; }
  .space-y-6 > * + * { margin-top: 24px !important; }
  .space-y-7 > * + * { margin-top: 28px !important; }
  .space-y-8 > * + * { margin-top: 32px !important; }

  .uppercase { text-transform: uppercase !important; }
  .tracking-tight { letter-spacing: -0.02em !important; }
  .tracking-wider { letter-spacing: 0.05em !important; }
  .tracking-widest { letter-spacing: 0.1em !important; }
  .leading-tight { line-height: 1.25 !important; }
  .leading-relaxed { line-height: 1.55 !important; }

  img.clinic-logo-img, .clinic-logo-img {
    width: 56px !important;
    height: 56px !important;
    max-width: 56px !important;
    max-height: 56px !important;
    object-fit: cover !important;
    border-radius: 12px !important;
    border: 2px solid #240C0B !important;
    display: block !important;
  }

  img.qr-code-img, .qr-code-img {
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    max-height: 100% !important;
    border: none !important;
    border-radius: 0px !important;
    object-fit: contain !important;
    image-rendering: pixelated !important;
    display: block !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .qr-code-box {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    overflow: hidden !important;
    padding: 2px !important;
    border: 1px solid #D8D3C4 !important;
    background: #ffffff !important;
    border-radius: 8px !important;
  }

  table {
    width: 100% !important;
    border-collapse: collapse !important;
    margin-top: 8px !important;
    margin-bottom: 8px !important;
  }

  thead tr {
    border-top: 2px solid #240C0B !important;
    border-bottom: 2px solid #240C0B !important;
  }

  th {
    padding: 10px 8px !important;
    font-size: 11px !important;
    font-weight: 800 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.08em !important;
    color: #240C0B !important;
  }

  td {
    border-bottom: 1px solid #E6DFD5 !important;
    padding: 12px 8px !important;
    font-size: 11.5px !important;
    vertical-align: top !important;
  }

  tr, td, th, div {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
`;

// Helper to reliably trigger printing across all browsers, mobile devices, and iframe environments
const triggerPrintDocument = (title: string, containerId: string) => {
  const containerEl = document.getElementById(containerId);
  const isIframe = window.self !== window.top;

  // 1. Direct browser print (works instantly on desktop & mobile tabs where @media print handles isolation)
  try {
    window.focus();
    window.print();
  } catch (err) {
    console.warn('Direct window.print() call warning:', err);
  }

  // 2. If running inside an iframe (like AI Studio preview), also launch a dedicated print window
  if (isIframe && containerEl) {
    try {
      const printWin = window.open('', '_blank', 'width=880,height=1050');
      if (printWin) {
        printWin.document.open();
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title}</title>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <script src="https://cdn.tailwindcss.com"></script>
              <script>
                tailwind.config = {
                  theme: {
                    extend: {
                      fontFamily: {
                        display: ['Fredoka', 'Nunito Sans', 'sans-serif'],
                        sans: ['Nunito Sans', 'sans-serif']
                      }
                    }
                  }
                }
              </script>
              <style>
                ${STANDALONE_PRINT_STYLES}
                .print-banner {
                  background: #240C0B;
                  color: #ffffff;
                  padding: 12px 18px;
                  border-radius: 14px;
                  margin-bottom: 20px;
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  gap: 12px;
                  font-family: "Nunito Sans", system-ui, -apple-system, sans-serif;
                }
                .print-action-btn {
                  background: #FF6B00;
                  color: #ffffff;
                  border: none;
                  font-weight: 800;
                  font-size: 13px;
                  padding: 8px 18px;
                  border-radius: 10px;
                  cursor: pointer;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                }
                .close-action-btn {
                  background: rgba(255,255,255,0.15);
                  color: #ffffff;
                  border: none;
                  font-weight: 700;
                  font-size: 12px;
                  padding: 8px 14px;
                  border-radius: 10px;
                  cursor: pointer;
                  margin-left: 8px;
                }
                @media print {
                  .print-banner { display: none !important; }
                }
              </style>
            </head>
            <body class="bg-white p-2 sm:p-4">
              <div class="print-banner no-print max-w-[800px] mx-auto">
                <div style="font-size: 13px; font-weight: 700;">
                  🖨️ <span>Print or Save as PDF</span>
                </div>
                <div>
                  <button class="print-action-btn" onclick="window.print()">Print Now</button>
                  <button class="close-action-btn" onclick="window.close()">Close</button>
                </div>
              </div>
              <div class="printable-area max-w-[800px] mx-auto bg-white p-4 sm:p-6 rounded-none shadow-none border-none">${containerEl.innerHTML}</div>
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.focus();
                    window.print();
                  }, 300);
                };
              </script>
            </body>
          </html>
        `);
        printWin.document.close();
      }
    } catch (popupErr) {
      console.warn('Popup print fallback warning:', popupErr);
    }
  }
};

// Helper to directly download a standalone printable HTML document for instant offline saving
const downloadPrintableHTML = (title: string, containerId: string, filename: string) => {
  const containerEl = document.getElementById(containerId);
  if (!containerEl) return;

  const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <title>${title}</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              display: ['Fredoka', 'Nunito Sans', 'sans-serif'],
              sans: ['Nunito Sans', 'sans-serif']
            }
          }
        }
      }
    </script>
    <style>${STANDALONE_PRINT_STYLES}</style>
  </head>
  <body class="bg-white p-2 sm:p-4">
    <div class="printable-area max-w-[800px] mx-auto bg-white p-4 sm:p-6 rounded-none shadow-none border-none">${containerEl.innerHTML}</div>
    <script>
      window.onload = function() {
        window.print();
      };
    </script>
  </body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 16. Print Daily Schedule Modal
const PrintScheduleModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const { appointments, clients, services, packages, staff, settings, redemptions, formatPrice } = useApp();

  const [dateISO, setDateISO] = useState<string>(data?.dateISO || '2026-08-12');
  const [staffId, setStaffId] = useState<string>(data?.staffId || 'all');

  // Filter appointments for selected date and staff
  const dailyAppts = appointments
    .filter((a) => {
      if (a.date !== dateISO || a.status === 'cancelled') return false;
      if (staffId !== 'all' && a.staffId !== staffId) return false;
      return true;
    })
    .sort((a, b) => a.start.localeCompare(b.start));

  const selectedStaffObj = staff.find((s) => s.id === staffId);
  const formattedDate = new Date(dateISO + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const totalRev = dailyAppts.reduce((sum, a) => {
    const inv = calculateAppointmentInvoice(a, { services, packages, settings, redemptions });
    return sum + inv.totalAmount;
  }, 0);
  const completedCount = dailyAppts.filter((a) => a.status === 'completed').length;

  const handlePrint = () => {
    triggerPrintDocument(`Daily Schedule (${dateISO}) - PawBook Pro`, 'printable-schedule-doc');
  };

  const handleDownload = () => {
    downloadPrintableHTML(`Daily Schedule (${dateISO}) - PawBook Pro`, 'printable-schedule-doc', `Daily_Schedule_${dateISO}.html`);
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar (Hidden when printing) */}
      <div className="no-print bg-[#F1EEE6] p-4 rounded-2xl border border-[#D8D3C4] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <label className="block text-[11px] font-bold text-[#5C716C] uppercase mb-1">Schedule Date</label>
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              className="bg-white border border-[#D8D3C4] rounded-xl px-3 py-1.5 text-xs font-bold text-[#173E39] outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#5C716C] uppercase mb-1">Filter Stylist</label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="bg-white border border-[#D8D3C4] rounded-xl px-3 py-1.5 text-xs font-bold text-[#173E39] outline-none"
            >
              <option value="all">All Stylists</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="bg-white border border-[#D8D3C4] hover:bg-[#FAF8F5] text-[#173E39] font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download offline HTML schedule"
          >
            <Download className="w-3.5 h-3.5 text-[#2E8A81]" />
            <span className="hidden sm:inline">Save File</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="printable-btn bg-[#2E8A81] hover:bg-[#1F6660] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Schedule / Save PDF</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost text-xs px-4 py-2.5 rounded-xl font-bold"
          >
            Close
          </button>
        </div>
      </div>

      {/* Printable Schedule Document Container */}
      <div id="printable-schedule-doc" className="printable-area bg-white p-2 sm:p-4 text-[#173E39] space-y-6">
        {/* Document Header */}
        <div className="border-b-2 border-[#173E39] pb-4 flex flex-row items-start justify-between gap-4 w-full">
          <div>
            <div className="flex items-center gap-2">
              <Scissors className="w-6 h-6 text-[#E8734A]" />
              <h1 className="font-display font-bold text-2xl text-[#173E39] tracking-tight">
                {settings?.name || settings?.salonName || 'PawBook Pro Grooming Studio'}
              </h1>
            </div>
            <p className="text-xs text-[#5C716C] mt-1 font-semibold">
              {settings?.address || '100 Bark Avenue, Suite 4 • San Francisco, CA 94107'}
            </p>
            <p className="text-[11px] text-[#2E8A81] font-bold mt-0.5">
              Daily Master Operations Schedule • Tel: {settings?.phone || '(555) 123-PAWS'}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1 bg-[#F1EEE6]/60 p-3 rounded-2xl border border-[#D8D3C4]/60">
            <div className="font-bold text-[#173E39] text-sm">{formattedDate}</div>
            <div className="text-[#5C716C]">
              Stylist View: <span className="font-bold text-[#173E39]">{selectedStaffObj ? selectedStaffObj.name : 'All Stylists'}</span>
            </div>
            <div className="text-[10px] text-[#5C716C]">
              Generated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Summary Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#F1EEE6] p-3 rounded-2xl border border-[#D8D3C4] text-center">
            <div className="text-[10px] uppercase font-bold text-[#5C716C]">Total Bookings</div>
            <div className="text-xl font-display font-bold text-[#173E39] mt-0.5">{dailyAppts.length} sessions</div>
          </div>
          <div className="bg-[#F1EEE6] p-3 rounded-2xl border border-[#D8D3C4] text-center">
            <div className="text-[10px] uppercase font-bold text-[#5C716C]">Completed</div>
            <div className="text-xl font-display font-bold text-[#3E9B6E] mt-0.5">{completedCount} grooms</div>
          </div>
          <div className="bg-[#F1EEE6] p-3 rounded-2xl border border-[#D8D3C4] text-center">
            <div className="text-[10px] uppercase font-bold text-[#5C716C]">Scheduled</div>
            <div className="text-xl font-display font-bold text-[#E8734A] mt-0.5">{dailyAppts.length - completedCount} pending</div>
          </div>
          <div className="bg-[#F1EEE6] p-3 rounded-2xl border border-[#D8D3C4] text-center">
            <div className="text-[10px] uppercase font-bold text-[#5C716C]">Expected Revenue</div>
            <div className="text-xl font-display font-bold text-[#173E39] mt-0.5">${totalRev}</div>
          </div>
        </div>

        {/* Schedule List Table */}
        {dailyAppts.length === 0 ? (
          <div className="p-8 text-center text-sm font-semibold text-[#5C716C] bg-[#F1EEE6]/30 rounded-2xl border border-dashed border-[#D8D3C4]">
            No appointments scheduled for {formattedDate} {staffId !== 'all' ? `with ${selectedStaffObj?.name}` : ''}.
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#173E39] rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#173E39] text-white font-bold">
                  <th className="p-3 border-r border-[#2E8A81]">Time</th>
                  <th className="p-3 border-r border-[#2E8A81]">Pet & Owner</th>
                  <th className="p-3 border-r border-[#2E8A81]">Service Details</th>
                  <th className="p-3 border-r border-[#2E8A81]">Stylist</th>
                  <th className="p-3 border-r border-[#2E8A81]">Care Notes / Sensitivities</th>
                  <th className="p-3 text-center">Sign-off</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8D3C4] bg-white">
                {dailyAppts.map((a) => {
                  const client = clients.find((c) => c.id === a.clientId);
                  const service = services.find((s) => s.id === a.serviceId);
                  const groomer = staff.find((st) => st.id === a.staffId);

                  return (
                    <tr key={a.id} className="hover:bg-[#F1EEE6]/40 print-page-break">
                      {/* Time */}
                      <td className="p-3 font-bold text-[#173E39] whitespace-nowrap border-r border-[#D8D3C4] bg-[#F1EEE6]/20">
                        <div className="text-sm font-display">{a.start}</div>
                        <div className="text-[10px] text-[#5C716C]">{a.duration} mins</div>
                      </td>

                      {/* Pet & Owner */}
                      <td className="p-3 border-r border-[#D8D3C4]">
                        <div className="font-bold text-sm text-[#173E39]">
                          {client?.name || 'Pet'} <span className="text-xs font-normal text-[#5C716C]">({client?.breed || 'Breed'})</span>
                        </div>
                        <div className="text-[11px] text-[#5C716C] mt-0.5">
                          Owner: <span className="font-semibold text-[#173E39]">{client?.owner}</span> • {client?.phone}
                        </div>
                      </td>

                      {/* Service Details */}
                      <td className="p-3 border-r border-[#D8D3C4]">
                        {(() => {
                          const inv = calculateAppointmentInvoice(a, { services, packages, settings, redemptions });
                          return (
                            <>
                              <div className="font-bold text-[#173E39]">{inv.serviceOrPackageName}</div>
                              <div className="text-[10px] text-[#5C716C] mt-0.5 font-medium">
                                Total: <span className="font-bold text-[#FF6B00]">{formatPrice(inv.totalAmount)}</span> <span className="text-[9px] text-[#A08E8B]">(incl. {inv.taxRate}% tax)</span>
                              </div>
                            </>
                          );
                        })()}
                      </td>

                      {/* Stylist */}
                      <td className="p-3 border-r border-[#D8D3C4] whitespace-nowrap">
                        <span
                          className="px-2 py-1 rounded-lg text-[10px] font-bold text-white inline-block"
                          style={{ backgroundColor: groomer?.color || '#2E8A81' }}
                        >
                          {groomer?.name || 'Unassigned'}
                        </span>
                      </td>

                      {/* Care Notes & Sensitivities */}
                      <td className="p-3 border-r border-[#D8D3C4]">
                        {client?.sensitivities ? (
                          <div className="bg-[#FEF2F2] border border-[#FCA5A5] p-1.5 rounded-xl text-[#991B1B] text-[10px] font-bold flex items-start gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#DC2626]" />
                            <span>{client.sensitivities}</span>
                          </div>
                        ) : (
                          <span className="text-[#5C716C] text-[11px] italic">{a.notes || 'No special alerts'}</span>
                        )}
                      </td>

                      {/* Groomer Signoff Checkbox */}
                      <td className="p-3 text-center align-middle whitespace-nowrap">
                        <div className="inline-flex items-center justify-center border-2 border-[#173E39] w-6 h-6 rounded-md bg-white">
                          {a.status === 'completed' && <Check className="w-4 h-4 text-[#3E9B6E]" />}
                        </div>
                        <div className="text-[9px] text-[#5C716C] font-bold uppercase mt-1">
                          {a.status}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Notes */}
        <div className="pt-4 border-t border-[#D8D3C4] text-[10px] text-[#5C716C] flex flex-col sm:flex-row items-center justify-between gap-2 font-medium">
          <div>PawBook Pro Pet Grooming Studio Operations • Confidential Internal Staff Schedule</div>
          <div>Reception Phone: (555) 123-PAWS • Page 1 of 1</div>
        </div>
      </div>
    </div>
  );
};

// 17. Official Invoice / Receipt Modal (Minimalist Premium A4 Layout)
const InvoiceModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const { clients, services, packages, staff, settings, redemptions, showToast, formatPrice } = useApp();
  const appt = data?.appointment || (data?.clientId ? data : null);

  if (!appt) return null;

  const client = clients.find((c) => c.id === appt.clientId);
  const service = services.find((s) => s.id === appt.serviceId);
  const groomer = staff.find((st) => st.id === appt.staffId);

  // Look up spa package if selected
  const pkg = appt.packageId 
    ? packages.find((p) => p.id === appt.packageId)
    : (appt.packageName ? packages.find(p => p.name.toLowerCase() === appt.packageName?.toLowerCase()) : (data?.packageId ? packages.find(p => p.id === data.packageId) : null));

  const purchasedItems: PurchasedRetailItem[] = data?.purchasedItems || appt.purchasedItems || [];
  const retailAddon = data?.retailAddon !== undefined 
    ? data.retailAddon 
    : (purchasedItems.length > 0 ? purchasedItems.reduce((s, p) => s + (p.price || 0) * (p.quantity || 1), 0) : (appt.retail || 0));
  const servicePrice = pkg ? pkg.price : (service?.price || appt.price || 0);
  const subtotal = servicePrice + retailAddon;

  // Read client/dog promo code discount if applied
  let discountAmount = data?.discountAmount !== undefined ? data.discountAmount : (appt.discountAmount || 0);
  let discountCode = data?.discountCode || appt.discountCode || '';
  let discountTitle = data?.discountTitle || appt.discountTitle || '';

  // If promo code exists but discount amount was 0, resolve from redemptions or appointment value
  if (discountCode && (!discountAmount || discountAmount === 0)) {
    const voucher = redemptions?.find((r) => r.code.toUpperCase() === discountCode.toUpperCase());
    if (voucher) {
      discountTitle = discountTitle || voucher.rewardTitle;
      if (voucher.discountType === 'percent') {
        discountAmount = Math.round(subtotal * (voucher.discountValue / 100) * 100) / 100;
      } else {
        discountAmount = Math.min(subtotal, voucher.discountValue);
      }
    } else if (appt.discountValue) {
      discountAmount = appt.discountType === 'percent'
        ? Math.round(subtotal * (appt.discountValue / 100) * 100) / 100
        : Math.min(subtotal, appt.discountValue);
    }
  }

  const taxableSubtotal = Math.max(0, subtotal - discountAmount);

  // Dynamic US tax rate from settings (0% to 20%)
  const taxRate = settings?.taxRate !== undefined ? settings.taxRate : 8.5;
  const tax = Math.round(taxableSubtotal * (taxRate / 100) * 100) / 100;
  const total = taxableSubtotal + tax;
  const pointsEarned = Math.floor(total);

  const invoiceNum = formatShortInvoiceNumber(appt);
  const isPaid = appt.status === 'completed';

  // Synchronized clinic data from settings
  const clinicName = settings?.name || settings?.salonName || 'PawBook Pro Grooming Studio';
  const clinicEmail = settings?.email || 'care@pawbookpro.com';
  const clinicWebsite = settings?.website || 'www.pawbookpro.com';
  const clinicPhone = settings?.phone || '(555) 123-PAWS';
  const clinicAddress = settings?.address || '100 Bark Avenue, Suite 4, San Francisco, CA 94107';
  const clinicPhoto = settings?.photo || 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=240&q=80';

  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const handlePrint = () => {
    triggerPrintDocument(`Invoice ${invoiceNum} - ${clinicName}`, 'printable-invoice-doc');
  };

  const handleDownload = () => {
    downloadPrintableHTML(`Invoice ${invoiceNum} - ${clinicName}`, 'printable-invoice-doc', `${invoiceNum}_${client?.name || 'Pet'}_Invoice.html`);
    showToast('Printable invoice downloaded successfully!', 'success');
  };

  const handleShareImage = async () => {
    const el = document.getElementById('printable-invoice-doc');
    if (!el) return;
    setIsProcessingImage(true);
    showToast('Rendering high-resolution invoice image...', 'info');
    try {
      const res = await shareElementImage(el, {
        title: `Invoice ${invoiceNum} - ${clinicName}`,
        text: `Official Invoice for ${client?.owner || 'Client'} (${client?.name || 'Pet'}) - ${invoiceNum}`,
        filename: `Invoice_${invoiceNum}_${client?.name || 'Pet'}.png`
      });
      if (res.success) {
        if (res.method === 'web-share') {
          showToast('Invoice image shared successfully!', 'success');
        } else if (res.method === 'clipboard') {
          showToast('Invoice image copied to clipboard & downloaded!', 'success');
        } else {
          showToast('Invoice PNG image downloaded (ready to share in WhatsApp)!', 'success');
        }
      } else {
        showToast(res.error || 'Failed to share image', 'error');
      }
    } catch (e) {
      showToast('Could not share image', 'error');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleDownloadPng = async () => {
    const el = document.getElementById('printable-invoice-doc');
    if (!el) return;
    setIsProcessingImage(true);
    showToast('Generating PNG image file...', 'info');
    const ok = await downloadElementAsPng(el, `Invoice_${invoiceNum}_${client?.name || 'Pet'}.png`);
    setIsProcessingImage(false);
    if (ok) {
      showToast('Invoice image (.PNG) saved to downloads!', 'success');
    } else {
      showToast('Failed to generate PNG image', 'error');
    }
  };

  const handleCopyImage = async () => {
    const el = document.getElementById('printable-invoice-doc');
    if (!el) return;
    setIsProcessingImage(true);
    const ok = await copyElementImageToClipboard(el);
    setIsProcessingImage(false);
    if (ok) {
      showToast('Invoice image copied! Paste directly into WhatsApp or messages.', 'success');
    } else {
      await downloadElementAsPng(el, `Invoice_${invoiceNum}_${client?.name || 'Pet'}.png`);
      showToast('Invoice image downloaded to attach in WhatsApp!', 'info');
    }
  };

  const handleWhatsAppShare = () => {
    if (!client) {
      showToast('Client details not found', 'error');
      return;
    }
    const ok = openWhatsAppInvoice({
      invoiceNum,
      client,
      appointment: { ...appt, retail: retailAddon, purchasedItems },
      clinicSettings: settings,
      serviceName: service?.name,
      packageName: pkg?.name || appt.packageName,
      groomerName: groomer?.name,
      servicePrice,
      retailAddon,
      purchasedItems,
      discountAmount,
      discountCode,
      discountTitle,
      taxRate,
      tax,
      total,
      pointsEarned,
      isPaid
    });
    if (ok) {
      showToast(`Redirecting to WhatsApp for ${client.owner}...`, 'success');
    }
  };

  const handleCopyTextReceipt = () => {
    if (!client) return;
    const text = generateWhatsAppInvoiceText({
      invoiceNum,
      client,
      appointment: { ...appt, retail: retailAddon, purchasedItems },
      clinicSettings: settings,
      serviceName: service?.name,
      packageName: pkg?.name || appt.packageName,
      groomerName: groomer?.name,
      servicePrice,
      retailAddon,
      purchasedItems,
      discountAmount,
      discountCode,
      discountTitle,
      taxRate,
      tax,
      total,
      pointsEarned,
      isPaid
    });
    navigator.clipboard.writeText(text);
    showToast('Invoice summary copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Top Action Toolbar (Hidden on print) */}
      <div className="no-print bg-[#FAF8F5] p-3.5 sm:p-4 rounded-2xl border border-[#E6DFD5] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#240C0B] text-white rounded-xl shadow-xs shrink-0">
            <Receipt className="w-5 h-5 text-[#FF6B00]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-extrabold text-sm text-[#240C0B]">Official Invoice & Receipt</h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#240C0B] text-white">
                A4 Standard
              </span>
            </div>
            <p className="text-[11px] text-[#7A6865] mt-0.5">
              US Sales Tax: <strong className="text-[#FF6B00]">{taxRate}%</strong> • Client: <strong className="text-[#240C0B]">{client?.owner}</strong> ({client?.phone || 'No phone'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto justify-end flex-wrap">
          {/* Share as Image (Native share to WhatsApp, AirDrop, Messages) */}
          <button
            type="button"
            disabled={isProcessingImage}
            onClick={handleShareImage}
            className="bg-[#2E8A81] hover:bg-[#236F68] disabled:opacity-50 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Share invoice as an image via WhatsApp or system share menu"
          >
            <ImageIcon className="w-4 h-4 text-white" />
            <span>{isProcessingImage ? 'Rendering Image...' : 'Share as Image'}</span>
          </button>

          {/* WhatsApp Direct Text Share */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Open WhatsApp with prefilled formatted invoice receipt text"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>WhatsApp Text</span>
          </button>

          {/* Download Image (PNG) */}
          <button
            type="button"
            disabled={isProcessingImage}
            onClick={handleDownloadPng}
            className="bg-white border border-[#D8D3C4] hover:bg-[#FAF8F5] disabled:opacity-50 text-[#240C0B] font-bold text-xs px-3 py-2.5 rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download high-resolution PNG image"
          >
            <Download className="w-3.5 h-3.5 text-[#2E8A81]" />
            <span>PNG</span>
          </button>

          {/* Copy Text Summary */}
          <button
            type="button"
            onClick={handleCopyTextReceipt}
            className="bg-white border border-[#D8D3C4] hover:bg-[#FAF8F5] text-[#240C0B] font-bold text-xs px-3 py-2.5 rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Copy formatted invoice text"
          >
            <Copy className="w-3.5 h-3.5 text-[#7A6865]" />
            <span className="hidden sm:inline">Copy</span>
          </button>

          {/* Print Invoice / Save PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="bg-[#240C0B] hover:bg-[#180504] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Print PDF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2.5 bg-white border border-[#E6DFD5] hover:bg-[#F1EEE6] text-[#240C0B] text-xs rounded-xl font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* A4 Printable Document Container (Exact 210mm standard proportions with clean white background) */}
      <div className="printable-wrapper flex justify-center overflow-x-auto p-2 sm:p-4 bg-transparent print:bg-white print:p-0 print:m-0 rounded-2xl">
        <div 
          id="printable-invoice-doc" 
          className="printable-area bg-white text-[#240C0B] w-full max-w-[210mm] min-h-[297mm] p-6 sm:p-10 md:p-12 space-y-7 border border-[#E6DFD5] shadow-md print:shadow-none print:border-none print:p-1 print:m-0 print:w-full print:max-w-none print:min-h-0"
        >
          {/* Header Block: Studio Brand & Official Invoice Title (Strictly Side-by-Side in the Same Line) */}
          <div className="flex flex-row justify-between items-start gap-4 border-b-2 border-[#240C0B] pb-5 w-full">
            {/* Left: Clinic Brand & Info */}
            <div className="flex items-start gap-3.5 max-w-[62%]">
              <img 
                src={clinicPhoto} 
                alt={clinicName}
                className="clinic-logo-img w-14 h-14 rounded-xl object-cover border-2 border-[#240C0B] shadow-xs shrink-0"
              />
              <div className="space-y-1 min-w-0">
                <h1 className="font-display font-extrabold text-xl sm:text-2xl text-[#240C0B] tracking-tight leading-tight">
                  {clinicName}
                </h1>
                <div className="text-[11px] text-[#6E5B58] space-y-0.5 leading-relaxed font-medium">
                  <p className="truncate">{clinicAddress}</p>
                  <p className="flex flex-wrap items-center gap-x-2">
                    <span>Tel: <strong className="text-[#240C0B]">{clinicPhone}</strong></span>
                    <span>•</span>
                    <span>Email: <strong className="text-[#240C0B]">{clinicEmail}</strong></span>
                  </p>
                  <p className="text-[#2E8A81] font-semibold">Web: {clinicWebsite}</p>
                </div>
              </div>
            </div>

            {/* Right: Official Tax Invoice & Meta (Aligned Right Top in Same Row) */}
            <div className="text-right space-y-1 shrink-0">
              <div>
                <p className="text-[9px] sm:text-[10px] font-black tracking-widest text-[#7A6865] uppercase">
                  Original Tax Invoice
                </p>
                <p className="font-display font-black text-xl sm:text-2xl tracking-tight text-[#240C0B] leading-tight">
                  {invoiceNum}
                </p>
              </div>
              <div className="text-[11px] text-[#6E5B58] space-y-0.5 font-medium">
                <p>Date: <strong className="text-[#240C0B]">{appt.date}</strong></p>
                <p>Time: <strong className="text-[#240C0B]">{appt.start}</strong></p>
              </div>
              <div className="pt-0.5">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isPaid 
                    ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                    : 'bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]'
                }`}>
                  ● {isPaid ? 'PAID IN FULL' : 'PAYMENT DUE'}
                </span>
              </div>
            </div>
          </div>

          {/* Minimalist 2-Column Details: Bill To & Care Session with Clean Side-by-Side Cards */}
          <div className="flex flex-row gap-4 text-xs w-full">
            <div className="flex-1 p-4 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5] space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#7A6865] border-b border-[#E6DFD5] pb-1">
                Billed To Client & Patient
              </p>
              <div className="space-y-1">
                <p className="font-display font-bold text-sm text-[#240C0B]">
                  {client?.owner || 'Pet Parent'}
                </p>
                <p className="text-[11px] text-[#6E5B58]">
                  Patient: <strong className="text-[#240C0B]">🐾 {client?.name || 'Pet'}</strong> ({client?.breed || 'Canine'}, {client?.size || 'Standard'})
                </p>
                <p className="text-[11px] text-[#6E5B58]">
                  Contact: <strong className="text-[#240C0B]">{client?.phone || 'N/A'}</strong> • {client?.email || 'N/A'}
                </p>
                {client?.sensitivities && (
                  <p className="text-[10px] text-[#C9503A] font-bold pt-0.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>Special Care: {client.sensitivities}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex-1 p-4 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5] space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#7A6865] border-b border-[#E6DFD5] pb-1">
                Clinical Details & Stylist
              </p>
              <div className="space-y-1">
                <p className="font-display font-bold text-sm text-[#240C0B]">
                  {groomer?.name || 'Master Pet Stylist'}
                </p>
                <p className="text-[11px] text-[#6E5B58]">
                  Session Length: <strong className="text-[#240C0B]">{appt.duration} Minutes</strong>
                </p>
                <p className="text-[11px] text-[#6E5B58]">
                  Sales Tax Reg: US-94028-PAW • Rate: <strong className="text-[#240C0B]">{taxRate}%</strong>
                </p>
                <p className="text-[11px] text-[#6E5B58]">
                  Payment Method: Contactless POS / Card / Cash
                </p>
              </div>
            </div>
          </div>

          {/* Itemized Table with Modern Refined Spacing */}
          <div className="space-y-2 pt-1 w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-t-2 border-b-2 border-[#240C0B] text-[#240C0B] font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 pr-3 text-left">Description & Treatment</th>
                  <th className="py-2.5 px-2 text-center">Qty / Duration</th>
                  <th className="py-2.5 px-2 text-right">Unit Rate</th>
                  <th className="py-2.5 pl-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DFD5] text-[#240C0B]">
                {/* Main Service or Spa Package */}
                <tr>
                  <td className="py-3 pr-3">
                    <div className="font-display font-bold text-sm text-[#240C0B]">
                      {pkg ? `✨ ${pkg.name} (Spa Package Bundle)` : (service?.name || 'Full Grooming & Spa Treatment')}
                    </div>
                    <div className="text-[11px] text-[#7A6865] mt-0.5 leading-relaxed">
                      {pkg ? (
                        <span>
                          Includes complete bundled care treatments: {pkg.serviceIds.map(sid => services.find(s => s.id === sid)?.name).filter(Boolean).join(' + ')}. Hand blowout, coat conditioning, & luxury styling.
                        </span>
                      ) : (
                        <span>
                          Hydro-massage bath, coat conditioning, hand blowout, custom scissor style & hygiene trim.
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center font-medium text-[#7A6865] text-[11px]">
                    {pkg ? `${pkg.duration}m` : `${appt.duration}m`}
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-[#7A6865] text-[11px]">
                    {formatPrice(servicePrice)}
                  </td>
                  <td className="py-3 pl-2 text-right font-bold text-sm text-[#240C0B]">
                    {formatPrice(servicePrice)}
                  </td>
                </tr>

                {/* Itemized Retail Products or Legacy Addon */}
                {purchasedItems.length > 0 ? (
                  purchasedItems.map((item, idx) => {
                    const qty = item.quantity || 1;
                    const unitPrice = item.price || 0;
                    const lineTotal = unitPrice * qty;
                    return (
                      <tr key={item.itemId || `prod_${idx}`}>
                        <td className="py-2.5 pr-3">
                          <div className="font-bold text-xs text-[#240C0B]">
                            🛍️ {item.name}
                          </div>
                          <div className="text-[11px] text-[#7A6865] mt-0.5">
                            Retail pet care & grooming take-home product.
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center font-medium text-[#7A6865] text-[11px]">{qty}x</td>
                        <td className="py-2.5 px-2 text-right font-medium text-[#7A6865] text-[11px]">{formatPrice(unitPrice)}</td>
                        <td className="py-2.5 pl-2 text-right font-bold text-xs text-[#240C0B]">{formatPrice(lineTotal)}</td>
                      </tr>
                    );
                  })
                ) : retailAddon > 0 ? (
                  <tr>
                    <td className="py-2.5 pr-3">
                      <div className="font-bold text-xs text-[#240C0B]">
                        Retail Care & Spa Treatment Add-on
                      </div>
                      <div className="text-[11px] text-[#7A6865] mt-0.5">
                        Organic botanical paw balm & hypoallergenic leave-in mist.
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-medium text-[#7A6865] text-[11px]">1x</td>
                    <td className="py-2.5 px-2 text-right font-medium text-[#7A6865] text-[11px]">{formatPrice(retailAddon)}</td>
                    <td className="py-2.5 pl-2 text-right font-bold text-xs text-[#240C0B]">{formatPrice(retailAddon)}</td>
                  </tr>
                ) : null}

                {/* Promo Code Discount */}
                {discountAmount > 0 && (
                  <tr className="bg-[#E8F5E9]/60">
                    <td className="py-2.5 pr-3 text-[#2E7D32]">
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 shrink-0" />
                        <span>Client Promo Code Discount ({discountCode ? `${discountCode} • ` : ''}{discountTitle || 'Special Voucher'})</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-[#2E7D32] text-[11px]">1x</td>
                    <td className="py-2.5 px-2 text-right font-bold text-[#2E7D32] text-[11px]">-{formatPrice(discountAmount)}</td>
                    <td className="py-2.5 pl-2 text-right font-black text-xs text-[#2E7D32]">-{formatPrice(discountAmount)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary & Tax Computation Row with 2 Columns */}
          <div className="flex flex-row gap-5 pt-3 items-start border-t border-[#E6DFD5] w-full">
            {/* Rewards & Client Notes */}
            <div className="flex-1 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5] text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-display font-bold text-[#FF6B00] text-xs">
                <Award className="w-3.5 h-3.5" />
                <span>Loyalty Points Earned</span>
              </div>
              <p className="text-[11px] text-[#6E5B58] leading-relaxed">
                {client?.name || 'Pet'} earned <strong className="text-[#240C0B]">+{pointsEarned} Paw Points</strong> on this visit. Current account total: <strong className="text-[#240C0B]">{(client?.points || 0) + pointsEarned} pts</strong>.
              </p>
              <div className="pt-2 border-t border-[#E6DFD5] text-[10px] text-[#7A6865] flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#2E8A81]" />
                <span>Certified Organic & Hypoallergenic Grooming Care</span>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="flex-1 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#6E5B58]">
                <span>Gross Subtotal:</span>
                <span className="font-bold text-[#240C0B]">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-[#2E7D32] font-semibold">
                  <span>Promo Code Savings:</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#6E5B58] pt-1 border-t border-[#E6DFD5]">
                <span>Taxable Amount:</span>
                <span className="font-bold text-[#240C0B]">{formatPrice(taxableSubtotal)}</span>
              </div>

              <div className="flex justify-between text-[#6E5B58]">
                <span>US Sales Tax ({taxRate}%):</span>
                <span className="font-bold text-[#FF6B00]">+{formatPrice(tax)}</span>
              </div>

              <div className="border-t-2 border-[#240C0B] pt-2 flex justify-between items-baseline">
                <span className="font-display font-black text-xs text-[#240C0B] uppercase tracking-wider">
                  Total Amount:
                </span>
                <span className="font-display font-black text-2xl text-[#240C0B]">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Scannable Invoice QR Code Component at Bottom */}
          <div className="pt-2 w-full">
            <InvoiceQRCode
              invoiceNum={invoiceNum}
              date={appt.date}
              clientName={client?.name}
              ownerName={client?.owner}
              serviceOrPackage={pkg ? pkg.name : service?.name}
              subtotal={taxableSubtotal}
              taxRate={taxRate}
              taxAmount={tax}
              totalAmount={total}
              isPaid={isPaid}
              clinicName={clinicName}
              size={120}
              className="w-full"
            />
          </div>

          {/* Minimalist A4 Footer with Signature and Clinic Note */}
          <div className="pt-4 border-t-2 border-[#240C0B] space-y-3 w-full">
            <div className="flex flex-row justify-between items-center gap-4 text-left text-xs">
              <div className="space-y-0.5">
                <p className="font-display font-bold text-xs text-[#240C0B]">
                  Thank you for visiting {clinicName}! 🐾
                </p>
                <p className="text-[11px] text-[#7A6865]">
                  Questions or schedule follow-up? Email <strong className="text-[#240C0B]">{clinicEmail}</strong> or visit <strong className="text-[#240C0B]">{clinicWebsite}</strong>
                </p>
              </div>

              <div className="border border-dashed border-[#A08E8B] px-3.5 py-1.5 rounded-lg text-center shrink-0">
                <p className="text-[9px] font-bold text-[#7A6865] uppercase tracking-widest">
                  Authorized Signature / Stamp
                </p>
                <p className="font-display text-xs text-[#240C0B] font-bold mt-0.5">
                  {clinicName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 18. Vaccine Schedule Form Modal
const VaccineScheduleFormModal: React.FC<{ data: any; onClose: () => void }> = ({ data, onClose }) => {
  const { clients, settings, addVaccineRecord } = useApp();

  const getTodayISO = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getNextYearISO = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [clientId, setClientId] = useState(data?.clientId || clients[0]?.id || '');
  const [vaccineName, setVaccineName] = useState('Rabies (3-Year)');
  const [dateAdministered, setDateAdministered] = useState(getTodayISO());
  const [nextDueDate, setNextDueDate] = useState(getNextYearISO());
  const [veterinarian, setVeterinarian] = useState('Central Pet Hospital');
  const [batchNo, setBatchNo] = useState('');
  const [notes, setNotes] = useState('');

  const quickVaccines = [
    'Rabies (3-Year)',
    'Rabies (1-Year)',
    'Bordetella (Kennel Cough)',
    'DHPP (Distemper Combo)',
    'Parvovirus',
    'Lyme Disease',
    'Feline Leukemia'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;

    addVaccineRecord(clientId, {
      vaccineName,
      dateAdministered,
      nextDueDate,
      veterinarian,
      batchNo,
      notes
    });

    onClose();
  };

  return (
    <div className="space-y-4 text-[#240C0B]">
      <div className="border-b border-[#E8E1D1] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display text-[#240C0B]">
              Add Vaccination Schedule
            </h2>
            <p className="text-xs text-[#A08E8B]">
              Record medical vaccine dates & upcoming renewals for pets
            </p>
          </div>
        </div>

        {/* Shop Name & Owner Name Display Badge */}
        <div className="mt-3 bg-[#FFF8E7] border border-[#FFE7B3] p-2.5 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#240C0B]">{settings.salonName || 'PawBook Pro Studio'}</span>
            <span className="text-[#A08E8B]">|</span>
            <span className="text-[#FF6B00] font-semibold">Owner: {settings.name || 'FAHD ABRAR'}</span>
          </div>
          <span className="text-[10px] bg-[#FF6B00]/10 text-[#FF6B00] font-bold px-2 py-0.5 rounded-md">
            Official Health Record
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Select Pet / Client */}
        <div>
          <label className="block text-xs font-bold text-[#240C0B] mb-1">
            Select Pet / Owner <span className="text-[#FF6B00]">*</span>
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full bg-[#FFFDF9] border border-[#D8D3C4] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            required
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.breed}) — Owner: {c.owner}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Vaccine Presets */}
        <div>
          <label className="block text-xs font-bold text-[#240C0B] mb-1">
            Vaccine Name <span className="text-[#FF6B00]">*</span>
          </label>
          <input
            type="text"
            value={vaccineName}
            onChange={(e) => setVaccineName(e.target.value)}
            className="w-full bg-[#FFFDF9] border border-[#D8D3C4] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00] mb-2"
            placeholder="e.g. Rabies (3-Year)"
            required
          />
          <div className="flex flex-wrap gap-1.5">
            {quickVaccines.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVaccineName(v)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  vaccineName === v
                    ? 'bg-[#FF6B00] text-white border-[#FF6B00] font-bold shadow-xs'
                    : 'bg-[#F1EEE6] text-[#5C716C] border-[#D8D3C4] hover:bg-[#E8E1D1]'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#240C0B] mb-1">
              Date Administered
            </label>
            <input
              type="date"
              value={dateAdministered}
              onChange={(e) => setDateAdministered(e.target.value)}
              className="w-full bg-[#FFFDF9] border border-[#D8D3C4] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#240C0B] mb-1">
              Next Due / Expiry Date <span className="text-[#FF6B00]">*</span>
            </label>
            <input
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              className="w-full bg-[#FFFDF9] border border-[#D8D3C4] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              required
            />
          </div>
        </div>

        {/* Vet Clinic & Batch # */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#240C0B] mb-1">
              Veterinarian / Clinic
            </label>
            <input
              type="text"
              value={veterinarian}
              onChange={(e) => setVeterinarian(e.target.value)}
              className="w-full bg-[#FFFDF9] border border-[#D8D3C4] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              placeholder="e.g. Central Pet Hospital"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#240C0B] mb-1">
              Batch / Lot Number (Optional)
            </label>
            <input
              type="text"
              value={batchNo}
              onChange={(e) => setBatchNo(e.target.value)}
              className="w-full bg-[#FFFDF9] border border-[#D8D3C4] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              placeholder="e.g. RB-9902"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-[#240C0B] mb-1">
            Notes / Health Instructions
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full bg-[#FFFDF9] border border-[#D8D3C4] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            placeholder="Special notes or vaccine verification info..."
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-[#E8E1D1]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#F1EEE6] hover:bg-[#E8E1D1] text-[#5C716C] rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-[#FF6B00] hover:bg-[#E55C00] text-white rounded-xl text-xs font-bold shadow-md shadow-[#FF6B00]/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Vaccination Schedule</span>
          </button>
        </div>
      </form>
    </div>
  );
};

