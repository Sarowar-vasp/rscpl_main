import { Head } from '@inertiajs/react'
import React, { useEffect, useRef, useState } from 'react'
import { BreadCrumb } from "primereact/breadcrumb";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { FaRegEdit, FaRegTrashAlt } from "react-icons/fa";
import AdminLayout from '@/Layouts/AdminLayout';


const index = (props) => {
	const toast = useRef();
	const [isLoading, setIsLoading] = useState(true);
	const [units, setUnits] = useState([]);

	const items = [{ label: "Master", url: '/' }, { label: "Item Unit" }];

	const loadData = (params) => {
		axios.get('/master/data/itemunits', { params })
			.then(res => {
				setUnits(res.data);
				setIsLoading(false);
			}).catch(er => {
				toast.current.show({ label: 'Error', severity: 'error', detail: er.message })
				setIsLoading(false);
			});
	}

	useEffect(() => {
		loadData({ page: 1, per_page: 10, order_by: 'name', order: 'asc', search: '' });
	}, []);
	const privilege = props.auth.user.role.privilege_index;

	return (
		<AdminLayout
			user={props.auth?.user}
			page="Master"
		>
			<Head title='Item-unit-master' />
			<div className="w-full flex flex-col gap-4 items-start">
				<BreadCrumb model={items} />
				{isLoading ? 'Loading' : (
					<div className="shadow w-full h-full flex flex-col bg-white rounded-lg">
						<div className="flex justify-between my-3 mx-5">
							<h3 className="text-3xl text-slate-600">Units</h3>
							{ privilege > 5 && <AddNewItem reload={loadData} toast={toast} /> }
						</div>
						<hr />
						<div className="flex flex-col gap-4">
							<ItemsList units={units} reload={loadData} toast={toast} privilege={privilege} />
						</div>
					</div>
				)}
			</div>
			<Toast ref={toast} />
		</AdminLayout>
	)
}

export default index


const ItemsList = (props) => {
	const { units, reload, privilege } = props;
	const [searchTxt, setSearchTxt] = useState('');
	const [perPage, setPerPage] = useState(10);

	const handleLimitChange = (e) => setPerPage(e.target.value);
	const handleSearch = (e) => setSearchTxt(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''));

	useEffect(() => {
		reload({ per_page: perPage, search: searchTxt });
	}, [perPage, searchTxt]);


	return (
		<div className="p-3 md:px-4 md:py-6 flex flex-col gap-2 rounded-md shadow-sm">
			<div className="flex justify-between px-2">
				<select value={perPage} onChange={handleLimitChange}>
					{[5, 10, 20, 50, 100].map(num => <option key={num} value={num}>{num}</option>)}
				</select>
				<input type="text" placeholder="Search..." onChange={handleSearch} />
			</div>
			<div className="content px-2">
				{units && units.total > 0 ? (
					<>
						<table className="w-full border">
							<thead>
								<tr>
									<th className="text-center">Sl.</th>
									<th className="text-left">Name</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{units.data.map((unit, i) => (
									<tr key={i} className="border">
										<td className="text-center py-2">{i + 1}</td>
										<td className="capitalize">{unit.name}</td>
										<td className="flex gap-4 justify-center items-center">
											{privilege > 5 && <EditItem {...props} unit={unit} />}
											{privilege > 10 && <DeleteItem {...props} unit={unit} />}
										</td>
									</tr>
								))}
							</tbody>
						</table>
						<Pagination units={units} reload={reload} perPage={perPage} searchTxt={searchTxt} />
					</>
				) : <span>No unit found!</span>}
			</div>
			<ConfirmDialog className="rounded-md bg-white p-4" />
		</div>
	);
}

const Pagination = ({ units, reload, perPage, searchTxt }) => (
	<div className="flex justify-between p-4">
		<span>Showing {units.from} to {units.to} of {units.total} items</span>
		<ul className="flex gap-3">
			{units.links.map((link, index) => {
				let page = 1;
				if (link.url) {
					const urlParams = new URLSearchParams(new URL(link.url).search);
					page = urlParams.get('page');
				}
				return (
					<li key={index} className={`text-md font-semibold ${link.active ? 'underline' : ''}`}>
						<button onClick={() => reload({ page, per_page: perPage, search: searchTxt })} dangerouslySetInnerHTML={{ __html: link.label }} />
					</li>
				);
			})}
		</ul>
	</div>
);

// operation

const AddNewItem = ({ reload, toast }) => {
	const [openDialog, setOpenDialog] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const name = formData.get("name");

		console.log(name);
		axios.post("/master/data/new/itemunit", {
			name
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
					<div className="flex flex-col">
						<label htmlFor="unit_name" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Unit Name</label>
						<input type="text" name="name" id="unit_name" required className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4" />
					</div>

					<button type="submit" className="px-4 py-2 font-semibold text-white bg-teal-500 rounded-md shadow-sm hover:bg-teal-600">
						Submit
					</button>
				</form>
			</Dialog>
		</>
	);
}

const EditItem = ({ reload, toast, unit }) => {
	const [openDialog, setOpenDialog] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const name = formData.get("name");

		axios.put(`/master/data/itemunit/${unit.id}`, {
			name
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
					<div className="flex flex-col">
						<label htmlFor="unit_name" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Unit Name</label>
						<input type="text" name="name" id="unit_name" required defaultValue={unit.name} className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4" />
					</div>
					<button type="submit" className="px-4 py-2 font-semibold text-white bg-teal-500 rounded-md shadow-sm hover:bg-teal-600">
						Submit
					</button>
				</form>
			</Dialog>
		</>
	);
};

const DeleteItem = ({ reload, toast, unit }) => {
	const accept = () => {
		axios.delete(`/master/data/itemunit/${unit.id}`)
			.then(res => {
				toast.current.show({ label: 'Success', severity: 'success', detail: res.data.message });
				reload();
			})
			.catch(err => toast.current.show({ label: 'Error', severity: 'error', detail: err.message }));
	};

	const handleConfirm = () => {
		confirmDialog({
			message: 'Do you want to delete this record?',
			header: 'Delete Confirmation',
			icon: 'pi pi-info-circle',
			acceptClassName: 'p-button-danger',
			accept
		});
	};

	return (
		<button onClick={handleConfirm} className="text-sm font-semi-bold p-1 rounded">
			<FaRegTrashAlt className="w-6 h-6 text-red-500 hover:text-red-700" />
		</button>
	);
};
