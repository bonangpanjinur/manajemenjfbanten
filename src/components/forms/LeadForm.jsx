import React from 'react';
import { useForm } from 'react-hook-form';
// FIXED: Import TextArea (Case Sensitive)
import { Input, Select, TextArea, Button } from '../common/FormUI'; 

const LeadForm = ({ onSubmit, initialData, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {}
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nama Lengkap"
          register={register('name', { required: 'Nama wajib diisi' })}
          error={errors.name}
        />
        
        <Input
          label="Nomor Telepon/WA"
          type="tel"
          register={register('phone', { required: 'Nomor telepon wajib diisi' })}
          error={errors.phone}
        />

        <Select
            label="Sumber Prospek"
            register={register('source')}
            options={[
                { value: 'social_media', label: 'Social Media' },
                { value: 'referral', label: 'Referral / Teman' },
                { value: 'website', label: 'Website' },
                { value: 'walk_in', label: 'Datang Langsung' },
                { value: 'agent', label: 'Agen' }
            ]}
        />

        <Select
            label="Status"
            register={register('status')}
            options={[
                { value: 'new', label: 'Baru' },
                { value: 'follow_up', label: 'Sedang Follow Up' },
                { value: 'interested', label: 'Tertarik' },
                { value: 'closed', label: 'Closing / Daftar' },
                { value: 'lost', label: 'Batal / Gagal' }
            ]}
        />
      </div>

      {/* FIXED: Menggunakan komponen TextArea dengan nama yang benar */}
      <TextArea
        label="Catatan / Kebutuhan"
        register={register('notes')}
        error={errors.notes}
        rows={4}
      />

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          Simpan Prospek
        </Button>
      </div>
    </form>
  );
};

export default LeadForm;