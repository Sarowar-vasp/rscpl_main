import { Head } from '@inertiajs/react'
import React, { useEffect, useRef, useState } from 'react'
import { BreadCrumb } from "primereact/breadcrumb";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import AdminLayout from '@/Layouts/AdminLayout';

const index = (props) => {
	const toast = useRef();
	const [isLoading, setIsLoading] = useState(true);
	const [branches, setBranches] = useState([]);
	const items = [{ label: "Master", url: '/' }, { label: "Branch" }];
	
	const loadData = (params) => {
		axios.get('/master/data/branches', { params })
			.then(res => {
				setBranches(res.data);
				setIsLoading(false);
			}).catch(er => {
				toast.current.show({ severity: 'error', summary: 'Error', detail: er.message, life: 3000 });
				setIsLoading(false);
			});
	}

	useEffect(() => {
		loadData({ page: 1, per_page: 10, order_by: 'name', order: 'asc', search: '' });
	}, []);

	return (
		<AdminLayout
			user={props.auth?.user}
			page="Master"
		>
			<Head title='Branch Master' />
			<div className="w-full flex flex-col gap-4 items-start">
				<BreadCrumb model={items} />
				{isLoading ? (
					<div className="flex justify-center items-center w-full h-64">
						<i className="pi pi-spin pi-spinner text-4xl"></i>
					</div>
				) : (
					<div className="shadow w-full h-full flex flex-col bg-white rounded-lg">
						<div className="flex justify-between my-3 mx-5">
							<h3 className="text-3xl text-slate-600">Branches</h3>
							<AddNewItem reload={loadData} toast={toast} />
						</div>
						<hr />
						<div className="flex flex-col gap-4">
							<ItemsList branches={branches} reload={loadData} toast={toast} />
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
	const { branches, reload } = props;
	const [globalFilter, setGlobalFilter] = useState('');
	const [perPage, setPerPage] = useState(10);

	const onPageChange = (event) => {
		reload({ page: event.page + 1, per_page: event.rows, search: globalFilter });
	};

	const header = (
		<div className="flex justify-between">
			<Dropdown value={perPage} options={[5, 10, 20, 50, 100]} onChange={(e) => setPerPage(e.value)} placeholder="Items per page" />
			<span className="p-input-icon-left">
				<i className="pi pi-search" />
				<InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
			</span>
		</div>
	);

	const actionBodyTemplate = (rowData) => {
		return (
			<div className="flex gap-2">
				<EditItem {...props} branch={rowData} />
				<DeleteItem {...props} branch={rowData} />
			</div>
		);
	};

	return (
		<div className="card">
			<DataTable 
				value={branches.data} 
				paginator 
				rows={perPage}
				totalRecords={branches.total}
				lazy
				first={branches.from - 1}
				onPage={onPageChange}
				header={header}
				globalFilter={globalFilter}
				emptyMessage="No branches found."
			>
				<Column field="name" header="Name" sortable />
				<Column field="phone" header="Phone No" sortable />
				<Column field="email" header="Email" sortable />
				<Column body={actionBodyTemplate} header="Actions" />
			</DataTable>
		</div>
	);
}

const AddNewItem = ({ reload, toast }) => {
	const [visible, setVisible] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const name = formData.get("name");
		const phone = formData.get("phone");
		const email = formData.get("email");

		axios.post("/master/data/new/branch", {
			name,
			phone,
			email
		})
			.then(res => {
				toast.current.show({ severity: 'success', summary: 'Success', detail: res.data.message, life: 3000 });
				reload();
				setVisible(false);
			})
			.catch(err => toast.current.show({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 }));
	};

	return (
		<>
			<Button label="Create New" icon="pi pi-plus" onClick={() => setVisible(true)} />
			<Dialog header="Add New Branch" visible={visible} style={{ width: '50vw' }} onHide={() => setVisible(false)}>
				<form onSubmit={handleSubmit} className="p-fluid">
					<div className="p-field">
						<label htmlFor="name">Name</label>
						<InputText id="name" name="name" required />
					</div>
					<div className="p-field">
						<label htmlFor="phone">Phone No</label>
						<InputText id="phone" name="phone" />
					</div>
					<div className="p-field">
						<label htmlFor="email">Email</label>
						<InputText id="email" name="email" type="email" />
					</div>
					<Button type="submit" label="Submit" />
				</form>
			</Dialog>
		</>
	);
}

const EditItem = ({ reload, toast, branch }) => {
	const [visible, setVisible] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const name = formData.get("name");
		const phone = formData.get("phone");
		const email = formData.get('email');

		axios.put(`/master/data/branch/${branch.id}`, {
			name,
			phone,
			email
		})
			.then(res => {
				toast.current.show({ severity: 'success', summary: 'Success', detail: res.data.message, life: 3000 });
				reload();
				setVisible(false);
			})
			.catch(err => toast.current.show({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 }));
	};

	return (
		<>
			<Button icon="pi pi-pencil" onClick={() => setVisible(true)} />
			<Dialog header="Edit Branch" visible={visible} style={{ width: '50vw' }} onHide={() => setVisible(false)}>
				<form onSubmit={handleSubmit} className="p-fluid">
					<div className="p-field">
						<label htmlFor="name">Name</label>
						<InputText id="name" name="name" required defaultValue={branch.name} />
					</div>
					<div className="p-field">
						<label htmlFor="phone">Phone No</label>
						<InputText id="phone" name="phone" defaultValue={branch.phone} />
					</div>
					<div className="p-field">
						<label htmlFor="email">Email</label>
						<InputText id="email" name="email" type="email" defaultValue={branch.email} />
					</div>
					<Button type="submit" label="Submit" />
				</form>
			</Dialog>
		</>
	);
};

const DeleteItem = ({ reload, toast, branch }) => {
	const accept = () => {
		axios.delete(`/master/data/branch/${branch.id}`)
			.then(res => {
				toast.current.show({ severity: 'success', summary: 'Success', detail: res.data.message, life: 3000 });
				reload();
			})
			.catch(err => toast.current.show({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 }));
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
		<>
		<ConfirmDialog />
		<Button icon="pi pi-trash" onClick={handleConfirm} />
		</>
	);
};