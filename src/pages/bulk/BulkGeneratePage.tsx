import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, Button, FileUpload, Alert } from '@/components/ui';
import { usePreviewExcel, useGenerateBulk } from '@/hooks/useCertificates';
import type { ExcelPreview, BulkImportResult } from '@/types';

type Step = 'upload' | 'preview' | 'result';

export const BulkGeneratePage = () => {
  const [step, setStep] = useState<Step>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ExcelPreview | null>(null);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previewExcel = usePreviewExcel();
  const generateBulk = useGenerateBulk();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
    previewExcel.mutate({ file }, {
      onSuccess: (data) => {
        setPreviewData(data);
        setStep('preview');
      },
      onError: (err) => {
        setError(err.message || 'Error al procesar el archivo');
      },
    });
  };

  const handleGenerate = () => {
    if (selectedFile) {
      generateBulk.mutate({ file: selectedFile }, {
        onSuccess: (data) => {
          setResult(data);
          setStep('result');
        },
        onError: (err) => {
          setError(err.message || 'Error al generar certificados');
        },
      });
    }
  };

  const reset = () => {
    setStep('upload');
    setSelectedFile(null);
    setPreviewData(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Generación Masiva</h1>
          <p className="text-secondary-600">Genera certificados desde un archivo Excel</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-primary-500' : 'text-secondary-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'upload' ? 'bg-primary-500 text-white' : 'bg-success text-white'}`}>
            {step !== 'upload' ? <CheckCircle className="w-5 h-5" /> : '1'}
          </div>
          <span className="font-medium">Subir Archivo</span>
        </div>
        <ArrowRight className="w-5 h-5 text-secondary-300" />
        <div className={`flex items-center gap-2 ${step === 'preview' ? 'text-primary-500' : step === 'result' ? 'text-success' : 'text-secondary-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'preview' ? 'bg-primary-500 text-white' : step === 'result' ? 'bg-success text-white' : 'bg-secondary-200'}`}>
            {step === 'result' ? <CheckCircle className="w-5 h-5" /> : '2'}
          </div>
          <span className="font-medium">Revisar Datos</span>
        </div>
        <ArrowRight className="w-5 h-5 text-secondary-300" />
        <div className={`flex items-center gap-2 ${step === 'result' ? 'text-primary-500' : 'text-secondary-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'result' ? 'bg-primary-500 text-white' : 'bg-secondary-200'}`}>
            3
          </div>
          <span className="font-medium">Resultados</span>
        </div>
      </div>

      {step === 'upload' && (
        <Card>
          <div className="max-w-xl mx-auto">
            <Alert type="info" className="mb-6">
              <p className="font-medium mb-2">Formato esperado del archivo Excel:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li><strong>full_name</strong>: Nombre completo del estudiante</li>
                <li><strong>email</strong>: Correo electrónico</li>
                <li><strong>document_id</strong>: Documento de identidad (único)</li>
                <li><strong>event_name</strong>: Nombre del evento (debe existir en el sistema)</li>
                <li><strong>phone</strong>: Teléfono (opcional)</li>
              </ul>
            </Alert>

            <FileUpload
              onFileSelect={handleFileSelect}
              isLoading={previewExcel.isPending}
              error={error || undefined}
            />

            {error && (
              <Alert type="error" className="mt-4">
                {error}
              </Alert>
            )}
          </div>
        </Card>
      )}

      {step === 'preview' && previewData && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-secondary-900">
                  <FileSpreadsheet className="w-5 h-5 inline mr-2 text-success" />
                  Archivo cargado exitosamente
                </p>
                <p className="text-sm text-secondary-500">
                  {previewData.row_count} registros encontrados
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={reset}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cambiar Archivo
                </Button>
                <Button onClick={handleGenerate} isLoading={generateBulk.isPending}>
                  Generar Certificados
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {error && (
              <Alert type="error">{error}</Alert>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-secondary-200 bg-secondary-50">
                    <th className="text-left py-2 px-3 font-semibold text-secondary-700">#</th>
                    {previewData.columns.map((col) => (
                      <th key={col} className="text-left py-2 px-3 font-semibold text-secondary-700 capitalize">
                        {col.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.data.slice(0, 20).map((row, idx) => (
                    <tr key={idx} className="border-b border-secondary-100">
                      <td className="py-2 px-3 text-secondary-500">{idx + 1}</td>
                      {previewData.columns.map((col) => (
                        <td key={col} className="py-2 px-3 text-secondary-900">
                          {String(row[col] || '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.row_count > 20 && (
                <p className="text-center py-2 text-sm text-secondary-500">
                  Mostrando 20 de {previewData.row_count} registros
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {step === 'result' && result && (
        <div className="space-y-6">
          <Card>
            <div className="text-center py-8">
              <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${result.failed === 0 ? 'bg-success/10' : 'bg-warning/10'}`}>
                {result.failed === 0 ? (
                  <CheckCircle className="w-10 h-10 text-success" />
                ) : (
                  <AlertTriangle className="w-10 h-10 text-warning" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                {result.failed === 0 ? '¡Certificados Generados!' : 'Proceso Completado'}
              </h2>
              <p className="text-secondary-600 mb-6">{result.summary}</p>

              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <p className="text-4xl font-bold text-secondary-900">{result.total_rows}</p>
                  <p className="text-sm text-secondary-500">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-success">{result.successful}</p>
                  <p className="text-sm text-secondary-500">Exitosos</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-error">{result.failed}</p>
                  <p className="text-sm text-secondary-500">Fallidos</p>
                </div>
              </div>
            </div>
          </Card>

          {result.errors.length > 0 && (
            <Card title="Errores Encontrados">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {result.errors.map((err, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-red-50">
                    <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        Fila {err.row}: {err.field || 'Error'}
                      </p>
                      <p className="text-sm text-red-600">{err.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="flex justify-center gap-4">
            <Button variant="secondary" onClick={reset}>
              <Upload className="w-4 h-4 mr-2" />
              Generar Más
            </Button>
            <a href="/certificates">
              <Button>
                Ver Certificados
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
