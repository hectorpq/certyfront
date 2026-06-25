import { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, RotateCcw, Eye, ImageIcon, MousePointer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, Button, Modal, Input, Select, SearchInput, Pagination, Badge, Textarea, Alert } from '@/components/ui';
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent, useRestoreEvent } from '@/hooks/useEvents';
import { useInstructors } from '@/hooks/useInstructors';
import { useTemplates } from '@/hooks/useTemplates';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import type { Event } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const eventSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().optional(),
  event_date: z.string().min(1, 'Fecha requerida'),
  end_date: z.string().optional(),
  duration_hours: z.string().min(1, 'Duración requerida'),
  location: z.string().min(1, 'Ubicación requerida'),
  status: z.string().min(1, 'Estado requerido'),
  category: z.number().optional(),
  instructor: z.union([z.string(), z.number()]).optional().transform(v =>
    v === '' || v === undefined || v === null ? undefined : Number(v)
  ),
  template: z.union([z.string(), z.number()]).optional().transform(v =>
    v === '' || v === undefined || v === null ? undefined : Number(v)
  ),
});

type EventForm = z.infer<typeof eventSchema>;

const statusOptions = [
  { value: 'draft', label: 'Borrador' },
  { value: 'active', label: 'Activo' },
  { value: 'finished', label: 'Finalizado' },
  { value: 'cancelled', label: 'Cancelado' },
];

export const EventsPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [templateImageFile, setTemplateImageFile] = useState<File | null>(null);
  const [templatePreviewUrl, setTemplatePreviewUrl] = useState<string | null>(null);
  const [editNameX, setEditNameX] = useState(50);
  const [editNameY, setEditNameY] = useState(40);
  const [editNameFontSize, setEditNameFontSize] = useState(28);
  const [editFontColor, setEditFontColor] = useState('#1e3a8a');
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useEvents({ page, search, status: statusFilter || undefined, show_deleted: showDeleted || undefined });
  const { data: instructors } = useInstructors();
  const { data: templates } = useTemplates();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const restoreEvent = useRestoreEvent();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      status: 'draft',
    },
  });

  const openModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      reset({
        name: event.name,
        description: event.description,
        event_date: event.event_date,
        end_date: event.end_date || '',
        duration_hours: String(event.duration_hours),
        location: event.location,
        status: event.status,
        category: event.category ?? undefined,
        instructor: event.instructor,
        template: event.template,
      });
      setTemplateImageFile(null);
      const imgUrl = event.template_image
        ? (event.template_image.startsWith('http') ? event.template_image : `${API_URL}/media/${event.template_image}`)
        : null;
      setTemplatePreviewUrl(imgUrl);
      setEditNameX(event.name_x ?? 50);
      setEditNameY(event.name_y ?? 40);
      setEditNameFontSize(event.name_font_size ?? 28);
      setEditFontColor(event.font_color ?? '#1e3a8a');
    } else {
      setEditingEvent(null);
      reset({ name: '', description: '', event_date: '', end_date: '', duration_hours: '', location: '', status: 'draft', category: undefined, instructor: undefined, template: undefined });
      setTemplateImageFile(null);
      setTemplatePreviewUrl(null);
      setEditNameX(50);
      setEditNameY(40);
      setEditNameFontSize(28);
      setEditFontColor('#1e3a8a');
    }
    setServerError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setServerError(null);
    setTemplateImageFile(null);
    setTemplatePreviewUrl(null);
    reset();
  };

