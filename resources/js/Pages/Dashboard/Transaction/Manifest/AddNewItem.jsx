import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import React, { useRef, useState } from 'react'
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const AddNewItem = (props) => {
    const { locations, reload} = props;
    const [openDialog, setOpenDialog] = useState(false);
    const [formInfo, setFormInfo] = useState({
        trip_date: new Date(),
        from_location: '',
        to_location: '',
        lorry_id: '',
    });

    const privilege = props.auth.user.role.privilege_index;
    if(privilege <=5) return null;
    
    const toast = useRef();
    const [lorries, setLorries] = useState(props.lorries);

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('/data/manifest/new', { ...formInfo })
            .then(res => {
                reload();
                setFormInfo({
                    trip_date: new Date(),
                    from_location: '',
                    to_location: '',
                    lorry_id: '',
                });
                setOpenDialog(false);
            })
            .catch(err => {
                console.log(err.message);
            });
    }

    

    return (
        <>
            <button onClick={() => setOpenDialog(true)} className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semi-bold py-2 px-3 rounded">
                Create New
            </button>
            <Dialog visible={openDialog} modal onHide={() => setOpenDialog(false)} className="rounded-md m-4 w-full md:w-3/4 p-4 bg-white">
                <h3 className="text-xl font-bold underline text-gray-500 capitalize px-4">
                    New manifest
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label htmlFor="trip_date" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Trip Date:</label>
                            <DatePicker
                                selected={formInfo.trip_date}
                                dateFormat={'dd/MM/yyyy'}
                                onChange={(date) => setFormInfo({ ...formInfo, trip_date: date })}
                                name="trip_date" id="trip_date"
                                className="w-full border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2"
                            />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex justify-between">
                                <label htmlFor="lorry_no" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Lorry Number:</label>
                                <AddLorryCompo lorries={lorries} setLorries={setLorries} toast={toast} />
                            </div>
                            <select
                                name="lorry_id"
                                id="lorry_no"
                                defaultValue={''}
                                onChange={(e) => setFormInfo({ ...formInfo, lorry_id: e.target.value })}
                                className="border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2"
                            >
                                <option value="" disabled>Select Lorry</option>
                                {lorries && lorries.map(lorry => (
                                    <option key={lorry.id} value={lorry.id}>{lorry.lorry_number}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex flex-col">
                            <label htmlFor="from_loc" className="mb-2 text-xs md:text-sm font-medium text-gray-700">From Location:</label>
                            <select
                                name="from_location"
                                id="from_loc"
                                defaultValue={formInfo.from_location}
                                onChange={(e) => setFormInfo({ ...formInfo, from_location: e.target.value })}
                                className="border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2"
                            >
                                <option value="" disabled>Select Location</option>
                                {locations && locations.map(loc => {
                                    return <option key={loc.id} value={loc.id}>{loc.name}</option>;
                                })}
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="to_loc" className="mb-2 text-xs md:text-sm font-medium text-gray-700">To Location:</label>
                            <select
                                name="to_location"
                                id="to_loc"
                                defaultValue={formInfo.to_location}
                                onChange={(e) => setFormInfo({ ...formInfo, to_location: e.target.value })}
                                className="border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2"
                            >
                                <option value="" disabled>Select location</option>
                                {locations && locations.map(loc => {
                                    if (loc.id == formInfo.from_location) return;
                                    return <option key={loc.id} value={loc.id}>{loc.name}</option>;
                                })}
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="px-4 py-2 font-semibold text-white bg-teal-500 rounded-md shadow-sm hover:bg-teal-600">
                        Submit
                    </button>
                </form>
                <Toast ref={toast} />
            </Dialog>
        </>
    );
}
export default AddNewItem

const AddLorryCompo = (props) => {
    const { lorries, setLorries, toast } = props;
    const [openDialog, setOpenDialog] = useState(false);

    const handleLorrySubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const formData = new FormData(e.target);
        const lorry_number = formData.get("lorry_number");
        const driver_number = formData.get("driver_number");


        if (lorries && lorries.length > 0) {
            let exists = lorries.some(lry => lry.lorry_number === lorry_number);
            if (exists) {
                toast.current.show({ label: 'Error', severity: 'error', detail: 'Lorry number already added !' })
                return;
            } else {
                storeLorry(lorry_number, driver_number);
            }
        } else {
            storeLorry(lorry_number, driver_number);
        }
    };

    const storeLorry = (lorry_number, driver_number) => {
        axios.post("/master/data/new/lorry", {
            lorry_number,
            driver_number
        })
            .then(res => {
                setLorries(res.data.lorries);
                setOpenDialog(false);
            })
            .catch(err => toast.current.show({ label: 'Error', severity: 'error', detail: err.message }));
    }

    return (
        <>
            <button type='button' onClick={() => setOpenDialog(true)} className="text-xs font-semibold underline">
                Add New
            </button>
            <Dialog visible={openDialog} modal onHide={() => setOpenDialog(false)} className="rounded-md shadow-sm m-4 w-full md:w-1/2 p-4 bg-white">
                <form onSubmit={handleLorrySubmit} className="space-y-4">
                    <div className="flex flex-col">
                        <label htmlFor="lorry_number" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Lorry Number</label>
                        <input type="text" name="lorry_number" id="lorry_number" required className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4" />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="driver_number" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Driver Number</label>
                        <input type="text" name="driver_number" id="driver_number" className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4" />
                    </div>

                    <button type="submit" className="px-4 py-2 font-semibold text-white bg-teal-500 rounded-md shadow-sm hover:bg-teal-600">
                        Submit
                    </button>
                </form>
            </Dialog>
        </>
    );


}

// user: laksvrdd_track_root
// LD.R]thTcvU%
// db: laksvrdd_transtrack
