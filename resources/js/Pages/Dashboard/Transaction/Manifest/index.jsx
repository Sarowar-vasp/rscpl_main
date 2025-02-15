import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react'
import AddNewItem from './AddNewItem';
import ItemsList from './ItemsList';

const index = (props) => {
	const items = [{ label: "Transaction", url: '#' }, { label: "Manfest" }];
	const toast = useRef();
	const [manifests, setManifests] = useState([]);

	const loadData = (params) => {
		axios.get('/data/manifests', { params })
			.then(res => {
				setManifests(res.data)
			})
			.catch(err => {
				console.log(err.message);
			});
	}

	useEffect(() => {
		loadData();
	}, [])


	return (
		<AdminLayout
			user={props.auth?.user}
			page="Transactions"
		>
			<Head title='manifest' />
			<div className="w-full flex flex-col gap-4 items-start">
				<BreadCrumb model={items} className='py-2 text-gray-500' />
				<div className="shadow w-full h-full flex flex-col bg-white rounded-lg">
					<div className="flex justify-between my-3 mx-5">
						<h3 className="text-3xl text-slate-600">Manifest</h3>
						<AddNewItem reload={loadData} toast={toast} {...props} />
					</div>
					<hr />
					<div className="flex flex-col gap-4">
						<ItemsList manifests={manifests} reload={loadData} {...props} />
					</div>
				</div>
			</div>
			<Toast ref={toast} />
		</AdminLayout>
	)
}

export default index