const onSubmit = (dataForm: EventForm) => {
    setServerError(null);

    const url = editingEvent ? `/api/events/${editingEvent.id}/` : '/api/events/';
    const method = editingEvent ? 'patch' : 'post';

    if (templateImageFile) {
      const formData = new FormData();
      formData.append('name', dataForm.name);
      formData.append('description', dataForm.description || '');
      formData.append('event_date', dataForm.event_date);
      formData.append('end_date', dataForm.end_date || '');
      formData.append('duration_hours', dataForm.duration_hours);
      formData.append('location', dataForm.location);
      formData.append('status', dataForm.status);
      if (dataForm.category) formData.append('category', String(dataForm.category));
      if (dataForm.instructor) formData.append('instructor', String(dataForm.instructor));
      if (dataForm.template) formData.append('template', String(dataForm.template));
      formData.append('name_x', String(editNameX));
      formData.append('name_y', String(editNameY));
      formData.append('name_font_size', String(editNameFontSize));
      formData.append('font_color', editFontColor);
      formData.append('template_image', templateImageFile);
      api[method](url, formData).then(closeModal).catch((err) => {
        const errors = err.response?.data;
        if (errors && typeof errors === 'object') {
          const firstError = Object.values(errors as Record<string, unknown[]>).flat()[0];
          setServerError(String(firstError));
        } else {
          setServerError('Error al guardar evento');
        }
      });
      return;
    }

    const payload: Record<string, unknown> = {
      name: dataForm.name,
      description: dataForm.description || '',
      event_date: dataForm.event_date,
      end_date: dataForm.end_date || null,
      duration_hours: parseInt(dataForm.duration_hours),
      location: dataForm.location,
      status: dataForm.status,
      category: dataForm.category ?? null,
      instructor: dataForm.instructor,
      template: dataForm.template,
      name_x: editNameX,
      name_y: editNameY,
      name_font_size: editNameFontSize,
      font_color: editFontColor,
    };

    if (editingEvent) {
      updateEvent.mutate(
        { id: editingEvent.id, data: payload as Partial<Event> },
        {
          onSuccess: closeModal,
          onError: (err: unknown) => {
            const error = err as { response?: { data?: unknown } };
            const errors = error.response?.data;
            if (errors && typeof errors === 'object') {
              const firstError = Object.values(errors as Record<string, unknown[]>).flat()[0];
              setServerError(String(firstError));
            } else {
              setServerError('Error al actualizar evento');
            }
          }
        }
      );
    } else {
      createEvent.mutate(
        payload as Parameters<typeof createEvent.mutate>[0],
        {
          onSuccess: closeModal,
          onError: (err: unknown) => {
            const error = err as { response?: { data?: unknown } };
            const errors = error.response?.data;
            if (errors && typeof errors === 'object') {
              const firstError = Object.values(errors as Record<string, unknown[]>).flat()[0];
              setServerError(String(firstError));
            } else {
              setServerError('Error al crear evento');
            }
          }
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este evento?')) {
      deleteEvent.mutate(id);
    }
  };

  const handleRestore = (id: number) => {
    if (confirm('¿Restaurar este evento?')) restoreEvent.mutate(id);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'default' | 'error'> = {
      active: 'success',
      draft: 'warning',
      finished: 'default',
      cancelled: 'error',
    };
    const labels: Record<string, string> = {
      active: 'Activo',
      draft: 'Borrador',
      finished: 'Finalizado',
      cancelled: 'Cancelado',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">Eventos</h1>
          <p className="text-sm text-secondary-500 mt-0.5">Gestiona los eventos del sistema</p>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <label style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)',
              cursor: 'pointer', userSelect: 'none',
            }}>
              <input
                type="checkbox"
                checked={showDeleted}
                onChange={e => { setShowDeleted(e.target.checked); setPage(1); }}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              Mostrar eliminados
            </label>
            <Button onClick={() => openModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Evento
            </Button>
          </div>
        )}
      </div>

      <Card>
        <div className="flex flex-wrap gap-4 mb-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar eventos..."
            className="flex-1 min-w-[200px]"
          />
          <Select
            options={[{ value: '', label: 'Todos los estados' }, ...statusOptions]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-48"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary-50 border-y border-secondary-100">
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Nombre</th>
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Fecha</th>
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Ubicación</th>
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Duración</th>
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Estado</th>
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Eliminado por</th>
                <th className="text-right py-2.5 px-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
              <tbody className="divide-y divide-secondary-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-secondary-400 text-sm">Cargando...</td>
                  </tr>
                ) : data?.results?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-secondary-400">
                        <Plus className="w-8 h-8 opacity-40" />
                        <span className="text-sm">No hay eventos registrados</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data?.results?.map((event) => (
                    <tr key={event.id} className="hover:bg-secondary-50/60 transition-colors">
                      <td className="py-3 px-4 text-sm font-semibold text-secondary-900">{event.name}</td>
                      <td className="py-3 px-4 text-sm text-secondary-500">
                        {new Date(event.event_date).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-3 px-4 text-sm text-secondary-500">{event.location}</td>
                      <td className="py-3 px-4 text-sm text-secondary-500">{event.duration_hours}h</td>
                      <td className="py-3 px-4">
                        {event.is_deleted ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '4px 12px', borderRadius: 999,
                            fontSize: 11, fontWeight: 700,
                            background: '#FFF7ED',
                            color: '#EA580C',
                            border: '1px solid rgba(234,88,12,0.25)',
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EA580C' }} />
                            Eliminado
                          </span>
                        ) : getStatusBadge(event.status)}
                      </td>
                      <td className="py-3 px-4 text-sm text-secondary-500">
                        {event.is_deleted && event.deleted_by_detail ? (
                          <span>
                            {event.deleted_by_detail.full_name}
                            <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)' }}>
                              {event.deleted_at ? new Date(event.deleted_at).toLocaleString('es-ES') : ''}
                            </span>
                          </span>
                        ) : (
                          <span style={{ color: 'var(--border)', fontWeight: 500 }}>—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => navigate(`/events/${event.id}`)}
                            className="p-1.5 rounded-lg text-primary-500 hover:text-primary-700 hover:bg-primary-50 transition-all"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            event.is_deleted ? (
                              <button
                                onClick={() => handleRestore(event.id)}
                                className="p-1.5 rounded-lg text-secondary-400 hover:text-green-600 hover:bg-green-50 transition-all"
                                title="Restaurar"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => openModal(event)}
                                  className="p-1.5 rounded-lg text-secondary-400 hover:text-secondary-700 hover:bg-secondary-100 transition-all"
                                  title="Editar"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(event.id)}
                                  className="p-1.5 rounded-lg text-secondary-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
            </tbody>
          </table>
        </div>

        {data && data.count > 10 && (
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(data.count / 10)}
            totalItems={data.count}
            itemsPerPage={10}
            onPageChange={setPage}
          />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <Alert type="error">{serverError}</Alert>
          )}
          <Input
            label="Nombre del Evento"
            {...register('name')}
            error={errors.name?.message}
          />
          <Textarea
            label="Descripción"
            {...register('description')}
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fecha de Inicio"
              type="date"
              {...register('event_date')}
              error={errors.event_date?.message}
            />
            <Input
              label="Fecha de Fin"
              type="date"
              {...register('end_date')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duración (horas)"
              type="number"
              {...register('duration_hours')}
              error={errors.duration_hours?.message}
            />
            <Input
              label="Ubicación"
              {...register('location')}
              error={errors.location?.message}
            />
          </div>
          <Select
            label="Estado"
            options={statusOptions}
            {...register('status')}
            error={errors.status?.message}
          />
          {instructors && instructors.length > 0 && (
            <Select
              label="Instructor"
              options={[
                { value: '', label: 'Sin instructor' },
                ...instructors.map((i) => ({ value: i.id, label: i.full_name }))
              ]}
              {...register('instructor')}
            />
          )}
          {templates && templates.length > 0 && (
            <Select
              label="Plantilla de Certificado"
              options={[
                { value: '', label: 'Sin plantilla' },
                ...templates.map((t) => ({ value: t.id, label: t.name }))
              ]}
              {...register('template')}
            />
          )}

          {/* ── Imagen de fondo del certificado ── */}
          <div className="border-t border-secondary-100 pt-4 mt-2">
            <p className="text-sm font-bold text-secondary-700 mb-3">Certificado del Evento</p>
            <div className="space-y-3">
              <label className="inline-flex items-center gap-3 px-4 py-2.5 border-2 border-dashed border-primary-200 rounded-xl cursor-pointer hover:bg-primary-50 hover:border-primary-400 transition-all duration-200 group w-full">
                <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <ImageIcon className="w-[16px] h-[16px] text-primary-500" />
                </div>
                <span className="text-sm font-semibold text-secondary-600 group-hover:text-primary-600 transition-colors">
                  {templateImageFile ? templateImageFile.name : (templatePreviewUrl ? 'Cambiar imagen de fondo...' : 'Subir imagen de fondo del certificado...')}
                </span>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setTemplateImageFile(file);
                      setTemplatePreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                />
              </label>

              {templatePreviewUrl && (
                <div className="space-y-3">
                  <div
                    ref={imageContainerRef}
                    className="relative cursor-crosshair rounded-xl overflow-hidden border border-primary-200 select-none"
                    onClick={(e) => {
                      if (!imageContainerRef.current) return;
                      const rect = imageContainerRef.current.getBoundingClientRect();
                      const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10;
                      const y = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10;
                      setEditNameX(Math.min(100, Math.max(0, x)));
                      setEditNameY(Math.min(100, Math.max(0, y)));
                    }}
                  >
                    <img
                      src={templatePreviewUrl}
                      alt="Vista previa"
                      className="w-full block pointer-events-none"
                      draggable={false}
                    />
                    <div
                      className="absolute w-3 h-3 rounded-full bg-primary-500 border-2 border-white shadow pointer-events-none"
                      style={{ left: `${editNameX}%`, top: `${editNameY}%`, transform: 'translate(-50%, -50%)' }}
                    />
                    <div
                      className="absolute pointer-events-none font-black text-[10px] opacity-80 whitespace-nowrap"
                      style={{
                        left: `${editNameX}%`,
                        top: `${editNameY}%`,
                        transform: 'translate(-50%, -50%)',
                        color: editFontColor,
                        textShadow: '0 0 4px rgba(255,255,255,0.9)',
                      }}
                    >
                      NOMBRE
                    </div>
                  </div>
                  <div className="text-xs text-secondary-400 flex items-center gap-1">
                    <MousePointer className="w-3 h-3" />
                    Haz clic en la imagen para posicionar el nombre
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-secondary-500 uppercase tracking-wide">X%</label>
                      <input
                        type="number" min={0} max={100}
                        value={editNameX}
                        onChange={(e) => setEditNameX(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-full h-8 px-2 rounded-lg border border-secondary-200 text-sm text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-secondary-500 uppercase tracking-wide">Y%</label>
                      <input
                        type="number" min={0} max={100}
                        value={editNameY}
                        onChange={(e) => setEditNameY(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-full h-8 px-2 rounded-lg border border-secondary-200 text-sm text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-secondary-500 uppercase tracking-wide">Tamaño</label>
                      <input
                        type="number" min={12} max={72}
                        value={editNameFontSize}
                        onChange={(e) => setEditNameFontSize(Math.min(72, Math.max(12, Number(e.target.value))))}
                        className="w-full h-8 px-2 rounded-lg border border-secondary-200 text-sm text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-secondary-500 uppercase tracking-wide">Color</label>
                      <input
                        type="color" value={editFontColor}
                        onChange={(e) => setEditFontColor(e.target.value)}
                        className="w-full h-8 rounded-lg cursor-pointer border border-secondary-200"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={createEvent.isPending || updateEvent.isPending}>
              {editingEvent ? 'Guardar Cambios' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
