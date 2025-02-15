import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { BreadCrumb } from 'primereact/breadcrumb';
import { TabView, TabPanel } from 'primereact/tabview';

import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react'

import ItemsList from './ItemsList';
import ReturnList from './Return/ReturnList';
import ManifestSection from './ManifestSection';

const index = (props) => {
	const items = [{ label: "Transaction", url: '#' }, { label: "Booking" }];
	const toast = useRef();
	const [bookings, setBookings] = useState([]);
	const [parties, setparties] = useState([]);
	const [returnList, setReturnList] = useState([]);
	const [manifests, setManifests] = useState(null);
	const [loading, setLoading] = useState({
		manifest: false,
		booking: false,
		return: false,
	});

	const loadManiData = (params) => {
		setLoading({ ...loading, manifest: true })
		axios.get('/data/manifests', { params })
			.then(res => {
				setManifests(res.data);
			})
			.catch(err => {
				console.error(err.message);
			})
			.finally(() => setLoading({ ...loading, manifest: false }));
	}


	const loadData = (params) => {
		setLoading({ ...loading, booking: true });
		loadParties();
		axios.get('/data/bookings', { params })
			.then(res => {
				setBookings(res.data)
			})
			.catch(err => {
				console.error(err.message);
			})
			.finally(() => setLoading({ ...loading, booking: false }));
	}


	const loadReturnData = (params) => {
		setLoading({ ...loading, return: true });
		loadParties();
		axios.get('/data/return/bookings', { params })
			.then(res => {
				setReturnList(res.data)
			})
			.catch(err => {
				console.error(err.message);
			})
			.finally(() => setLoading({ ...loading, return: false }));
	}

	const loadParties = () => {
		axios.get('/master/data/parties/all')
			.then(res => {
				setparties(res.data)
			})
			.catch(err => {
				console.error(err.message);
			});
	}


	useEffect(() => {
		loadManiData();
		loadData();
		loadReturnData();
	}, [])


	return (
		<AdminLayout
			user={props.auth?.user}
			page="Transactions"
		>
			<Head title='Booking' />
			<div className="w-full flex flex-col gap-4 items-start">
				<BreadCrumb model={items} className='py-2 text-gray-500' />
				<div className="shadow w-full h-full flex flex-col bg-white rounded-lg p-4">
					<div className="card">
						<TabView>
							<TabPanel header="Manifests">
								<ManifestSection 
									manifests={manifests} 
									toast={toast} 
									reload={loadManiData} 
									auth={props.auth} 
									loading={loading.manifest} 
									locations={props.locations} 
									lorries={props.lorries} 
								/>
							</TabPanel>
							<TabPanel header="Consignment List">
								<ItemsList 
									parties={parties} 
									bookings={bookings} 
									manifests={manifests?.data || []} 
									reload={loadData} 
									toast={toast} 
									{...props} 
									loading={loading.booking} 
									/>
							</TabPanel>
							<TabPanel header="Return Consignments">
								<ReturnList 
									parties={parties} 
									bookings={returnList} 
									manifests={manifests?.data || []} 
									reload={loadReturnData} 
									toast={toast} 
									{...props} 
									loading={loading.return}
									 />
							</TabPanel>
						</TabView>
					</div>
				</div>
			</div>
			<Toast ref={toast} />
		</AdminLayout>
	)
}

export default index