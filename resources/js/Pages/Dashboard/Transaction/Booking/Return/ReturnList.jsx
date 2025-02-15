import { Link } from '@inertiajs/react';
import { Button, IconButton, Tooltip } from '@mui/material';
import { EyeIcon, ImagePlusIcon, PrinterIcon, Trash2Icon } from 'lucide-react';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import React, { useEffect, useState } from 'react';
import AddReturn from './AddReturn';
import EditReturn from './EditReturn';
import ReturnPOD from './ReturnPOD';

const ReturnList = (props) => {

    const { bookings, manifests, parties, reload, toast } = props;
    const [searchTxt, setSearchTxt] = useState('');
    const [perPage, setPerPage] = useState(10);

    const handleLimitChange = (e) => setPerPage(e.target.value);
    const handleSearch = (e) => setSearchTxt(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''));

    useEffect(() => {
        reload({ per_page: perPage, search: searchTxt });
    }, [perPage, searchTxt]);

    const handlePrint = (id) => {
        const printUrl = `/print/return/booking/${id}`;
        window.open(printUrl, '_blank', 'width=1200,height=1200');
    };

    const privilege = props.auth.user.role.privilege_index;

    const handleDelete = (booking) => {
        confirmDialog({
            message: 'Are you sure you want to delete this booking?',
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: () => deleteBooking(booking.id),
        });
    }

    const deleteBooking = (id) => {
        axios.delete(`/data/return/booking/delete/${id}`).then(response => {
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Return Booking deleted successfully', life: 3000 });
            reload();
        }).catch(error => {
            console.error('Error deleting booking:', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete return booking', life: 3000 });
        });

    };

    return (
        <div className="p-3 md:px-4 md:py-6 flex flex-col gap-2 rounded-md shadow-sm">
            <div className="noPrint flex justify-between my-3 mx-5">
                <h3 className="text-3xl text-slate-600">Return Booking</h3>
                <div className="flex gap-2">
                    {privilege > 5 && <AddReturn {...props} />}
                </div>
            </div>
            <div className="flex justify-between px-2">
                <select value={perPage} onChange={handleLimitChange}>
                    {[5, 10, 20, 50, 100].map(num => <option key={num} value={num}>{num}</option>)}
                </select>
                <input type="text" placeholder="Search..." onChange={handleSearch} />
            </div>
            <div className="content px-2">
                {bookings && bookings.total > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full border">
                                <thead>
                                    <tr>
                                        <th className="text-center py-3 px-2">Sl.</th>
                                        <th className="text-left min-w-[180px]">Mnfst</th>
                                        <th className="text-left min-w-[100px]">CN</th>
                                        <th className="text-left min-w-[120px]">Cnsgor</th>
                                        <th className="text-start min-w-[120px]">Prty Loc</th>
                                        <th className="text-left min-w-[120px]">Cnsgnee</th>
                                        <th className="text-center min-w-[120px]">Qty</th>
                                        <th className="text-center min-w-[120px]">Wt (KG)</th>
                                        <th className="text-center min-w-[100px]">Amt (₹)</th>
                                        <th className="text-center min-w-[100px]">POD</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.data.map((booking, i) => (
                                        <tr key={i} className="border">
                                            <td className='text-center py-2'>{i + 1}</td>
                                            <td className='text-left'>{booking.manifest?.lorry?.lorry_number} <span className='text-xs text-red-500 font-bold'>({booking.manifest.trip_date})</span></td>
                                            <td className='text-left'>{booking.cn_no}</td>
                                            <td className='text-left'>{booking.consignee?.name}</td>
                                            <td className='text-left'>
                                                {booking.party_location ? booking.party_location : booking.consignee?.location?.name}
                                            </td>
                                            <td className='text-left'>{booking.consignor?.name}</td>
                                            <td className='text-center'>
                                                {booking.items.reduce((sum, item) => sum + item.item_quantities.reduce((itemSum, itemInfo) => itemSum + itemInfo.quantity, 0), 0)}
                                            </td>
                                            <td className='text-center'>
                                                {booking.items.reduce((sum, item) => sum + parseFloat(item.weight), 0)}
                                            </td>
                                            <td className='text-center'>
                                                {booking.items.reduce((ac, ci) => ac + parseInt(ci.amount), 0)}
                                            </td>
                                            <td className='text-center'>
                                                <div className="flex justify-center items-center">
                                                <ReturnPOD
                                                    booking={booking}
                                                    reload={reload}
                                                    toast={toast}
                                                />
                                                </div>
                                            </td>
                                            <td className='text-center'>
                                                <div className="flex gap-2">
                                                    <Button
                                                        color="primary"
                                                        variant="outlined"
                                                        onClick={() => handlePrint(booking.id)}
                                                        startIcon={<PrinterIcon className='h-4 w-4' />}
                                                        aria-label="Print">
                                                        Print
                                                    </Button>

                                                    <EditReturn
                                                        booking={booking}
                                                        manifests={manifests}
                                                        parties={parties}
                                                        reload={reload}
                                                        toast={toast}
                                                        items={props.items}
                                                    />


                                                    <Tooltip title="Delete">
                                                        <Button
                                                            color="error"
                                                            variant='outlined'
                                                            onClick={() => handleDelete(booking)}
                                                            startIcon={<Trash2Icon className='w-4 h-4' />}
                                                            aria-label="Delete">
                                                            Delete
                                                        </Button>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination bookings={bookings} reload={reload} perPage={perPage} searchTxt={searchTxt} />
                    </>
                ) : <span>No Item found!</span>}
            </div>
            <ConfirmDialog className="rounded-md bg-white p-4" />

        </div>
    )
}

export default ReturnList



const Pagination = ({ bookings, reload, perPage, searchTxt }) => (
    <div className="flex justify-between p-4">
        <span>Showing {bookings.from} to {bookings.to} of {bookings.total} items</span>
        <ul className="flex gap-3">
            {bookings.links.map((link, index) => {
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

