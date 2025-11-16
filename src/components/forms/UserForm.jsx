import React, { useState, useEffect, useMemo } from 'react';
import { ModalFooter } from '../common/Modal';
import { Input, Select, FormGroup, FormLabel } from '../common/FormUI';

const UserForm = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        role: 'hr_staff',
        password: '',
        phone: '',
        status: 'active',
    });

    const isEdit = useMemo(() => !!initialData, [initialData]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                full_name: initialData.full_name || '',
                email: initialData.email || '',
                role: initialData.role || 'hr_staff',
                password: '', // Jangan pernah tampilkan hash
                phone: initialData.phone || '',
                status: initialData.status || 'active',
            });
        } else {
             setFormData({
                full_name: '', email: '', role: 'hr_staff',
                password: '', phone: '', status: 'active',
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup>
                    <FormLabel htmlFor="full_name">Nama Lengkap</FormLabel>
                    <Input type="text" name="full_name" id="full_name" value={formData.full_name} onChange={handleChange} required />
                </FormGroup>
                <FormGroup>
                    <FormLabel htmlFor="email">Email (untuk login)</FormLabel>
                    <Input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required />
                </FormGroup>
                
                <FormGroup>
                    <FormLabel htmlFor="role">Peran (Role)</FormLabel>
                    <Select name="role" id="role" value={formData.role} onChange={handleChange} required>
                        <option value="admin_staff">Admin Staff</option>
                        <option value="finance_staff">Finance Staff</option>
                        <option value="hr_staff">HR Staff</option>
                        <option value="marketing_staff">Marketing Staff</option>
                        <option value="owner">Owner</option>
                    </Select>
                </FormGroup>
                <FormGroup>
                    <FormLabel htmlFor="phone">No. Telepon</FormLabel>
                    <Input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} />
                </FormGroup>

                <FormGroup>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <Input 
                        type="password" 
                        name="password" 
                        id="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        placeholder={isEdit ? "Isi untuk mengubah" : ""}
                        required={!isEdit} 
                    />
                </FormGroup>
                <FormGroup>
                    <FormLabel htmlFor="status">Status Akun</FormLabel>
                    <Select name="status" id="status" value={formData.status} onChange={handleChange} required>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </Select>
                </FormGroup>
            </div>
            <ModalFooter onCancel={onCancel} />
        </form>
    );
};

export default UserForm;