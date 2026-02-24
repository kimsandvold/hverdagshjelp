import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useBookingStore from '../../stores/useBookingStore';
import useMessagesStore from '../../stores/useMessagesStore';
import SEO from '../../components/SEO';

const statusLabels = {
  pending: 'Venter på svar',
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

export default function MyBookingsPage() {
  const { bookings, loading, fetchMyBookings, markBookingsSeen } = useBookingStore();
  const startConversation = useMessagesStore((state) => state.startConversation);
  const navigate = useNavigate();

  const handleSendMessage = async (helperId) => {
    const result = await startConversation(helperId);
    if (result.conversationId) {
      navigate('/meldinger');
    }
  };

  useEffect(() => {
    fetchMyBookings();
    markBookingsSeen();
  }, [fetchMyBookings, markBookingsSeen]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <SEO title="Mine forespørsler" description="Dine forespørsler." noindex />
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Mine forespørsler</h1>

      {bookings.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500">Du har ikke sendt noen forespørsler enda.</p>
          <Link
            to="/search"
            className="mt-4 inline-block rounded-lg bg-primary-500 px-6 py-2 font-medium text-white hover:bg-primary-600"
          >
            Finn en hjelper
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {booking.helperAvatar ? (
                    <img src={booking.helperAvatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-200 text-sm font-bold text-primary-700">
                      {booking.helperName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <Link
                      to={`/helper/${booking.helper_id}`}
                      className="text-sm font-semibold text-gray-900 hover:text-primary-500"
                    >
                      {booking.helperName}
                    </Link>
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

              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {new Date(booking.created_at).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <button
                  onClick={() => handleSendMessage(booking.helper_id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100 cursor-pointer"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                  </svg>
                  Send melding
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
