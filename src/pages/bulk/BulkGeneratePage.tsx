import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload, FileSpreadsheet, CheckCircle, XCircle,
  AlertTriangle, ArrowRight, ArrowLeft, ImageIcon, MousePointer,
  Sparkles, Send, RotateCcw, Award, Users, Save,
  Calendar, MapPin, User,
} from 'lucide-react';
import { Card, Button, FileUpload, Alert, Select, SignaturePad, Spinner } from '@/components/ui';
import { usePreviewExcel, useGenerateBulkFull } from '@/hooks/useCertificates';
import { useEvents, useEvent, useEventParticipants, useEventGenerateCertificates, useUpdateEvent } from '@/hooks/useEvents';
import type { ExcelPreview, BulkImportResult, EventGenerateResult } from '@/types';

type Step = 'upload' | 'preview' | 'template' | 'result';
type Mode = 'by-event' | 'by-excel';

interface NamePosition {
  x: number;
  y: number;
}

const STEPS = [
  { key: 'upload',   label: 'Subir Excel',  icon: Upload },
  { key: 'preview',  label: 'Revisar',       icon: FileSpreadsheet },
  { key: 'template', label: 'Plantilla',     icon: ImageIcon },
  { key: 'result',   label: 'Resultado',     icon: Sparkles },
] as const;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── By Excel Mode (existing) ───────────────────────────────────────────────────
const ByExcelMode = () => {
  const [step, setStep] = useState<Step>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | ''>('');
  const [previewData, setPreviewData] = useState<ExcelPreview | null>(null);
  const [templateImage, setTemplateImage] = useState<File | null>(null);
  const [templatePreviewUrl, setTemplatePreviewUrl] = useState<string | null>(null);
  const [namePosition, setNamePosition] = useState<NamePosition>({ x: 50, y: 40 });
  const [fontSize, setFontSize] = useState(28);
  const [fontColor, setFontColor] = useState('#1e3a8a');
  const [signatureImage, setSignatureImage] = useState<File | null>(null);
  const [instructorName, setInstructorName] = useState('');
  const [instructorSpecialty, setInstructorSpecialty] = useState('');
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const { data: eventsData } = useEvents({ status: 'active' });
  const previewExcel = usePreviewExcel();
  const generateBulk = useGenerateBulkFull();

  const events = eventsData?.results ?? [];

  const handleFileSelect = (file: File) => {
    if (!selectedEventId) {
      setError('Selecciona un evento antes de subir el archivo');
      return;
    }
    setSelectedFile(file);
    setError(null);
    previewExcel.mutate({ file }, {
      onSuccess: (data) => { setPreviewData(data); setStep('preview'); },
      onError: (err) => {
        const axiosErr = err as { response?: { data?: { detail?: string; error?: string } } };
        setError(axiosErr.response?.data?.detail || axiosErr.response?.data?.error || (err as Error).message || 'Error al leer el archivo');
      },
    });
  };

  const handleImageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10;
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10;
    setNamePosition({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  }, []);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTemplateImage(file);
    setTemplatePreviewUrl(URL.createObjectURL(file));
  };

  const handleGenerate = () => {
    if (!selectedFile || !templateImage || !selectedEventId) return;
    setError(null);
    generateBulk.mutate(
      { excelFile: selectedFile, eventId: Number(selectedEventId), templateImage, nameX: namePosition.x, nameY: namePosition.y, fontSize, fontColor, signatureImage: signatureImage ?? undefined, instructorName, instructorSpecialty },
      {
        onSuccess: (data) => { setResult(data); setStep('result'); },
        onError: (err) => {
          const axiosErr = err as { response?: { data?: { detail?: string; error?: string } } };
          setError(axiosErr.response?.data?.detail || axiosErr.response?.data?.error || (err as Error).message || 'Error al generar certificados');
        },
      },
    );
  };

  const reset = () => {
    setStep('upload');
    setSelectedFile(null);
    setSelectedEventId('');
    setPreviewData(null);
    setTemplateImage(null);
    setTemplatePreviewUrl(null);
    setNamePosition({ x: 50, y: 40 });
    setFontSize(28);
    setFontColor('#1e3a8a');
    setSignatureImage(null);
    setInstructorName('');
    setInstructorSpecialty('');
    setResult(null);
    setError(null);
  };

  const stepIndex: Record<Step, number> = { upload: 0, preview: 1, template: 2, result: 3 };

  return (
    <>
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1 bg-white rounded-2xl p-2 shadow-card border border-secondary-100">
          {STEPS.map(({ key, label, icon: Icon }, i) => {
            const current = stepIndex[step];
            const done = i < current;
            const active = i === current;
            return (
              <div key={key} className="flex items-center">
                <div
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.40)]'
                      : done
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-secondary-400'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    active ? 'bg-white/25' : done ? 'bg-emerald-100' : 'bg-secondary-100'
                  }`}>
                    {done
                      ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                      : <Icon className="w-4 h-4" />
                    }
                  </div>
                  <span className={`text-sm font-bold hidden sm:inline ${active ? 'text-white' : ''}`}>
                    {label}
                  </span>
                </div>
                {i < 3 && (
                  <div className={`w-6 h-0.5 mx-1 rounded-full ${i < current ? 'bg-emerald-300' : 'bg-secondary-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {step === 'upload' && (
        <Card>
          <div className="max-w-2xl mx-auto space-y-6">
            <Select
              label="Evento"
              value={String(selectedEventId)}
              onChange={(e) => {
                setSelectedEventId(e.target.value ? Number(e.target.value) : '');
                setError(null);
              }}
              options={[
                { value: '', label: 'Selecciona un evento...' },
                ...events.map((ev) => ({ value: ev.id, label: ev.name })),
              ]}
            />

            <Alert type="info">
              <p className="font-bold mb-2 text-sm">Columnas requeridas en el Excel:</p>
              <ul className="space-y-1">
                {[
                  ['full_name', 'nombre completo del participante'],
                  ['email', 'correo electrónico'],
                  ['document_id', 'DNI o cédula (único por persona)'],
                  ['phone', 'teléfono (opcional)'],
                ].map(([col, desc]) => (
                  <li key={col} className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-0.5 rounded-md bg-primary-100 text-primary-700 font-mono font-bold text-xs">{col}</span>
                    <span className="text-secondary-600">{desc}</span>
                  </li>
                ))}
              </ul>
            </Alert>

            <FileUpload
              onFileSelect={handleFileSelect}
              isLoading={previewExcel.isPending}
              error={error || undefined}
              label={selectedEventId ? 'Arrastra el Excel aquí o haz clic para seleccionar' : 'Primero selecciona un evento arriba'}
            />
          </div>
        </Card>
      )}

      {step === 'preview' && previewData && (
        <Card>
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-secondary-900">
                    {previewData.row_count} participantes encontrados
                  </p>
                  <p className="text-sm text-secondary-500">Revisa que los datos sean correctos</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" size="md" onClick={reset}>
                  <ArrowLeft className="w-4 h-4" />
                  Cambiar archivo
                </Button>
                <Button size="md" onClick={() => setStep('template')}>
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-secondary-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-primary-50 to-blue-50 border-b border-secondary-100">
                    <th className="py-3 px-4 text-left text-xs font-bold text-primary-600 uppercase tracking-wider">#</th>
                    {previewData.columns.map((col) => (
                      <th key={col} className="py-3 px-4 text-left text-xs font-bold text-primary-600 uppercase tracking-wider">
                        {col.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {previewData.data.slice(0, 20).map((row, idx) => (
                    <tr key={idx} className="hover:bg-primary-50/40 transition-colors">
                      <td className="py-2.5 px-4 text-secondary-400 text-xs font-bold">{idx + 1}</td>
                      {previewData.columns.map((col) => (
                        <td key={col} className="py-2.5 px-4 text-secondary-700 font-medium">{String(row[col] ?? '—')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.row_count > 20 && (
                <p className="text-center py-3 text-sm text-secondary-500 font-medium border-t border-secondary-100 bg-secondary-50/60">
                  Mostrando 20 de {previewData.row_count} registros
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {step === 'template' && (
        <div className="space-y-5">
          <Card>
            <div className="space-y-6">
              <div>
                <p className="text-sm font-bold text-secondary-700 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs font-black flex items-center justify-center">1</span>
                  Sube la imagen de tu certificado (PNG o JPG)
                </p>
                <label className="inline-flex items-center gap-3 px-5 py-3 border-2 border-dashed border-primary-200 rounded-xl cursor-pointer hover:bg-primary-50 hover:border-primary-400 transition-all duration-200 group">
                  <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <ImageIcon className="w-4.5 h-4.5 text-primary-500 w-[18px] h-[18px]" />
                  </div>
                  <span className="text-sm font-semibold text-secondary-600 group-hover:text-primary-600 transition-colors">
                    {templateImage ? templateImage.name : 'Seleccionar imagen...'}
                  </span>
                  <input type="file" accept=".png,.jpg,.jpeg" onChange={handleImageFile} className="hidden" />
                </label>
              </div>

              {templatePreviewUrl && (
                <div className="space-y-5">
                  <p className="text-sm font-bold text-secondary-700 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs font-black flex items-center justify-center">2</span>
                    <MousePointer className="w-4 h-4 text-primary-500" />
                    Haz clic en la imagen para colocar el nombre del participante
                  </p>

                  <div
                    ref={imageContainerRef}
                    className="relative cursor-crosshair rounded-2xl overflow-hidden border-2 border-primary-300 select-none shadow-[0_4px_20px_rgba(59,130,246,0.20)]"
                    onClick={handleImageClick}
                  >
                    <img
                      src={templatePreviewUrl}
                      alt="Plantilla"
                      className="w-full block pointer-events-none"
                      draggable={false}
                    />
                    <div
                      className="absolute w-4 h-4 rounded-full bg-primary-500 border-3 border-white shadow-glow pointer-events-none"
                      style={{ left: `${namePosition.x}%`, top: `${namePosition.y}%`, transform: 'translate(-50%, -50%)', borderWidth: 3 }}
                    />
                    <div
                      className="absolute pointer-events-none font-black drop-shadow-sm whitespace-nowrap"
                      style={{
                        left: `${namePosition.x}%`,
                        top: `${namePosition.y}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: `${Math.max(10, fontSize * 0.55)}px`,
                        color: fontColor,
                        textShadow: '0 0 6px rgba(255,255,255,0.95)',
                      }}
                    >
                      NOMBRE APELLIDO
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-1">
                    <div className="space-y-2 bg-secondary-50 rounded-xl p-4">
                      <label className="text-xs font-bold text-secondary-600 uppercase tracking-wide">
                        Tamaño de letra — {fontSize}pt
                      </label>
                      <input
                        type="range" min={12} max={72} value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full accent-primary-500 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2 bg-secondary-50 rounded-xl p-4">
                      <label className="text-xs font-bold text-secondary-600 uppercase tracking-wide">Color del nombre</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color" value={fontColor}
                          onChange={(e) => setFontColor(e.target.value)}
                          className="w-10 h-9 rounded-lg cursor-pointer border-2 border-secondary-200"
                        />
                        <span className="text-sm text-secondary-600 font-mono font-bold">{fontColor}</span>
                      </div>
                    </div>
                    <div className="space-y-2 bg-secondary-50 rounded-xl p-4">
                      <label className="text-xs font-bold text-secondary-600 uppercase tracking-wide">Posición</label>
                      <p className="text-sm text-secondary-700 font-mono font-bold">
                        X: {namePosition.x.toFixed(1)}% · Y: {namePosition.y.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-secondary-100 pt-5">
                <p className="text-sm font-bold text-secondary-700 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs font-black flex items-center justify-center">3</span>
                  Firma digital del instructor (opcional)
                </p>
                <p className="text-xs text-secondary-400 mb-3">
                  Si el evento ya tiene instructor asignado, su firma se usa automáticamente. Aquí puedes subir una firma ad-hoc o solo escribir el nombre.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-secondary-600 uppercase tracking-wide">Nombre del instructor</label>
                    <input
                      type="text"
                      value={instructorName}
                      onChange={(e) => setInstructorName(e.target.value)}
                      placeholder="Ej: Dr. Juan Pérez"
                      className="w-full h-10 px-3 rounded-lg border border-secondary-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-secondary-600 uppercase tracking-wide">Cargo / Especialidad</label>
                    <input
                      type="text"
                      value={instructorSpecialty}
                      onChange={(e) => setInstructorSpecialty(e.target.value)}
                      placeholder="Ej: Director Académico"
                      className="w-full h-10 px-3 rounded-lg border border-secondary-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-xs font-bold text-secondary-600 uppercase tracking-wide block mb-2">Firma</label>
                  <SignaturePad onSave={(file) => setSignatureImage(file ?? null)} />
                </div>
              </div>

              {error && <Alert type="error">{error}</Alert>}
            </div>
          </Card>

          <div className="flex justify-between gap-3">
            <Button variant="secondary" size="lg" onClick={() => setStep('preview')}>
              <ArrowLeft className="w-4 h-4" />
              Atrás
            </Button>
            <Button
              size="lg"
              onClick={handleGenerate}
              isLoading={generateBulk.isPending}
              disabled={!templateImage}
            >
              <Send className="w-4 h-4" />
              Generar y Enviar Certificados
            </Button>
          </div>
        </div>
      )}

      {step === 'result' && result && (
        <div className="space-y-6">
          <Card>
            <div className="text-center py-10">
              <div className={`w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg ${
                result.failed === 0
                  ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_8px_24px_rgba(16,185,129,0.40)]'
                  : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_8px_24px_rgba(245,158,11,0.40)]'
              }`}>
                {result.failed === 0
                  ? <CheckCircle className="w-12 h-12 text-white drop-shadow" />
                  : <AlertTriangle className="w-12 h-12 text-white drop-shadow" />}
              </div>

              <h2 className="text-3xl font-black text-secondary-900 mb-2">
                {result.failed === 0 ? '¡Todo enviado!' : 'Proceso completado'}
              </h2>
              <p className="text-secondary-500 font-semibold mb-10">{result.success_rate} de éxito</p>

              <div className="flex justify-center gap-6 flex-wrap">
                {[
                  { value: result.total_rows,  label: 'Total',    color: 'from-secondary-700 to-secondary-900' },
                  { value: result.successful,  label: 'Enviados', color: 'from-emerald-500 to-emerald-700' },
                  { value: result.failed,      label: 'Fallidos', color: 'from-red-500 to-red-700' },
                ].map(({ value, label, color }) => (
                  <div key={label} className="bg-secondary-50 rounded-2xl px-8 py-5 min-w-[120px]">
                    <p className={`text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br ${color}`}>
                      {value}
                    </p>
                    <p className="text-xs text-secondary-500 font-bold uppercase tracking-wide mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {result.errors.length > 0 && (
            <Card title="Errores detectados">
              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {result.errors.map((err, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-800">Fila {err.row}: {err.field || 'Error'}</p>
                      <p className="text-sm text-red-600 font-medium mt-0.5">{err.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="flex justify-center gap-4">
            <Button variant="secondary" size="lg" onClick={reset}>
              <RotateCcw className="w-4 h-4" />
              Generar otro lote
            </Button>
            <a href="/certificates">
              <Button size="lg">
                <Award className="w-4 h-4" />
                Ver Certificados
              </Button>
            </a>
          </div>
        </div>
      )}
    </>
  );
};

// ─── By Event Mode (new) ────────────────────────────────────────────────────────
const ByEventMode = () => {
  const [selectedEventId, setSelectedEventId] = useState<number | ''>('');
  const [templateImage, setTemplateImage] = useState<File | null>(null);
  const [templatePreviewUrl, setTemplatePreviewUrl] = useState<string | null>(null);
  const [namePosition, setNamePosition] = useState<NamePosition>({ x: 50, y: 40 });
  const [fontSize, setFontSize] = useState(28);
  const [fontColor, setFontColor] = useState('#1e3a8a');
  const [instructorName, setInstructorName] = useState('');
  const [instructorSpecialty, setInstructorSpecialty] = useState('');
  const [instructorSignatureUrl, setInstructorSignatureUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EventGenerateResult | null>(null);
  const [step, setStep] = useState<'config' | 'result'>('config');
  const [selectedPIds, setSelectedPIds] = useState<number[]>([]);
  const [configSaved, setConfigSaved] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const { data: eventsData } = useEvents({ status: 'active' });
  const { data: eventData, isLoading: isLoadingEvent } = useEvent(Number(selectedEventId));
  const { data: participants, isLoading: isLoadingParticipants } = useEventParticipants(Number(selectedEventId));
  const generateMutation = useEventGenerateCertificates();
  const updateEvent = useUpdateEvent();

  const events = eventsData?.results ?? [];

  const prevEventIdRef = useRef(0);
  useEffect(() => {
    if (eventData && eventData.id !== prevEventIdRef.current) {
      prevEventIdRef.current = eventData.id;
      const imgUrl = eventData.template_image
        ? (eventData.template_image.startsWith('http') ? eventData.template_image : `${API_URL}/media/${eventData.template_image}`)
        : null;
      setTemplatePreviewUrl(imgUrl);
      setNamePosition({
        x: eventData.name_x ?? 50,
        y: eventData.name_y ?? 40,
      });
      setFontSize(eventData.name_font_size ?? 28);
      setFontColor(eventData.font_color ?? '#1e3a8a');
      setInstructorName(eventData.instructor_name || '');
      setInstructorSpecialty(eventData.instructor_specialty || '');
      const sigUrl = eventData.instructor_signature
        ? (eventData.instructor_signature.startsWith('http') ? eventData.instructor_signature : `${API_URL}${eventData.instructor_signature}`)
        : null;
      setInstructorSignatureUrl(sigUrl);
    }
  }, [eventData]);

  const prevSelectedRef = useRef<number | ''>('');
  useEffect(() => {
    if (selectedEventId !== prevSelectedRef.current) {
      prevSelectedRef.current = selectedEventId;
      setSelectedPIds([]);
      setConfigSaved(false);
      setResult(null);
      setStep('config');
      setTemplateImage(null);
      setTemplatePreviewUrl(null);
      setNamePosition({ x: 50, y: 40 });
      setFontSize(28);
      setFontColor('#1e3a8a');
      setError(null);
      setInstructorName('');
      setInstructorSpecialty('');
    }
  }, [selectedEventId]);

  const handleImageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10;
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10;
    setNamePosition({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  }, []);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTemplateImage(file);
    setTemplatePreviewUrl(URL.createObjectURL(file));
  };

  const handleSaveConfig = () => {
    if (!selectedEventId) return;
    setError(null);
    updateEvent.mutate(
      {
        id: Number(selectedEventId),
        data: {
          name_x: Math.round(namePosition.x),
          name_y: Math.round(namePosition.y),
          name_font_size: fontSize,
          font_color: fontColor,
        },
      },
      {
        onSuccess: () => {
          setConfigSaved(true);
          setTimeout(() => setConfigSaved(false), 3000);
        },
        onError: () => setError('Error al guardar la configuración'),
      }
    );
  };

  const handleSelectAll = () => {
    if (!participants) return;
    if (selectedPIds.length === participants.length) {
      setSelectedPIds([]);
    } else {
      setSelectedPIds(participants.map(p => p.participant_id));
    }
  };

  const handleSelectParticipant = (pid: number) => {
    setSelectedPIds(prev =>
      prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]
    );
  };

  const handleGenerate = () => {
    if (!selectedEventId) return;
    setError(null);
    generateMutation.mutate(
      {
        id: Number(selectedEventId),
        participantIds: selectedPIds.length > 0 ? selectedPIds : undefined,
      },
      {
        onSuccess: (data) => {
          setResult(data);
          setStep('result');
        },
        onError: (err) => setError((err as Error).message || 'Error al generar certificados'),
      }
    );
  };

  const reset = () => {
    setSelectedEventId('');
    setTemplateImage(null);
    setTemplatePreviewUrl(null);
    setNamePosition({ x: 50, y: 40 });
    setFontSize(28);
    setFontColor('#1e3a8a');
    setInstructorName('');
    setInstructorSpecialty('');
    setInstructorSignatureUrl(null);
    setError(null);
    setResult(null);
    setStep('config');
    setSelectedPIds([]);
    setConfigSaved(false);
  };

  return (
    <>
      {step === 'config' && (
        <div className="space-y-5">
          <Card>
            <div className="max-w-2xl mx-auto space-y-5">
              <Select
                label="Seleccionar Evento"
                value={String(selectedEventId)}
                onChange={(e) => {
                  setSelectedEventId(e.target.value ? Number(e.target.value) : '');
                  setError(null);
                }}
                options={[
                  { value: '', label: 'Selecciona un evento...' },
                  ...events.map((ev) => ({ value: ev.id, label: ev.name })),
                ]}
              />
            </div>
          </Card>

          {selectedEventId && isLoadingEvent && (
            <div className="flex justify-center py-8">
              <Spinner className="w-8 h-8 text-primary-500" />
            </div>
          )}

          {selectedEventId && eventData && (
            <>
              <Card>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-primary-500" />
                    <div>
                      <p className="text-xs text-secondary-500 font-bold uppercase">Fecha</p>
                      <p className="text-sm font-bold text-secondary-800">{eventData.event_date}{eventData.end_date ? ` — ${eventData.end_date}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-primary-500" />
                    <div>
                      <p className="text-xs text-secondary-500 font-bold uppercase">Ubicación</p>
                      <p className="text-sm font-bold text-secondary-800">{eventData.location || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-xl">
                    <User className="w-5 h-5 text-primary-500" />
                    <div>
                      <p className="text-xs text-secondary-500 font-bold uppercase">Instructor</p>
                      <p className="text-sm font-bold text-secondary-800">{eventData.instructor_name || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-xl">
                    <Users className="w-5 h-5 text-primary-500" />
                    <div>
                      <p className="text-xs text-secondary-500 font-bold uppercase">Inscritos</p>
                      <p className="text-sm font-bold text-secondary-800">
                        {isLoadingParticipants ? '...' : `${participants?.length ?? 0}`}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Diseño del Certificado">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-bold text-secondary-700 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs font-black flex items-center justify-center">1</span>
                      Imagen de fondo del certificado
                    </p>
                    <p className="text-xs text-secondary-400 mb-3">
                      {eventData.template_image
                        ? 'El evento ya tiene una imagen guardada. Puedes cambiarla subiendo una nueva.'
                        : 'El evento no tiene imagen de fondo. Sube una (PNG o JPG).'}
                    </p>
                    <label className="inline-flex items-center gap-3 px-5 py-3 border-2 border-dashed border-primary-200 rounded-xl cursor-pointer hover:bg-primary-50 hover:border-primary-400 transition-all duration-200 group">
                      <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                        <ImageIcon className="w-[18px] h-[18px] text-primary-500" />
                      </div>
                      <span className="text-sm font-semibold text-secondary-600 group-hover:text-primary-600 transition-colors">
                        {templateImage ? templateImage.name : 'Seleccionar imagen...'}
                      </span>
                      <input type="file" accept=".png,.jpg,.jpeg" onChange={handleImageFile} className="hidden" />
                    </label>
                  </div>

                  {templatePreviewUrl && (
                    <div className="space-y-5">
                      <p className="text-sm font-bold text-secondary-700 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs font-black flex items-center justify-center">2</span>
                        <MousePointer className="w-4 h-4 text-primary-500" />
                        Haz clic en la imagen para colocar el nombre del participante
                      </p>

                      <div
                        ref={imageContainerRef}
                        className="relative cursor-crosshair rounded-2xl overflow-hidden border-2 border-primary-300 select-none shadow-[0_4px_20px_rgba(59,130,246,0.20)]"
                        onClick={handleImageClick}
                      >
                        <img
                          src={templatePreviewUrl}
                          alt="Plantilla"
                          className="w-full block pointer-events-none"
                          draggable={false}
                        />
                        <div
                          className="absolute w-4 h-4 rounded-full bg-primary-500 border-3 border-white shadow-glow pointer-events-none"
                          style={{ left: `${namePosition.x}%`, top: `${namePosition.y}%`, transform: 'translate(-50%, -50%)', borderWidth: 3 }}
                        />
                        <div
                          className="absolute pointer-events-none font-black drop-shadow-sm whitespace-nowrap"
                          style={{
                            left: `${namePosition.x}%`,
                            top: `${namePosition.y}%`,
                            transform: 'translate(-50%, -50%)',
                            fontSize: `${Math.max(10, fontSize * 0.55)}px`,
                            color: fontColor,
                            textShadow: '0 0 6px rgba(255,255,255,0.95)',
                          }}
                        >
                          NOMBRE APELLIDO
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-1">
                        <div className="space-y-2 bg-secondary-50 rounded-xl p-4">
                          <label className="text-xs font-bold text-secondary-600 uppercase tracking-wide">
                            Tamaño de letra — {fontSize}px
                          </label>
                          <input
                            type="range" min={12} max={72} value={fontSize}
                            onChange={(e) => setFontSize(Number(e.target.value))}
                            className="w-full accent-primary-500 cursor-pointer"
                          />
                        </div>
                        <div className="space-y-2 bg-secondary-50 rounded-xl p-4">
                          <label className="text-xs font-bold text-secondary-600 uppercase tracking-wide">Color del nombre</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color" value={fontColor}
                              onChange={(e) => setFontColor(e.target.value)}
                              className="w-10 h-9 rounded-lg cursor-pointer border-2 border-secondary-200"
                            />
                            <span className="text-sm text-secondary-600 font-mono font-bold">{fontColor}</span>
                          </div>
                        </div>
                        <div className="space-y-2 bg-secondary-50 rounded-xl p-4">
                          <label className="text-xs font-bold text-secondary-600 uppercase tracking-wide">Posición</label>
                          <p className="text-sm text-secondary-700 font-mono font-bold">
                            X: {namePosition.x.toFixed(1)}% · Y: {namePosition.y.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button
                      size="md"
                      variant={configSaved ? 'primary' : 'secondary'}
                      onClick={handleSaveConfig}
                      isLoading={updateEvent.isPending}
                    >
                      <Save className="w-4 h-4" />
                      {configSaved ? '¡Guardado!' : 'Guardar posición en el evento'}
                    </Button>
                  </div>
                </div>
              </Card>

              <Card title="Instructor">
                <div className="space-y-4">
                  <p className="text-xs text-secondary-400">
                    Los datos del instructor se cargan del evento. Puedes sobrescribirlos para esta emisión.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-secondary-600 uppercase tracking-wide">Nombre del instructor</label>
                      <input
                        type="text"
                        value={instructorName}
                        onChange={(e) => setInstructorName(e.target.value)}
                        placeholder="Ej: Dr. Juan Pérez"
                        className="w-full h-10 px-3 rounded-lg border border-secondary-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-secondary-600 uppercase tracking-wide">Cargo / Especialidad</label>
                      <input
                        type="text"
                        value={instructorSpecialty}
                        onChange={(e) => setInstructorSpecialty(e.target.value)}
                        placeholder="Ej: Director Académico"
                        className="w-full h-10 px-3 rounded-lg border border-secondary-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  {instructorSignatureUrl && (
                    <div>
                      <label className="text-xs font-bold text-secondary-600 uppercase tracking-wide block mb-2">Firma guardada</label>
                      <img
                        src={instructorSignatureUrl}
                        alt="Firma del instructor"
                        className="max-h-16 object-contain border border-secondary-200 rounded-lg p-2 bg-white"
                      />
                    </div>
                  )}
                </div>
              </Card>

              <Card title="Participantes">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-secondary-600">
                      {participants?.length ?? 0} participantes inscritos
                      {selectedPIds.length > 0 && (
                        <span className="ml-2 font-bold text-primary-600">({selectedPIds.length} seleccionados)</span>
                      )}
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      {selectedPIds.length === participants?.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    </Button>
                  </div>

                  {isLoadingParticipants ? (
                    <div className="flex justify-center py-8">
                      <Spinner className="w-8 h-8 text-primary-500" />
                    </div>
                  ) : participants && participants.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-secondary-100 max-h-80 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gradient-to-r from-primary-50 to-blue-50 border-b border-secondary-100">
                            <th className="py-3 px-4 w-12">
                              <input
                                type="checkbox"
                                checked={participants.length > 0 && selectedPIds.length === participants.length}
                                onChange={handleSelectAll}
                                className="w-4 h-4 accent-primary-500 cursor-pointer"
                              />
                            </th>
                            <th className="py-3 px-4 text-left text-xs font-bold text-primary-600 uppercase tracking-wider">Participante</th>
                            <th className="py-3 px-4 text-left text-xs font-bold text-primary-600 uppercase tracking-wider">Email</th>
                            <th className="py-3 px-4 text-left text-xs font-bold text-primary-600 uppercase tracking-wider">Asistencia</th>
                            <th className="py-3 px-4 text-left text-xs font-bold text-primary-600 uppercase tracking-wider">Certificado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-100">
                          {participants.map((p) => (
                            <tr key={p.enrollment_id} className="hover:bg-primary-50/40 transition-colors">
                              <td className="py-2.5 px-4">
                                <input
                                  type="checkbox"
                                  checked={selectedPIds.includes(p.participant_id)}
                                  onChange={() => handleSelectParticipant(p.participant_id)}
                                  className="w-4 h-4 accent-primary-500 cursor-pointer"
                                />
                              </td>
                              <td className="py-2.5 px-4 text-secondary-800 font-bold">{p.participant_name}</td>
                              <td className="py-2.5 px-4 text-secondary-600">{p.participant_email}</td>
                              <td className="py-2.5 px-4">
                                {p.attendance
                                  ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold"><CheckCircle className="w-3 h-3" /> Sí</span>
                                  : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold"><XCircle className="w-3 h-3" /> No</span>
                                }
                              </td>
                              <td className="py-2.5 px-4">
                                {p.has_certificate
                                  ? <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                      p.certificate_status === 'sent' ? 'bg-emerald-100 text-emerald-700' :
                                      p.certificate_status === 'generated' ? 'bg-blue-100 text-blue-700' :
                                      p.certificate_status === 'failed' ? 'bg-red-100 text-red-700' :
                                      'bg-amber-100 text-amber-700'
                                    }`}>{p.certificate_status_display || p.certificate_status}</span>
                                  : <span className="text-secondary-400 text-xs">—</span>
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <Alert type="info">
                      No hay participantes inscritos en este evento.
                    </Alert>
                  )}
                </div>
              </Card>

              {error && <Alert type="error">{error}</Alert>}

              <div className="flex justify-center gap-4 pt-2">
                <Button
                  size="lg"
                  onClick={handleGenerate}
                  isLoading={generateMutation.isPending}
                  disabled={!selectedEventId || (participants && participants.length === 0)}
                >
                  <Send className="w-4 h-4" />
                  Emitir Certificados
                  {selectedPIds.length > 0 ? ` (${selectedPIds.length})` : ''}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {step === 'result' && result && (
        <div className="space-y-6">
          <Card>
            <div className="text-center py-10">
              <div className={`w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg ${
                result.errors === 0
                  ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_8px_24px_rgba(16,185,129,0.40)]'
                  : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_8px_24px_rgba(245,158,11,0.40)]'
              }`}>
                {result.errors === 0
                  ? <CheckCircle className="w-12 h-12 text-white drop-shadow" />
                  : <AlertTriangle className="w-12 h-12 text-white drop-shadow" />}
              </div>

              <h2 className="text-3xl font-black text-secondary-900 mb-2">
                {result.errors === 0 ? '¡Certificados emitidos!' : 'Proceso completado'}
              </h2>
              <p className="text-secondary-500 font-semibold mb-10">
                {result.created} creados, {result.already_exists} ya existían, {result.errors} errores
              </p>

              <div className="flex justify-center gap-6 flex-wrap">
                {[
                  { value: result.total_enrollments, label: 'Total inscritos', color: 'from-secondary-700 to-secondary-900' },
                  { value: result.created, label: 'Generados', color: 'from-emerald-500 to-emerald-700' },
                  { value: result.errors, label: 'Errores', color: 'from-red-500 to-red-700' },
                ].map(({ value, label, color }) => (
                  <div key={label} className="bg-secondary-50 rounded-2xl px-8 py-5 min-w-[120px]">
                    <p className={`text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br ${color}`}>
                      {value}
                    </p>
                    <p className="text-xs text-secondary-500 font-bold uppercase tracking-wide mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {result.errors > 0 && result.results?.errors?.length > 0 && (
            <Card title="Errores detectados">
              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {result.results.errors.map((err, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-800">{err.participant_name}</p>
                      <p className="text-sm text-red-600 font-medium mt-0.5">{err.error}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="flex justify-center gap-4">
            <Button variant="secondary" size="lg" onClick={reset}>
              <RotateCcw className="w-4 h-4" />
              Emitir otro lote
            </Button>
            <a href="/certificates">
              <Button size="lg">
                <Award className="w-4 h-4" />
                Ver Certificados
              </Button>
            </a>
          </div>
        </div>
      )}
    </>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export const BulkGeneratePage = () => {
  const [mode, setMode] = useState<Mode>('by-event');

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold uppercase tracking-widest mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Certificación Masiva
        </div>
        <h1 className="text-3xl lg:text-4xl font-black text-secondary-900 tracking-tight">
          Generación{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-blue-400">
            en Masa
          </span>
        </h1>
        <p className="text-secondary-500 font-medium text-base">
          Genera y envía certificados a todos tus participantes
        </p>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex bg-white rounded-2xl p-1.5 shadow-card border border-secondary-100">
          <button
            onClick={() => setMode('by-event')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              mode === 'by-event'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.40)]'
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Por Evento
          </button>
          <button
            onClick={() => setMode('by-excel')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              mode === 'by-excel'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.40)]'
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Por Excel
          </button>
        </div>
      </div>

      {mode === 'by-event' ? <ByEventMode /> : <ByExcelMode />}
    </div>
  );
};
