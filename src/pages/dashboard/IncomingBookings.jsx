import { useState, useEffect } from 'react';
import useBookingStore from '../../stores/useBookingStore';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const statusLabels = {
  pending: 'Venter',
  accepted: 'Akseptert',
  declined: 'Avslått',
  completed: 'Fullført',
  cancelled: 'Kansellert',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-gray-100 text-gray-600',
};

export default function IncomingBookings() {
  const { bookings, loading, fetchIncomingBookings, updateBookingStatus, completeBooking } = useBookingStore();
  const [acceptModal, setAcceptModal] = useState(null);
  const [agreedPrice, setAgreedPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchIncomingBookings();
  }, [fetchIncomingBookings]);

  const handleAccept = async () => {
    if (!acceptModal) return;
    setSubmitting(true);
    await updateBookingStatus(
      acceptModal,
      'accepted',
      agreedPrice ? parseInt(agreedPrice, 10) : undefined
    );
    setAcceptModal(null);
    setAgreedPrice('');
    setSubmitting(false);
  };

  const handleDecline = async (id) => {
    await updateBookingStatus(id, 'declined');
  };

  const handleComplete = async (id) => {
    await completeBooking(id);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Forespørsler</h1>

      {bookings.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500">Ingen forespørsler ennå.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {booking.clientAvatar ? (
                    <img src={booking.clientAvatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
                      {booking.clientName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{booking.clientName}</p>
                    <p className="text-xs text-gray-500">{booking.categoryName}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                  {statusLabels[booking.status] || booking.status}
                </span>
              </div>

              <p className="mt-3 text-sm text-gray-600">{booking.description}</p>

              {booking.preferred_date && (
                <p className="mt-2 text-xs text-gray-500">
                  Ønsket tidspunkt: {booking.preferred_date}
                </p>
              )}

              {booking.agreed_price_nok && (
                <div className="mt-2 text-sm">
                  <span className="font-medium text-gray-700">Avtalt pris: {booking.agreed_price_nok} kr</span>
                  {booking.platform_fee_nok != null && (
                    <span className="ml-3 text-xs text-gray-400">
                      Plattformgebyr: {booking.platform_fee_nok} kr (faktureres senere)
                    </span>
                  )}
                </div>
              )}

              <p className="mt-2 text-xs text-gray-400">
                {new Date(booking.created_at).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>

              {/* Action buttons */}
              {booking.status === 'pending' && (
                <div className="mt-4 flex gap-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => { setAcceptModal(booking.id); setAgreedPrice(''); }}
                  >
                    Aksepter
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDecline(booking.id)}
                  >
                    Avslå
                  </Button>
                </div>
              )}

              {booking.status === 'accepted' && (
                <div className="mt-4">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleComplete(booking.id)}
                  >
                    Marker som fullført
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Accept modal with price */}
      <Modal
        isOpen={!!acceptModal}
        onClose={() => setAcceptModal(null)}
        title="Aksepter forespørsel"
      >
        <div>
          <p className="text-sm text-gray-600">
            Oppgi en avtalt pris (valgfritt). Denne kan avtales med kunden etterpå.
          </p>
          <input
            type="number"
            value={agreedPrice}
            onChange={(e) => setAgreedPrice(e.target.value)}
            placeholder="Pris i kr (valgfritt)"
            className="mt-3 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setAcceptModal(null)}>
              Avbryt
            </Button>
            <Button variant="primary" onClick={handleAccept} disabled={submitting}>
              {submitting ? 'Aksepterer...' : 'Aksepter'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
