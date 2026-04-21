import { useState } from 'react';
import { Plus, Upload, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, Button, Modal, Input, SearchInput, Pagination, Badge, Alert, FileUpload } from '@/components/ui';
import { useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent, useImportStudents } from '@/hooks/useStudents';
import { useAuth } from '@/hooks/useAuth';
import type { Student } from '@/types';

const studentSchema = z.object({
  document_id: z.string().min(1, 'Documento requerido'),
  first_name: z.string().min(1, 'Nombre requerido'),
  last_name: z.string().min(1, 'Apellido requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
});

type StudentForm = z.infer<typeof studentSchema>;

export const StudentsPage = () => {
  const { isAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data, isLoading } = useStudents({ page, search, is_active: true });
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();
  const importStudents = useImportStudents();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentForm>({
    resolver: zodResolver(studentSchema),
  });

  const openModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      reset({
        document_id: student.document_id,
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        phone: student.phone || '',
      });
    } else {
      setEditingStudent(null);
      reset({ document_id: '', first_name: '', last_name: '', email: '', phone: '' });
    }
    setServerError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setServerError(null);
    reset();
  };

  const onSubmit = (dataForm: StudentForm) => {
    setServerError(null);
    const payload = {
      document_id: dataForm.document_id,
      first_name: dataForm.first_name,
      last_name: dataForm.last_name,
      email: dataForm.email,
      phone: dataForm.phone || '',
    };
    
    if (editingStudent) {
      updateStudent.mutate(
        { id: editingStudent.id, data: payload },
        { 
          onSuccess: closeModal,
          onError: (err: unknown) => {
            const error = err as { response?: { data?: unknown } };
            const errors = error.response?.data;
            if (errors && typeof errors === 'object') {
              const firstError = Object.values(errors as Record<string, unknown[]>).flat()[0];
              setServerError(String(firstError));
            } else {
              setServerError('Error al actualizar estudiante');
            }
          }
        }
      );
    } else {
      createStudent.mutate(payload, {
        onSuccess: closeModal,
        onError: (err: unknown) => {
          const error = err as { response?: { data?: unknown } };
          const errors = error.response?.data;
          if (errors && typeof errors === 'object') {
            const firstError = Object.values(errors as Record<string, unknown[]>).flat()[0];
            setServerError(String(firstError));
          } else {
            setServerError('Error al crear estudiante');
          }
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este estudiante?')) {
      deleteStudent.mutate(id);
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      importStudents.mutate(selectedFile, {
        onSuccess: () => {
          setIsImportModalOpen(false);
          setSelectedFile(null);
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">Estudiantes</h1>
          <p className="text-sm text-secondary-500 mt-0.5">Gestiona los estudiantes del sistema</p>
        </div>
        {isAdmin && (
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsImportModalOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Importar Excel
            </Button>
            <Button onClick={() => openModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Estudiante
            </Button>
          </div>
        )}
      </div>

      <Card>
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nombre, email o documento..."
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary-50 border-y border-secondary-100">
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Documento</th>
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Nombre</th>
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Email</th>
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Teléfono</th>
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
                      <Upload className="w-8 h-8 opacity-40" />
                      <span className="text-sm">No hay estudiantes registrados</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.results?.map((student) => (
                  <tr key={student.id} className="hover:bg-secondary-50/60 transition-colors">
                    <td className="py-3 px-4 text-sm font-mono text-secondary-700">{student.document_id}</td>
                    <td className="py-3 px-4 text-sm font-medium text-secondary-900">
                      {student.first_name} {student.last_name}
                    </td>
                    <td className="py-3 px-4 text-sm text-secondary-500">{student.email}</td>
                    <td className="py-3 px-4 text-sm text-secondary-500">{student.phone || '—'}</td>
                    <td className="py-3 px-4">
                      <Badge variant={student.is_active ? 'success' : 'error'} dot>
                        {student.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-1">
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openModal(student)}
                              className="p-1.5 rounded-lg text-secondary-400 hover:text-secondary-700 hover:bg-secondary-100 transition-all"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(student.id)}
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
        title={editingStudent ? 'Editar Estudiante' : 'Nuevo Estudiante'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <Alert type="error">{serverError}</Alert>
          )}
          <Input
            label="Documento de Identidad"
            {...register('document_id')}
            error={errors.document_id?.message}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre"
              {...register('first_name')}
              error={errors.first_name?.message}
            />
            <Input
              label="Apellido"
              {...register('last_name')}
              error={errors.last_name?.message}
            />
          </div>
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            label="Teléfono"
            {...register('phone')}
            error={errors.phone?.message}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={createStudent.isPending || updateStudent.isPending}>
              {editingStudent ? 'Guardar Cambios' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => { setIsImportModalOpen(false); setSelectedFile(null); }}
        title="Importar Estudiantes desde Excel"
        size="md"
      >
        <div className="space-y-4">
          <Alert type="info">
            El archivo debe contener las columnas: <strong>document_id</strong>, <strong>first_name</strong>, <strong>last_name</strong>, <strong>email</strong>, <strong>phone</strong> (opcional)
          </Alert>
          <FileUpload
            onFileSelect={setSelectedFile}
            isLoading={importStudents.isPending}
            error={importStudents.isError ? 'Error al importar' : undefined}
            success={importStudents.isSuccess}
          />
          {importStudents.data && (
            <Alert type="success">
              Se importaron {importStudents.data.imported} de {importStudents.data.total_rows} registros.
              {importStudents.data.errors.length > 0 && (
                <div className="mt-2">
                  {importStudents.data.errors.length} errores.
                </div>
              )}
            </Alert>
          )}
          {importStudents.isError && (
            <Alert type="error">
              Error al importar el archivo. Verifica el formato.
            </Alert>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => { setIsImportModalOpen(false); setSelectedFile(null); }}>
              Cerrar
            </Button>
            <Button onClick={handleImport} isLoading={importStudents.isPending} disabled={!selectedFile}>
              Importar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
