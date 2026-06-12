import { useState } from 'react';
import {
  Download, Send, Copy, RefreshCw, FileText, CheckCircle,
  XCircle, Clock, Calendar, MapPin, User, Award, Clock3,
} from 'lucide-react';
import { Card, Button, Modal, SearchInput, Pagination, Badge, Select } from '@/components/ui';
import { useCertificates, useCertificate, useGenerateCertificate, useDeliverCertificate } from '@/hooks/useCertificates';
import { useAuth } from '@/hooks/useAuth';
import type { Certificate } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const buildPdfUrl = (pdf_url?: string) =>
  pdf_url ? (pdf_url.startsWith('http') ? pdf_url : `${API_URL}${pdf_url}`) : null;

export const CertificatesPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deliverMethod, setDeliverMethod] = useState<'email' | 'whatsapp' | 'link'>('email');
  const [copied, setCopied] = useState(false);

  const { isAdmin } = useAuth();

  const { data, isLoading } = useCertificates({ page, search, status: statusFilter || undefined });
  const { data: detailData } = useCertificate(selectedCertificate?.id || 0);
  const generateCertificate = useGenerateCertificate();
  const deliverCertificate = useDeliverCertificate();

  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'generated', label: 'Generado' },
    { value: 'sent', label: 'Enviado' },
    { value: 'failed', label: 'Fallido' },
  ];

  const getStatusBadge = (status: string) => {
    const map: Record<string, { variant: 'success' | 'warning' | 'info' | 'error'; label: string; icon: React.ReactNode }> = {
      generated: { variant: 'success', label: 'Generado', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
      pending:   { variant: 'warning', label: 'Pendiente', icon: <Clock className="w-3 h-3 mr-1" /> },
      sent:      { variant: 'info',    label: 'Enviado',   icon: <FileText className="w-3 h-3 mr-1" /> },
      failed:    { variant: 'error',   label: 'Fallido',   icon: <XCircle className="w-3 h-3 mr-1" /> },
    };
    const entry = map[status] || { variant: 'default' as const, label: status, icon: null };
    return (
      <Badge variant={entry.variant}>
        {entry.icon}
        {entry.label}
      </Badge>
    );
  };

  const openDetail = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setIsDetailModalOpen(true);
  };

  const closeDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedCertificate(null);
  };

  const handleGenerate = () => {
    if (selectedCertificate) {
      generateCertificate.mutate({ id: selectedCertificate.id }, { onSuccess: closeDetail });
    }
  };

  const handleDeliver = () => {
    if (selectedCertificate) {
      deliverCertificate.mutate({ id: selectedCertificate.id, method: deliverMethod }, { onSuccess: closeDetail });
    }
  };

  const copyVerificationLink = (code: string) => {
    const url = `${window.location.origin}/verify?code=${code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">
            {isAdmin ? 'Certificados' : 'Mis Certificados'}
          </h1>
          <p className="text-sm text-secondary-500 mt-0.5">
            {isAdmin ? 'Gestiona y envía certificados del sistema' : 'Certificados emitidos a tu nombre'}
          </p>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap gap-4 mb-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={isAdmin ? 'Buscar por estudiante o evento…' : 'Buscar por evento…'}
            className="flex-1 min-w-[200px]"
          />
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-40"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-secondary-400 text-sm">Cargando…</div>
          ) : !data?.results?.length ? (
            <div className="col-span-full py-12 text-center">
              <div className="flex flex-col items-center gap-2 text-secondary-400">
                <Award className="w-8 h-8 opacity-40" />
                <span className="text-sm">No hay certificados</span>
              </div>
            </div>
          ) : (
            data.results.map((cert) => {
              const pdfSrc = buildPdfUrl(cert.pdf_url);
              return (
                <div
                  key={cert.id}
                  className="p-4 rounded-xl border border-secondary-200 hover:border-primary-400 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => openDetail(cert)}
                >
                  {/* Certificate thumbnail */}
                  <div className={`aspect-[1.4/1] rounded-lg mb-3 flex flex-col items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-[1.02] ${pdfSrc ? 'bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-100' : 'bg-secondary-100'}`}>
                    {pdfSrc ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center shadow-sm">
                          <FileText className="w-6 h-6 text-primary-600" />
                        </div>
                        <span className="text-xs font-semibold text-primary-700">PDF generado</span>
                        <span className="text-[10px] text-primary-400">Clic para ver</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-secondary-300">
                        <FileText className="w-10 h-10" />
                        <span className="text-xs">Sin generar</span>
                      </div>
                    )}
                  </div>

                  {/* Card info */}
                  <div className="flex items-center justify-between mb-2">
                    {getStatusBadge(cert.status)}
                    <span className="text-xs text-secondary-400 font-mono bg-secondary-100 px-1.5 py-0.5 rounded">
                      {cert.verification_code?.slice(0, 8)}…
                    </span>
                  </div>
                  {isAdmin && (
                    <h3 className="font-semibold text-secondary-900 truncate">{cert.participant?.full_name}</h3>
                  )}
                  <p className="text-sm text-secondary-600 truncate font-medium">{cert.event?.name}</p>
                  <p className="text-xs text-secondary-400 mt-1">{formatDate(cert.event?.event_date)}</p>
                </div>
              );
            })
          )}
        </div>

        {data && data.count > 9 && (
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(data.count / 9)}
            totalItems={data.count}
            itemsPerPage={9}
            onPageChange={setPage}
          />
        )}
      </Card>

      {/* Detail modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={closeDetail}
        title="Detalle del Certificado"
        size="xl"
      >
        {detailData && (() => {
          const pdfSrc = buildPdfUrl(detailData.pdf_url);
          const event = detailData.event as {
            id: number; name: string; event_date?: string | null; end_date?: string | null;
            description?: string; location?: string; duration_hours?: number | null; instructor_name?: string | null;
          };

          return (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* LEFT — certificate preview */}
              <div className="lg:w-[55%] flex flex-col gap-3">
                <div className="aspect-[1.4/1] bg-secondary-100 rounded-xl overflow-hidden border border-secondary-200 flex items-center justify-center">
                  {pdfSrc ? (
                    <iframe
                      src={pdfSrc}
                      className="w-full h-full"
                      title="Certificate PDF"
                    />
                  ) : (
                    <div className="text-center text-secondary-400">
                      <FileText className="w-14 h-14 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Certificado no generado</p>
                    </div>
                  )}
                </div>

                {/* Download always available when pdf exists */}
                {pdfSrc && (
                  <a href={pdfSrc} target="_blank" rel="noopener noreferrer" download>
                    <Button variant="secondary" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Descargar PDF
                    </Button>
                  </a>
                )}
              </div>

              {/* RIGHT — info side panel */}
              <div className="lg:w-[45%] flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
                {/* Status */}
                <div className="flex items-center gap-2">
                  {getStatusBadge(detailData.status)}
                  {detailData.expires_at && (
                    <span className="text-xs text-secondary-400">
                      Vence: {formatDate(detailData.expires_at)}
                    </span>
                  )}
                </div>

                {/* Event info */}
                <div className="rounded-xl border border-secondary-200 p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-secondary-400 uppercase tracking-wide mb-2">Evento</h4>
                  <p className="font-semibold text-secondary-900 text-base">{event.name}</p>

                  {event.event_date && (
                    <div className="flex items-center gap-2 text-sm text-secondary-600">
                      <Calendar className="w-4 h-4 flex-shrink-0 text-secondary-400" />
                      <span>{formatDate(event.event_date)}{event.end_date ? ` — ${formatDate(event.end_date)}` : ''}</span>
                    </div>
                  )}

                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-secondary-600">
                      <MapPin className="w-4 h-4 flex-shrink-0 text-secondary-400" />
                      <span>{event.location}</span>
                    </div>
                  )}

                  {event.duration_hours != null && (
                    <div className="flex items-center gap-2 text-sm text-secondary-600">
                      <Clock3 className="w-4 h-4 flex-shrink-0 text-secondary-400" />
                      <span>{event.duration_hours} horas</span>
                    </div>
                  )}

                  {event.instructor_name && (
                    <div className="flex items-center gap-2 text-sm text-secondary-600">
                      <User className="w-4 h-4 flex-shrink-0 text-secondary-400" />
                      <span>{event.instructor_name}</span>
                    </div>
                  )}

                  {event.description && (
                    <p className="text-sm text-secondary-500 pt-1 border-t border-secondary-100">{event.description}</p>
                  )}
                </div>

                {/* Participant info */}
                <div className="rounded-xl border border-secondary-200 p-4 space-y-1">
                  <h4 className="text-xs font-semibold text-secondary-400 uppercase tracking-wide mb-2">Participante</h4>
                  <p className="font-medium text-secondary-900">{detailData.participant?.full_name}</p>
                  <p className="text-sm text-secondary-500">{detailData.participant?.email}</p>
                  {detailData.participant?.phone && (
                    <p className="text-sm text-secondary-400">{detailData.participant.phone}</p>
                  )}
                </div>

                {/* Verification code */}
                <div className="rounded-xl border border-secondary-200 p-4">
                  <h4 className="text-xs font-semibold text-secondary-400 uppercase tracking-wide mb-2">Código de Verificación</h4>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm bg-secondary-100 px-2 py-1 rounded flex-1 truncate">
                      {detailData.verification_code}
                    </code>
                    <button
                      onClick={() => copyVerificationLink(detailData.verification_code)}
                      className="p-1.5 rounded hover:bg-secondary-100 text-secondary-500 transition-colors flex-shrink-0"
                      title="Copiar enlace"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  {copied && <p className="text-xs text-green-600 mt-1">¡Enlace copiado!</p>}
                </div>

                {/* Admin/Coordinator actions */}
                {isAdmin && (
                  <div className="rounded-xl border border-secondary-200 p-4 space-y-3">
                    <h4 className="text-xs font-semibold text-secondary-400 uppercase tracking-wide">Acciones</h4>

                    {(detailData.status === 'pending' || detailData.status === 'failed') && (
                      <Button onClick={handleGenerate} isLoading={generateCertificate.isPending} className="w-full">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {detailData.status === 'pending' ? 'Generar PDF' : 'Regenerar PDF'}
                      </Button>
                    )}

                    {detailData.status === 'generated' && (
                      <>
                        <Button onClick={handleGenerate} variant="secondary" isLoading={generateCertificate.isPending} className="w-full">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerar
                        </Button>
                        <div className="flex gap-2">
                          <Select
                            options={[
                              { value: 'email', label: 'Email' },
                              { value: 'whatsapp', label: 'WhatsApp' },
                              { value: 'link', label: 'Link' },
                            ]}
                            value={deliverMethod}
                            onChange={(e) => setDeliverMethod(e.target.value as 'email' | 'whatsapp' | 'link')}
                            className="flex-1"
                          />
                          <Button onClick={handleDeliver} isLoading={deliverCertificate.isPending}>
                            <Send className="w-4 h-4 mr-2" />
                            Enviar
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Delivery history (admin only) */}
                {isAdmin && detailData.delivery_history && detailData.delivery_history.length > 0 && (
                  <div className="rounded-xl border border-secondary-200 p-4">
                    <h4 className="text-xs font-semibold text-secondary-400 uppercase tracking-wide mb-3">
                      Historial de Entregas
                    </h4>
                    <div className="space-y-2">
                      {detailData.delivery_history.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-secondary-50"
                        >
                          <div className="flex items-center gap-2">
                            <Send className={`w-3.5 h-3.5 ${log.delivery_method === 'whatsapp' ? 'text-green-500' : 'text-secondary-400'}`} />
                            <div>
                              <p className="text-xs font-medium text-secondary-800">
                                {log.delivery_method === 'email' ? 'Email' : log.delivery_method === 'whatsapp' ? 'WhatsApp' : 'Link'}
                              </p>
                              <p className="text-[10px] text-secondary-400">{log.recipient}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={log.is_successful ? 'success' : log.is_pending ? 'warning' : 'error'}>
                              {log.status_display}
                            </Badge>
                            <p className="text-[10px] text-secondary-400 mt-0.5">
                              {new Date(log.sent_at).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};
