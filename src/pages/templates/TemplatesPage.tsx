import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Image, Move } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, Button, Modal, Input, Badge, Alert, SignaturePad } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useInstructors } from '@/hooks/useInstructors';
import api from '@/services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getMediaUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
};

const templateSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  category: z.string().optional(),
  is_active: z.boolean().optional(),
});

type TemplateForm = z.infer<typeof templateSchema>;

interface LayoutConfig {
  student_name?: { x: number; y: number; font_size: number; font_family: string; color: string };
  signature?: { image_path?: string; image_url?: string; instructor_name?: string; instructor_specialty?: string };
}

interface TemplateResponse {
  id: number;
  name: string;
  category: string;
  background_image: number | null;
  background_url: string;
  background_image_url?: string;
  preview_url: string;
  layout_config: LayoutConfig;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  font_color?: string;
  font_family?: string;
  font_size?: number;
  x_coord?: number;
  y_coord?: number;
}

const TemplatesPage = () => {
  const { isAdmin } = useAuth();
  const { data: instructors } = useInstructors();
  const [templates, setTemplates] = useState<TemplateResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateResponse | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Background image
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Signature
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [instructorName, setInstructorName] = useState('');
  const [instructorSpecialty, setInstructorSpecialty] = useState('');
  const [selectedInstructorId, setSelectedInstructorId] = useState<number | ''>('');

  // Name layout
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    student_name: { x: 100, y: 150, font_size: 24, font_family: 'Arial', color: '#000000' },
  });
  const [containerHeight, setContainerHeight] = useState(400);
  const [isDragging, setIsDragging] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previewRef.current) {
      setContainerHeight(previewRef.current.offsetHeight);
    }
  }, [previewImage]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TemplateForm>({
    resolver: zodResolver(templateSchema),
  });

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/templates/');
      setTemplates(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const openModal = (template?: TemplateResponse) => {
    setEditingTemplate(template || null);
    setServerError(null);
    setSelectedFile(null);
    setSignatureFile(null);
    setSignaturePreview(null);

    if (template) {
      reset({ name: template.name, category: template.category || '', is_active: template.is_active });
      setLayoutConfig(template.layout_config || {
        student_name: { x: 100, y: 150, font_size: 24, font_family: 'Arial', color: '#000000' },
      });
      setPreviewImage(template.background_image_url || null);
      const sig = template.layout_config?.signature;
      setInstructorName(sig?.instructor_name || '');
      setInstructorSpecialty(sig?.instructor_specialty || '');
      setSignaturePreview(getMediaUrl(sig?.image_url));
    } else {
      reset({ name: '', category: '', is_active: true });
      setLayoutConfig({ student_name: { x: 100, y: 150, font_size: 24, font_family: 'Arial', color: '#000000' } });
      setPreviewImage(null);
      setInstructorName('');
      setInstructorSpecialty('');
    }
    setSelectedInstructorId('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
    setServerError(null);
    setSelectedFile(null);
    setSignatureFile(null);
    setSignaturePreview(null);
    setSelectedInstructorId('');
    reset();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDragStart = (e: React.MouseEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragEnd = () => setIsDragging(false);

  const handleDrag = (e: React.MouseEvent) => {
    if (!isDragging || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = rect.height - (e.clientY - rect.top);
    setLayoutConfig((prev) => ({
      ...prev,
      student_name: {
        ...prev.student_name!,
        x: Math.max(0, Math.min(x, rect.width)),
        y: Math.max(0, Math.min(y, rect.height)),
      },
    }));
  };

  const handleSave = async (data: TemplateForm) => {
    setServerError(null);
    try {
      const templateData = {
        name: data.name,
        category: data.category || '',
        is_active: data.is_active ?? true,
        font_color: String(layoutConfig.student_name?.color || '#000000'),
        font_family: String(layoutConfig.student_name?.font_family || 'Helvetica'),
        font_size: Number(layoutConfig.student_name?.font_size) || 24,
        x_coord: Number(layoutConfig.student_name?.x) || 100,
        y_coord: Number(layoutConfig.student_name?.y) || 150,
      };

      let templateId: number;

      if (editingTemplate) {
        await api.put(`/api/templates/${editingTemplate.id}/`, templateData);
        templateId = editingTemplate.id;
      } else {
        const response = await api.post('/api/templates/', templateData);
        templateId = response.data.id; // now included thanks to TemplateCreateSerializer fix
      }

      // Upload background image if selected
      if (selectedFile && templateId) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        await api.post(`/api/templates/${templateId}/upload-image/`, formData);
      }

      // Upload signature if image or name provided
      if ((signatureFile || instructorName) && templateId) {
        const sigForm = new FormData();
        if (signatureFile) sigForm.append('signature_image', signatureFile);
        if (instructorName) sigForm.append('instructor_name', instructorName);
        if (instructorSpecialty) sigForm.append('instructor_specialty', instructorSpecialty);
        await api.post(`/api/templates/${templateId}/upload-signature/`, sigForm);
      }

      closeModal();
      fetchTemplates();
    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown } };
      console.error('Template save error:', err.response?.data);
      const errors = err.response?.data as Record<string, unknown> | undefined;
      if (errors) {
        setServerError(Object.values(errors).flat().join(', '));
      } else {
        setServerError('Error al guardar plantilla');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta plantilla?')) return;
    try {
      await api.delete(`/api/templates/${id}/`);
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">Plantillas</h1>
          <p className="text-sm text-secondary-500 mt-0.5">Gestiona las plantillas de certificados</p>
        </div>
        {isAdmin && (
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Plantilla
          </Button>
        )}
      </div>

      {templates.length === 0 ? (
        <Card className="py-16 text-center">
          <Image className="w-12 h-12 mx-auto text-secondary-300 mb-3" />
          <p className="font-medium text-secondary-700 mb-1">No hay plantillas disponibles</p>
          <p className="text-sm text-secondary-400 mb-5">Crea tu primera plantilla de certificado</p>
          {isAdmin && (
            <Button onClick={() => openModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Crear primera plantilla
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="rounded-2xl border border-secondary-200 bg-white overflow-hidden shadow-[0_1px_4px_0_rgba(0,0,0,0.06)] hover:shadow-md hover:border-primary-200 transition-all">
              <div className="aspect-video bg-secondary-100 flex items-center justify-center overflow-hidden">
                {template.background_image_url ? (
                  <img src={template.background_image_url} alt={template.name} className="w-full h-full object-contain" />
                ) : (
                  <Image className="w-12 h-12 text-secondary-300" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-secondary-900 truncate">{template.name}</h3>
                <p className="text-xs text-secondary-400 mt-0.5">{template.category || 'Sin categoría'}</p>
                {template.layout_config?.signature?.instructor_name && (
                  <p className="text-xs text-primary-600 mt-0.5">
                    ✍ {template.layout_config.signature.instructor_name}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <Badge variant={template.is_active ? 'success' : 'default'} dot>
                    {template.is_active ? 'Activa' : 'Inactiva'}
                  </Badge>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => openModal(template)}
                        className="p-1.5 rounded-lg text-secondary-400 hover:text-secondary-700 hover:bg-secondary-100 transition-all"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="p-1.5 rounded-lg text-secondary-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
        size="lg"
      >
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          {serverError && <Alert type="error">{serverError}</Alert>}

          <Input label="Nombre" {...register('name')} error={errors.name?.message} />
          <Input label="Categoría" {...register('category')} />

          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" {...register('is_active')} className="rounded border-secondary-300" />
            <label htmlFor="is_active" className="text-sm text-secondary-700">Plantilla activa</label>
          </div>

          {/* Name style */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary-600 uppercase tracking-wider mb-1.5">Color de nombre</label>
              <input
                type="color"
                value={layoutConfig.student_name?.color || '#000000'}
                onChange={(e) => setLayoutConfig((prev) => ({ ...prev, student_name: { ...prev.student_name!, color: e.target.value } }))}
                className="w-full h-10 rounded-lg border border-secondary-200 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-600 uppercase tracking-wider mb-1.5">Fuente</label>
              <select
                value={layoutConfig.student_name?.font_family || 'Helvetica'}
                onChange={(e) => setLayoutConfig((prev) => ({ ...prev, student_name: { ...prev.student_name!, font_family: e.target.value } }))}
                className="w-full h-10 px-3 rounded-lg border border-secondary-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              >
                <option value="Helvetica">Helvetica</option>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-600 uppercase tracking-wider mb-1.5">Tamaño</label>
              <input
                type="number"
                value={layoutConfig.student_name?.font_size || 24}
                onChange={(e) => setLayoutConfig((prev) => ({ ...prev, student_name: { ...prev.student_name!, font_size: parseInt(e.target.value) || 24 } }))}
                className="w-full h-10 px-3 rounded-lg border border-secondary-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                min={8} max={72}
              />
            </div>
          </div>

          {/* Background image */}
          <div>
            <label className="block text-xs font-semibold text-secondary-600 uppercase tracking-wider mb-1.5">Imagen de Fondo</label>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleImageSelect}
              className="text-sm text-secondary-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>

          {previewImage && (
            <div>
              <label className="block text-xs font-semibold text-secondary-600 uppercase tracking-wider mb-1.5">
                Posición del nombre — arrastra para ajustar
              </label>
              <div
                ref={previewRef}
                className="relative w-full aspect-[1.4/1] bg-secondary-100 rounded-lg overflow-hidden cursor-move select-none"
                onMouseMove={handleDrag}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
                <img src={previewImage} alt="Preview" className="w-full h-full object-contain" draggable={false} />
                <div
                  className="absolute flex items-center gap-1 px-2 py-1 bg-white/90 rounded shadow-md text-xs font-bold text-primary-700 border-2 border-primary-500"
                  style={{
                    left: layoutConfig.student_name?.x || 100,
                    top: containerHeight - (layoutConfig.student_name?.y || 150),
                    transform: 'translate(-50%, -50%)',
                    cursor: isDragging ? 'grabbing' : 'grab',
                  }}
                  onMouseDown={handleDragStart}
                >
                  <Move className="w-3 h-3" />
                  NOMBRE
                </div>
              </div>
              <p className="text-xs text-secondary-500 mt-1">
                X: {Math.round(layoutConfig.student_name?.x || 0)} · Y: {Math.round(layoutConfig.student_name?.y || 0)}
              </p>
            </div>
          )}

          {/* Firma digital */}
          <div className="border-t border-secondary-100 pt-4 space-y-3">
            <label className="block text-xs font-semibold text-secondary-600 uppercase tracking-wider">
              Firma Digital del Instructor (opcional)
            </label>

            {/* Selector de instructor */}
            {instructors && instructors.length > 0 && (
              <div>
                <label className="block text-xs text-secondary-500 mb-1">Seleccionar instructor registrado</label>
                <select
                  value={selectedInstructorId}
                  onChange={(e) => {
                    const id = e.target.value === '' ? '' : Number(e.target.value);
                    setSelectedInstructorId(id);
                    if (id === '') {
                      setInstructorName('');
                      setInstructorSpecialty('');
                      setSignaturePreview(null);
                      setSignatureFile(null);
                    } else {
                      const inst = instructors.find((i) => i.id === id);
                      if (inst) {
                        setInstructorName(inst.full_name);
                        setInstructorSpecialty(inst.specialty || '');
                        const url = getMediaUrl(inst.signature_image);
                        setSignaturePreview(url);
                        if (url) {
                          fetch(url)
                            .then((r) => r.blob())
                            .then((blob) => setSignatureFile(new File([blob], 'firma.png', { type: blob.type })))
                            .catch(() => {});
                        } else {
                          setSignatureFile(null);
                        }
                      }
                    }
                  }}
                  className="w-full h-9 px-3 rounded-lg border border-secondary-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                >
                  <option value="">— Seleccionar instructor —</option>
                  {instructors.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.full_name}{i.specialty ? ` — ${i.specialty}` : ''}
                      {i.signature_image ? ' ✓' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-secondary-400 mt-1">✓ indica que el instructor tiene firma guardada</p>
              </div>
            )}

            {/* Nombre y cargo (editable, se rellena al seleccionar) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-secondary-500 mb-1">Nombre del instructor</label>
                <input
                  type="text"
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  placeholder="Ej: Dr. Juan Pérez"
                  className="w-full h-9 px-3 rounded-lg border border-secondary-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-secondary-500 mb-1">Cargo / Especialidad</label>
                <input
                  type="text"
                  value={instructorSpecialty}
                  onChange={(e) => setInstructorSpecialty(e.target.value)}
                  placeholder="Ej: Director Académico"
                  className="w-full h-9 px-3 rounded-lg border border-secondary-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </div>
            </div>

            <SignaturePad
              onSave={(file) => setSignatureFile(file)}
              initialPreview={signaturePreview}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit">{editingTemplate ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TemplatesPage;
