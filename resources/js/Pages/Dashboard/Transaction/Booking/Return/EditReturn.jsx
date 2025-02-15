import { IconButton, Button, Tooltip } from '@mui/material'
import axios from 'axios';
import { PencilIcon, PlusIcon, XIcon } from 'lucide-react'
import { Dialog } from 'primereact/dialog';
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import DatePicker from 'react-datepicker';

const EditReturn = (props) => {
    const { booking, manifests, parties, reload, toast, items } = props;

    const [openDialog, setOpenDialog] = useState(false);
    const [itemList, setItemList] = useState([]);

    const [processedData, setProcessedData] = useState({
        totalWeight: 0,
        totalQty: 0,
        totalAmount: 0
    });

    useEffect(() => {
        if (itemList.length > 0) {
            const totalWeight = itemList.reduce((sum, item) => sum + parseFloat(item.weight || 0), 0);
            const totalQty = itemList.reduce((sum, item) => sum + item.itemsInfo.reduce((itemSum, info) => itemSum + parseInt(info.qty || 0), 0), 0);
            const totalAmount = itemList.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

            setProcessedData({
                totalWeight: totalWeight.toFixed(2),
                totalQty,
                totalAmount: totalAmount.toFixed(2)
            });
        }
    }, [itemList])


    useEffect(() => {
        if (booking) {
            setItemList(booking.items.map(item => ({
                invoice_no: item.invoice_no,
                invoice_date: new Date(item.invoice_date),
                amount: item.amount,
                itemsInfo: item.item_quantities.map(iq => ({ name: iq.item_name, qty: iq.quantity })),
                weight: item.weight,
                remarks: item.remarks // Add remarks to the itemList
            })));
        }
    }, [booking]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const bookingItemsData = itemList.map(item => ({
            invoice_no: item.invoice_no,
            invoice_date: item.invoice_date,
            amount: item.amount,
            weight: item.weight,
            item_quantities: item.itemsInfo.map(itemInfo => ({
                item_name: itemInfo.name,
                quantity: itemInfo.qty
            })),
            remarks: item.remarks
        }));
        if (bookingItemsData.length > 0) {
            axios.put(`/data/return/booking/update/${booking.id}`, { bookingItemsData })
                .then(res => {
                    reload();
                    setOpenDialog(false);
                    toast.current.show({ label: 'Success', severity: 'success', detail: 'Booking items updated successfully' });
                })
                .catch(err => {
                    console.log(err.message);
                    toast.current.show({ label: 'Error', severity: 'error', detail: err.message });
                });
        } else {
            toast.current.show({ label: 'Error', severity: 'error', detail: 'Invalid booking data' });
        }
    }

    return (
        <>
            <Tooltip title="Edit">
                <Button
                    color="primary"
                    onClick={() => setOpenDialog(true)}
                    aria-label="Edit"
                    variant='outlined'
                    startIcon={<PencilIcon className='w-4 h-4' />}
                >
                    Edit
                </Button>
            </Tooltip>
            <Dialog visible={openDialog}
                header={'Edit Return'}
                modal
                onHide={() => setOpenDialog(false)}
                className="rounded-md m-4 w-full md:w-2/3 p-4 bg-white"
            >
                <div className="flex flex-col">
                    <div className="mb-4 p-4 bg-gray-100 rounded-md">
                        <h3 className="text-lg font-semibold mb-2">Booking Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p><span className="font-medium">Consignment No:</span> {booking.cn_no}</p>
                                <p><span className="font-medium">Consignor:</span> {booking.consignor?.name}</p>
                                <p><span className="font-medium">From:</span> {booking.consignor?.location.name}</p>
                            </div>
                            <div>
                                <p><span className="font-medium">Booking Date:</span> {new Date(booking.manifest?.trip_date).toLocaleDateString()}</p>
                                <p><span className="font-medium">Consignee:</span> {booking.consignee?.name}</p>
                                <p><span className="font-medium">To:</span> {booking.consignee?.location.name}</p>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4 p-4">
                            <BookingItems
                                items={items}
                                itemList={itemList}
                                setItemList={setItemList}
                                setProcessedData={setProcessedData}
                                toast={toast}
                            />
                            <hr />
                            {itemList && itemList.length > 0 && (
                                <>
                                    <div className="flex justify-end items-end flex-col gap-2">
                                        <div className="border rounded-md pt-0 min-w-[200px] overflow-hidden">
                                            <h4 className="text-md font-semibold px-4 py-2 bg-gray-700 text-white">Summary</h4>
                                            <div className="p-4">
                                                <h6 className='py-0 my-0 text-sm'>Weight: {processedData.totalWeight + ' KG'} </h6>
                                                <h6 className='py-0 my-0 text-sm'>Quantity: {processedData.totalQty}</h6>
                                                <h6 className='py-0 my-0 text-sm'>Amount: {'Rs ' + processedData.totalAmount}</h6>
                                            </div>
                                        </div>

                                        <button type="submit" className="px-4 py-2 font-semibold text-white bg-teal-500 rounded-md shadow-sm hover:bg-teal-600">
                                            Update Booking Items
                                        </button>
                                    </div>
                                </>
                            )}

                        </form>

                    </div>

                </div>
            </Dialog>
        </>
    )
}

