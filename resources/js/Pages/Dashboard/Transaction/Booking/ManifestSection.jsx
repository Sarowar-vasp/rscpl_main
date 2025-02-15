import React, { useEffect, useState } from 'react'
import AddNewItem from '../Manifest/AddNewItem';
import ItemsList from '../Manifest/ItemsList';


const ManifestSection = (props) => {
    
    return (
        <div className="p-3 md:px-4 md:py-6 flex flex-col gap-2 rounded-md shadow-sm">
            <div className="noPrint flex justify-between my-3 mx-5">
                <h3 className="text-3xl text-slate-600">Manifests</h3>
                <div className="flex gap-2">
                    <AddNewItem {...props} />
                </div>
            </div>
            <hr className="my-2" />
            <div className="flex flex-col gap-4">
                <ItemsList {...props} />
            </div>
        </div>
    )
}

export default ManifestSection