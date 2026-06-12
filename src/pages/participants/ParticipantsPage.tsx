import { useState } from 'react';
import { Plus, Upload, Pencil, Trash2, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Modal, Input, SearchInput, Pagination, Alert, FileUpload } from '@/components/ui';
import { useParticipants, useCreateParticipant, useUpdateParticipant, useDeleteParticipant, useImportParticipants } from '@/hooks/useParticipants';
import { useAuth } from '@/hooks/useAuth';
import type { Participant } from '@/types';

const participantSchema = z.object({
  document_id: z.string().min(1, 'Documento requerido'),
  first_name:  z.string().min(1, 'Nombre requerido'),
  last_name:   z.string().min(1, 'Apellido requerido'),
  email:       z.string().email('Email inválido'),
  phone:       z.string().optional(),
});

type ParticipantForm = z.infer<typeof participantSchema>;

/* Avatar gradient pool */
const AVATAR_GRADS = [
  { bg: 'linear-gradient(135deg, #1E40AF, #3B82F6)' },
  { bg: 'linear-gradient(135deg, #065F46, #10B981)' },
  { bg: 'linear-gradient(135deg, #6D28D9, #A78BFA)' },
  { bg: 'linear-gradient(135deg, #92400E, #F59E0B)' },
  { bg: 'linear-gradient(135deg, #991B1B, #F87171)' },
  { bg: 'linear-gradient(135deg, #1E3A5F, #2563EB)' },
  { bg: 'linear-gradient(135deg, #064E3B, #059669)' },
];

