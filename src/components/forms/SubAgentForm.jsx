// Lokasi: src/components/forms/SubAgentForm.jsx
// Ini adalah file baru yang dibuat untuk melengkapi form di halaman SubAgents.jsx
// PERBAIKAN: Mengembalikan path import ke path relatif yang benar dan melengkapi file.

import React, { useState, useEffect } from 'react';
// --- PERBAIKAN: Mengubah path import menjadi relatif ---
import { useApi } from '../../context/ApiContext.jsx';
import { Input, Textarea, Button, Select, FormGroup, FormLabel } from '../common/FormUI.jsx';
import { ModalFooter } from '../common/Modal.jsx';
import { LoadingSpinner as Loading } from '../common/Loading.jsx';
import { ErrorMessage } from '../common/ErrorMessage.jsx';
import { formatDateForInput } from '../../utils/helpers.js';
// --- AKHIR PERBAIKAN ---

const SubAgentForm = ({ initialData, onSave, onClose, onSubmit, onCancel }) => {
    // Gunakan onCancel jika onClose tidak tersedia (untuk kompatibilitas)
    const handleCancel = onClose || onCancel;
    const { loading: apiLoading, error: apiError } = useApi();

    const [formData, setFormData] = useState({
        agent_id: '',
        name: '',
        join_date: formatDateForInput(new Date()),
        id_number: '',
        address: '',
        phone: '',
        notes: '',
        status: 'active',
    });
    
    const [error, setError] = useState(null);

    useEffect(() => {
        if (apiError) {
            setError(apiError.message);
        }
    }, [apiError]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                join_date: formatDateForInput(initialData.join_date),
            });
        } else {
            // Reset form
             setFormData({
                agent_id: '',
                name: '',
                join_date: formatDateForInput(new Date()),
                id_number: '',
                address: '',
                phone: '',
                notes: '',
                status: 'active',
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        
        // Gunakan onSave (dari Jamaah.jsx) atau onSubmit (dari App.jsx)
        const handleSave = onSave || onSubmit;
        
        if (handleSave) {
            handleSave(formData);
        }
        
        if (handleCancel) {
            handleCancel(); // Tutup modal
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <ErrorMessage message={error} />}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup>
                    <FormLabel htmlFor="agent_id">No. ID Agent (SA-001)</FormLabel>
                    <Input
                        type="text"
                        name="agent_id"
                        id="agent_id"
                        value={formData.agent_id}
                        onChange={handleChange}
                        placeholder="Contoh: SA-001"
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel htmlFor="name">Nama</FormLabel>
                    <Input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel htmlFor="join_date">Tanggal Bergabung</FormLabel>
                    <Input
                        type="date"
                        name="join_date"
                        id="join_date"
                        value={formData.join_date}
                        onChange={handleChange}
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel htmlFor="id_number">No. KTP</FormLabel>
                    <Input
                        type="text"
                        name="id_number"
                        id="id_number"
                        value={formData.id_number}
                        onChange={handleChange}
                    />
                </FormGroup>

                <FormGroup className="md:col-span-2">
                    <FormLabel htmlFor="address">Alamat</FormLabel>
                    <Textarea
                        name="address"
                        id="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel htmlFor="phone">Telepon (WA)</FormLabel>
                    <Input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </FormGroup>

                <FormGroup>
                    <FormLabel htmlFor="status">Status</FormLabel>
                    <Select
                        name="status"
                        id="status"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="active">Aktif</option>
                        <option value="inactive">Tidak Aktif</option>
                    </Select>
                </FormGroup>

                <FormGroup className="md:col-span-2">
                    <FormLabel htmlFor="notes">Keterangan</FormLabel>
                    <Textarea
                        name="notes"
                        id="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={2}
                    />
                </FormGroup>
            </div>
            
            <ModalFooter onCancel={handleCancel} submitText={initialData ? 'Update' : 'Simpan'} />
        </form>
    );
};

export default SubAgentForm;