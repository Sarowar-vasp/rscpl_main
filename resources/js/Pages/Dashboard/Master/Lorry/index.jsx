import { Head } from '@inertiajs/react'
import React, { useEffect, useRef, useState } from 'react'
import { BreadCrumb } from "primereact/breadcrumb";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { FaRegEdit, FaRegTrashAlt } from "react-icons/fa";
import AdminLayout from '@/Layouts/AdminLayout';
import { ChevronDown, ChevronUp } from 'lucide-react';

const index = (props) => {

  const toast = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [lorries, setLorries] = useState([]);
  const items = [{ label: "Master", url: '/' }, { label: "Lorries" }];

  const loadData = (params) => {
		axios.get('/master/data/lorries', { params })
			.then(res => {
				setLorries(res.data);
				setIsLoading(false);
			}).catch(er => {
				toast.current.show({ label: 'Error', severity: 'error', detail: er.message })
				setIsLoading(false);
			});
	}

	useEffect(() => {
		loadData({ page: 1, per_page: 10, order_by: 'lorry_number', order: 'asc', search: '' });
	}, []);
	const privilege = props.auth.user.role.privilege_index;

  return (
    <AdminLayout
			user={props.auth?.user}
			page="Master"
		>
			<Head title='lorry-master' />
			<div className="w-full flex flex-col gap-4 items-start">
				<BreadCrumb model={items} />
				{isLoading ? 'Loading' : (
					<div className="shadow w-full h-full flex flex-col bg-white rounded-lg">
						<div className="flex justify-between my-3 mx-5">
							<h3 className="text-3xl text-slate-600">Lorries</h3>
							{privilege > 5 && <AddNewItem reload={loadData} toast={toast} />}
						</div>
						<hr />
						<div className="flex flex-col gap-4">
							<ItemsList lorries={lorries} reload={loadData} toast={toast} privilege={privilege}/>
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
	const { lorries, reload,privilege } = props;
	const [searchTxt, setSearchTxt] = useState('');
	const [sort, setSort] = useState({
		order: 'asc',
		order_by: 'lorry_number'
	});

  console.log(lorries);

	const [perPage, setPerPage] = useState(10);

	const handleLimitChange = (e) => setPerPage(e.target.value);
	const handleSearch = (e) => setSearchTxt(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''));

	useEffect(() => {
		reload({ per_page: perPage, search: searchTxt, order_by: sort.order_by, order: sort.order });
	}, [perPage, searchTxt, sort]);


	return (
		<div className="p-3 md:px-4 md:py-6 flex flex-col gap-2 rounded-md shadow-sm">
			<div className="flex justify-between px-2">
				<div className="flex flex-col">
					<label htmlFor="tablelimit" className='text-sm py-2'>Show:</label>
					<select id='tablelimit' value={perPage} onChange={handleLimitChange} className='min-w-md rounded-md'>
						{[5, 10, 20, 50, 100].map(num => <option key={num} value={num}>{num}</option>)}
					</select>
				</div>
				<div className="flex flex-col justify-end">

					<input
						type="text"
						className='min-w-lg rounded-md'
						placeholder="Search..."
						onChange={handleSearch}
					/>
				</div>
			</div>
			<div className="content px-2">
				{lorries && lorries.total > 0 ? (
					<>
						<table className="w-full border">
							<thead>
								<tr>
									<th className="text-center py-2">Sl.</th>
									
									<th className="text-left" onClick={() => setSort({ order_by: 'lorry_number', order: sort.order == 'asc' ? 'desc' : 'asc' })}>
										<span className='flex gap-2 cursor-pointer'>
											Lorry No
											{sort.order_by == 'lorry_number' ? sort.order == 'asc' ? <ChevronDown className='w-4' /> : <ChevronUp className='w-4' /> : ''}
										</span>
									</th>
									<th className="text-left" onClick={() => setSort({ order_by: 'driver_number', order: sort.order == 'asc' ? 'desc' : 'asc' })}>
										<span className='flex gap-2 cursor-pointer'>
											Driver No
											{sort.order_by == 'driver_number' ? sort.order == 'asc' ? <ChevronDown className='w-4' /> : <ChevronUp className='w-4' /> : ''}
										</span>
									</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{lorries.data.map((lorry, i) => (
									<tr key={i} className="border">
										<td className="text-center py-2">{i + (lorries.per_page * (lorries.current_page - 1)) + 1}</td>
										<td className="capitalize">{lorry.lorry_number}</td>
										<td className="capitalize">{lorry.driver_number}</td>
										<td className="flex gap-4 justify-center items-center">
											{privilege > 5 && <EditItem {...props} lorry={lorry} />}
											{privilege > 10 && <DeleteItem {...props} lorry={lorry} />}
										</td>
									</tr>
								))}
							</tbody>
						</table>
						<Pagination lorries={lorries} reload={reload} perPage={perPage} searchTxt={searchTxt} />
					</>
				) : <span>No lorry found!</span>}
			</div>
			<ConfirmDialog className="rounded-md bg-white p-4" />
		</div>
	);
}

const Pagination = ({ lorries, reload, perPage, searchTxt }) => (
	<div className="flex flex-col md:flex-row items-center md:justify-between p-4">
		<div className="flex-1 hidden md:inline-block">
			<span>Showing {lorries.from} to {lorries.to} of {lorries.total} items</span>
		</div>
		<ul className="flex-1 w-full flex gap-3 justify-between md:justify-end">
			{lorries.links.map((link, index) => {
				let page = 1;
				let show_on_mobile = isNaN(parseInt(link.label));

				if (link.url) {
					const urlParams = new URLSearchParams(new URL(link.url).search);
					page = urlParams.get('page');
				}

				return (
					<li 
					key={index} 
					className={`
						text-md font-semibold 
						${link.url ? 'text-slate-700' : 'text-slate-200'}
						${!show_on_mobile ? 'hidden md:inline' : ''} 
						${link.active ? 'underline' : ''}
						`}>
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
		const lorry_number = formData.get("lorry_number");
		const driver_number = formData.get("driver_number");


		axios.post("/master/data/new/lorry", {
			lorry_number,
			driver_number
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

const EditItem = ({ reload, toast, lorry }) => {
	const [openDialog, setOpenDialog] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const lorry_number = formData.get("lorry_number");
		const driver_number = formData.get("driver_number");

		axios.put(`/master/data/lorry/${lorry.id}`, {
			lorry_number,
			driver_number
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
						<label htmlFor="lorry_number" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Lorry Number</label>
						<input type="text" name="lorry_number" id="lorry_number" required defaultValue={lorry.lorry_number} className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4" />
					</div>
					<div className="flex flex-col">
						<label htmlFor="driver_number" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Driver Number</label>
						<input type="text" name="driver_number" id="driver_number" defaultValue={lorry.driver_number} className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4" />
					</div>

					<button type="submit" className="px-4 py-2 font-semibold text-white bg-teal-500 rounded-md shadow-sm hover:bg-teal-600">
						Submit
					</button>
				</form>
			</Dialog>
		</>
	);
};

const DeleteItem = ({ reload, toast, lorry }) => {
	const accept = () => {
		axios.delete(`/master/data/lorry/${lorry.id}`)
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