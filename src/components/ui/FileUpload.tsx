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
    if (file) onFileSelect(file);
  };

  const borderColor = error
    ? 'border-red-300 bg-red-50/40'
    : success
    ? 'border-emerald-300 bg-emerald-50/40'
    : 'border-primary-200 bg-gradient-to-br from-primary-50/60 to-blue-50/40 hover:border-primary-400 hover:from-primary-100/70 hover:to-blue-100/50';

  return (
    <div className="w-full">
      <label
        className={`relative flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 group ${borderColor}`}
      >
        <div className="flex flex-col items-center justify-center gap-3 select-none">
          {isLoading ? (
            <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : success ? (
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
          ) : error ? (
            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 group-hover:scale-110 transition-all duration-200 shadow-glow-sm">
              <Upload className="w-8 h-8 text-primary-500" />
            </div>
          )}

          <div className="text-center">
            <p className={`text-base font-semibold ${error ? 'text-red-600' : success ? 'text-emerald-600' : 'text-secondary-700'}`}>
              {isLoading ? 'Procesando archivo...' : error || (success ? '¡Archivo cargado!' : label)}
            </p>
            {!isLoading && !error && !success && (
              <p className="text-sm text-secondary-400 mt-1">Excel (.xlsx, .xls) — máx. 10 MB</p>
            )}
          </div>

          {!isLoading && !error && !success && (
            <span className="mt-1 px-4 py-1.5 rounded-full bg-primary-500 text-white text-xs font-bold shadow-glow-sm group-hover:shadow-glow transition-all duration-200">
              Seleccionar archivo
            </span>
          )}
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
