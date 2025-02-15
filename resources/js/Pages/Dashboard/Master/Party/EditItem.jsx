import axios from 'axios';
import React, { useState } from 'react'
import { Dialog } from 'primereact/dialog';
import { FaRegEdit } from 'react-icons/fa';
import { InputSwitch } from 'primereact/inputswitch';

const EditItem = ({ reload, toast, party, locations }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [isConsignor, setIsConsignor] = useState(party.is_consignor);

    const handleSubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const name = formData.get("name");
      const location_id = formData.get("location_id");
      const address = formData.get("address");
      const phone = formData.get("phone");
      const email = formData.get('email');
      const pin = formData.get("pin");
      const cin = formData.get("cin");
      const gstin = formData.get("gstin");
      const is_consignor = isConsignor;

      axios.put(`/master/data/party/${party.id}`, {
        name,
        location_id,
        address,
        phone,
        email,
        pin,
        cin,
        gstin,
        is_consignor
      })
        .then(res => {
          toast.current.show({ label: 'Success', severity: 'success', detail: res.data.message });
          reload();
          setOpenDialog(false);
        })
        .catch(err => toast.current.show({ label: 'Error', severity: 'error', detail: err.message }));
    };
  
    return (
      <>
        <button onClick={() => setOpenDialog(true)} className="text-sm font-semi-bold p-1 rounded">
          <FaRegEdit className="w-6 h-6 text-teal-500 hover:text-teal-600" />
        </button>
        <Dialog visible={openDialog} modal onHide={() => setOpenDialog(false)} className="rounded-md m-4 w-full md:w-1/2 p-4 bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
  
              <div className="flex flex-col">
                <label htmlFor="name" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Name</label>
                <input type="text" name="name" id="name" required defaultValue={party.name} className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4" />
              </div>
              <div className="flex flex-col">
                <label htmlFor="location_name" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Location</label>
                <select
                  name="location_id"
                  id="location_name"
                  defaultValue={party.location_id}
                  className='border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4'>
                  <option value="" disabled>Select location</option>
                  {locations && locations.length && locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col">
              <label htmlFor="address" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Address</label>
              <textarea name="address" id="address" rows={2} defaultValue={party.address} className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4" ></textarea>
            </div>
  
            <div className='grid grid-cols-2 gap-2'>
              <div className="flex flex-col">
                <label htmlFor="phone_no" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Phone No</label>
                <input type="text" name="phone" id="phone_no" defaultValue={party.phone} className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4" />
              </div>
  
  
              <div className="flex flex-col">
                <label htmlFor="email" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Emaii Id</label>
                <input type="email" name="email" id="email" defaultValue={party.email} className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4" />
              </div>
            </div>
            <div className='grid grid-cols-3 gap-2'>
              <div className="flex flex-col">
                <label htmlFor="pin" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Pin</label>
                <input type="number" name="pin" id="pin" defaultValue={party.pin} className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4" />
              </div>
              <div className="flex flex-col">
                <label htmlFor="cin" className="mb-2 text-xs md:text-sm font-medium text-gray-700">CIN</label>
                <input type="text" name="cin" id="cin" defaultValue={party.cin} className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4" />
              </div>
              <div className="flex flex-col">
                <label htmlFor="gstin" className="mb-2 text-xs md:text-sm font-medium text-gray-700">GSTIN</label>
                <input type="text" name="gstin" id="gstin" defaultValue={party.gstin} className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4" />
              </div>
            </div>
  
            <div className="flex flex-col">
              <label htmlFor="is_consignor" className="mb-2 text-xs md:text-sm font-medium text-gray-700 flex gap-6 justify-end">
                <span>
                  Is Consignor ?
                </span>
                <div className="p-field-switch">
                  <InputSwitch
                    inputId='is_consignor'
                    checked={isConsignor}
                    onChange={(e) => setIsConsignor(e.value)}
                  />
                </div>
              </label>
            </div>
  
            <button type="submit" className="px-4 py-2 font-semibold text-white bg-teal-500 rounded-md shadow-sm hover:bg-teal-600">
              Submit
            </button>
          </form>
        </Dialog>
      </>
    );
  };

export default EditItem