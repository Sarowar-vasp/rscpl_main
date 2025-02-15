import React, { useEffect, useState } from 'react'
import { CSVLink } from 'react-csv';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";


const ReturnReport = (props) => {

    const [bookings, setBookings] = useState([]);
    const [invoices, setInvoices] = useState([]);

    const getDefaultDates = () => {
        const currentDate = new Date();
        const pastDate = new Date();
        pastDate.setMonth(currentDate.getMonth() - 1);

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        return {
            from_date: formatDate(pastDate),
            to_date: formatDate(currentDate),
        };
    };

    const [formInfo, setFormInfo] = useState(getDefaultDates());

    const getItems = () => {
        if (formInfo.from_date && formInfo.to_date) {
            const formattedFromDate = new Date(formInfo.from_date).toISOString().split('T')[0];
            const formattedToDate = new Date(formInfo.to_date).toISOString().split('T')[0];
            axios.post('/data/report/return/booking', {
                from_date: formattedFromDate,
                to_date: formattedToDate
            }
            ).then(res => {
                setBookings(res.data)
            }).catch(err => {
                console.log(err.message);
            });
        } else {
            setBookings([])
        }
    }
    useEffect(() => {
        if (bookings && bookings.length > 0) {
            const itemsWithDetails = bookings.flatMap(booking =>
                booking.items.map(item => ({ ...item, booking: booking }))
            );
            itemsWithDetails.forEach(iwd => {
                iwd.item_quantities.sort((a, b) => a.id - b.id);
            });
            setInvoices(itemsWithDetails);
        } else {
            setInvoices([]);
        }
    }, [bookings]);

    useEffect(() => {
        getItems();
    }, []);


    return (
        <div className="shadow w-full h-full flex flex-col bg-white rounded-lg">
            <div className="noPrint flex flex-col my-3 mx-5">
                <div className="my-4">
                    <h3 className="text-3xl text-slate-600">Return Consignment Report</h3>
                </div>
                <div className="flex justify-between items-end">
                    <div className="flex gap-3 items-end">
                        <div className="flex flex-col">
                            <label htmlFor="from_date" className="mb-2 text-xs md:text-sm font-medium text-gray-700">From Date:</label>
                            <DatePicker
                                selected={formInfo.from_date}
                                locale="en-IN"
                                dateFormat="dd/MM/yyyy"
                                onChange={(date) => setFormInfo({ ...formInfo, from_date: date })}
                                name="from_date" id="from_date"
                                className="w-full border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm text-xs shadow-xs px-2"
                            />
                        </div>
                        {formInfo.from_date && (
                            <div className="flex flex-col">
                                <label htmlFor="to_date" className="mb-2 text-xs md:text-sm font-medium text-gray-700">To Date:</label>
                                <DatePicker
                                    selected={formInfo.to_date}
                                    minDate={formInfo.from_date}
                                    locale="en-IN"
                                    dateFormat="dd/MM/yyyy"
                                    onChange={(date) => setFormInfo({ ...formInfo, to_date: date })}
                                    name="to_date" id="to_date"
                                    className="w-full border-gray-200 focus:border-gray-500 focus:ring-0 text-xs rounded-sm shadow-xs px-2"
                                />
                            </div>
                        )}
                        {formInfo.from_date && formInfo.to_date && (
                            <button onClick={getItems} className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semi-bold py-2 px-3 rounded">
                                Continue
                            </button>
                        )}
                    </div>
                    <div className="">
                        {invoices && invoices.length > 0 && <CSVButton invoices={invoices} />}
                    </div>
                </div>
            </div>
            <hr />
            {invoices && invoices.length > 0 ? (
                <div className="flex flex-col gap-4 my-4 px-2">
                    <div className="print-content overflow-x-auto my-8">
                        <table className="w-full my-8 align-middle text-dark border-neutral-200">
                            <thead className='align-bottom'>
                                <tr className='font-semibold text-[0.95rem] border-b text-secondary-dark'>
                                    <th className="min-w-[50px] pb-3 text-center">Sl.</th>
                                    <th className="min-w-[180px] pb-3 text-start">Party (Consignor)</th>
                                    <th className="min-w-[180px] pb-3 text-start">Consignee</th>
                                    <th className="min-w-[120px] pb-3 text-start">Invoice Number</th>
                                    <th className="min-w-[100px] pb-3 text-start">CN. No.</th>
                                    <th className="min-w-[150px] pb-3 text-start">Docket Date</th>
                                    <th className="min-w-[180px] px-2 pb-3 text-start">Destination</th>
                                    {invoices[0].item_quantities.map(itemType => (
                                        <th key={itemType.id} className="capitalize min-w-[50px] pt-2 pb-3 px-2 text-center bg-gray-100">{itemType.item_name}</th>
                                    ))}
                                    <th className="min-w-[100px] pt-2 pb-3 px-2 text-center bg-gray-200">Total</th>
                                    <th className="min-w-[100px] px-2 pb-3 text-start">Weight (KG)</th>
                                    <th className="min-w-[100px] pb-3 text-start">Amount (₹)</th>
                                    <th className="min-w-[100px] pb-3 text-end">Vehicle No</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv, i) => (
                                    <tr key={i} className='border-b border-dashed last:border-b-0'>
                                        <td className='p-3 pl-0 text-center'>{i + 1}</td>
                                        <td className='text-left'>{inv.booking.consignee?.name}</td>
                                        <td className='text-left'>{inv.booking.consignor?.name}</td>
                                        <td className='text-left'>{inv.invoice_no}</td>
                                        <td className='text-left'>{inv.booking.cn_no}</td>
                                        <td className='text-left'>
                                            <span className="text-center align-baseline inline-flex px-4 py-3 mr-auto items-center font-semibold text-[.8rem] leading-none text-blue-700 bg-blue-100 rounded-lg">
                                                {new Date(inv.booking.manifest.trip_date).toISOString().split('T')[0]}
                                            </span>
                                        </td>
                                        <td className='text-left px-2 '>
                                            {inv.booking.consignor.address}
                                        </td>
                                        {inv.item_quantities.map(it_qty => (
                                            <th key={it_qty.id} className="text-center bg-gray-50">{it_qty.quantity}</th>
                                        ))}
                                        <td className='text-center bg-gray-50'>{inv.item_quantities.reduce((itemSum, itemInfo) => itemSum + itemInfo.quantity, 0)}</td>
                                        <td className='text-left px-2 '>{inv.weight}</td>
                                        <td className='text-left'>{inv.amount}</td>
                                        <td className='text-right'>
                                            <span className='text-center align-baseline inline-flex px-2 py-2 mr-auto items-center font-semibold text-[.8rem] leading-none text-gray-700 bg-gray-100 rounded-lg'>
                                                {inv.booking.manifest?.lorry?.lorry_number}
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
    )
}

export default ReturnReport



const CSVButton = ({ invoices }) => {
    const [isLoading, setIsLoading] = useState(false);

    // Dynamically generate headers based on item_quantities
    const headers = [
        { label: 'Sl.', key: 'index' },
        { label: 'Party (Consignor)', key: 'consignee' },
        { label: 'Consignee', key: 'consignor' },
        { label: 'Invoice', key: 'invoice' },
        { label: 'CN. No.', key: 'cn_no' },
        { label: 'Docket Date', key: 'docket_date' },
        { label: 'Destination', key: 'destination' },
        ...invoices[0].item_quantities.map(itemType => ({
            label: itemType.item_name,
            key: itemType.item_name.toLowerCase().replace(/\s/g, '_')
        })),
        { label: 'Total Quantity', key: 'total_quantity' },
        { label: 'Weight (KG)', key: 'gross_weight' },
        { label: 'Amount (INR)', key: 'total_amount' },
        { label: 'Vehicle No', key: 'vehicle_no' }
    ];

    // Generate CSV data based on invoices
    const csvData = invoices.map((inv, index) => ({
        index: index + 1,
        consignee: inv.booking.consignee?.name,
        consignor: inv.booking.consignor?.name,
        invoice: inv.invoice_no,
        cn_no: inv.booking.cn_no,
        docket_date: new Date(inv.booking.manifest.trip_date).toISOString().split('T')[0],
        destination: inv.booking.consignor.address,
        ...inv.item_quantities.reduce((acc, itemType) => ({
            ...acc,
            [itemType.item_name.toLowerCase().replace(/\s/g, '_')]: itemType.quantity
        }), {}),
        total_quantity: inv.item_quantities.reduce((itemSum, itemInfo) => itemSum + itemInfo.quantity, 0),
        gross_weight: inv.weight,
        total_amount: inv.amount,
        vehicle_no: inv.booking.manifest?.lorry?.lorry_number
    }));

    return (
        <CSVLink
            data={csvData}
            headers={headers}
            filename={'bookings.csv'}
            className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-semi-bold py-2 px-3 rounded"
            onClick={(event) => {
                if (isLoading) {
                    event.preventDefault();
                } else {
                    setIsLoading(true);
                    setTimeout(() => setIsLoading(false), 2000);
                }
            }}
        >
            {isLoading ? 'Loading...' : 'Export CSV'}
        </CSVLink>
    );
}