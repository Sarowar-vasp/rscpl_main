import { Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import axios from 'axios';
import { Dialog } from 'primereact/dialog';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import imageCompression from 'browser-image-compression';

const BookingStatus = (props) => {
    const { booking, reload, perPage, searchTxt, status } = props;

    const [openDialog, setOpenDialog] = useState(false);

    const [formInfo, setFormInfo] = useState({
        image: '',
        delivery_date: new Date()
    });
    
    const [imagePreview, setImagePreview] = useState(null);

    const getFileExtensionFromMimeType = (mimeType) => {
        const mimeExtensions = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
        };
        return mimeExtensions[mimeType] || 'jpg';
    };

    const compressImage = async (file) => {
        const options = {
            maxSizeMB: 0.3,
            maxWidthOrHeight: 600,
            useWebWorker: true,
        };

        const compressedBlob = await imageCompression(file, options);
        const extension = getFileExtensionFromMimeType(file.type);
        const newFileName = `_.${extension}`;

        const compressedFile = new File([compressedBlob], newFileName, { type: compressedBlob.type });
        return compressedFile;
    };

    const handleChange = (e) => {
        e.preventDefault();
        let inp_value = e.target.value;
        if (inp_value === 'delivered') {
            setOpenDialog(true);
        } else {
            changeStatus(inp_value);
        }
    }

    const changeStatus = (inp_value) => {
        axios.post(`/transaction/booking/status/${booking.id}`, { status: inp_value }).then(res => {
            reload({ per_page: perPage, search: searchTxt });
        }).catch(err => {
            console.log(err.message);
        });
    }

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg')) {
            const compressedImage = await compressImage(file);
            setFormInfo({ ...formInfo, image: compressedImage });
            setImagePreview(URL.createObjectURL(compressedImage));
        } else {
            alert('Please select a valid image file (jpg, jpeg, png)');
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        let d_date = formInfo.delivery_date.toISOString().slice(0, 10);
        const formData = new FormData();
        formData.append('image', formInfo.image);
        formData.append('delivery_date', d_date);

        axios.post(`/transaction/booking/upload_document/${booking.id}`, formData)
            .then(res => {
                changeStatus('delivered');
                setOpenDialog(false);
            }).catch(err => {
                console.log(err.message);
            });
    }

    const updatePod = () => {
        changeStatus('delivered');
        setOpenDialog(false);
    }

    const removePOD = (id) => {
        axios.delete(`/data/pod/delete/${id}`).then(res => {
            reload({ per_page: perPage, search: searchTxt });
        }).catch(err => {
            console.log(err.message);
        });
        setOpenDialog(false);
    }

    return (
        <>
            <div className="flex gap-2 items-center justify-center">
                <FormControl sx={{ m: 1 }} size="small">
                    <Select
                        id="stsSelect"
                        className='custom-select'
                        displayEmpty
                        onChange={handleChange}
                        value={status ? status.status : 'pending'}
                    >
                        <MenuItem className='text-sm' value={'pending'}>Pending</MenuItem>
                        <MenuItem className='text-sm' value={'in_transit'}>In Transit</MenuItem>
                        <MenuItem className='text-sm' value={'delivered'}>Delivered</MenuItem>
                    </Select>
                </FormControl>
            </div>
            <Dialog visible={openDialog} modal onHide={() => setOpenDialog(false)} className="rounded-md m-4 w-full md:w-1/3 p-4 bg-white">
                <div className="p-4">
                    {booking.document ? (
                        <div className="">
                            <span>You have already uploaded Proof of Delivery to this order !</span>
                            <img
                                className="w-full border rounded-lg shadow-md"
                                src={`/storage/${booking.document.file_location}`} alt="" />
                            <hr className='my-4' />
                            <div className="flex justify-end gap-2">
                                <Button onClick={() => removePOD(booking.document.id)} variant="contained" size="small" color="error">Remove</Button>
                                <Button onClick={updatePod} variant="contained" size="small">Continue</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="">
                            <h3 className="text-xl font-bold underline text-gray-500 capitalize">
                                Upload Document
                            </h3>
                            <form className="space-y-4 py-4" onSubmit={handleSubmit} >
                                <div className="flex flex-col gap-3">
                                    <div className="">
                                        <label
                                            htmlFor="pod"
                                            className='w-full min-h-[100px] relative border border-dashed border-gray-500 rounded-lg overflow-hidden flex items-center justify-center'
                                        >
                                            {imagePreview ? (
                                                <>
                                                    <img src={imagePreview} alt="Preview" className="max-h-[300px]" />
                                                    <span className="absolute px-2 py-1 text-sm bg-slate-900/90 text-white rounded-md">Change</span>
                                                </>
                                            ) : (
                                                <span>Upload Image</span>
                                            )}
                                        </label>
                                        <input type="file" name="pod" className='hidden' id='pod' onChange={handleFileChange} />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="delivery_date" className='text-sm font-semibold'>Delivery Date:</label>
                                        <DatePicker
                                            selected={formInfo.delivery_date}
                                            locale="en-IN"
                                            dateFormat="dd/MM/yyyy"
                                            onChange={(date) => setFormInfo({ ...formInfo, delivery_date: date })}
                                            name="delivery_date"
                                            id="delivery_date"
                                            className="w-full border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2"
                                        />
                                    </div>
                                    <div className="flex gap-4 justify-end">
                                        <button type="button" onClick={() => setOpenDialog(false)} className="px-4 py-2 font-semibold text-white bg-gray-500 rounded-md shadow-sm hover:bg-gray-600">
                                            Cancel
                                        </button>
                                        <button type="submit" className="px-4 py-2 font-semibold text-white bg-teal-500 rounded-md shadow-sm hover:bg-teal-600">
                                            Upload
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                </div>
            </Dialog>
        </>
    );
}

export default BookingStatus;
