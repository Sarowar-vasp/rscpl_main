import { Button } from '@mui/material';
import { ImageIcon, ImagePlusIcon } from 'lucide-react';
import { Dialog } from 'primereact/dialog';
import React, { useState } from 'react'
import imageCompression from 'browser-image-compression';

const ReturnPOD = ({ booking, reload, toast }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [toChange, setToChange] = useState(false);

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

        axios.post(`/transaction/return/booking/upload_document/${booking.id}`, formData)
            .then(res => {
                console.log("POD Uploaded");
            }).catch(err => {
                console.log(err.message);
            }).finally(() => {
                setToChange(false)
                setFormInfo({ ...formInfo, image: null });
                setImagePreview(null);
                reload();
                setOpenDialog(false);
            });
    }

    return (
        <>
            <td className='text-center'>
                <button onClick={() => setOpenDialog(true)}>
                    {booking.document ? (
                        <ImageIcon className="w-8 h-8 text-green-500" />
                    ) : (
                        <ImagePlusIcon className="w-8 h-8 text-gray-400" />
                    )}
                </button>
            </td>
            <Dialog visible={openDialog} modal onHide={() => setOpenDialog(false)} className="rounded-md m-4 w-full md:w-1/3 p-4 bg-white">
                {(!toChange && booking.document) ? (
                    <div className="">
                        <img
                            className="w-full border rounded-lg shadow-md"
                            src={`/storage/${booking.document.file_location}`}
                            alt=""
                        />
                        <hr className='my-4' />
                        <div className="flex justify-end gap-2">
                            <Button onClick={() => setToChange(true)} variant="contained" size="small" color="warning">Change</Button>
                            <Button onClick={() => setOpenDialog(false)} variant="contained" size="small" color="info">Close</Button>
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
                                        htmlFor={`chpod_${booking.id}`}
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
                                    <input type="file" name="pod" className='hidden' id={`chpod_${booking.id}`} onChange={handleFileChange} />
                                </div>

                                <div className="flex gap-4 justify-end">
                                    <button type="button" onClick={() => {
                                        if(!booking.document){
                                            setOpenDialog(false);
                                        }else{
                                            setToChange(false);
                                        }
                                    }} className="px-4 py-2 font-semibold text-white bg-gray-500 rounded-md shadow-sm hover:bg-gray-600">
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
            </Dialog>
        </>
    );
}

export default ReturnPOD