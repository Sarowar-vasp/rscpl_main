import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { Head } from '@inertiajs/react'
import { ChevronDownIcon } from 'lucide-react';
import { BreadCrumb } from 'primereact/breadcrumb';
import React, { useEffect, useState } from 'react'
import { CSVLink } from 'react-csv';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const PartyReport = (props) => {
   
    const [item, setItem] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [parties, setParties] = useState([]);


    const getDefaultDates = () => {
        const currentDate = new Date();
        const pastDate = new Date();
        pastDate.setMonth(currentDate.getMonth() - 1);

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        return {
            from_date: formatDate(pastDate),
            to_date: formatDate(currentDate),
        };
    };

    const [formInfo, setFormInfo] = useState({
        from_date: '',
        to_date: ''
    });

    const getItems = () => {
        if (item && formInfo.from_date && formInfo.to_date) {
            const formattedFromDate = new Date(formInfo.from_date).toISOString().split('T')[0];
            const formattedToDate = new Date(formInfo.to_date).toISOString().split('T')[0];
            axios.post('/data/report/party_booking', {
                party_id: item.id,
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
        setFormInfo({
            ...formInfo,
            ...getDefaultDates(),
        })
        getItems();
    }, [item]);

    return (

        <div className="shadow w-full h-full flex flex-col bg-white rounded-lg">
            <div className="noPrint flex flex-col my-3 mx-5">
                <div className="my-4">
                    <h3 className="text-3xl text-slate-600">Consignment Report</h3>
                </div>
                <div className="flex justify-between items-end">
                    <div className="flex gap-3 items-end">
                        <div className="flex flex-col">
                            <label htmlFor="party" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Party:</label>
                            <PartySelector parties={parties} setItem={setItem} item={item} />
                        </div>
                        {item && (
                            <>
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
                                {formInfo.from_date && formInfo.to_date && (
                                    <button onClick={getItems} className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semi-bold py-2 px-3 rounded">
                                        Continue
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                    <div className="">
                        {bookings && bookings.length > 0 && <CSVButton bookings={bookings} />}
                    </div>
                </div>
            </div>
            <hr />
            {bookings && bookings.length > 0 ? (
                <div className="flex flex-col gap-4 my-4 px-2">

                    <div className="print-content">
                        <table className="w-full my-0 align-middle text-dark border-neutral-200">
                            <thead className='align-bottom'>
                                <tr className='font-semibold text-[0.95rem] text-secondary-dark'>
                                    <th className="pb-3 text-start">Sl.</th>
                                    <th className="pb-3 text-center">CN. No.</th>
                                    <th className="pb-3 text-start">Party (Consignee)</th>
                                    <th className="pb-3 text-start min-w-[175px]">Invoices</th>
                                    <th className="pb-3 text-start">Docket Date</th>
                                    <th className="pb-3 text-start">Destination</th>
                                    <th className="pb-3 text-center">Total Quantity</th>
                                    <th className="pb-3 text-center">Gross Weight (KG)</th>
                                    <th className="pb-3 text-end">Total Amount (₹)</th>
                                    <th className="pb-3 text-end">Vehicle No</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking, i) => (
                                    <tr key={i} className='border-b border-dashed last:border-b-0'>
                                        <td className='p-3 pl-0'>{i + 1}</td>
                                        <td className='p-3 pr-0 text-center'>{booking.cn_no}</td>
                                        <td className='text-left'>{booking.consignee?.name}</td>
                                        <td className='text-left'>
                                            {booking.items && booking.items.length > 0 && booking.items.map((b_i, index) => (
                                                <span
                                                    key={'inv' + b_i.id}
                                                    className='text-center align-baseline inline-flex px-2 py-2 mr-auto items-center font-semibold text-[.8rem] leading-none text-gray-700 bg-gray-100 rounded-lg'
                                                >
                                                    {b_i.invoice_no}
                                                </span>
                                            )).reduce((prev, curr) => [prev, ', ', curr])}
                                        </td>

                                        <td className='text-left'>
                                            <span className="text-center align-baseline inline-flex px-4 py-3 mr-auto items-center font-semibold text-[.8rem] leading-none text-blue-700 bg-blue-100 rounded-lg">
                                                {new Date(booking.manifest.trip_date).toISOString().split('T')[0]}
                                            </span>
                                        </td>
                                        <td className='text-left'>
                                            {booking.consignee?.location?.name}
                                        </td>
                                        <td className='text-center'>
                                            {booking.items.reduce((sum, item) => sum + item.item_quantities.reduce((itemSum, itemInfo) => itemSum + itemInfo.quantity, 0), 0)}
                                        </td>
                                        <td className='text-center'>
                                            {booking.items.reduce((sum, item) => sum + item.weight, 0)}
                                        </td>
                                        <td className='text-right'>
                                            {booking.items.reduce((ac, ci) => ac + parseInt(ci.amount), 0)}
                                        </td>
                                        <td className='text-right'>
                                            <span className='text-center align-baseline inline-flex px-2 py-2 mr-auto items-center font-semibold text-[.8rem] leading-none text-gray-700 bg-gray-100 rounded-lg'>
                                                {booking.manifest?.lorry?.lorry_number}
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

    );
}

export default PartyReport


const CSVButton = ({ bookings }) => {
    const [isLoading, setIsLoading] = useState(false);
    const headers = [
        { label: 'Sl.', key: 'index' },
        { label: 'CN. No.', key: 'cn_no' },
        { label: 'Party (Consignee)', key: 'consignee' },
        { label: 'Invoices', key: 'invoices' },
        { label: 'Docket Date', key: 'docket_date' },
        { label: 'Destination', key: 'destination' },
        { label: 'Total Quantity', key: 'total_quantity' },
        { label: 'Gross Weight (KG)', key: 'gross_weight' },
        { label: 'Total Amount (INR)', key: 'total_amount' },
        { label: 'Vehicle No', key: 'vehicle_no' }
    ];

    const csvData = bookings.map((booking, index) => ({
        index: index + 1,
        cn_no: booking.cn_no,
        consignee: booking.consignee?.name,
        invoices: booking.items.map((b_i) => b_i.invoice_no).join(', '),
        docket_date: new Date(booking.manifest.trip_date).toISOString().split('T')[0],
        destination: booking.consignee?.location?.name,
        total_quantity: booking.items.reduce((sum, item) => sum + item.item_quantities.reduce((itemSum, itemInfo) => itemSum + itemInfo.quantity, 0), 0),
        gross_weight: booking.items.reduce((sum, item) => sum + item.weight, 0),
        total_amount: booking.items.reduce((ac, ci) => ac + parseInt(ci.amount), 0),
        vehicle_no: booking.manifest?.lorry?.lorry_number
    }));


    return (
        <button disabled={isLoading} className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-semi-bold py-2 px-3 rounded">

            {isLoading ? 'Loading...' : (
                <CSVLink
                    data={csvData}
                    headers={headers}
                    filename={'bookings.csv'}
                    onClick={(event) => {
                        if (isLoading) {
                            event.preventDefault();
                        } else {
                            setIsLoading(true);
                            setTimeout(() => setIsLoading(false), 2000);
                        }
                    }}
                >
                    Export CSV
                </CSVLink>
            )}
        </button>
    )
}

const PartySelector = ({ parties, item, setItem }) => {
    const [query, setQuery] = useState('');
    const filtered =
        query === '' ? parties.slice(0, 5)
            : parties.filter((ix) => {
                return ix.name.toLowerCase().includes(query.toLowerCase())
            });

    return (
        <Combobox value={item} onChange={setItem} onClose={() => setQuery('')}>
            <div className="relative">
                <ComboboxInput
                    id='assignee'
                    aria-label="Assignee"
                    displayValue={(itx) => itx?.name}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Select Party"
                    className={'w-full rounded border-none bg-black/10 py-1.5 pr-8 pl-3 text-sm/6 text-black focus:outline-none data-[focus]:outline-1 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'}
                />
                <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
                    <ChevronDownIcon className="size-4 fill-white/60 group-data-[hover]:fill-white" />
                </ComboboxButton>
            </div>
            <ComboboxOptions
                anchor="bottom"
                className="w-[var(--input-width)] rounded shadow-md border border-white/0 bg-white/90 p-1 [--anchor-gap:var(--spacing-1)] empty:invisible transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0 "
            >
                {filtered.map((itx) => (
                    <ComboboxOption key={itx.id} value={itx} className="data-[focus]:bg-blue-100 group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none">
                        {itx.name}
                    </ComboboxOption>
                ))}
            </ComboboxOptions>
        </Combobox>
    )
}