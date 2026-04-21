import { useState } from 'react';
import { Download, Send, Copy, RefreshCw, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, Button, Modal, SearchInput, Pagination, Badge, Select } from '@/components/ui';
import { useCertificates, useCertificate, useGenerateCertificate, useDeliverCertificate } from '@/hooks/useCertificates';
import type { Certificate } from '@/types';

export const CertificatesPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deliverMethod, setDeliverMethod] = useState<'email' | 'whatsapp' | 'link'>('email');

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
    const variants: Record<string, 'success' | 'warning' | 'info' | 'error'> = {
      generated: 'success',
      pending: 'warning',
      sent: 'info',
      failed: 'error',
    };
    const labels: Record<string, string> = {
      generated: 'Generado',
      pending: 'Pendiente',
      sent: 'Enviado',
      failed: 'Fallido',
    };
    const icons: Record<string, React.ReactNode> = {
      generated: <CheckCircle className="w-3 h-3 mr-1" />,
      pending: <Clock className="w-3 h-3 mr-1" />,
      sent: <FileText className="w-3 h-3 mr-1" />,
      failed: <XCircle className="w-3 h-3 mr-1" />,
    };
    return (
      <Badge variant={variants[status] || 'default'}>
        {icons[status]}
        {labels[status] || status}
      </Badge>
    );
  };

  const openDetail = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setIsDetailModalOpen(true);
  };

  const handleGenerate = () => {
    if (selectedCertificate) {
      generateCertificate.mutate({ id: selectedCertificate.id }, {
        onSuccess: () => {
          setSelectedCertificate(null);
          setIsDetailModalOpen(false);
        },
      });
    }
  };

  const handleDeliver = () => {
    if (selectedCertificate) {
      deliverCertificate.mutate({ id: selectedCertificate.id, method: deliverMethod }, {
        onSuccess: () => {
          setSelectedCertificate(null);
          setIsDetailModalOpen(false);
        },
      });
    }
  };

  const copyVerificationLink = (code: string) => {
    const url = `${window.location.origin}/verify?code=${code}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Certificados</h1>
          <p className="text-secondary-600">Gestiona los certificados del sistema</p>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap gap-4 mb-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por estudiante o evento..."
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
            <div className="col-span-full py-8 text-center text-secondary-500">Cargando...</div>
          ) : data?.results?.length === 0 ? (
            <div className="col-span-full py-8 text-center text-secondary-500">No hay certificados</div>
          ) : (
            data?.results?.map((cert) => (
              <div
                key={cert.id}
                className="p-4 rounded-xl border border-secondary-200 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => openDetail(cert)}
              >
                <div className="aspect-[1.4/1] bg-secondary-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {cert.pdf_url ? (
                    <img
                      src={cert.pdf_url}
                      alt="Certificate preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <FileText className={`w-12 h-12 text-secondary-300 ${cert.pdf_url ? 'hidden' : ''}`} />
                </div>
                <div className="flex items-center justify-between mb-2">
                  {getStatusBadge(cert.status)}
                  <span className="text-xs text-secondary-500 font-mono">{cert.verification_code.slice(0, 8)}...</span>
                </div>
                <h3 className="font-semibold text-secondary-900 truncate">{cert.student.full_name}</h3>
                <p className="text-sm text-secondary-600 truncate">{cert.event.name}</p>
                <p className="text-xs text-secondary-400 mt-1">
                  {new Date(cert.issued_at).toLocaleDateString('es-ES')}
                </p>
              </div>
            ))
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

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedCertificate(null); }}
        title="Detalle del Certificado"
        size="xl"
      >
        {detailData && (
          <div className="space-y-6">
            <div className="aspect-[1.4/1] bg-secondary-100 rounded-xl flex items-center justify-center overflow-hidden border border-secondary-200">
              {detailData.pdf_url ? (
                <iframe
                  src={detailData.pdf_url}
                  className="w-full h-full"
                  title="Certificate PDF"
                />
              ) : (
                <div className="text-center">
                  <FileText className="w-16 h-16 text-secondary-300 mx-auto mb-2" />
                  <p className="text-secondary-500">Certificado no generado</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-secondary-500">Estudiante</p>
                <p className="font-medium text-secondary-900">{detailData.student.full_name}</p>
                <p className="text-sm text-secondary-600">{detailData.student.email}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">Evento</p>
                <p className="font-medium text-secondary-900">{detailData.event.name}</p>
                <p className="text-sm text-secondary-600">
                  {new Date(detailData.event.event_date).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">Estado</p>
                {getStatusBadge(detailData.status)}
              </div>
              <div>
                <p className="text-sm text-secondary-500">Código de Verificación</p>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-sm bg-secondary-100 px-2 py-1 rounded">
                    {detailData.verification_code}
                  </code>
                  <button
                    onClick={() => copyVerificationLink(detailData.verification_code)}
                    className="p-1 rounded hover:bg-secondary-100 text-secondary-500"
                    title="Copiar enlace"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {detailData.status === 'pending' && (
                <Button
                  onClick={handleGenerate}
                  isLoading={generateCertificate.isPending}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generar PDF
                </Button>
              )}
              {detailData.status === 'generated' && (
                <>
                  <Button
                    onClick={handleGenerate}
                    variant="secondary"
                    isLoading={generateCertificate.isPending}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerar
                  </Button>
                  <div className="flex gap-2 items-center">
                    <Select
                      options={[
                        { value: 'email', label: 'Email' },
                        { value: 'whatsapp', label: 'WhatsApp' },
                        { value: 'link', label: 'Link' },
                      ]}
                      value={deliverMethod}
                      onChange={(e) => setDeliverMethod(e.target.value as 'email' | 'whatsapp' | 'link')}
                      className="w-32"
                    />
                    <Button
                      onClick={handleDeliver}
                      isLoading={deliverCertificate.isPending}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Enviar
                    </Button>
                  </div>
                </>
              )}
              {detailData.pdf_url && (
                <a href={detailData.pdf_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                </a>
              )}
            </div>

            {detailData.delivery_history && detailData.delivery_history.length > 0 && (
              <div>
                <h4 className="font-semibold text-secondary-900 mb-3">Historial de Entregas</h4>
                <div className="space-y-2">
                  {detailData.delivery_history.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary-50"
                    >
                      <div className="flex items-center gap-3">
                        {log.delivery_method === 'email' && <Send className="w-4 h-4 text-secondary-500" />}
                        {log.delivery_method === 'whatsapp' && <Send className="w-4 h-4 text-green-500" />}
                        {log.delivery_method === 'link' && <Copy className="w-4 h-4 text-blue-500" />}
                        <div>
                          <p className="text-sm font-medium text-secondary-900">
                            {log.delivery_method === 'email' ? 'Email' : log.delivery_method === 'whatsapp' ? 'WhatsApp' : 'Link'}
                          </p>
                          <p className="text-xs text-secondary-500">{log.recipient}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={log.is_successful ? 'success' : log.is_pending ? 'warning' : 'error'}>
                          {log.status_display}
                        </Badge>
                        <p className="text-xs text-secondary-400 mt-1">
                          {new Date(log.sent_at).toLocaleString('es-ES')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