export const ParticipantsPage = () => {
  const { isAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data, isLoading } = useParticipants({ page, search, is_active: true });
  const createParticipant  = useCreateParticipant();
  const updateParticipant  = useUpdateParticipant();
  const deleteParticipant  = useDeleteParticipant();
  const importParticipants = useImportParticipants();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ParticipantForm>({
    resolver: zodResolver(participantSchema),
  });

  const openModal = (participant?: Participant) => {
    if (participant) {
      setEditingParticipant(participant);
      reset({ document_id: participant.document_id, first_name: participant.first_name, last_name: participant.last_name, email: participant.email, phone: participant.phone || '' });
    } else {
      setEditingParticipant(null);
      reset({ document_id: '', first_name: '', last_name: '', email: '', phone: '' });
    }
    setServerError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingParticipant(null);
    setServerError(null);
    reset();
  };

  const onSubmit = (dataForm: ParticipantForm) => {
    setServerError(null);
    const payload = {
      document_id: dataForm.document_id,
      first_name:  dataForm.first_name,
      last_name:   dataForm.last_name,
      email:       dataForm.email,
      phone:       dataForm.phone || '',
    };
    if (editingParticipant) {
      updateParticipant.mutate({ id: editingParticipant.id, data: payload }, {
        onSuccess: closeModal,
        onError: (err: unknown) => {
          const e = err as { response?: { data?: unknown } };
          const errs = e.response?.data;
          if (errs && typeof errs === 'object') {
            setServerError(String(Object.values(errs as Record<string, unknown[]>).flat()[0]));
          } else { setServerError('Error al actualizar participante'); }
        }
      });
    } else {
      createParticipant.mutate(payload, {
        onSuccess: closeModal,
        onError: (err: unknown) => {
          const e = err as { response?: { data?: unknown } };
          const errs = e.response?.data;
          if (errs && typeof errs === 'object') {
            setServerError(String(Object.values(errs as Record<string, unknown[]>).flat()[0]));
          } else { setServerError('Error al crear participante'); }
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este participante?')) deleteParticipant.mutate(id);
  };

  const handleImport = () => {
    if (selectedFile) {
      importParticipants.mutate(selectedFile, {
        onSuccess: () => { setIsImportModalOpen(false); setSelectedFile(null); },
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Poppins, Inter', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.4px' }}>
            Participantes
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Gestiona los estudiantes del sistema
          </p>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setIsImportModalOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '0 18px', height: 42, borderRadius: 12,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(37,99,235,0.07)',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <Upload style={{ width: 15, height: 15 }} />
              Importar Excel
            </button>
            <button
              onClick={() => openModal()}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '0 18px', height: 42, borderRadius: 12,
                background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
                border: 'none',
                color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(37,99,235,0.40)',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.50)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.40)'; }}
            >
              <Plus style={{ width: 15, height: 15 }} />
              Nuevo Participante
            </button>
          </div>
        )}
      </div>

      {/* ── Tabla card ── */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 20,
        border: '1px solid var(--border)',
        boxShadow: '0 4px 24px rgba(37,99,235,0.08)',
        overflow: 'hidden',
      }}>
        {/* Search */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nombre, email o documento..."
          />
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                {['Documento', 'Nombre', 'Email', 'Teléfono', 'Estado', 'Acciones'].map((col, i) => (
                  <th key={col} style={{
                    padding: '12px 20px',
                    textAlign: i === 5 ? 'right' : 'left',
                    fontSize: 11, fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    Cargando...
                  </td>
                </tr>
              ) : data?.results?.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '56px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <Users style={{ width: 36, height: 36, color: 'var(--border)' }} />
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No hay participantes registrados</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.results?.map((participant, idx) => {
                  const av = AVATAR_GRADS[idx % AVATAR_GRADS.length];
                  const initials = `${participant.first_name?.[0] ?? ''}${participant.last_name?.[0] ?? ''}`.toUpperCase();
                  return (
                    <tr
                      key={participant.id}
                      style={{ borderBottom: '1px solid var(--border)', transition: 'background 150ms ease' }}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg-secondary)'}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                    >
                      {/* Documento */}
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          fontFamily: 'Montserrat, monospace', fontSize: 12, fontWeight: 600,
                          color: 'var(--text-muted)',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border)',
                          borderRadius: 7, padding: '3px 9px',
                        }}>
                          {participant.document_id}
                        </span>
                      </td>

                      {/* Nombre con avatar */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                            background: av.bg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 800, color: '#fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          }}>
                            {initials}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {participant.first_name} {participant.last_name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {participant.email}
                      </td>

                      {/* Teléfono */}
                      <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {participant.phone || <span style={{ color: 'var(--border)', fontWeight: 500 }}>—</span>}
                      </td>

                      {/* Estado */}
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '4px 12px', borderRadius: 999,
                          fontSize: 11, fontWeight: 700,
                          background: participant.is_active
                            ? 'var(--color-success-soft, #ECFDF5)'
                            : 'var(--color-error-soft, #FEF2F2)',
                          color: participant.is_active
                            ? 'var(--color-success, #059669)'
                            : 'var(--color-error, #DC2626)',
                          border: `1px solid ${participant.is_active ? 'rgba(5,150,105,0.25)' : 'rgba(220,38,38,0.25)'}`,
                        }}>
                          <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: participant.is_active ? '#059669' : '#DC2626',
                          }} />
                          {participant.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => openModal(participant)}
                                title="Editar"
                                style={{
                                  width: 32, height: 32, borderRadius: 9,
                                  background: 'transparent',
                                  border: '1px solid var(--border)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: 'var(--text-muted)', cursor: 'pointer',
                                  transition: 'all 180ms ease',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.10)'; e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                              >
                                <Pencil style={{ width: 14, height: 14 }} />
                              </button>
                              <button
                                onClick={() => handleDelete(participant.id)}
                                title="Eliminar"
                                style={{
                                  width: 32, height: 32, borderRadius: 9,
                                  background: 'transparent',
                                  border: '1px solid var(--border)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: 'var(--text-muted)', cursor: 'pointer',
                                  transition: 'all 180ms ease',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.10)'; e.currentTarget.style.borderColor = '#DC2626'; e.currentTarget.style.color = '#DC2626'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                              >
                                <Trash2 style={{ width: 14, height: 14 }} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.count > 10 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(data.count / 10)}
              totalItems={data.count}
              itemsPerPage={10}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* ── Modal crear/editar ── */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingParticipant ? 'Editar Participante' : 'Nuevo Participante'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && <Alert type="error">{serverError}</Alert>}
          <Input label="Documento de Identidad" {...register('document_id')} error={errors.document_id?.message} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre"   {...register('first_name')} error={errors.first_name?.message} />
            <Input label="Apellido" {...register('last_name')}  error={errors.last_name?.message} />
          </div>
          <Input label="Email"    type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Teléfono" {...register('phone')} error={errors.phone?.message} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" isLoading={createParticipant.isPending || updateParticipant.isPending}>
              {editingParticipant ? 'Guardar Cambios' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal importar ── */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => { setIsImportModalOpen(false); setSelectedFile(null); }}
        title="Importar Participantes desde Excel"
        size="md"
      >
        <div className="space-y-4">
          <Alert type="info">
            El archivo debe contener las columnas: <strong>document_id</strong>, <strong>first_name</strong>, <strong>last_name</strong>, <strong>email</strong>, <strong>phone</strong> (opcional)
          </Alert>
          <FileUpload onFileSelect={setSelectedFile} isLoading={importParticipants.isPending} error={importParticipants.isError ? 'Error al importar' : undefined} success={importParticipants.isSuccess} />
          {importParticipants.data && (
            <Alert type="success">
              Se importaron {importParticipants.data.imported} de {importParticipants.data.total_rows} registros.
              {importParticipants.data.errors.length > 0 && <div className="mt-2">{importParticipants.data.errors.length} errores.</div>}
            </Alert>
          )}
          {importParticipants.isError && <Alert type="error">Error al importar el archivo. Verifica el formato.</Alert>}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => { setIsImportModalOpen(false); setSelectedFile(null); }}>Cerrar</Button>
            <Button onClick={handleImport} isLoading={importParticipants.isPending} disabled={!selectedFile}>Importar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};