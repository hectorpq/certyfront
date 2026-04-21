import { useState } from 'react';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, Button, Modal, Input, Select, SearchInput, Pagination, Badge, Textarea, Alert } from '@/components/ui';
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/useEvents';
import { useInstructors } from '@/hooks/useInstructors';
import { useTemplates } from '@/hooks/useTemplates';
import { useAuth } from '@/hooks/useAuth';
import type { Event } from '@/types';

const eventSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().optional(),
  event_date: z.string().min(1, 'Fecha requerida'),
  end_date: z.string().optional(),
  duration_hours: z.string().min(1, 'Duración requerida'),
  location: z.string().min(1, 'Ubicación requerida'),
  status: z.string().min(1, 'Estado requerido'),
  category: z.number().optional(),
  instructor: z.number().optional(),
  template: z.number().optional(),
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data, isLoading } = useEvents({ page, search, status: statusFilter || undefined });
  const { data: instructors } = useInstructors();
  const { data: templates } = useTemplates();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

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
        category: event.category,
        instructor: event.instructor,
        template: event.template,
      });
    } else {
      setEditingEvent(null);
      reset({ name: '', description: '', event_date: '', end_date: '', duration_hours: '', location: '', status: 'draft', category: 1, instructor: undefined, template: undefined });
    }
    setServerError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setServerError(null);
    reset();
  };

const onSubmit = (dataForm: EventForm) => {
    setServerError(null);
    const payload: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'created_by_name' | 'status_display' | 'category_name' | 'template_name'> = {
      name: dataForm.name,
      description: dataForm.description || '',
      event_date: dataForm.event_date,
      end_date: dataForm.end_date || null,
      duration_hours: parseInt(dataForm.duration_hours),
      location: dataForm.location,
      status: dataForm.status as Event['status'],
      category: dataForm.category || 1,
      instructor: dataForm.instructor,
      template: dataForm.template,
    };

    if (editingEvent) {
      updateEvent.mutate(
        { id: editingEvent.id, data: payload },
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
        payload,
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
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Evento
          </Button>
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
                <th className="text-right py-2.5 px-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-secondary-400 text-sm">Cargando...</td>
                </tr>
              ) : data?.results?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
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
                    <td className="py-3 px-4">{getStatusBadge(event.status)}</td>
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
