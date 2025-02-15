import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { BreadCrumb } from "primereact/breadcrumb";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { FaRegTrashAlt, FaEdit } from 'react-icons/fa';
import axios from 'axios';

const Location = (props) => {
	const toast = useRef(null);
	const [locations, setLocations] = useState(null);
	const [loading, setLoading] = useState(true);
	const items = [{ label: "Master", url: '/' }, { label: "Locations" }];
	const [searchTxt, setSearchTxt] = useState('');
	const [perPage, setPerPage] = useState(10);


	const loadData = (params) => {
		setLoading(true);
		axios.get('/master/data/locations', { params })
			.then((response) => {
				setLocations(response.data);
				setLoading(false);
			})
			.catch((error) => {
				toast.current.show({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
				setLoading(false);
			});
	};

	useEffect(() => {
		loadData({ page: 1, per_page: perPage, order_by: 'name', order: 'asc', search: searchTxt });
	}, [perPage, searchTxt]);

	const privilege = props.auth.user.role.privilege_index;

	return (
		<AdminLayout user={props.auth?.user} page="Master">
			<Head title='location-master' />
			<div className="w-full flex flex-col gap-4 items-start">
				<BreadCrumb model={items} />
				{loading ? 'Loading' : (
					<div className="shadow w-full h-full flex flex-col bg-white rounded-lg">
						<div className="flex justify-between my-3 mx-5">
							<h3 className="text-3xl text-slate-600">Locations</h3>
							{privilege > 5 && <AddNewLocation reload={loadData} toast={toast} />}
						</div>
						<hr />
						<div className="flex flex-col gap-4">
							<LocationList locations={locations} reload={loadData} toast={toast} privilege={privilege} perPage={perPage} setPerPage={setPerPage} searchTxt={searchTxt} setSearchTxt={setSearchTxt} />
						</div>
					</div>
				)}
			</div>
			<Toast ref={toast} />
		</AdminLayout>
	);
};

export default Location;


const LocationList = (props) => {
	const { locations, reload, privilege, perPage, setPerPage, searchTxt, setSearchTxt } = props;
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
				{locations && locations.total > 0 ? (
					<>
						<table className="w-full border">
							<thead>
								<tr className="bg-gray-100">
									<th className="text-center p-2">Sl.</th>
									<th className="text-left p-2">Name</th>
									<th className="text-left p-2">Beat No</th>
									<th className="text-left p-2">Address</th>
									<th className="text-center p-2">Actions</th>
								</tr>
							</thead>
							<tbody>
								{locations.data.map((location, i) => (
									<tr key={i} className="border-b">
										<td className="text-center py-2">{i + (locations.per_page * (locations.current_page - 1)) + 1}</td>
										<td className="capitalize py-2">{location.name}</td>
										<td className="py-2">{location.beat_no}</td>
										<td className="py-2">{location.address}</td>
										<td className="flex gap-4 justify-center items-center py-2">
											{privilege > 5 && <EditLocation {...props} location={location} />}
											{privilege > 10 && <DeleteLocation {...props} location={location} />}
										</td>
									</tr>
								))}
							</tbody>
						</table>
						<Pagination locations={locations} reload={reload} perPage={perPage} searchTxt={searchTxt} />
					</>
				) : <span className="text-gray-500 italic">No location found!</span>}
			</div>
			<ConfirmDialog className="rounded-md bg-white p-4" />
		</div>
	);
}

const Pagination = ({ locations, reload, perPage, searchTxt }) => (
	<div className="flex justify-between p-4">
		<span>Showing {locations.from} to {locations.to} of {locations.total} items</span>
		<ul className="flex gap-3">
			{locations.links.map((link, index) => {
				let page = 1;
				if (link.url) {
					const urlParams = new URLSearchParams(new URL(link.url).search);
					page = urlParams.get('page');
				}
				return (
					<li key={index} className={`text-md font-semibold ${link.active ? 'underline' : ''}`}>
						<button
							onClick={() => reload({ page, per_page: perPage, search: searchTxt })}
							dangerouslySetInnerHTML={{ __html: link.label }}
							className={`px-2 py-1 rounded ${link.active ? 'bg-blue-500 text-white' : 'text-blue-500'}`}
						/>
					</li>
				);
			})}
		</ul>
	</div>
);

const EditLocation = ({ reload, toast, location }) => {
	const [openDialog, setOpenDialog] = useState(false);
	const [formData, setFormData] = useState({
		name: location.name,
		beat_no: location.beat_no,
		address: location.address,
	});

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		axios.put(`/master/data/location/${location.id}`, formData)
			.then(res => {
				toast.current.show({ severity: 'success', summary: 'Success', detail: res.data.message, life: 3000 });
				reload();
				setOpenDialog(false);
			})
			.catch(err => toast.current.show({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 }));
	};

	return (
		<>
			<button onClick={() => setOpenDialog(true)} className="text-sm font-semi-bold p-1 rounded">
				<FaEdit className="w-5 h-5 text-blue-500 hover:text-blue-700" />
			</button>
			<Dialog visible={openDialog} onHide={() => setOpenDialog(false)} header="Edit Location" className="w-1/2">
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="flex flex-col">
						<label htmlFor="name" className="mb-1">Name</label>
						<input
							type="text"
							id="name"
							name="name"
							value={formData.name}
							onChange={handleChange}
							className="border rounded px-2 py-1"
							required
						/>
					</div>
					<div className="flex flex-col">
						<label htmlFor="beat_no" className="mb-1">Beat No</label>
						<input
							type="text"
							id="beat_no"
							name="beat_no"
							value={formData.beat_no}
							onChange={handleChange}
							className="border rounded px-2 py-1"
						/>
					</div>
					<div className="flex flex-col">
						<label htmlFor="address" className="mb-1">Address</label>
						<textarea
							id="address"
							name="address"
							value={formData.address}
							onChange={handleChange}
							className="border rounded px-2 py-1"
							rows="3"
						/>
					</div>
					
					<button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
						Update
					</button>
				</form>
			</Dialog>
		</>
	);
};

