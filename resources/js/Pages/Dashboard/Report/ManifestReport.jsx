import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import InvoiceDetailsTable from './InvoiceDetailsTable';
import { CSVLink } from 'react-csv';


const getDefaultDates = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    let fromDate, toDate;

    if (currentMonth <= 3) {
        fromDate = new Date(currentYear - 1, 3, 1);
        toDate = new Date(currentYear, 2, 31);
    } else {
        fromDate = new Date(currentYear, 3, 1);
        toDate = new Date(currentYear + 1, 2, 31);
    }

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return {
        from_date: formatDate(fromDate),
        to_date: formatDate(toDate),
    };
};

const textShorten = (inpText) => {
    const words = inpText.split(' ');
    const firstLetters = words.map(word => {
        const match = word.match(/[a-zA-Z]/);
        return match ? match[0] : '';
    });
    const code = firstLetters.join('');
    return code;
};

const ManifestReport = (props) => {
    const [bookings, setBookings] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [formInfo, setFormInfo] = useState(getDefaultDates());

    const getItems = () => {
        if (formInfo.from_date && formInfo.to_date) {
            const formattedFromDate = new Date(formInfo.from_date).toISOString().split('T')[0];
            const formattedToDate = new Date(formInfo.to_date).toISOString().split('T')[0];
            axios.post('/data/report/booking', {
                from_date: formattedFromDate,
                to_date: formattedToDate
            }
            ).then(res => {
                setBookings(res.data);
            }).catch(err => {
                console.log(err.message);
            });
        } else {
            setBookings([])
        }
    }


    useEffect(() => {
        if (bookings && bookings.length > 0) {

            const itemsWithDetails = bookings.flatMap(booking => {
                return booking.items.map(item => ({ ...item, booking: booking }))
            });

            itemsWithDetails.forEach(iwd => { iwd.total = iwd.item_quantities.reduce((acc, itx) => acc + (itx.quantity || 0), 0) });
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
            <div className="flex flex-col my-3 mx-5">
                <div className="my-4">
                    <h3 className="text-3xl text-slate-600">Manifest Wise Report</h3>
                </div>
                <div className="flex justify-between items-end">
                    <div className="filter"></div>
                    <div className="action">
                        <ExportCSV
                            invoices={invoices}
                            formInfo={formInfo}
                            setFormInfo={setFormInfo}
                        />
                    </div>

                </div>
            </div>
            <hr />
            <div className="flex flex-col my-3 mx-5 border rounded-lg">
                {invoices && invoices.length > 0 ? (
                    <InvoiceDetailsTable invoices={invoices} textShorten={textShorten} />
                ) : ("")}
            </div>
        </div>
    )
}

export default ManifestReport


const ExportCSV = (props) => {
    const { invoices, formInfo, setFormInfo } = props;
    const [openDialog, setOpenDialog] = useState(false);
    const [sameDate, setSameDate] = useState(false);
    const [filtered, setFiltered] = useState(invoices);
    const [partyIds, setPartyIds] = useState([]);
    const [consignors, setConsignors] = useState([]);

    useEffect(() => {
        if (sameDate) {
            setFormInfo({
                ...formInfo,
                to_date: formInfo.from_date
            });
        }
    }, [sameDate]);

    useEffect(() => {
        filterItems();
        getConsignors();
    }, [invoices]);

    useEffect(() => {
        getConsignors();
        filterItems();
    }, [formInfo, partyIds]);

    const filterItems = () => {
        const fromDateTimestamp = new Date(formInfo.from_date).setHours(0, 0, 0, 0);
        const toDateTimestamp = new Date(formInfo.to_date).setHours(23, 59, 59, 999);
        if (isNaN(fromDateTimestamp) || isNaN(toDateTimestamp)) {
            console.error('Invalid date range');
            return;
        }
        const filteredInvoices = invoices.filter(invoice => {
            const tripDateTimestamp = new Date(invoice.booking.manifest.trip_date).setHours(0, 0, 0, 0);
            return tripDateTimestamp >= fromDateTimestamp && tripDateTimestamp <= toDateTimestamp;
        });

        const filteredByPartyIds = filteredInvoices.filter(invoice =>
            partyIds.includes(invoice.booking.consignor.id)
        );

        setFiltered(filteredByPartyIds);
    }

    const getConsignors = () => {
        const consignorsSet = new Set();
        invoices.forEach(invoice => {
            if (invoice.booking && invoice.booking.consignor) {
                consignorsSet.add(JSON.stringify(invoice.booking.consignor));
            }
        });
        const uniqueConsignors = Array.from(consignorsSet).map(consignor => JSON.parse(consignor));
        setConsignors(uniqueConsignors);
    }

    return (
        <>
            <Button
                onClick={() => setOpenDialog(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-semi-bold py-1 px-3 rounded"
            >
                Export
            </Button>
            <Dialog
                visible={openDialog}
                modal
                onHide={() => setOpenDialog(false)}
                className="rounded-md m-4 w-full md:w-3/4 p-4 bg-white"
                header={'Export to CSV'}
            >
                <div className="flex flex-col gap-2">
                    <div className="border rounded-lg p-4">
                        <div className="mb-2">
                            <h4 className='underline'>Filter by Date:</h4>
                            <div className="flex gap-2">
                                <div className="flex flex-col">
                                    <label htmlFor="from_date" className="mb-1 text-xs font-medium text-gray-700">From Date:</label>
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
                                        <label htmlFor="to_date" className="mb-1 text-xs font-medium text-gray-700 flex justify-between">
                                            To Date:
                                            <div className="flex justify-end text-xs">
                                                <input
                                                    id='sameday'
                                                    type="checkbox"
                                                    onChange={() => setSameDate(!sameDate)}
                                                    defaultChecked={sameDate}
                                                    className='hidden'
                                                />
                                                <label htmlFor='sameday' className='text-green-700 underline'>
                                                    {sameDate ? 'Other Date ?' : 'Same Date?'}
                                                </label>
                                            </div>
                                        </label>
                                        <DatePicker
                                            selected={formInfo.to_date}
                                            minDate={formInfo.from_date}
                                            locale="en-IN"
                                            dateFormat="dd/MM/yyyy"
                                            disabled={sameDate}
                                            onChange={(date) => {
                                                setFormInfo({ ...formInfo, to_date: date });
                                                setSameDate(formInfo.fromDate === date);
                                            }}
                                            name="to_date" id="to_date"
                                            className={`w-full border-gray-200 focus:border-gray-500 focus:ring-0 text-xs rounded-sm shadow-xs px-2 ${sameDate && 'text-gray-300'}`}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mb-2">
                            <h4 className='underline'>Filter by Party:</h4>
                            <div className="flex flex-wrap gap-2 p-2">
                                {consignors && consignors.map(cn => {
                                    let selected = partyIds.includes(cn.id)
                                    return <span
                                        key={cn.id}
                                        onClick={() => {
                                            if (selected) {
                                                setPartyIds(partyIds.filter(id => id !== cn.id));
                                            } else {
                                                setPartyIds([...partyIds, cn.id]);
                                            }
                                        }}
                                        className={`text-xs font-bold px-3 py-1 ${selected ? 'bg-cyan-700 text-gray-100' : ' bg-gray-100 text-gray-500'} rounded-full cursor-pointer`}
                                    >
                                        {cn.name}
                                    </span>
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-lg p-4">
                        {filtered && filtered.length > 0 ?
                            <InvoiceDetailsTable invoices={filtered} textShorten={textShorten} />
                            :
                            <div className="flex justify-center items-center">
                                <span className="text-gray-400 font-bold">No Items found !</span>
                            </div>
                        }
                    </div>
                    <hr />
                    {filtered && filtered.length > 0 &&
                        <div className="flex justify-end gap-4">
                            <Button
                                onClick={() => setOpenDialog(false)}
                                className="bg-gray-100 hover:bg-gray-150 text-gray-700 text-sm font-semi-bold py-1 px-3 rounded"
                            >
                                Cancel
                            </Button>
                            <ExportCSVData invoices={filtered} setOpen={setOpenDialog} />

                        </div>
                    }
                </div>
            </Dialog>
        </>
    )
}

const getDtStr = (dx) => {
    const d = new Date(dx);
    return `${d.getFullYear() % 100}${(d.getMonth() + 1).toString().padStart(2, '0')}${d.getDate().toString().padStart(2, '0')}`;
};


const ExportCSVData = ({ invoices, setOpen, outbond = 'Upcountry' }) => {
    // const uniqueConsignors = Array.from(new Set(invoices.map(inv => inv.booking?.consignor?.name).filter(Boolean)));
    const getManiWeight = (maniId) => {
        return invoices
            .filter(inv => inv.booking?.manifest?.id === maniId)
            .reduce((total, inv) => total + (inv.weight || 0), 0);
    };

    const csvData = invoices.map((inv, i) => {
        const qty = inv.item_quantities.reduce((itemSum, itemInfo) => itemSum + itemInfo.quantity, 0)
        const manifestNo = inv.booking.manifest.manifest_no.length > 4 ? inv.booking.manifest.manifest_no : `${getDtStr(inv.booking.manifest.trip_date)}${inv.booking.manifest.manifest_no}`;

        let consignor_name = inv.booking?.consignor?.name;

        let str_x = consignor_name.trim().replace(/[.\s]/g, '').toLowerCase();
        
        let isJKIL = ['jk','tyres'].some(subStr => str_x.includes(subStr));
        let isCIL = ['caven','cavein', 'ndish'].some(subStr => str_x.includes(subStr));

        const manifestWeight = getManiWeight(inv.booking.manifest.id);
        const claimRatio = (manifestWeight > 0) ? (inv.weight / manifestWeight * 100) : 0;

        const dealerLocation = inv.booking.ship_to_party ? inv.booking.party_location : inv.booking.consignee.location?.name;
        const destination = inv.booking.manifest.to_location?.name;
        const rate = inv.booking.manifest.rate ? inv.booking.manifest.rate : 0;
        const vehicleNum = inv.booking.manifest?.lorry?.lorry_number;
        return {
            'Sl': i + 1,
            'Outbound Type': outbond,
            'Trip No(Manifest Number)': manifestNo,
            'Vehicle': vehicleNum,
            'Vehicle Type': 'PickUp',
            'Destination': destination,
            'Booking(CN) Date': new Date(inv.booking.manifest.trip_date).toLocaleDateString('en-GB'),
            'Dealer Name': inv.booking.consignee?.name,
            'Dealer Location': dealerLocation,
            'Invoice No': inv.invoice_no,
            'Invoice Date': new Date(inv.invoice_date).toLocaleDateString('en-GB'),
            'Company': textShorten(consignor_name),
            'CN Summary': '',
            'CN No': inv.booking.cn_no,
            'Total Qty': qty,
            'Weight': inv.weight,
            'Route': '',
            'Rate': rate,
            'Claim Ratio(%)': Number(claimRatio).toFixed(2),
            'CIL Freight Amt (INR)': isCIL ? Number(claimRatio * rate).toFixed(2) : '',
            'CIL CN Charges Amt (INR)': '',
            'JKIL Freight Amt (INR)': isJKIL ? Number(claimRatio * rate).toFixed(2) : '',
            'JKIL CN Charges Amt (INR)': '',
            'Total Claimed Amt (INR)': '',
        };
    });

    return (
        <CSVLink
            data={csvData}
            filename={"invoices.csv"}
            target="_blank"
            className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-semi-bold py-1 px-3 rounded"
            onClick={() => setOpen(false)}
        >
            Export
        </CSVLink>
    );
};