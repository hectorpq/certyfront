import { Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  isLoading?: boolean;
  error?: string;
  success?: boolean;
  label?: string;
}

export const FileUpload = ({
  onFileSelect,
  accept = '.xlsx,.xls',
  isLoading,
  error,
  success,
  label = 'Arrastra un archivo o haz clic para seleccionar',
}: FileUploadProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full">
      <label className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-secondary-300 rounded-xl cursor-pointer bg-secondary-50 hover:bg-secondary-100 transition-colors">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isLoading ? (
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-3" />
          ) : success ? (
            <CheckCircle className="w-10 h-10 text-success mb-3" />
          ) : error ? (
            <AlertCircle className="w-10 h-10 text-error mb-3" />
          ) : (
            <Upload className="w-10 h-10 text-secondary-400 mb-3" />
          )}
          <p className={`text-sm ${error ? 'text-error' : success ? 'text-success' : 'text-secondary-600'}`}>
            {isLoading ? 'Procesando...' : error || (success ? '¡Archivo cargado exitosamente!' : label)}
          </p>
          <p className="text-xs text-secondary-400 mt-1">Archivos Excel (.xlsx, .xls)</p>
        </div>
        <input
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
          disabled={isLoading}
        />
      </label>
    </div>
  );
};
