import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { Button } from '@mui/material';
import { BreadCrumb } from 'primereact/breadcrumb';
import React, { useEffect} from 'react'

const BookingItem = (props) => {
    const items = [
        { label: "Transaction", url: '#' },
        { label: "Booking", url: '/transaction/booking' },
        { label: props.booking.id },
    ];
    const { booking } = props;
    let branch = booking.manifest?.branch;

    const itemNames = [...new Set(booking.items.flatMap(item => item.item_quantities.map(itemQuantity => itemQuantity.item_name)))];

    const totalAmount = booking.items.reduce((accumulator, currentItem) => accumulator + parseInt(currentItem.amount), 0);
    const totalQuantities = booking.items.reduce((sum, item) => sum + item.item_quantities.reduce((itemSum, itemInfo) => itemSum + itemInfo.quantity, 0), 0);
    const totalWeight = booking.items.reduce((sum, item) => sum + item.weight, 0);

    const handlePrint = () => {
        const printUrl = `/print/booking/${booking.id}`;
        window.open(printUrl, '_blank', 'width=1200,height=1200');
    };


    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === 'p') {
                event.preventDefault();
                handlePrint();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <AdminLayout
            user={props.auth?.user}
            page="Booking"
        >
            <Head title="Booking" />
            <BreadCrumb model={items} className='py-4 text-gray-500' />
            <div className="p-8 pt-2 bg-white rounded-lg">
                <Button onClick={handlePrint} color="warning" variant="outlined" size="small" sx={{}}>
                    Print
                </Button>
                <div className="p-4">
                        <table className='w-full'>
                            <thead>
                                <tr>
                                    <td>
                                        <div className="page-header">
                                            <div className="header-info">
                                                <div className="flex justify-center pb-8">
                                                    <h2 className='px-6 underline font-bold'>{booking.ship_to_party ? "Ship to Party " : " "}Consignment Note</h2>
                                                </div>
                                                <div className="flex flex-col gap-2 border-b ">
                                                    <div className="flex justify-between items-start">
                                                        <div className="branch_details">
                                                            <h2 className="text-3xl font-bold uppercase text-gray-800">{branch?.name}</h2>
                                                            <p className="">
                                                                {branch?.address ?
                                                                    <span className="font-semibold text-gray-700">
                                                                        {branch?.address}
                                                                    </span>
                                                                    :
                                                                    <span className="font-semibold">
                                                                        {branch?.location?.name}
                                                                    </span>
                                                                }
                                                            </p>
                                                        </div>
                                                        <div className="Date">
                                                            <h4>CN no: <span>{booking.cn_no}</span></h4>
                                                            <h4>Date:
                                                                <span>
                                                                    {new Date(booking.manifest?.trip_date).toLocaleDateString('en-GB')}
                                                                </span>
                                                            </h4>
                                                        </div>
                                                    </div>
                                                    <hr />
                                                    <div className="grid grid-cols-2 items-start text-gray-500">
                                                        <div className="">
                                                            <h3 className="text-xl font-semibold">Consignor</h3>
                                                            <h5 className="">{booking.consignor.name}</h5>
                                                            <h5 className="">{booking.consignor.address}</h5>
                                                            <h5 className="font-bold">GSTIN: {booking.consignor.gstin}</h5>
                                                            <h5 className="">Dispatch From: <span className='font-semibold'> {booking.consignor.location?.name}</span></h5>
                                                        </div>
                                                        <div className="">
                                                            <h3 className="text-xl font-semibold">Consignee</h3>
                                                            <h5 className="">{booking.consignee.name}</h5>
                                                            {booking.consignee.address ? <p >{'Address: '}<span>{booking.consignee.address}</span></p> : ''}
                                                            <h5 className="">Destination
                                                                {booking.ship_to_party ? " (Party Location) :" : " : "}
                                                                {booking.ship_to_party ? booking.party_location : booking.consignee.location?.name}
                                                            </h5>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="page-header-space">
                                        </div>
                                    </td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div className="page px-5">
                                            <table className="w-full mt-4 border-collapse border border-gray-200">
                                                <thead>
                                                    <tr>
                                                        <th className="border border-gray-200 p-2">Invoice No</th>
                                                        <th className="border border-gray-200 p-2">Invoice Date</th>
                                                        <th className="border border-gray-200 p-2">Amount</th>
                                                        {itemNames.map((itm, i) => (
                                                            <th key={i} className="border border-gray-200 p-2">{itm}(Qty)</th>
                                                        ))}
                                                        <th className="border border-gray-200 p-2">Gross Weight(KG)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {booking.items && booking.items.length > 0 && booking.items.map((itm, i) => (
                                                        <tr key={i}>
                                                            <td className="border border-gray-200 text-center p-2">{itm.invoice_no}</td>
                                                            <td className="border border-gray-200 text-center p-2">
                                                                {new Date(itm.invoice_date).toLocaleDateString('en-GB')}
                                                            </td>
                                                            <td className="border border-gray-200 text-center p-2">{itm.amount}</td>
                                                            {itm.item_quantities.map((itemInfo, i) => (
                                                                <td key={i} className="border border-gray-200 text-center p-2">{itemInfo.quantity}</td>
                                                            ))}
                                                            <td className="border border-gray-200 text-center p-2">{itm.weight}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="flex items-start justify-between py-8">
                                            <div className="">
                                                <h3>Vehicle No: {booking.manifest?.lorry?.lorry_number}</h3>
                                                <h3>Driver No: {booking.manifest?.lorry?.driver_number}</h3>
                                            </div>
                                            <div className="min-w-[200px] ">
                                                <h3>Total Quantity: {totalQuantities}</h3>
                                                <h3>Gross Weight: {totalWeight} KG</h3>
                                                <h3>Total Amount: {totalAmount.toFixed(2)}</h3>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <div className="page-footer-space"></div>
                            </tfoot>
                        </table>
                        <div className="page-footer">
                            <div className="flex justify-between items-start py-4 mt-3 page-footer-space">
                                <div className="min-w-[250px] min-h-[150px] relative">
                                    <h3 className="text-xl">{branch ? branch.name : ''}</h3>
                                    <div className="absolute bottom-1 left-0 right-0 flex justify-start">
                                        <span className='text-sm'>
                                            Authorised Signatory
                                        </span>
                                    </div>
                                </div>
                                <div className="min-w-[250px] min-h-[150px] relative">
                                    <h3 className="text-xl uppercase">Consignee</h3>
                                    <div className="absolute bottom-1 left-0 right-0 flex justify-start">
                                        <span className='text-sm'>
                                            Receiver's Sign / Stamp
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>
        </AdminLayout>
    )
}

export default BookingItem