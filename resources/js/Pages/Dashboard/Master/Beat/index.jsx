import AdminLayout from '@/Layouts/AdminLayout'
import { Head } from '@inertiajs/react'
import axios from 'axios'
import { BreadCrumb } from 'primereact/breadcrumb'
import { Dialog } from 'primereact/dialog'
import { Toast } from 'primereact/toast'
import React, { useState, useEffect, useRef } from 'react'


const BeatItem = (props) => {
    const toast = useRef(null);
    const items = [{ label: "Master", url: '/' }, { label: "Beat Rates" }];
    const [beats, setBeats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTxt, setSearchTxt] = useState('');
    const [perPage, setPerPage] = useState(10);
    const [locations, setLocations] = useState(null);


    const loadData = (params) => {
        setLoading(true);
        Promise.all([
            axios.get('/master/data/beats', { params }),
            axios.get('/master/data/locations?paginate=no')
        ])
            .then(([beatsResponse, locationsResponse]) => {
                setBeats(beatsResponse.data);
                setLocations(locationsResponse.data);
            })
            .catch((error) => {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.response?.data?.message, life: 3000 });
            })
            .finally(() => {
                setLoading(false);
            });
    };


    useEffect(() => {
        loadData({ page: 1, per_page: perPage, order_by: 'beat_no', order: 'asc', search: searchTxt });
    }, [perPage, searchTxt]);
    const privilege = props.auth.user.role.privilege_index;

    return (
        <AdminLayout user={props.auth?.user} page="Master">
            <Head title='beat-master' />
            <div className="w-full flex flex-col gap-4 items-start">
                <BreadCrumb model={items} />
                {loading ? 'Loading' : (
                    <div className="shadow w-full h-full flex flex-col bg-white rounded-lg">
                        <div className="flex justify-between my-3 mx-5">
                            <h3 className="text-3xl text-slate-600">Beats</h3>
                            {privilege > 5 && <AddNewItem reload={loadData} toast={toast} locations={locations} />}
                        </div>
                        <hr />
                        <div className="flex flex-col gap-4">
                            <ItemList beats={beats} reload={loadData} toast={toast} privilege={privilege} perPage={perPage} setPerPage={setPerPage} searchTxt={searchTxt} setSearchTxt={setSearchTxt} />
                        </div>
                    </div>
                )}
            </div>
            <Toast ref={toast} />
        </AdminLayout>
    )
}

export default BeatItem


const ItemList = (props) => {
    const { beats, reload, privilege, perPage, setPerPage, searchTxt, setSearchTxt } = props;
    const handleLimitChange = (e) => setPerPage(e.target.value);
    const handleSearch = (e) => setSearchTxt(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''));

    return (
        <div className="p-3 md:px-4 md:py-6 flex flex-col gap-2 rounded-md shadow-sm">
            <div className="flex justify-between px-2">
                <div className="min-w-[200px]">
                    <select value={perPage} onChange={handleLimitChange} className="border rounded px-2 py-1 w-full">
                        {[5, 10, 20, 50, 100].map(num => <option key={num} value={num}>{num}</option>)}
                    </select>
                </div>
                <input
                    type="text"
                    defaultValue={searchTxt}
                    placeholder="Search..."
                    onBlur={handleSearch}
                    className="border rounded px-2 py-1"
                />
            </div>
            <div className="content px-2">
                {beats && beats.total > 0 ? (
                    <>
                        <table className="w-full border">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="text-center p-2">Sl.</th>
                                    <th className="text-left p-2">Beat No</th>
                                    <th className="text-left p-2">Location</th>
                                    <th className="text-left p-2">Rate</th>
                                    <th className="text-center p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {beats.data.map((beat, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="text-center py-2">{i + (beats.per_page * (beats.current_page - 1)) + 1}</td>
                                        <td className="capitalize py-2">{beat.beat_no}</td>
                                        <td className="capitalize py-2">{beat.location?.name}</td>
                                        <td className="py-2">{beat.rate}</td>
                                        <td className="flex gap-4 justify-center items-center py-2">
                                            {privilege > 5 && <EditBeat {...props} beat={beat} />}
                                            {privilege > 10 && <DeleteBeat {...props} beat={beat} />}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Pagination beats={beats} reload={reload} perPage={perPage} searchTxt={searchTxt} />
                    </>
                ) : <span className="text-gray-500 italic">No beat found!</span>}
            </div>
        </div>
    );
}