const DeleteLocation = ({ reload, toast, location }) => {
	const accept = () => {
		axios.delete(`/master/data/location/${location.id}`)
			.then(res => {
				toast.current.show({ severity: 'success', summary: 'Success', detail: res.data.message, life: 3000 });
				reload();
			})
			.catch(err => toast.current.show({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 }));
	};

	const handleConfirm = () => {
		confirmDialog({
			message: 'Do you want to delete this location?',
			header: 'Delete Confirmation',
			icon: 'pi pi-info-circle',
			acceptClassName: 'p-button-danger',
			accept
		});
	};

	return (
		<button onClick={handleConfirm} className="text-sm font-semi-bold p-1 rounded">
			<FaRegTrashAlt className="w-5 h-5 text-red-500 hover:text-red-700" />
		</button>
	);
};


const AddNewLocation = ({ reload, toast }) => {
	const [openDialog, setOpenDialog] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const name = formData.get("name");
		const beat_no = formData.get("beat_no");
		const address = formData.get("address");

		axios.post("/master/data/new/location", {
			name,
			beat_no,
			address,
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
			<button onClick={() => setOpenDialog(true)} className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semi-bold py-2 px-3 rounded">
				Create New
			</button>
			<Dialog visible={openDialog} modal onHide={() => setOpenDialog(false)} className="rounded-md m-4 w-full md:w-1/2 p-4 bg-white">
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-1 gap-2">
						<div className="flex flex-col">
							<label htmlFor="name" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Name</label>
							<input type="text" name="name" id="name" required className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4" />
						</div>

						<div className="flex flex-col">
							<label htmlFor="beat_no" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Beat No</label>
							<input type="text" name="beat_no" id="beat_no" className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4" />
						</div>

						<div className="flex flex-col">
							<label htmlFor="address" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Address</label>
							<textarea name="address" id="address" rows="3" className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4"></textarea>
						</div>
					</div>

					<button type="submit" className="px-4 py-2 font-semibold text-white bg-teal-500 rounded-md shadow-sm hover:bg-teal-600">
						Submit
					</button>
				</form>
			</Dialog>
		</>
	);
}
