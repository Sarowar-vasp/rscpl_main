import AdminLayout from '@/Layouts/AdminLayout'
import { Head } from '@inertiajs/react'
import { BreadCrumb } from 'primereact/breadcrumb'
import { TabPanel, TabView } from 'primereact/tabview'
import React from 'react'
import BookingReport from './BookingReport'
import ReturnReport from './ReturnReport'
import ManifestReport from './ManifestReport'

const ConsignmentReport = (props) => {
    const items = [
        { label: "Transaction", url: '#' },
        { label: "Booking", url: '/transaction/booking' },
        { label: "Report" }
    ];

    return (
        <AdminLayout
            user={props.auth?.user}
            page="Report"
        >
            <Head title="Report" />
            <div className="w-full flex flex-col gap-4 items-start relative">
                <BreadCrumb model={items} className='py-2 text-gray-500' />
                <div className="shadow w-full h-full flex flex-col bg-white rounded-lg p-4">
                    <div className="card w-full">
                        <TabView>
                            <TabPanel header="Manifest Wise Report">
                                <ManifestReport {...props} />
                            </TabPanel>
                            <TabPanel header="Booking Report">
                                <BookingReport {...props} />
                            </TabPanel>
                            <TabPanel header="Return Report">
                                <ReturnReport {...props} />
                            </TabPanel>
                        </TabView>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default ConsignmentReport