const AddNewItem = ({ reload, toast, locations }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
        location_id: '',
        beat_no: '',
        rate: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post("/master/data/new/beat", formData)
            .then(res => {
                toast.current.show({ severity: 'success', summary: 'Success', detail: res.data.message, life: 3000 });
                reload();
                setOpenDialog(false);
            })
            .catch(err => toast.current.show({ severity: 'error', summary: 'Error', detail: err.response?.data?.message, life: 3000 }));
    };

    return (
        <>
            <button onClick={() => setOpenDialog(true)} className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semi-bold py-2 px-3 rounded">
                Create New Beat
            </button>
            <Dialog visible={openDialog} modal onHide={() => setOpenDialog(false)} className="rounded-md m-4 w-full md:w-1/2 p-4 bg-white">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col">
                        <label htmlFor="beat_no" className="mb-1">Beat No</label>
                        <input
                            type="text"
                            id="beat_no"
                            name="beat_no"
                            value={formData.beat_no}
                            onChange={handleChange}
                            className="border rounded px-2 py-1"
                            required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="location" className="mb-1">Location</label>
                        <select
                            name="location_id"
                            id="location"
                            defaultValue={''}
                            onChange={handleChange}
                        >
                            <option value={''}>Select Location</option>
                            {locations && locations.length > 0 ? locations.map((loc, i) => (
                                <option key={i} value={loc.id}>{loc.name}</option>
                            ))
                                : null}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="rate" className="mb-1">Rate</label>
                        <input
                            type="number"
                            id="rate"
                            name="rate"
                            value={formData.rate}
                            onChange={handleChange}
                            className="border rounded px-2 py-1"
                            required
                        />
                    </div>
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Submit
                    </button>
                </form>
            </Dialog>
        </>
    );
}



const EditBeat = ({ reload, toast, beat, locations }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
        beat_no: rate.beat_no,
        location_id: rate.location_id,
        rate: rate.rate,
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.put(`/master/data/beat/${beat.id}`, formData)
            .then(res => {
                toast.current.show({ severity: 'success', summary: 'Success', detail: res.data.message, life: 3000 });
                reload();
                setOpenDialog(false);
            })
            .catch(err => toast.current.show({ severity: 'error', summary: 'Error', detail: err.response?.data?.message, life: 3000 }));
    };

    return (
        <>
            <button onClick={() => setOpenDialog(true)} className="text-sm font-semi-bold p-1 rounded">
                <FaEdit className="w-5 h-5 text-blue-500 hover:text-blue-700" />
            </button>
            <Dialog visible={openDialog} onHide={() => setOpenDialog(false)} header="Edit Beat" className="w-1/2">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col">
                        <label htmlFor="beat_no" className="mb-1">Beat No</label>
                        <input
                            type="text"
                            id="beat_no"
                            name="beat_no"
                            value={formData.beat_no}
                            onChange={handleChange}
                            className="border rounded px-2 py-1"
                            required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="location" className="mb-1">Location</label>
                        <select
                            name="location_id"
                            id="location"
                            defaultValue={beat.location_id}
                            onChange={handleChange}
                        >
                            <option value={''}>Select Location</option>
                            {locations && locations.length > 0 ? locations.map((loc, i) => (
                                <option key={i} value={loc.id}>{loc.name}</option>
                            ))
                                : null}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="rate" className="mb-1">Rate</label>
                        <input
                            type="number"
                            id="rate"
                            name="rate"
                            value={formData.rate}
                            onChange={handleChange}
                            className="border rounded px-2 py-1"
                            required
                        />
                    </div>
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Update
                    </button>
                </form>
            </Dialog>
        </>
    );
}

const DeleteBeat = ({ reload, toast, beat }) => {
    const [openDialog, setOpenDialog] = useState(false);

    const handleDelete = () => {
        axios.delete(`/master/data/beat/${beat.id}`)
            .then(res => {
                toast.current.show({ severity: 'success', summary: 'Success', detail: res.data.message, life: 3000 });
                reload();
                setOpenDialog(false);
            })
            .catch(err => toast.current.show({ severity: 'error', summary: 'Error', detail: err.response?.data?.message, life: 3000 }));
    };

    return (
        <>
            <button onClick={() => setOpenDialog(true)} className="text-sm font-semi-bold p-1 rounded">
                <FaTrash className="w-5 h-5 text-red-500 hover:text-red-700" />
            </button>
            <Dialog visible={openDialog} onHide={() => setOpenDialog(false)} header="Delete Beat" className="w-1/3">
                <p>Are you sure you want to delete this rate?</p>
                <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => setOpenDialog(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        Cancel
                    </button>
                    <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                        Delete
                    </button>
                </div>
            </Dialog>
        </>
    );
}
