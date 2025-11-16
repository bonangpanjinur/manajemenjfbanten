import React, { useState, useEffect } from 'react';
import { formatDateForInput } from '../../utils/helpers'; // .js dihapus
import { ModalFooter } from '../common/Modal'; // .jsx dihapus
import { Input, Select, Textarea, Checkbox, FormGroup, FormLabel } from '../common/FormUI'; // .jsx dihapus

const PackageForm = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        status: 'draft',
        promo: 0,
        departure_city: '',
        duration: 9,
        departure_date: '',
        slots_available: 50,
        price_quad: '',
        price_triple: '',
        price_double: '',
        short_description: '',
        itinerary: '',
        meta_title: '',
        meta_description: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                promo: !!initialData.promo, // Pastikan boolean
                departure_date: formatDateForInput(initialData.departure_date),
                price_quad: '',
                price_triple: '',
                price_double: '',
             });
             
            if (initialData.price_details) {
                try {
                    const prices = JSON.parse(initialData.price_details);
                    setFormData(prev => ({
                        ...prev,
                        price_quad: prices.quad || '',
                        price_triple: prices.triple || '',
                        price_double: prices.double || '',
                    }));
                } catch (e) {
                    console.error("Gagal parse price_details JSON:", e);
                }
            }
        } else {
             setFormData({
                title: '', slug: '', status: 'draft', promo: 0,
                departure_city: '', duration: 9, departure_date: '',
                slots_available: 50, price_quad: '', price_triple: '',
                price_double: '', short_description: '', itinerary: '',
                meta_title: '', meta_description: '',
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const price_details = JSON.stringify({
            quad: formData.price_quad || 0,
            triple: formData.price_triple || 0,
            double: formData.price_double || 0,
        });
        const dataToSubmit = { ...formData };
        delete dataToSubmit.price_quad;
        delete dataToSubmit.price_triple;
        delete dataToSubmit.price_double;
        dataToSubmit.price_details = price_details;
        onSubmit(dataToSubmit);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup className="md:col-span-2">
                    <FormLabel htmlFor="title">Judul Paket</FormLabel>
                    <Input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required />
                </FormGroup>

                <FormGroup>
                    <FormLabel htmlFor="status">Status</FormLabel>
                    <Select name="status" id="status" value={formData.status} onChange={handleChange}>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </Select>
                </FormGroup>
                <FormGroup>
                    <FormLabel htmlFor="slug">Slug (URL)</FormLabel>
                    <Input type="text" name="slug" id="slug" value={formData.slug} onChange={handleChange} />
                </FormGroup>

                <FormGroup>
                    <FormLabel htmlFor="duration">Durasi (Hari)</FormLabel>
                    <Input type="number" name="duration" id="duration" value={formData.duration} onChange={handleChange} required />
                </FormGroup>
                <FormGroup>
                    <FormLabel htmlFor="departure_city">Kota Keberangkatan</FormLabel>
                    <Input type="text" name="departure_city" id="departure_city" value={formData.departure_city} onChange={handleChange} />
                </FormGroup>

                <FormGroup>
                    <FormLabel htmlFor="departure_date">Tanggal Keberangkatan (Opsional)</FormLabel>
                    <Input type="date" name="departure_date" id="departure_date" value={formData.departure_date} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                    <FormLabel htmlFor="slots_available">Jumlah Slot Tersedia</FormLabel>
                    <Input type="number" name="slots_available" id="slots_available" value={formData.slots_available} onChange={handleChange} />
                </FormGroup>

                <FormGroup className="md:col-span-2 mt-2">
                    <Checkbox name="promo" id="promo" checked={!!formData.promo} onChange={handleChange} label="Tandai sebagai Promo" />
                </FormGroup>

                <hr className="md:col-span-2" />
                <h4 className="md:col-span-2 text-lg font-semibold text-gray-800 -mb-2">Detail Harga</h4>
                <FormGroup>
                    <FormLabel htmlFor="price_quad">Harga Quad (Rp)</FormLabel>
                    <Input type="number" name="price_quad" id="price_quad" value={formData.price_quad} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                    <FormLabel htmlFor="price_triple">Harga Triple (Rp)</FormLabel>
                    <Input type="number" name="price_triple" id="price_triple" value={formData.price_triple} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                    <FormLabel htmlFor="price_double">Harga Double (Rp)</FormLabel>
                    <Input type="number" name="price_double" id="price_double" value={formData.price_double} onChange={handleChange} />
                </FormGroup>

                <hr className="md:col-span-2" />
                <h4 className="md:col-span-2 text-lg font-semibold text-gray-800 -mb-2">Deskripsi & SEO</h4>
                <FormGroup className="md:col-span-2">
                    <FormLabel htmlFor="short_description">Deskripsi Singkat</FormLabel>
                    <Textarea name="short_description" id="short_description" value={formData.short_description} onChange={handleChange}></Textarea>
                </FormGroup>
                <FormGroup className="md:col-span-2">
                    <FormLabel htmlFor="itinerary">Itinerary (JSON/Text)</FormLabel>
                    <Textarea name="itinerary" id="itinerary" value={formData.itinerary} onChange={handleChange}></Textarea>
                </FormGroup>
                <FormGroup>
                    <FormLabel htmlFor="meta_title">Meta Title (SEO)</FormLabel>
                    <Input type="text" name="meta_title" id="meta_title" value={formData.meta_title} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                    <FormLabel htmlFor="meta_description">Meta Description (SEO)</FormLabel>
                    <Input type="text" name="meta_description" id="meta_description" value={formData.meta_description} onChange={handleChange} />
                </FormGroup>
            </div>
            <ModalFooter onCancel={onCancel} />
        </form>
    );
};

export default PackageForm;