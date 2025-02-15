import { IconButton, Tooltip } from '@mui/material'
import { EyeIcon } from 'lucide-react'
import { Dialog } from 'primereact/dialog';
import React, { useEffect, useState } from 'react'

const ManifestDetails = (props) => {
    const { id } = props;
    const [openDialog, setOpenDialog] = useState(false);

    const [manifest, setManifest] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [consignors, setConsignors] = useState([]);
    const [party, setParty] = useState(null);

    const loadItem = () => {
        axios.get(`/data/manifest/${id}`)
            .then(res => {
                setManifest(res.data);
            })
            .catch(err => {
                console.log(err.message);
            })
    }

    const handleOpenView = () => {
        loadItem();
        setOpenDialog(true)
    }

    useEffect(() => {
        if (manifest && manifest.bookings && manifest.bookings.length > 0) {
            const itemsWithDetails = manifest.bookings.flatMap(booking =>
                booking.items.map(item => ({
                    ...item,
                    booking: booking,
                    trip_date: manifest.trip_date,
                    lorry: manifest.lorry
                }))
            );

            const uniqueConsignors = Array.from(new Set(manifest.bookings.map(booking => JSON.stringify(booking.consignor)))).map(json => JSON.parse(json));
            setConsignors(uniqueConsignors);

            if (uniqueConsignors.length == 1) {
                setParty(uniqueConsignors[0].id);
            }

            itemsWithDetails.forEach(iwd => {
                iwd.item_quantities.sort((a, b) => a.id - b.id);
            });
            setInvoices(itemsWithDetails);
            setFiltered(itemsWithDetails);
        } else {
            setInvoices([]);
        }
    }, [manifest]);


    useEffect(() => {
        if (party) {
            const filtered = invoices.filter(inv => inv.booking.consignor.id == party);
            setFiltered(filtered);
        }
    }, [party]);


    return (
        <>
            <Tooltip title="View Bookings" placement="top">
                <IconButton onClick={handleOpenView} color="primary" aria-label="View manifest">
                    <EyeIcon />
                </IconButton>
            </Tooltip>
            <Dialog visible={openDialog} modal onHide={() => setOpenDialog(false)} className="rounded-md m-4 w-full md:w-3/4 p-4 min-h-48 bg-white flex flex-col">
                <div className="">
                    <div className="grid md:grid-cols-3 gap-4 px-2 my-4">
                        <select value={party} onChange={(e) => setParty(e.target.value)}>
                            <option value="">Select Consignor</option>
                            {consignors.length && consignors.map(cn => (
                                <option value={cn.id}>{cn.name}</option>
                            ))}
                        </select>
                    </div>
                    {filtered && filtered.length > 0 ? (
                        <div className="content px-2 my-4">
                            <div className="flex w-full overflow-x-scroll">
                                <table className="min-w-full border">
                                    <thead className='align-bottom'>
                                        <tr className='font-semibold text-[0.95rem] text-secondary-dark'>
                                            <th className="min-w-[60px] pb-3 text-center">Sl.</th>
                                            <th className="min-w-[60px] pb-3 text-start">CN. No.</th>
                                            <th className="min-w-[180px] pb-3 text-start">Consignor</th>
                                            <th className="min-w-[180px] pb-3 text-start">Party (Consignee)</th>
                                            <th className="min-w-[150px] pb-3 text-start">Invoice Number</th>
                                            <th className="min-w-[100px] pb-3 px-2 text-start">Invoice Date</th>
                                            <th className="min-w-[100px] pb-3 px-2 text-start">Docket Date</th>
                                            <th className="min-w-[100px] pb-3 px-2 text-start">Delivery Date</th>
                                            <th className="min-w-[150px] px-2 pb-3 text-start">Destination</th>
                                            {filtered[0].item_quantities.map(itemType => (
                                                <th key={itemType.id} className="min-w-[100px] pt-2 pb-3 px-2 text-center bg-gray-100">{itemType.item_name}</th>
                                            ))}
                                            <th className="min-w-[130px] pt-2 pb-3 px-2 text-center bg-gray-100">Total Quantity</th>
                                            <th className="min-w-[120px] px-2 pb-3 text-start">Weight (KG)</th>
                                            <th className="min-w-[120px] pb-3 text-start">Amount (₹)</th>
                                            <th className="min-w-[150px] pb-3 text-end">Vehicle No</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((inv, i) => (
                                            <tr key={i} className='border-b border-dashed last:border-b-0'>
                                                <td className='p-3 text-center'>{i + 1}</td>
                                                <td className='text-left'>{inv.booking.cn_no}</td>
                                                <td className='text-left'>{inv.booking.consignor?.name}</td>
                                                <td className='text-left'>{inv.booking.consignee?.name}</td>
                                                <td className='text-left'>{inv.invoice_no}</td>
                                                <td className='text-left'>
                                                    <span className="text-center align-baseline inline-flex px-3 py-1.5 mr-auto items-center font-semibold text-[.8rem] leading-none text-blue-700 bg-blue-100 rounded-lg">
                                                        {new Date(inv.invoice_date).toLocaleDateString('en-GB')}
                                                    </span>
                                                </td>
                                                <td className='text-left'>
                                                    <span className="text-center align-baseline inline-flex px-3 py-1.5 mr-auto items-center font-semibold text-[.8rem] leading-none text-teal-700 bg-teal-100 rounded-lg">
                                                        {new Date(inv.trip_date).toLocaleDateString('en-GB')}
                                                    </span>
                                                </td>
                                                <td>
                                                    {(inv.booking.statuses.find(bx => bx.active == 1) && inv.booking.document) ?
                                                        <span className="text-center align-baseline inline-flex px-3 py-1.5 mr-auto items-center font-semibold text-[.8rem] leading-none text-red-700 bg-red-100 rounded-lg">
                                                            {new Date(inv.booking.document?.delivery_date).toLocaleDateString('en-GB')}
                                                        </span>
                                                        : ''}
                                                </td>
                                                <td className='text-left px-2 '>
                                                    {inv.booking.ship_to_party ? inv.booking.party_location : inv.booking.consignee.location?.name}
                                                </td>
                                                {inv.item_quantities.map(it_qty => (
                                                    <th key={it_qty.id} className="text-center bg-gray-50">{it_qty.quantity}</th>
                                                ))}
                                                <td className='text-center bg-gray-50'>{inv.item_quantities.reduce((itemSum, itemInfo) => itemSum + itemInfo.quantity, 0)}</td>
                                                <td className='text-left px-2 '>{inv.weight}</td>
                                                <td className='text-left'>{inv.amount}</td>
                                                <td className='text-right'>
                                                    <span className='text-center align-baseline inline-flex px-2 py-2 mr-auto items-center font-semibold text-[.8rem] leading-none text-gray-700 bg-gray-100 rounded-lg'>
                                                        {inv.lorry?.lorry_number}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full flex justify-center items-center my-8">
                            <span className='text-2xl text-slate-400'>No Item found!</span>
                        </div>
                    )}
                </div>
            </Dialog>
        </>
    )
}

export default ManifestDetails