export default EditReturn;



const BookingItems = ({ items, itemList, setItemList, setProcessedData, toast }) => {
    const [formItem, setFormItem] = useState({
        invoice_no: '',
        invoice_date: new Date(),
        amount: 0,
        itemsInfo: items.map(ix => ({ name: ix.name, qty: 0 })),
        weight: 0,
        remarks: '' // Initialize remarks in formItem
    });

    const handleItemInfoChange = (updatedItem) => {
        updatedItem.qty = isNaN(parseInt(updatedItem.qty, 10)) ? 0 : parseInt(updatedItem.qty, 10);
        if (updatedItem.qty > 0) {
            const newItemsInfo = formItem.itemsInfo.map(item =>
                item.name === updatedItem.name ? { ...item, qty: updatedItem.qty } : item
            );
            setFormItem({ ...formItem, itemsInfo: newItemsInfo });
        } else {
            toast.current.show({ label: 'Error', severity: 'error', detail: 'Quantity can not be a negative value' });
        }
    };

    const reloadForm = () => {
        setFormItem({
            invoice_no: '',
            invoice_date: new Date(),
            amount: 0,
            itemsInfo: items.map(ix => ({ name: ix.name, qty: 0 })),
            weight: 0,
            remarks: '' // Reset remarks when reloading the form
        });
    }

    useEffect(() => {
        reloadForm();
    }, []);

    const AddItemQty = async (e) => {
        e.preventDefault();

        const formQty = formItem.itemsInfo?.length > 0 ? formItem.itemsInfo.reduce((acc, itemInfo) => acc + parseInt(itemInfo.qty || 0), 0) : 0;
        if (!formItem.invoice_no) {

        }
        let acceptedNames = ['N/A', 'NA', 'Unavailable', 'Not Applicable', 'None', 'Unknown', '', null];

        const inList = itemList.some(il => (
            !acceptedNames.includes(formItem.invoice_no) && il.invoice_no === formItem.invoice_no
        ));

        if (inList) {
            toast.current.show({ label: 'Error', severity: 'error', detail: 'Duplicate Invoice entry!' });
            return false;
        }


        if (formItem.amount < 0) {
            toast.current.show({ label: 'Error', severity: 'error', detail: 'Negative Amount is not accepted' });
            return false;
        }

        if (formQty <= 0) {
            toast.current.show({ label: 'Error', severity: 'error', detail: 'Enter Items Quantities' });
            return false;
        }

        if (formItem.weight < 0) {
            toast.current.show({ label: 'Error', severity: 'error', detail: 'Enter weight' });
            return false;
        }

        try {
            if (formItem.invoice_no.length > 4) {
                const res = await axios.post('/data/invoice/check', { invoice_no: formItem.invoice_no });
                if (res.data.available) {
                    const newItemList = [...itemList, {
                        ...formItem,
                        item_quantities: formItem.itemsInfo.map(info => ({
                            item_name: info.name,
                            quantity: info.qty
                        })),
                    }];
                    setItemList(newItemList);
                    updateProcessedData(newItemList);
                    reloadForm();
                } else {
                    toast.current.show({ label: 'Error', severity: 'error', detail: 'Invoice has been already submitted. Please enter another invoice number' });
                }
            } else {
                const newItemList = [...itemList, {
                    ...formItem,
                    invoice_no: 'NA',
                    item_quantities: formItem.itemsInfo.map(info => ({
                        item_name: info.name,
                        quantity: info.qty
                    })),
                }];
                setItemList(newItemList);
                updateProcessedData(newItemList);
                reloadForm();
            }

        } catch (err) {
            toast.current.show({ label: 'Error', severity: 'error', detail: err.message });
        }
    };

    const removeItem = (index) => {
        const updatedItemList = [...itemList];
        updatedItemList.splice(index, 1);
        setItemList(updatedItemList);
        updateProcessedData(updatedItemList);
    };

    const updateProcessedData = (newItemList) => {
        const totalWeight = newItemList.reduce((acc, itm) => acc + parseInt(itm.weight || 0), 0);
        const totalAmount = newItemList.reduce((acc, itm) => acc + parseInt(itm.amount || 0), 0);
        const totalQty = newItemList.reduce((acc, itm) => acc + itm.itemsInfo.reduce((acc2, itemInfo) => acc2 + parseInt(itemInfo.qty || 0), 0), 0);

        setProcessedData({
            totalWeight,
            totalQty,
            totalAmount
        });
    };

    return (
        <div className="p-2">
            <div className="flex justify-between items-center">
                <h3 className='font-bold text-xl'>Booking Details</h3>
            </div>
            <table className="w-full mt-4 border-collapse border border-gray-200">
                <thead>
                    <tr>
                        <th className="border border-gray-200 p-2 text-sm max-w-[100px]">Invoice No</th>
                        <th className="border border-gray-200 p-2 text-sm max-w-[60px]">Invoice Date</th>
                        <th className="border border-gray-200 p-2 text-sm max-w-[60px]">Amount</th>
                        {items.map((itm, i) => (
                            <th key={i} className="border capitalize border-gray-200 p-2 text-sm max-w-[40px]">{itm.name}</th>
                        ))}
                        <th className="border border-gray-200 p-2 text-sm max-w-[60px]">Weight(KG)</th>
                        <th className="border border-gray-200 p-2 text-sm max-w-[60px]">Remarks</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {itemList.map((itm, index) => (
                        <tr key={index}>
                            <td className="border border-gray-200 text-center text-sm max-w-[100px]">{itm.invoice_no}</td>
                            <td className="border border-gray-200 text-center text-sm max-w-[60px]">{new Date(itm.invoice_date).toLocaleDateString('en-GB')}</td>
                            <td className="border border-gray-200 text-center text-sm max-w-[60px]">{itm.amount}</td>
                            {items.map((itx, i) => {
                                let itmx = itm.itemsInfo.find(ittx => ittx.name.toLowerCase() == itx.name.toLowerCase());
                                return (
                                    <td key={i} className="border border-gray-200 text-center text-sm max-w-[40px]">{itmx ? itmx.qty : '0'}</td>
                                );
                            })}
                            <td className="border border-gray-200 text-center text-sm max-w-[60px]">{itm.weight}</td>
                            <td className="border border-gray-200 text-center text-sm max-w-[60px]">{itm.remarks}</td>                            <td className="border border-gray-200 text-center text-sm max-w-[60px]">
                                <IconButton onClick={() => removeItem(index)}>
                                    <XIcon className='h-4 w-4 text-orange-600' />
                                </IconButton>
                            </td>
                        </tr>
                    ))}

                    <tr className='border-2 border-green-800'>
                        <td className="border border-gray-200 text-center text-sm max-w-[100px]">
                            <input type="text"
                                name="invoice_no"
                                id="inv_no"
                                value={formItem.invoice_no}
                                onChange={e => {
                                    let inv_val = e.target.value || 'NA';
                                    setFormItem({ ...formItem, invoice_no: inv_val })
                                }}
                                className="w-full text-xs border-none outline-none focus:ring-0 rounded-sm shadow-xs px-2 text-center"
                                placeholder='Invoice Number'
                            />
                        </td>
                        <td className="border border-gray-200 text-center text-sm max-w-[60px]">
                            <DatePicker
                                selected={formItem.invoice_date}
                                dateFormat={'dd/MM/yyyy'}
                                locale="en-IN"
                                onChange={(date) => setFormItem({ ...formItem, invoice_date: date })}
                                name="invoice_date"
                                id="inv_date"
                                className="w-full text-xs border-none outline-none focus:ring-0 rounded-sm shadow-xs px-2 text-center"
                                placeholderText='Select Date'
                            />
                        </td>
                        <td className="border border-gray-200 text-center text-sm max-w-[60px]">
                            <input type="text"
                                name="amount"
                                id="inv_amt"
                                value={formItem.amount}
                                onChange={(e) => setFormItem({ ...formItem, amount: e.target.value })}
                                className="w-full text-xs  border-none outline-none focus:ring-0 rounded-sm shadow-xs px-2 text-center"
                                placeholder='amount'
                            />
                        </td>
                        {formItem.itemsInfo.map((itm, i) => (
                            <td key={i} className="border border-gray-200 text-center text-sm max-w-[40px]">
                                <input type="text"
                                    name="qty"
                                    value={itm.qty}
                                    onChange={(e) => handleItemInfoChange({ name: itm.name, qty: e.target.value })}
                                    className="w-full text-xs  border-none outline-none focus:ring-0 rounded-sm shadow-xs px-2 text-center"
                                />
                            </td>
                        ))}
                        <td className="border border-gray-200 text-center text-sm max-w-[60px]">
                            <input type="text"
                                name="weight"
                                id="grss_weight"
                                value={formItem.weight}
                                onChange={(e) => setFormItem({ ...formItem, weight: e.target.value })}
                                className="w-full text-xs  border-none outline-none focus:ring-0 rounded-sm shadow-xs px-2 text-center"
                                placeholder='Gross Weight'
                            />
                        </td>
                        <td className="border border-gray-200 text-center text-sm max-w-[60px]">
                            <input type="text"
                                name="remarks"
                                id="remarks"
                                value={formItem.remarks} // Bind remarks input to formItem.remarks
                                onChange={(e) => setFormItem({ ...formItem, remarks: e.target.value })}
                                className="w-full text-xs border-none outline-none focus:ring-0 rounded-sm shadow-xs px-2 text-center"
                                placeholder='Remark'
                            />
                        </td>
                        <td className="border border-gray-200 text-center text-sm max-w-[60px]">
                            <IconButton onClick={AddItemQty}>
                                <PlusIcon className='h-4 w-4 text-green-600' />
                            </IconButton>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};