import React, { useEffect } from 'react'
import '../../../../../../css/print.css';

const PrintItem = (props) => {
    const { booking } = props;

    useEffect(() => {
        initiatePrint();
    }, [])
    
    const initiatePrint=()=>{
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
            <div className="section-header">
                <div className="header-info">
                    <div className="flex justify-center pb-1">
                        <h2 className='px-6 underline uppercase font-bold'>{booking.ship_to_party ? "Ship to Party " : " "} Return Consignment Note</h2>
                    </div>
                    <div className="flex flex-col gap-1 border-b ">
                        <div className="flex justify-between items-start">
                            <div className="branch_details">
                                <h2 className="text-md font-bold uppercase text-gray-800">{branch?.name}</h2>
                                <p className="text-xs font-bold">GSTIN : 18ACVPA9671J1ZV</p>
                                <p className="text-xs">
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
                                <div className="text-xs">
                                    <h3 className="text-sm font-semibold">Consignor (Party)</h3>
                                    <h5 className="">{booking.consignee.name}</h5>
                                    <h5 className="">
                                        {booking.party_location ? "Party Location : " + booking.party_location : "Location : " + booking.consignee.location?.name}
                                    </h5>
                                    {booking.consignee.address ? <p >{'Address:'} <span>{booking.consignee.address}</span></p> : ''}
                                </div>
                                <div className="text-xs">
                                    <h3 className="text-sm font-semibold">Consignee</h3>
                                    <h5 className="">{booking.consignor.name}</h5>
                                    <h5 className="">Location: <span className='font-semibold'> {booking.consignor.location?.name}</span></h5>
                                    {booking.consignor.address ?
                                        <h5 className=""> {'Address:'} <span className='font-semibold'> {booking.consignor.address}</span></h5>
                                        : ''}
                                </div>

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
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className={`section-footer ${type == 1 ? 'border-b-2 border-dashed' : ''}`}>
                <div>
                    <div className="flex items-start justify-between py-2 text-xs font-bold">
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
                    <div className="flex justify-between items-start">
                        <div className="min-w-[250px] min-h-[100px] relative">
                            <h3 className="text-sm font-semibold">{branch ? branch.name : ''}</h3>
                            <div className="absolute bottom-1 left-0 right-0 flex justify-start">
                                <span className='text-xs font-semibold'>
                                    Authorised Signatory
                                </span>
                            </div>
                        </div>
                        <div className="min-w-[250px] min-h-[100px] relative">
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

    return (
        <div id="print-content" className="print-content text-xs">
            {booking.items && booking.items.length > 0 && booking.items.map((_, i) => {
                if (i % 5 === 0) {
                    const slicedData = booking.items.slice(i, i + 5);
                    return (
                        <div className="page" key={i}>
                            {createSection('sender-copy', slicedData, 1)}
                            {createSection('buyer-copy', slicedData, 2)}
                        </div>
                    );
                }
                return null;
            })}
        </div>
    )
}

export default PrintItem