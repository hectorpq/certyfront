import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Image, Move } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, Button, Modal, Input, Badge, Alert } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';

const templateSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  category: z.string().optional(),
  is_active: z.boolean().optional(),
});

type TemplateForm = z.infer<typeof templateSchema>;

interface LayoutConfig {
  student_name?: { x: number; y: number; font_size: number; font_family: string; color: string };
  event_name?: { x: number; y: number; font_size: number; font_family: string; color: string };
  event_date?: { x: number; y: number; font_size: number; font_family: string; color: string };
  verification_code?: { x: number; y: number; font_size: number; font_family: string; color: string };
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
  created_by_name?: string;
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
  const [templates, setTemplates] = useState<TemplateResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateResponse | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
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
      const token = localStorage.getItem('access_token');
      const response = await api.get('/api/templates/', {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    if (template) {
      reset({
        name: template.name,
        category: template.category || '',
        is_active: template.is_active,
      });
      setLayoutConfig(template.layout_config || {
        student_name: { x: 100, y: 150, font_size: 24, font_family: 'Arial', color: '#000000' },
      });
      setPreviewImage(template.background_image_url || null);
    } else {
      reset({
        name: '',
        category: '',
        is_active: true,
      });
      setLayoutConfig({
        student_name: { x: 100, y: 150, font_size: 24, font_family: 'Arial', color: '#000000' },
      });
      setPreviewImage(null);
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
    setServerError(null);
    setSelectedFile(null);
    setPreviewImage(null);
    reset();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

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

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleSave = async (data: TemplateForm) => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };

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

      let savedTemplate;
      let templateId: number;
      if (editingTemplate) {
        const response = await api.put(`/api/templates/${editingTemplate.id}/`, templateData, { headers });
        savedTemplate = response.data;
        templateId = editingTemplate.id;
      } else {
        const response = await api.post('/api/templates/', templateData, { headers });
        savedTemplate = response.data;
        templateId = savedTemplate.id;
      }

      if (selectedFile && templateId) {
        try {
          const formData = new FormData();
          formData.append('file', selectedFile);
          await api.post(`/api/templates/${templateId}/upload-image/`, formData, {
            headers: { 
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (uploadErr) {
          console.error('Image upload error:', uploadErr);
        }
      }

      closeModal();
      fetchTemplates();
    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown; status?: number } };
      console.error('Template save error:', err.response?.data);
      const errors = err.response?.data as Record<string, unknown> | undefined;
      if (errors) {
        const errorMessages = Object.values(errors).flat().join(', ');
        setServerError(errorMessages);
      } else {
        setServerError('Error al guardar plantilla');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta plantilla?')) return;

    try {
      const token = localStorage.getItem('access_token');
      await api.delete(`/api/templates/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
                  <img
                    src={template.background_image_url}
                    alt={template.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image className="w-12 h-12 text-secondary-300" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-secondary-900 truncate">{template.name}</h3>
                <p className="text-xs text-secondary-400 mt-0.5">{template.category || 'Sin categoría'}</p>
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
          {serverError && (
            <Alert type="error">{serverError}</Alert>
          )}

          <Input
            label="Nombre"
            {...register('name')}
            error={errors.name?.message}
          />

          <Input
            label="Categoría"
            {...register('category')}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              {...register('is_active')}
              className="rounded border-secondary-300"
            />
            <label htmlFor="is_active" className="text-sm text-secondary-700">
              Plantilla activa
            </label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary-600 uppercase tracking-wider mb-1.5">Color de letra</label>
              <input
                type="color"
                value={layoutConfig.student_name?.color || '#000000'}
                onChange={(e) => setLayoutConfig((prev) => ({
                  ...prev,
                  student_name: { ...prev.student_name!, color: e.target.value }
                }))}
                className="w-full h-10 rounded-lg border border-secondary-200 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-600 uppercase tracking-wider mb-1.5">Tipo de letra</label>
              <select
                value={layoutConfig.student_name?.font_family || 'Helvetica'}
                onChange={(e) => setLayoutConfig((prev) => ({
                  ...prev,
                  student_name: { ...prev.student_name!, font_family: e.target.value }
                }))}
                className="w-full h-10 px-3 rounded-lg border border-secondary-200 hover:border-secondary-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
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
                onChange={(e) => setLayoutConfig((prev) => ({
                  ...prev,
                  student_name: { ...prev.student_name!, font_size: parseInt(e.target.value) || 24 }
                }))}
                className="w-full h-10 px-3 rounded-lg border border-secondary-200 hover:border-secondary-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                min={8}
                max={72}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-600 uppercase tracking-wider mb-1.5">
              Imagen de Fondo
            </label>
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
                Previsualización — arrastra el nombre para posicionar
              </label>
              <div
                ref={previewRef}
                className="relative w-full aspect-[1.4/1] bg-secondary-100 rounded-lg overflow-hidden cursor-move select-none"
                onMouseMove={handleDrag}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-full object-contain"
                  draggable={false}
                />
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
                Posición X: {Math.round(layoutConfig.student_name?.x || 0)}, Y: {Math.round(layoutConfig.student_name?.y || 0)}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingTemplate ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TemplatesPage;