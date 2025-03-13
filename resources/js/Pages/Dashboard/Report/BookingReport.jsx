import { BarChart, PieChart } from '@mui/x-charts';
import React, { useEffect, useState } from 'react'
import { CSVLink } from 'react-csv';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import PrintPODs from './PrintPODs';

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

const BookingReport = () => {
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [invoices, setInvoices] = useState([]);

    const [formInfo, setFormInfo] = useState(getDefaultDates());

    const getItems = () => {
        setLoading(true);
        if (formInfo.from_date && formInfo.to_date) {
            const formattedFromDate = new Date(formInfo.from_date).toISOString().split('T')[0];
            const formattedToDate = new Date(formInfo.to_date).toISOString().split('T')[0];

            axios.post('/data/report/booking', {
                from_date: formattedFromDate,
                to_date: formattedToDate
            }).then(res => {
                setBookings(res.data);
            }).catch(err => {
                console.log(err.message);
            }).finally(() => {
                setLoading(false);
            });
        } else {
            setBookings([]);
            setLoading(false); // Stop loading if no date range is selected
        }
    };

    useEffect(() => {
        if (!bookings || bookings.length === 0) {
            setInvoices([]);
            setLoading(false);
            return;
        }

        setLoading(true); // Start loading before processing invoices

        const processInvoices = async () => {
            const itemsWithDetails = bookings.flatMap(booking =>
                booking.items.map(item => ({ ...item, booking: booking }))
            );

            itemsWithDetails.forEach(iwd => {
                iwd.item_quantities.sort((a, b) => a.id - b.id);
            });

            setInvoices(itemsWithDetails);
            setLoading(false); // Only stop loading after invoices are fully set
        };

        processInvoices();
    }, [bookings]);

    useEffect(() => {
        getItems();
    }, []);



    return (
        <div className="shadow w-full h-full flex flex-col bg-white rounded-lg">

            <div className="noPrint flex flex-col my-3 mx-5">
                <div className="my-4">
                    <h3 className="text-3xl text-slate-600">Consignment Report</h3>
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
                    <div className="flex justify-end gap-2">
                        <PrintPODs bookings={bookings.filter(bk => {
                            if (bk.document) return true;
                            return false;
                        })} />

                        {invoices && invoices.length > 0 && <CSVButton invoices={invoices} />}
                    </div>
                </div>
            </div>
            <hr />
            {loading ? (
                <div className="w-full flex justify-center items-center my-8">
                    <LoadingAnimation />
                </div>
            ) : invoices && invoices.length > 0 ? (
                <div className="flex flex-col my-3 mx-5 border rounded-lg">
                    <div className="flex w-full overflow-x-scroll max-h-[600px] overflow-y-auto">
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
                                    {invoices[0].item_quantities.map(itemType => (
                                        <th key={itemType.id} className="min-w-[100px] pt-2 pb-3 px-2 text-center bg-gray-100">{itemType.item_name}</th>
                                    ))}
                                    <th className="min-w-[130px] pt-2 pb-3 px-2 text-center bg-gray-100">Total Quantity</th>
                                    <th className="min-w-[120px] px-2 pb-3 text-start">Weight (KG)</th>
                                    <th className="min-w-[120px] pb-3 text-start">Amount (₹)</th>
                                    <th className="min-w-[150px] pb-3 text-end">Vehicle No</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv, i) => (
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
                                                {new Date(inv.booking.manifest.trip_date).toLocaleDateString('en-GB')}
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
            <hr />
            <div className="">
                {invoices && invoices.length > 0 ? (
                    <BookingChart invoices={invoices} from_date={formInfo.from_date} to_date={formInfo.to_date} />
                ) : null}
            </div>
        </div>
    );
}

export default BookingReport;


const CSVButton = ({ invoices }) => {
    const [isLoading, setIsLoading] = useState(false);

    // Dynamically generate headers based on item_quantities
    const headers = [
        { label: 'Sl.', key: 'index' },
        { label: 'CN. No.', key: 'cn_no' },
        { label: 'Consignor', key: 'consignor' },
        { label: 'Party (Consignee)', key: 'consignee' },
        { label: 'Invoice', key: 'invoice' },
        { label: 'Invoice Date', key: 'invoice_date' },
        { label: 'Docket Date', key: 'docket_date' },
        { label: 'Delivery Date', key: 'deliv_date' },
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
        cn_no: inv.booking.cn_no,
        consignor: inv.booking.consignor?.name,
        consignee: inv.booking.consignee?.name,
        invoice: inv.invoice_no,
        invoice_date: new Date(inv.invoice_date).toISOString().split('T')[0],
        docket_date: new Date(inv.booking.manifest.trip_date).toISOString().split('T')[0],
        deliv_date: (inv.booking.statuses.find(bx => bx.active == 1) && inv.booking.document) ? new Date(inv.booking.document?.delivery_date).toISOString().split('T')[0] : '',
        destination: inv.booking.ship_to_party ? inv.booking.party_location : inv.booking.consignee.location?.name,
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
            filename={'consignment-report.csv'}
            className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-semi-bold py-2 px-3 rounded"
            onClick={(event) => {
                if (isLoading) {
                    event.preventDefault();
                    // prevent multiple click at once
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

const BookingChart = ({ invoices, from_date, to_date }) => {
    const [chartData, setChartData] = useState([]);
    const [pieChartData, setPieChartData] = useState([]);

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const [xAxis, setXAxis] = useState([]);
    const [series, setSeries] = useState([]);

    const getMonthsInRange = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const months = [];

        while (start <= end) {
            months.push({ month: start.getMonth() + 1, year: start.getFullYear() });
            start.setMonth(start.getMonth() + 1);
        }

        return months;
    };

    useEffect(() => {
        const updateChartData = () => {
            const fromDate = new Date(from_date);
            const toDate = new Date(to_date);
            const filteredInvoices = invoices.filter(inv => {
                const invoiceDate = new Date(inv.invoice_date);
                return invoiceDate >= fromDate && invoiceDate <= toDate;
            });

            const monthsInRange = getMonthsInRange(fromDate, toDate);

            const chartData = monthsInRange.map(({ month, year }) => {
                const monthInvoices = filteredInvoices.filter(inv => {
                    const invoiceDate = new Date(inv.invoice_date);
                    return invoiceDate.getMonth() + 1 === month && invoiceDate.getFullYear() === year;
                });
                return {
                    month,
                    year,
                    total: monthInvoices.length,
                    delivered: monthInvoices.filter(inv => inv.booking.statuses.some(bx => bx.active === 1 && bx.status === 'delivered')).length,
                    inTransit: monthInvoices.filter(inv => inv.booking.statuses.some(bx => bx.active === 1 && bx.status === 'in_transit')).length,
                    pending: monthInvoices.filter(inv => inv.booking.statuses.some(bx => bx.active === 1 && bx.status === 'pending')).length,
                };
            });

            setChartData(chartData);
        };
        updateChartData();
    }, [invoices, from_date, to_date]);

    useEffect(() => {
        if (chartData) {
            setXAxis([{
                scaleType: 'band',
                data: chartData.map(item => monthNames[item.month - 1].slice(0, 3)),
                categoryGapRatio: 0.2,
            }]);
            setSeries([
                {
                    label: 'Delivered',
                    data: chartData.map(item => item.delivered),
                    stack: 'a'
                },
                {
                    label: 'In Transit',
                    data: chartData.map(item => item.inTransit),
                    stack: 'a'
                },
                {
                    label: 'Pending',
                    data: chartData.map(item => item.pending),
                    stack: 'a'
                }
            ]);
        }

        const totalDelivered = chartData.reduce((acc, item) => acc + item.delivered, 0);
        const totalInTransit = chartData.reduce((acc, item) => acc + item.inTransit, 0);
        const totalPending = chartData.reduce((acc, item) => acc + item.pending, 0);
        const total = totalDelivered + totalInTransit + totalPending;

        setPieChartData([
            {
                id: 1,
                value: totalDelivered,
                label: 'Delivered'
            },
            {
                id: 2,
                value: totalInTransit,
                label: 'In Transit'
            },
            {
                id: 3,
                value: totalPending,
                label: 'Pending'
            },
        ]);

    }, [chartData]);

    if (chartData) {
        return (
            <div className="p-4 mt-6">
                <div className="flex md:justify-between items-center">
                    {/*  */}
                </div>
                <div className="flex justify-center gap-8">
                    {xAxis && series.length && (
                        <BarChart
                            xAxis={xAxis}
                            series={series}
                            title="Monthly Bookings"
                            width={600}
                            height={200}
                        />
                    )}
                    {pieChartData && (
                        <PieChart
                            series={[
                                {
                                    data: pieChartData,
                                },
                            ]}
                            width={300}
                            height={150}
                        />
                    )}
                </div>
            </div>
        );
    } else {
        return null;
    }
};

const LoadingAnimation = () => {
    const loadingTexts = ["Loading", "Loading .", "Loading . .", "Loading . . ."];
    const [textIndex, setTextIndex] = useState(0);
    const [showStandBy, setShowStandBy] = useState(false);

    useEffect(() => {
        let interval;

        const cycleLoadingText = () => {
            setTextIndex((prev) => (prev + 1) % loadingTexts.length);
        };

        const startLoadingAnimation = () => {
            interval = setInterval(cycleLoadingText, 1000);
        };

        startLoadingAnimation();

        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="text-lg font-semibold text-gray-700 animate-pulse">
            {loadingTexts[textIndex]}
        </div>
    );
};
