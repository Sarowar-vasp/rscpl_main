import React, { useEffect } from 'react'
import '../../../../../css/print.css';
import { useState } from 'react';
import { Dialog } from 'primereact/dialog';

const PrintItem = (props) => {
    const { booking, is_return } = props;
    const [openDialog, setOpenDialog] = useState(false);

    const [options, setOptions] = useState({
        sectionSize: '0.5', // 0.5 or 1, 
    });

    const initiatePrint = () => {
        window.print();
        window.close()
    }

    let branch = booking.manifest?.branch;
    const itemNames = [...new Set(booking.items.flatMap(item => item.item_quantities.map(itemQuantity => itemQuantity.item_name)))];
    const totalAmount = booking.items.reduce((accumulator, currentItem) => accumulator + parseInt(currentItem.amount), 0);
    const totalQuantities = booking.items.reduce((sum, item) => sum + item.item_quantities.reduce((itemSum, itemInfo) => itemSum + itemInfo.quantity, 0), 0);
    const totalWeight = booking.items.reduce((sum, item) => sum + item.weight, 0);

    const createSection = (sectionClass, dataChunk, type) => (
        <div className={`section ${sectionClass}`}>
            <div className="flex flex-col justify-start gap-4">
                <div className="section-header">
                    <div className="header-info">
                        <div className="flex justify-center pb-1">
                            <h2 className='px-6 underline uppercase font-bold'>{booking.ship_to_party ? "Ship to Party " : " "} {is_return ? ' Return ' : ''} Consignment Note</h2>
                        </div>
                        <div className="flex flex-col gap-1 border-b ">
                            <div className="flex justify-between items-start">
                                <div className="branch_details">
                                    <h2 className="text-md font-bold uppercase text-gray-800">{branch?.name}</h2>
                                    <p className="text-xs">

                                        {branch?.gstin ? (
                                            <span className="font-bold">
                                            GSTIN : {branch.gstin}
                                        </span>
                                        ):''}
                                        <span className="ml-1 mr-2">,</span>
                                        {branch?.address ?
                                            <span className="font-semibold text-gray-700">
                                                {branch?.address}
                                            </span>
                                            :
                                            <span className="font-semibold">
                                                {branch?.location}
                                            </span>
                                        }
                                    </p>
                                </div>

                                <div className="Date text-sm">
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
                                {is_return ?
                                    <div className="text-xs">
                                        <h3 className="text-sm font-semibold">Consignor (Party)</h3>
                                        <h5 className="">
                                            <span className="font-semibold mr-2">
                                                {booking.consignee.name}
                                            </span>
                                            {booking.party_location ? "Party Location : " + booking.party_location : "Location : " + booking.consignee.location?.name}
                                        </h5>
                                        {booking.consignee.address ? <p >{'Address:'} <span>{booking.consignee.address}</span></p> : ''}
                                    </div>
                                    :
                                    <div className="text-xs">
                                        <h3 className="text-sm font-semibold">Consignor</h3>
                                        <h5 className="text-xs ">{booking.consignor.name + ', ' + booking.consignor.address}</h5>
                                        <h5 className="text-xs font-bold">GSTIN: {booking.consignor.gstin}</h5>
                                        <h5 className="text-xs ">Dispatch From: <span className='font-semibold'> {booking.consignor.location?.name}</span></h5>
                                    </div>
                                }
                                {is_return ?
                                    <div className="text-xs">
                                        <h3 className="text-sm font-semibold">Consignee</h3>
                                        <h5 className="">{booking.consignor.name}</h5>
                                        <h5 className="">Location: <span className='font-semibold'> {booking.consignor.location?.name}</span></h5>
                                        {booking.consignor.address ?
                                            <h5 className=""> {'Address:'} <span className='font-semibold'> {booking.consignor.address}</span></h5>
                                            : ''}
                                    </div>
                                    :
                                    <div className="">
                                        <h3 className="text-sm font-semibold">Consignee</h3>
                                        <h5 className="text-xs">
                                            <span>{booking.consignee.name}</span>
                                        </h5>
                                        {booking.consignee.address ? <p className='text-xs'>{'Address: '}<span>{booking.consignee.address}</span></p> : ''}
                                        <h5 className="text-xs">Destination
                                            {booking.ship_to_party ? " (Party Location) :" : " : "}
                                            {booking.ship_to_party ? booking.party_location : booking.consignee.location?.name}
                                        </h5>
                                    </div>
                                }

                            </div>
                        </div>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Invoice No</th>
                            <th>Invoice Date</th>
                            <th>Amount</th>
                            {itemNames.map((itm, i) => (
                                <th key={i} className='capitalize'>{itm}</th>
                            ))}
                            <th>Weight</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataChunk.map((item, i) => (
                            <tr key={i}>
                                <td>{item.invoice_no}</td>
                                <td>{new Date(item.invoice_date).toLocaleDateString('en-GB')}</td>
                                <td>{item.amount}</td>
                                {item.item_quantities.map((itemInfo, ix) => (
                                    <td key={ix}>{itemInfo.quantity}</td>
                                ))}
                                <td>{item.weight}</td>
                                <td>{item.remarks}</td>
                            </tr>
                        ))}
                        <tr>
                            <td className='border-none' colSpan={2}>
                                Vehicle No: {booking.manifest?.lorry?.lorry_number}
                            </td>
                            <td>Total: {totalAmount.toFixed(2)}</td>
                            <td colSpan={itemNames.length}>Total Items: {totalQuantities}</td>
                            <td>{totalWeight}</td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className={`section-footer ${type == 1 ? 'border-b-2 border-dashed' : ''}`}>
                <div>

                    <div className="flex justify-between items-start">
                        <div className="min-w-[250px] min-h-[60px] relative">
                            <h3 className="text-sm font-semibold">{branch ? branch.name : ''}</h3>
                            <div className="absolute bottom-1 left-0 right-0 flex justify-start">
                                <span className='text-xs font-semibold'>
                                    Authorised Signatory
                                </span>
                            </div>
                        </div>
                        <div className="min-w-[250px] min-h-[60px] relative">
                            <h3 className="text-sm font-semibold uppercase">Consignee</h3>
                            <div className="absolute bottom-1 left-0 right-0 flex justify-start">
                                <span className='text-xs font-semibold'>
                                    Receiver's Sign / Stamp
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    useEffect(() => {
        if (booking.items.length > 2) {
            setOpenDialog(true);
        } else {
            initiatePrint();
        }
    }, [booking.items.length]);

    useEffect(() => {
        document.documentElement.style.setProperty('--section-height', options.sectionSize === '0.5' ? '49vh' : '98vh');
    }, [options.sectionSize]);

    return (
        <>
            <div id="print-content" className="print-content text-xs">
                {booking.items && booking.items.length > 0 && booking.items.map((_, i) => {
                    let ips = 8 * (options.sectionSize == 1 ? 4 : 1);
                    if (i % ips === 0) {
                        const slicedData = booking.items.slice(i, i + ips);
                        return (
                            <div key={i}>
                                {options.sectionSize === '0.5' ? (
                                    <div className="page">
                                        {createSection('sender-copy', slicedData, 1)}
                                        {createSection('buyer-copy', slicedData, 2)}
                                    </div>
                                ) : (
                                    <>
                                        <div className="page">
                                            {createSection('sender-copy', slicedData, 1)}
                                        </div>
                                        <div className="page">
                                            {createSection('buyer-copy', slicedData, 2)}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    }
                    return null;
                })}
            </div>

            <Dialog
                visible={openDialog}
                header={'Print Options'}
                modal
                onHide={() => setOpenDialog(false)}
                closable={false}
                className="rounded-md m-4 min-w-[500px] p-4 bg-white"
            >
                <div className="flex flex-col">
                    <div className="mb-4">
                        <label className="mb-2">Select Section Size:</label>
                        <div className="flex justify-around items-center p-6 min-h-[300px]">
                            <div className={`cursor-pointer shadow-md h-[150px] w-[100px] flex justify-center items-center ${options.sectionSize === '0.5' ? 'shadow bg-red-100 border-red-900' : 'border-gray-300'} border border-dashed`} onClick={() => setOptions({ ...options, sectionSize: '0.5' })}>
                                <input className='hidden' type="radio" id="halfScreen" name="sectionSize" value="0.5" checked={options.sectionSize === '0.5'} />
                                <label htmlFor="halfScreen" className="font-bold text-sm">Half Screen</label>
                            </div>

                            <div className={`cursor-pointer shadow-md h-[150px] w-[100px] flex justify-center items-center ${options.sectionSize === '1' ? 'shadow bg-red-100 border-red-900' : 'border-gray-300'} border border-dashed`} onClick={() => setOptions({ ...options, sectionSize: '1' })}>
                                <input className='hidden' type="radio" id="fullScreen" name="sectionSize" value="1" checked={options.sectionSize === '1'} />
                                <label htmlFor="fullScreen" className="font-bold text-sm">Full Screen</label>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4">
                        <button className="bg-teal-500 text-white rounded-md py-2 px-4" onClick={() => {
                            setOpenDialog(false);
                            initiatePrint();
                        }}>
                            Confirm
                        </button>
                        <button className="bg-red-500 text-white rounded-md py-2 px-4" onClick={() => {
                            setOpenDialog(false);
                            window.close();
                        }}>
                            Cancel
                        </button>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default PrintItem

