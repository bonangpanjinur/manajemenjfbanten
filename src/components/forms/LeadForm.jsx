import React, { useState, useEffect, useMemo } from 'react';
import { ModalFooter } from '../common/Modal';
import { Input, Select, FormGroup, FormLabel } from '../common/FormUI';

const LeadForm = ({ initialData, onSubmit, onCancel, users }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        source: '',
        status: 'new',
        assigned_to_user_id: '',
    });
    
    const marketingUsers = useMemo(() => 
        users.filter(u => ['marketing_staff', 'admin_staff', 'owner', 'super_admin'].includes(u.role)),
    [users]);

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        } else {
             setFormData({
                full_name: '', email: '', phone: '', source: '',
                status: 'new', assigned_to_user_id: '',
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
                    <FormLabel htmlFor="phone">No. Telepon</FormLabel>
                    <Input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} />
                </FormGroup>

                <FormGroup className="md:col-span-2">
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <Input type="email" name="email" id="email" value={formData.email} onChange={handleChange} />
                </FormGroup>
                
                <FormGroup>
                    <FormLabel htmlFor="source">Sumber Lead</FormLabel>
                    <Input type="text" name="source" id="source" value={formData.source} onChange={handleChange} placeholder="Cth: Facebook, Website, Walk-in" />
                </FormGroup>
                <FormGroup>
                    <FormLabel htmlFor="status">Status</FormLabel>
                    <Select name="status" id="status" value={formData.status} onChange={handleChange} required>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="unqualified">Unqualified</option>
                        <option value="converted">Converted</option>
                    </Select>
                </FormGroup>

                <FormGroup className="md:col-span-2">
                    <FormLabel htmlFor="assigned_to_user_id">Ditugaskan ke (Marketing)</FormLabel>
                    <Select name="assigned_to_user_id" id="assigned_to_user_id" value={formData.assigned_to_user_id} onChange={handleChange}>
                        <option value="">Belum Ditugaskan</option>
                        {marketingUsers.map(u => (
                            <option key={u.id} value={u.id}>{u.full_name}</option>
                        ))}
                    </Select>
                </FormGroup>
            </div>
            <ModalFooter onCancel={onCancel} />
        </form>
    );
};

export default LeadForm;