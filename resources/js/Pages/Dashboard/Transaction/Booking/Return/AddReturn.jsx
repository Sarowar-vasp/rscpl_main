import { Dialog } from 'primereact/dialog';
import React, { useEffect, useState } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { IconButton } from '@mui/material';
import { XIcon } from 'lucide-react';

const AddReturn = (props) => {
    const { manifests, parties, reload, toast } = props;
    const [openDialog, setOpenDialog] = useState(false);
    const [itemList, setItemList] = useState([]);
    const [formInfo, setFormInfo] = useState({
        manifest_id: '',
        cn_no: '',
        consignor: '',
        consignee: '',
        party_location: '',
        amount: '',
        remarks: '',
    });

    const [processedData, setProcessedData] = useState({
        totalWeight: 0,
        totalQty: 0,
        totalAmount: 0
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const bookingData = {
            manifest_id: parseInt(formInfo.manifest_id), // Ensure manifest_id is an integer
            cn_no: formInfo.cn_no,
            consignor: formInfo.consignor,
            consignee: formInfo.consignee,
            amount: parseFloat(processedData.totalAmount).toFixed(2), // Ensure totalAmount is a float with 2 decimal places
            remarks: formInfo.remarks,
            party_location: formInfo.party_location ? formInfo.party_location : ''
        };

        const bookingItemsData = itemList.map(item => ({
            invoice_no: item.invoice_no,
            invoice_date: item.invoice_date,
            amount: parseFloat(item.amount).toFixed(2), // Ensure amount is a float with 2 decimal places
            weight: parseFloat(item.weight).toFixed(2), // Ensure weight is a float with 2 decimal places
            itemsInfo: item.itemsInfo.map(itemInfo => ({
                item_name: itemInfo.name,
                quantity: parseInt(itemInfo.qty) // Ensure quantity is an integer
            }))
        }));

        // Validate totalAmount before submission
        if (bookingData && bookingItemsData.length > 0 && processedData.totalAmount >= 0) {
            axios.post('/data/return/booking/new', { bookingData, bookingItemsData })
                .then(res => {
                    reload();
                    setFormInfo({
                        manifest_id: '',
                        cn_no: '',
                        consignor: '',
                        consignee: '',
                        amount: '',
                        remarks: '',
                        party_location: '',
                    });
                    setItemList([]);
                    setOpenDialog(false);
                    toast.current.show({ label: 'Success', severity: 'success', detail: res.data.message });
                })
                .catch(err => {
                    // Improve error handling
                    toast.current.show({ label: 'Error', severity: 'error', detail: `Error: ${err.response?.data?.message || err.message}` });
                    console.log(err.response?.data || err.message);
                });
        } else {
            console.log('No booking items data or total amount is zero');
        }
    };

    const generateChallanNumber = () => {
        axios.get('/data/return/last_item/challan').then(res => {
            let last_ch_num = res.data;
            let new_ch_num = incrementChallanNumber(last_ch_num);
            setFormInfo(
                {
                    ...formInfo,
                    cn_no: new_ch_num,
                });
        }).catch(err => {
            console.log(err.message);
        });
    };

    const incrementChallanNumber = (challanNumber) => {
        let match = challanNumber.match(/(\D*)(\d+)$/);
        if (!match) {
            throw new Error('Invalid challan number format');
        }

        let prefix = match[1];
        let number = match[2];
        let newNumber = (parseInt(number) + 1).toString().padStart(number.length, '0');

        return prefix + newNumber;
    };

    useEffect(() => {
        if (formInfo.manifest_id) {
            generateChallanNumber();
        }
    }, [formInfo.manifest_id]);


    return (
        <>
            <button onClick={() => setOpenDialog(true)} className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semi-bold py-2 px-3 rounded">
                Create Return Booking
            </button>
            <Dialog visible={openDialog} modal onHide={() => setOpenDialog(false)} className="rounded-md m-4 w-full md:w-11/12 p-4 bg-white">
                <h3 className="text-xl font-bold underline text-gray-500 capitalize px-4">
                    New return booking
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4 p-4">
                    <BookingItems {...props} itemList={itemList} setItemList={setItemList} setProcessedData={setProcessedData} />
                    <hr />
                    {itemList && itemList.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-12 items-end gap-3">
                                <div className="items md:col-span-9">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                        <div className="flex flex-col">
                                            <label htmlFor="mani_no" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Lorry Manifest:</label>
                                            <select
                                                name="manifest_id"
                                                id="mani_no"
                                                defaultValue={''}
                                                onChange={(e) => setFormInfo({ ...formInfo, manifest_id: e.target.value })}
                                                className="border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2"
                                            >
                                                <option value="" disabled>Select Manifest</option>
                                                {manifests && manifests.map(mani => (
                                                    <option key={mani.id} value={mani.id}>{mani.lorry?.lorry_number + ' ' + mani.trip_date} </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex flex-col">
                                            <label htmlFor="cn_no" className="mb-2 text-xs md:text-sm font-medium text-gray-700">CN no:</label>
                                            <input type="text"
                                                name="cn_no"
                                                id="cn_no"
                                                value={formInfo.cn_no}
                                                onChange={(e) => setFormInfo({ ...formInfo, cn_no: e.target.value })}
                                                className="bg-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2"
                                            />
                                        </div>


                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div className="flex flex-col">
                                            <label htmlFor="consignee" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Consignor (Party):</label>
                                            <select
                                                name="consignee"
                                                id="consignee"
                                                defaultValue={''}
                                                onChange={(e) => setFormInfo({ ...formInfo, consignee: e.target.value })}
                                                className="border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2"
                                            >
                                                <option value="" disabled>Select Party</option>
                                                {parties && parties.map(party => {
                                                    if (party.id == formInfo.consignor) return null;
                                                    if (party.is_consignor) return null;
                                                    return (<option key={party.id} value={party.id}>{party.name}</option>);
                                                })}
                                            </select>
                                        </div>
                                        <div className="flex flex-col">
                                            <label htmlFor="consignor" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Consignee:</label>
                                            <select
                                                name="consignor"
                                                id="consignor"
                                                defaultValue={''}
                                                onChange={(e) => setFormInfo({ ...formInfo, consignor: e.target.value })}
                                                className="border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2"
                                            >
                                                <option value="" disabled>Select Consignee</option>
                                                {parties && parties.map(party => {
                                                    if (party.id == formInfo.consignee) return null;
                                                    if (!party.is_consignor) return null;
                                                    return (<option key={party.id} value={party.id}>{party.name}</option>);
                                                })}
                                            </select>
                                        </div>

                                    </div>
                                    <hr className='my-8' />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

                                        <div className="flex flex-col">
                                            <label htmlFor="party_location" className="mb-2 text-xs md:text-sm font-medium text-gray-700">
                                                Party Location:
                                            </label>
                                            <input
                                                type="text"
                                                name="party_location"
                                                id="party_location"
                                                value={formInfo.party_location}
                                                onChange={(e) => setFormInfo({ ...formInfo, party_location: e.target.value })}
                                                className="border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2"
                                            />
                                        </div>

                                    </div>
                                </div>
                                <div className="px-4">
                                    <h4 className="text-lg font-semibold">Summary</h4>
                                    <h6 style={{ display: 'ruby' }}>Weight: {processedData.totalWeight + ' KG'} </h6><br />
                                    <h6 style={{ display: 'ruby' }}>Quantity: {processedData.totalQty}</h6><br />
                                    <h6 style={{ display: 'ruby' }}>Amount: {'Rs ' + processedData.totalAmount}</h6><br />
                                </div>
                            </div>

                            <button type="submit" className="px-4 py-2 font-semibold text-white bg-teal-500 rounded-md shadow-sm hover:bg-teal-600">
                                Submit
                            </button>
                        </>
                    )}
                </form>
            </Dialog>
        </>
    );
}
export default AddReturn;

const BookingItems = (props) => {
    const { items, setProcessedData, itemList, setItemList } = props;
    const [formItem, setFormItem] = useState({
        invoice_no: '',
        invoice_date: '', // Added invoice_date to formItem
        amount: 0,
        itemsInfo: [],
        weight: 0,
    });

    const [formOpen, setFormOpen] = useState(false);


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
        const newItemsInfo = items.map(ix => ({ name: ix.name, qty: 0 }));
        setFormItem({ ...formItem, itemsInfo: newItemsInfo });
    }

    useEffect(() => {
        reloadForm();
    }, []);

    const AddItemQty = async (e) => {
        e.preventDefault();

        const formQty = formItem.itemsInfo?.length > 0
            ? formItem.itemsInfo.reduce((acc, itemInfo) => acc + parseInt(itemInfo.qty || 0), 0)
            : 0;

        if (!formItem.invoice_no || formItem.invoice_no.length < 3) {
            formItem.invoice_no = 'NA';
            const newItemList = [...itemList, formItem];
            setItemList(newItemList);
            const totalQty = newItemList.reduce((acc, itm) => acc + itm.itemsInfo.reduce((acc2, itemInfo) => acc2 + parseInt(itemInfo.qty || 0), 0), 0);
            const totalWeight = newItemList.reduce((acc, itm) => acc + parseInt(itm.weight || 0), 0);
            const totalAmount = newItemList.reduce((acc, itm) => acc + parseInt(itm.amount || 0), 0);
            setProcessedData({
                totalWeight,
                totalQty,
                totalAmount
            });
            reloadForm();
            setFormOpen(false);
        } else {
            const inList = itemList.some(il => il.invoice_no === formItem.invoice_no);
            if (inList) {
                toast.current.show({ label: 'Error', severity: 'error', detail: 'Please enter another invoice number' });
                return;
            }

            try {
                const res = await axios.post('/data/return/invoice/check', { invoice_no: formItem.invoice_no });

                if (res.data.available) {
                    const newItemList = [...itemList, formItem];
                    setItemList(newItemList);
                    const totalQty = newItemList.reduce((acc, itm) => acc + itm.itemsInfo.reduce((acc2, itemInfo) => acc2 + parseInt(itemInfo.qty || 0), 0), 0);
                    const totalWeight = newItemList.reduce((acc, itm) => acc + parseInt(itm.weight || 0), 0);
                    const totalAmount = newItemList.reduce((acc, itm) => acc + parseInt(itm.amount || 0), 0);
                    setProcessedData({
                        totalWeight,
                        totalQty,
                        totalAmount
                    });
                    reloadForm();
                    setFormOpen(false);
                } else {
                    toast.current.show({ label: 'Error', severity: 'error', detail: 'Invoice has been already submitted. Please enter another invoice number' });
                }
            } catch (err) {
                toast.current.show({ label: 'Error', severity: 'error', detail: err.message });
            }
        }

    };


    const removeItem = (index) => {
        const updatedItemList = [...itemList];
        updatedItemList.splice(index, 1);
        setItemList(updatedItemList);

        const totalWeight = updatedItemList.reduce((acc, itm) => acc + parseInt(itm.weight || 0), 0);
        const totalAmount = updatedItemList.reduce((acc, itm) => acc + parseInt(itm.amount || 0), 0);
        const totalQty = updatedItemList.reduce((acc, itm) => acc + itm.itemsInfo.reduce((acc2, itemInfo) => acc2 + parseInt(itemInfo.qty || 0), 0), 0);

        setProcessedData({
            totalWeight,
            totalQty,
            totalAmount
        });
    };


    return (
        <div className="p-2">
            <div className="flex justify-between items-center">
                <h3 className='font-bold text-xl'>Return Booking Details</h3>
                <button
                    type='button'
                    onClick={(e) => {
                        e.preventDefault();
                        setFormOpen(!formOpen);
                    }}
                    className='px-3 py-1 text-xs font-semibold text-white bg-orange-500 rounded-md shadow-sm hover:bg-orange-600'>
                    {formOpen ? 'Close' : 'Add Invoice'}
                </button>
            </div>
            {formOpen && (
                <div className={`flex flex-col gap-2 my-8 p-4 bg-slate-100 rounded shadow-md`}>
                    <div className="w-full">
                        <div className="flex gap-4">
                            <div className="flex-1 flex flex-col">
                                <label htmlFor="inv_no" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Invoice No:</label>
                                <input type="text"
                                    name="invoice_no"
                                    id="inv_no"
                                    value={formItem.invoice_no}
                                    onChange={e => setFormItem({ ...formItem, invoice_no: e.target.value })}
                                    className="w-full text-xs border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2"
                                />
                            </div>
                            <div className="flex-1 flex flex-col">
                                <label htmlFor="inv_date" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Invoice Date:</label>
                                <input type="date"
                                    name="invoice_date"
                                    id="inv_date"
                                    value={formItem.invoice_date}
                                    onChange={(e) => setFormItem({ ...formItem, invoice_date: e.target.value })}
                                    className="w-full text-xs border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2"
                                />
                            </div>
                            <div className="flex-1 flex flex-col">
                                <label htmlFor="inv_amt" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Amount:</label>
                                <input type="text"
                                    name="amount"
                                    id="inv_amt"
                                    value={formItem.amount}
                                    onChange={(e) => setFormItem({ ...formItem, amount: e.target.value })}
                                    className="w-full text-xs border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2"
                                />
                            </div>

                            <div className="flex-1 flex flex-col">
                                <label htmlFor="grss_weight" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Gross Weight(KG):</label>
                                <input type="text"
                                    name="weight"
                                    id="grss_weight"
                                    value={formItem.weight}
                                    onChange={(e) => setFormItem({ ...formItem, weight: e.target.value })}
                                    className="w-full text-xs border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2"
                                />
                            </div>


                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {items && items.length > 0 && items.map((itm, i) => (
                                <div key={i} className="flex-1 flex flex-col">
                                    <label htmlFor={`itm${itm.id}`} className="mb-2 text-xs md:text-sm font-medium text-gray-700">{itm.name}(Qty)</label>
                                    <input type="text"
                                        name="qty"
                                        defaultValue={'0'}
                                        id={`itm${itm.id}`}
                                        onChange={(e) => handleItemInfoChange({ name: itm.name, qty: e.target.value })}
                                        className="w-full text-xs border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between items-end">
                        <button
                            onClick={AddItemQty}
                            type='button'
                            className='px-3 py-1 text-xs font-semibold text-white bg-green-500 rounded-md shadow-sm hover:bg-green-600'>
                            Add
                        </button>
                    </div>
                </div>
            )}
            <table className="w-full mt-4 border-collapse border border-gray-200">
                <thead>
                    <tr>
                        <th className="border border-gray-200 p-2">Invoice No</th>
                        <th className="border border-gray-200 p-2">Invoice Date</th>
                        <th className="border border-gray-200 p-2">Amount</th>
                        {items.map((itm, i) => (
                            <th key={i} className="border border-gray-200 p-2">{itm.name}(Qty)</th>
                        ))}
                        <th className="border border-gray-200 p-2">Gross Weight(KG)</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {itemList.map((itm, index) => (
                        <tr key={index}>
                            <td className="border border-gray-200 text-center p-2">{itm.invoice_no}</td>
                            <td className="border border-gray-200 text-center p-2">{itm.invoice_date}</td>
                            <td className="border border-gray-200 text-center p-2">{itm.amount}</td>
                            {itm.itemsInfo.map((itemInfo, i) => (
                                <td key={i} className="border border-gray-200 text-center p-2">{itemInfo.qty}</td>
                            ))}
                            <td className="border border-gray-200 text-center p-2">{itm.weight}</td>
                            <td className="border border-gray-200 text-center p-2">
                                <IconButton onClick={() => removeItem(index)}>
                                    <XIcon className='text-orange-600' />
                                </IconButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


