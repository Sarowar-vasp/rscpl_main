import AdminLayout from '@/Layouts/AdminLayout'
import { Head } from '@inertiajs/react'
import { BreadCrumb } from 'primereact/breadcrumb';
import React, { useEffect, useState } from 'react'
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { ChevronDownIcon } from 'lucide-react';
import axios from 'axios';

const index = (props) => {
    const { booking, bookings } = props;
    const [item, setItem] = useState(booking);
    const [tracking, setTracking] = useState([]);

    const items = [
        { label: "Transaction", url: '#' },
        { label: "Booking", url: '/transaction/booking' },
        { label: "Track" }
    ];

    useEffect(() => {
        if (item) {
            axios.get(`/data/trackings?cn_no=${item.cn_no}`)
                .then(res => setTracking(res.data))
                .catch(err => console.log(err.message));
        };
    }, [item]);

    useEffect(() => {
        if (tracking) {
            console.log(tracking);
        };
    }, [tracking])

    return (
        <AdminLayout
            user={props.auth?.user}
            page="Tracking"
        >
            <Head title='Tracking' />
            <div className="w-full flex flex-col gap-4 items-start">
                <BreadCrumb model={items} className='py-2 text-gray-500' />
                <div className="w-full h-full flex flex-col gap-3 bg-white rounded-lg">
                    <div className="noPrint flex justify-between my-3 mx-5">
                        {/* select target */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div className="flex flex-col">
                                <label htmlFor="assignee" className='text-xs font-bold'>CN No</label>
                                <ConsignmentSelect items={bookings} item={item} setItem={setItem} />
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div className="flex flex-col gap-4">
                        {item && (
                            <div className="details"></div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        {tracking && tracking.length > 0 && (
                            <table className="border">
                                <thead>
                                    <tr>
                                        <th className='text-center py-2'>Date</th>
                                        <th className="text-left">Status</th>
                                        <th className="text-left">description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tracking.map((track, i) => (
                                        <tr key={i} className="border">
                                            <td className='text-center py-2'>{new Date(track.created_at).toLocaleDateString('en-CA')}</td>
                                            <td>{track.status}</td>
                                            <td>{track.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default index



const ConsignmentSelect = ({ items, item, setItem }) => {
    const [query, setQuery] = useState('');
    const filtered =
        query === '' ? items.slice(0, 5)
            : items.filter((ix) => {
                return ix.cn_no.toLowerCase().includes(query.toLowerCase())
            });

    return (
        <Combobox value={item} onChange={setItem} onClose={() => setQuery('')}>
            <div className="relative">
                <ComboboxInput
                    id='assignee'
                    aria-label="Assignee"
                    displayValue={(itx) => itx?.cn_no}
                    onChange={(event) => setQuery(event.target.value)}
                    className={'w-full rounded-lg border-none bg-black/5 py-1.5 pr-8 pl-3 text-sm/6 text-black focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'}
                />
                <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
                    <ChevronDownIcon className="size-4 fill-white/60 group-data-[hover]:fill-white" />
                </ComboboxButton>
            </div>
            <ComboboxOptions
                anchor="bottom"
                className="w-[var(--input-width)] rounded-xl border border-white/95 bg-white/95 p-1 [--anchor-gap:var(--spacing-1)] empty:invisible transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0 "
            >
                {filtered.map((itx) => (
                    <ComboboxOption key={itx.id} value={itx} className="data-[focus]:bg-blue-100 group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none">
                        {itx.cn_no}
                    </ComboboxOption>
                ))}
            </ComboboxOptions>
        </Combobox>
    )

}