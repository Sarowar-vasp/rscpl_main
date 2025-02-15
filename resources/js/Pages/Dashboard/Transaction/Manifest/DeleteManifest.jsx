import { IconButton, Tooltip } from '@mui/material';
import { TrashIcon } from 'lucide-react';
import { Dialog } from 'primereact/dialog';
import React, { useState } from 'react'

const DeleteManifest = ({ item, reload }) => {
    const [openDialog, setOpenDialog] = useState(false);

    const handleDelete = () => {
        axios.delete(`/data/manifest/delete/${item.id}`)
            .then(res => {
                reload();
                setOpenDialog(false);
            })
            .catch(err => {
                console.log(err.message);
            });
    }

    const isDeletable = () => {
        return true;
    }
    
    return (
        <>
            <Tooltip title="Delete Manifest" placement="top">
                    <IconButton disabled={!isDeletable()} onClick={() => setOpenDialog(true)} color="warning" aria-label="remove-manifest">
                        <TrashIcon className='w-6 h-6' />
                    </IconButton>
            </Tooltip>

            <Dialog visible={openDialog} modal onHide={() => setOpenDialog(false)} className="rounded-md m-4 w-full md:w-1/4 p-4 bg-white flex flex-col">
                <h3 className="text-center text-2xl text-slate-600 font-bold">Are You Sure ?</h3>
                <p className="text-center text-slate-600">
                    You are going to delete all the consignments in this manifest also.
                </p>
                <hr className='my-4' />
                <div className="flex justify-center gap-4">
                    <button onClick={handleDelete} className="px-4 py-2 font-semibold text-white bg-red-500 rounded-md shadow-sm hover:bg-red-600">
                        Yes
                    </button>
                    <button onClick={() => setOpenDialog(false)} className="px-4 py-2 font-semibold bg-gray-300 rounded-md shadow-sm hover:bg-gray-400">
                        No
                    </button>
                </div>
            </Dialog>
        </>
    )
}

export default DeleteManifest