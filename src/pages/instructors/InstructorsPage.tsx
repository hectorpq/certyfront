import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, Button, Modal, Input, SearchInput, Textarea, Alert, SignaturePad } from '@/components/ui';
import { useInstructors, useCreateInstructor, useUpdateInstructor, useDeleteInstructor } from '@/hooks/useInstructors';
import { useAuth } from '@/hooks/useAuth';
import type { Instructor } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getMediaUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
};

const instructorSchema = z.object({
  full_name: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  specialty: z.string().optional(),
  bio: z.string().optional(),
});

type InstructorForm = z.infer<typeof instructorSchema>;

export const InstructorsPage = () => {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

  const { data, isLoading } = useInstructors();
  const createInstructor = useCreateInstructor();
  const updateInstructor = useUpdateInstructor();
  const deleteInstructor = useDeleteInstructor();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InstructorForm>({
    resolver: zodResolver(instructorSchema),
  });

  const filteredInstructors = (data || []).filter((instructor) =>
    instructor.full_name.toLowerCase().includes(search.toLowerCase()) ||
    instructor.email.toLowerCase().includes(search.toLowerCase()) ||
    instructor.specialty?.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (instructor?: Instructor) => {
    if (instructor) {
      setEditingInstructor(instructor);
      reset({
        full_name: instructor.full_name,
        email: instructor.email,
        phone: instructor.phone,
        specialty: instructor.specialty,
        bio: instructor.bio,
      });
      setSignaturePreview(getMediaUrl(instructor.signature_image));
    } else {
      setEditingInstructor(null);
      reset({ full_name: '', email: '', phone: '', specialty: '', bio: '' });
      setSignaturePreview(null);
    }
    setSignatureFile(null);
    setServerError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingInstructor(null);
    setServerError(null);
    setSignatureFile(null);
    setSignaturePreview(null);
    reset();
  };

  const onSubmit = (dataForm: InstructorForm) => {
    setServerError(null);
    const formData = new FormData();
    formData.append('full_name', dataForm.full_name);
    formData.append('email', dataForm.email);
    formData.append('phone', dataForm.phone || '');
    formData.append('specialty', dataForm.specialty || '');
    formData.append('bio', dataForm.bio || '');
    formData.append('signature_url', '');
    if (signatureFile) {
      formData.append('signature_image', signatureFile);
    }

    if (editingInstructor) {
      updateInstructor.mutate(
        { id: editingInstructor.id, data: formData },
        {
          onSuccess: closeModal,
          onError: (err: unknown) => {
            const error = err as { response?: { data?: unknown } };
            const errors = error.response?.data;
            if (errors && typeof errors === 'object') {
              const firstError = Object.values(errors as Record<string, unknown[]>).flat()[0];
              setServerError(String(firstError));
            } else {
              setServerError('Error al actualizar instructor');
            }
          }
        }
      );
    } else {
      createInstructor.mutate(
        formData,
        {
          onSuccess: closeModal,
          onError: (err: unknown) => {
            const error = err as { response?: { data?: unknown } };
            const errors = error.response?.data;
            if (errors && typeof errors === 'object') {
              const firstError = Object.values(errors as Record<string, unknown[]>).flat()[0];
              setServerError(String(firstError));
            } else {
              setServerError('Error al crear instructor');
            }
          }
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este instructor?')) {
      deleteInstructor.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">Instructores</h1>
          <p className="text-sm text-secondary-500 mt-0.5">Gestiona los instructores del sistema</p>
        </div>
        {isAdmin && (
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Instructor
          </Button>
        )}
      </div>

      <Card>
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nombre, email o especialidad..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-secondary-400 text-sm">Cargando...</div>
          ) : filteredInstructors?.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <div className="flex flex-col items-center gap-2 text-secondary-400">
                <Plus className="w-8 h-8 opacity-40" />
                <span className="text-sm">No hay instructores registrados</span>
              </div>
            </div>
          ) : (
            filteredInstructors?.map((instructor) => (
              <div
                key={instructor.id}
                className="p-4 rounded-xl border border-secondary-200 hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">
                        {instructor.full_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900 leading-tight">{instructor.full_name}</h3>
                      <p className="text-xs text-secondary-500">{instructor.email}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => openModal(instructor)}
                        className="p-1.5 rounded-lg text-secondary-400 hover:text-secondary-700 hover:bg-secondary-100 transition-all"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(instructor.id)}
                        className="p-1.5 rounded-lg text-secondary-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                {instructor.specialty && (
                  <span className="inline-block text-xs font-semibold text-primary-700 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-full mb-2">
                    {instructor.specialty}
                  </span>
                )}
                {instructor.bio && (
                  <p className="text-sm text-secondary-600 line-clamp-2">{instructor.bio}</p>
                )}
                {instructor.phone && (
                  <p className="text-xs text-secondary-400 mt-2">{instructor.phone}</p>
                )}
                {instructor.signature_image && (
                  <div className="mt-3 pt-3 border-t border-secondary-100">
                    <p className="text-xs text-secondary-400 mb-1">Firma digital</p>
                    <img
                      src={getMediaUrl(instructor.signature_image) ?? ''}
                      alt="Firma"
                      className="h-10 object-contain"
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingInstructor ? 'Editar Instructor' : 'Nuevo Instructor'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <Alert type="error">{serverError}</Alert>
          )}
          <Input
            label="Nombre Completo"
            {...register('full_name')}
            error={errors.full_name?.message}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              label="Teléfono"
              {...register('phone')}
            />
          </div>
          <Input
            label="Especialidad"
            {...register('specialty')}
            error={errors.specialty?.message}
          />
          <Textarea
            label="Biografía"
            {...register('bio')}
            rows={3}
          />

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Firma Digital
            </label>
            <SignaturePad
              onSave={(file) => setSignatureFile(file)}
              initialPreview={signaturePreview}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={createInstructor.isPending || updateInstructor.isPending}>
              {editingInstructor ? 'Guardar Cambios' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
