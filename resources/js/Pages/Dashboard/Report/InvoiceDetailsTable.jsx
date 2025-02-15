import React from 'react'

const InvoiceDetailsTable = (props) => {
    const { invoices, textShorten } = props;

    return (
        <div className="flex w-full overflow-x-scroll max-h-[400px] overflow-y-auto">
            <table className="min-w-full">
                <thead className='align-bottom'>
                    <tr className='font-semibold text-sm text-secondary-dark border-b'>
                        <th className="min-w-[60px] py-3 text-center">sl. no</th>
                        <th className="min-w-[80px] pb-3 text-center">Vehicle</th>
                        <th className="min-w-[150px] pb-3 text-center">Destination</th>
                        <th className="min-w-[100px] pb-3 text-center">Manifest No</th>
                        <th className="min-w-[100px] pb-3 text-center">Trip Date</th>
                        <th className="min-w-[150px] pb-3 text-center">Dealer Name</th>
                        <th className="min-w-[100px] pb-3 text-center">Invoice</th>
                        <th className="min-w-[100px] pb-3 text-center">Invoice Date</th>
                        <th className="min-w-[100px] pb-3 text-center">Total Qty</th>
                        <th className="min-w-[80px] pb-3 text-center">CN. No</th>
                        <th className="min-w-[60px] pb-3 text-center">Weight</th>
                        <th className="min-w-[150px] pb-3 text-center">Company</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map((inv, i) => {
                        
                        return (
                            <tr key={i} className='border-b border-dashed last:border-b-0 last:pb-16'>
                                <td className='p-3 text-center'>{i + 1}</td>
                                <td className="text-center">
                                    <span onClick={() => console.log(inv.booking.manifest)} className='text-center align-baseline inline-flex px-2 py-2 mr-auto items-center font-semibold text-[.8rem] leading-none text-gray-700 bg-gray-100 rounded-lg'>
                                        {inv.booking.manifest?.lorry?.lorry_number}
                                    </span>
                                </td>
                                <td className='text-center px-2 '>
                                    {inv.booking.ship_to_party ? inv.booking.party_location : inv.booking.consignee.location?.name}
                                </td>
                                <td className='text-center px-2 '>
                                    {inv.booking.manifest?.manifest_no}
                                </td>
                                <td className='text-center'>
                                    <span className="text-center align-baseline inline-flex px-3 py-1.5 mr-auto items-center font-semibold text-[.8rem] leading-none text-teal-700 bg-teal-100 rounded-lg">
                                        {new Date(inv.booking.manifest.trip_date).toLocaleDateString('en-GB')}
                                    </span>
                                </td>
                                <td className='text-center'>{inv.booking.consignee?.name}</td>
                                <td className='text-center'>{inv.invoice_no}</td>
                                <td className='text-center'>
                                    <span className="text-center align-baseline inline-flex px-3 py-1.5 mr-auto items-center font-semibold text-[.8rem] leading-none text-blue-700 bg-blue-100 rounded-lg">
                                        {new Date(inv.invoice_date).toLocaleDateString('en-GB')}
                                    </span>
                                </td>
                                <td className='text-center'>{inv.total}</td>
                                <td className='text-center'>{inv.booking.cn_no}</td>
                                <td className='text-center'>{inv.weight}</td>
                                <td className='text-center'>{textShorten(inv.booking.consignor?.name)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default InvoiceDetailsTable