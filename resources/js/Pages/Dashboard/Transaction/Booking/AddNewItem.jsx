import { Dialog } from 'primereact/dialog';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { IconButton } from '@mui/material';
import { PlusIcon, XIcon } from 'lucide-react';

const AddNewItem = (props) => {
    const { manifests, reload, toast } = props;
    const [openDialog, setOpenDialog] = useState(false);
    const [itemList, setItemList] = useState([]);
    const [formInfo, setFormInfo] = useState({
        manifest_id: '',
        cn_no: '',
        cewb: '',
        cewb_expires: '',
        consignor: '',
        consignee: '',
        ship_to_party: 0,
        party_location: '',
        amount: '',
        remarks: '',
    });

    const [processedData, setProcessedData] = useState({
        totalWeight: 0,
        totalQty: 0,
        totalAmount: 0
    });

    const [locations, setLocations] = useState([]);
    const [parties, setParties] = useState([]);

    const loadLocations = () => {
        axios.get('/master/data/locations?paginate=no')
            .then(res => {
                setLocations(res.data);
            }).catch(er => {
                toast.current.show({ label: 'Error', severity: 'error', detail: er.message })
            });
    }

    const loadParties = () => {
        axios.get('/master/data/parties/all')
            .then(res => {
                setParties(res.data);
            }).catch(er => {
                toast.current.show({ label: 'Error', severity: 'error', detail: er.message })
            });
    }
    useEffect(() => {
        loadLocations();
        loadParties();
    }, []);


    const handleSubmit = (e) => {
        e.preventDefault();
        const bookingData = {
            manifest_id: formInfo.manifest_id,
            cn_no: formInfo.cn_no,
            cewb: formInfo.cewb,
            cewb_expires: formInfo.cewb_expires,
            consignor: formInfo.consignor,
            consignee: formInfo.consignee,
            amount: processedData.totalAmount,
            remarks: formInfo.remarks,
            ship_to_party: formInfo.ship_to_party,
            party_location: formInfo.ship_to_party ? formInfo.party_location : ''
        };

        const bookingItemsData = itemList.map(item => ({
            invoice_no: item.invoice_no,
            invoice_date: item.invoice_date,
            amount: item.amount,
            weight: item.weight,
            remarks: item.remarks,
            itemsInfo: item.itemsInfo.map(itemInfo => ({
                item_name: itemInfo.name,
                quantity: itemInfo.qty
            }))
        }));


        if (bookingData && bookingItemsData.length > 0) {
            axios.post('/data/booking/new', { bookingData, bookingItemsData })
                .then(res => {
                    reload();
                    setFormInfo({
                        manifest_id: '',
                        cn_no: '',
                        cewb: '',
                        cewb_expires: '',
                        consignor: '',
                        consignee: '',
                        amount: '',
                        remarks: '',
                        ship_to_party: 0,
                        party_location: '',
                    });
                    setItemList([]);
                    setOpenDialog(false);
                })
                .catch(err => {
                    console.log(err.message);
                });
        } else {
            console.log('No booking items data');

        }
    };

    const generateChallanNumber = () => {
        axios.get('/data/last_item/challan').then(res => {
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
                Create New
            </button>
            <Dialog visible={openDialog} header={'New Booking'} modal onHide={() => setOpenDialog(false)} className="rounded-md m-4 w-full p-4 bg-white">

                <form onSubmit={handleSubmit} className="space-y-4 p-4">
                    <div className="items w-full border p-4 rounded-lg shadow-md">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-4">
                            <div className={`col-span-3 flex flex-col`}>
                                <label htmlFor="mani_no" className="mb-2 text-xs font-medium text-gray-700">Lorry Manifest:</label>
                                <select
                                    name="manifest_id"
                                    id="mani_no"
                                    defaultValue={''}
                                    onChange={(e) => setFormInfo({ ...formInfo, manifest_id: e.target.value })}
                                    className="border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2 text-xs"
                                >
                                    <option value="" disabled>Select Manifest</option>
                                    {manifests && manifests.map(mani => {
                                        const tripDate = new Date(mani.trip_date);
                                        const lastMonth = new Date();

                                        // Set the lastMonth to one month ago from today (updated 2month)
                                        lastMonth.setMonth(lastMonth.getMonth() - 3);

                                        // Compare tripDate with lastMonth
                                        if (tripDate >= lastMonth) {
                                            return (
                                                <option key={mani.id} value={mani.id}>
                                                    {mani.lorry?.lorry_number + '-' + tripDate.toLocaleDateString('en-GB')}
                                                    ({mani.manifest_no})
                                                </option>
                                            );
                                        }
                                        return null;
                                    })}


                                </select>
                            </div>
                            <div className="flex flex-col col-span-2">
                                <label htmlFor="cn_no" className="mb-2 text-xs font-medium text-gray-700">CN no: <span className="text-red-700">*</span> </label>
                                <input type="text"
                                    name="cn_no"
                                    id="cn_no"
                                    value={formInfo.cn_no}
                                    onChange={(e) => setFormInfo({ ...formInfo, cn_no: e.target.value })}
                                    className="bg-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2 text-xs"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="cweb" className="mb-2 text-xs font-medium text-gray-700">CWEB:</label>
                                <input type="text"
                                    name="cweb"
                                    id="cweb"
                                    value={formInfo.cweb}
                                    onChange={(e) => setFormInfo({ ...formInfo, cweb: e.target.value })}
                                    className="border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2 text-xs"
                                />
                            </div>

                           

                            <div className={`col-span-3 flex flex-col `}>
                                <label htmlFor="consignor" className="mb-2 text-xs font-medium text-gray-700">Consignor:</label>
                                <select
                                    name="consignor"
                                    id="consignor"
                                    defaultValue={''}
                                    onChange={(e) => setFormInfo({ ...formInfo, consignor: e.target.value })}
                                    className="border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2 text-xs"
                                >
                                    <option value="" disabled>Select Consignor</option>
                                    {parties && parties.map(party => {
                                        if (party.id == formInfo.consignee) return null;
                                        if (!party.is_consignor) return null;
                                        return (<option key={party.id} value={party.id}>{party.name}</option>);
                                    })}
                                </select>
                            </div>

                            <div className={`col-span-3 flex flex-col `}>
                                <div className="flex justify-between items-center">
                                    <label htmlFor="consignee" className="mb-2 text-xs font-medium text-gray-700">Consignee:</label>
                                    <NewConsignee parties={parties} reload={loadParties} toast={toast} locations={locations} />
                                </div>
                                <select
                                    name="consignee"
                                    id="consignee"
                                    defaultValue={''}
                                    onChange={(e) => setFormInfo({ ...formInfo, consignee: e.target.value })}
                                    className="border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2 text-xs"
                                >
                                    <option value="" disabled>Select Consignee</option>
                                    {parties && parties.map(party => {
                                        if (party.id == formInfo.consignor) return null;
                                        if (party.is_consignor) return null;
                                        return (<option key={party.id} value={party.id}>{party.name}</option>);
                                    })}
                                </select>
                            </div>

                        </div>
                        {/* ship to party ? */}
                        <div className="flex flex-col my-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="ship_to_party"
                                    id="ship_to_party"
                                    defaultChecked={formInfo.ship_to_party}
                                    onChange={(e) => setFormInfo({ ...formInfo, ship_to_party: e.target.checked })}
                                    className=''
                                />
                                <label className="cursor-pointer text-xs" htmlFor="ship_to_party">Ship to party?</label>
                            </div>
                        </div>

                        {formInfo.ship_to_party ? (
                            <input
                                type="text"
                                name="party_location"
                                id="party_location"
                                placeholder='Party Location'
                                required
                                value={formInfo.party_location}
                                onChange={(e) => setFormInfo({ ...formInfo, party_location: e.target.value })}
                                className="border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2 text-xs"
                            />
                        ) : ''}
                    </div>

                    <BookingItems {...props} itemList={itemList} setItemList={setItemList} setProcessedData={setProcessedData} />

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
                                    Submit
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </Dialog>
        </>
    );
}
export default AddNewItem;


const BookingItems = (props) => {
    const { toast, items, setProcessedData, itemList, setItemList } = props;
    const [formItem, setFormItem] = useState({
        invoice_no: '',
        invoice_date: new Date(),
        amount: 0,
        itemsInfo: items.map(ix => ({ name: ix.name, qty: 0 })),
        weight: 0,
        remarks:''
    });

    const handleItemInfoChange = (updatedItem) => {
        updatedItem.qty = isNaN(parseInt(updatedItem.qty, 10)) ? 0 : parseInt(updatedItem.qty, 10);
        if (updatedItem.qty >= 0) {
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
            remarks:''
        });
    }

    useEffect(() => {
        reloadForm();
    }, []);


    const AddItemQty = async (e) => {
        e.preventDefault();

        const formQty = formItem.itemsInfo?.length > 0 ? formItem.itemsInfo.reduce((acc, itemInfo) => acc + parseInt(itemInfo.qty || 0), 0) : 0;
        if (!formItem.invoice_no || formItem.invoice_no.length < 3) {
            formItem.invoice_no = 'NA';
        } else {
            const inList = itemList.some(il => il.invoice_no === formItem.invoice_no);
            if (inList) {
                toast.current.show({ label: 'Error', severity: 'error', detail: 'Duplicate Invoice entry !' });
                return false;
            }
        }

        if (formItem.amount < 0) {
            toast.current.show({ label: 'Error', severity: 'error', detail: 'Enter Amount' });
            return false
        };

        if (formQty <= 0) {
            toast.current.show({ label: 'Error', severity: 'error', detail: 'Enter Items Quantities' });
            return false
        };

        if (formItem.weight < 0) {
            toast.current.show({ label: 'Error', severity: 'error', detail: 'Enter weight' });
            return false
        };


        try {
            const res = await axios.post('/data/invoice/check', { invoice_no: formItem.invoice_no });

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
            } else {
                toast.current.show({ label: 'Error', severity: 'error', detail: 'Invoice has been already submitted. Please enter another invoice number' });
            }
        } catch (err) {
            toast.current.show({ label: 'Error', severity: 'error', detail: err.message });
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
                        <th className="border border-gray-200 p-2 text-sm max-w-[60px]">Remark</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {itemList.map((itm, index) => (
                        <tr key={index}>
                            <td className="border border-gray-200 text-center text-sm max-w-[100px]">{itm.invoice_no}</td>
                            <td className="border border-gray-200 text-center text-sm max-w-[60px]">
                                {new Date(itm.invoice_date).toLocaleDateString('en-GB')}
                            </td>
                            <td className="border border-gray-200 text-center text-sm max-w-[60px]">
                                {itm.amount}
                            </td>
                            {itm.itemsInfo.map((itemInfo, i) => (
                                <td key={i} className="border border-gray-200 text-center text-sm max-w-[40px]">
                                    {itemInfo.qty}
                                </td>
                            ))}
                            <td className="border border-gray-200 text-center text-sm max-w-[60px]">
                                {itm.weight}
                            </td>
                            <td className="border border-gray-200 text-center text-sm max-w-[60px]">
                                {itm.remarks}
                            </td>
                            <td className="border border-gray-200 text-center text-sm max-w-[60px]">
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
                                onChange={e => setFormItem({ ...formItem, invoice_no: e.target.value })}
                                className="w-full text-xs border-none outline-none focus:ring-0 rounded-sm shadow-xs px-2 text-center"
                                placeholder='Invoice Number'
                            />
                        </td>
                        <td className="border border-gray-200 text-center text-sm max-w-[60px]">
                            <DatePicker
                                selected={formItem.invoice_date}
                                locale="en-IN"
                                dateFormat="dd/MM/yyyy"
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
                                value={parseInt(formItem.amount) ? parseInt(formItem.amount): 0}
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
                                value={parseInt(formItem.weight) ? parseInt(formItem.weight): 0}
                                onChange={(e) => setFormItem({ ...formItem, weight: e.target.value })}
                                className="w-full text-xs  border-none outline-none focus:ring-0 rounded-sm shadow-xs px-2 text-center"
                                placeholder='Gross Weight'
                            />
                        </td>
                        <td className="border border-gray-200 text-center text-sm max-w-[60px]">
                            <input type="text"
                                name="remarks"
                                id="remarks"
                                value={formItem.remarks}
                                onChange={(e) => setFormItem({ ...formItem, remarks: e.target.value })}
                                className="w-full text-xs  border-none outline-none focus:ring-0 rounded-sm shadow-xs px-2 text-center"
                                placeholder='Remark'
                            />
                        </td>
                        <td className="border border-gray-200 text-center text-sm max-w-[60px]">
                            <IconButton onClick={AddItemQty}>
                                <PlusIcon className='h-4 w-4 text-green-600' />
                            </IconButton>
                        </td>
                    </tr>


                    {itemList && itemList.length < 4 && Array.from({ length: Math.max(0, 4 - itemList.length) }).map((_, index) => (
                        <tr key={`form-${index}`}>
                            <td className="border border-gray-200 text-center text-sm max-w-[100px]"></td>
                            <td className="border border-gray-200 text-center text-sm max-w-[60px]"></td>
                            <td className="border border-gray-200 text-center text-sm max-w-[60px]"></td>
                            {items.map((itm, i) => (
                                <td key={i} className="border border-gray-200 text-center text-sm max-w-[40px]"></td>
                            ))}
                            <td className="border border-gray-200 text-center text-sm max-w-[60px]"></td>
                            <td className="border border-gray-200 text-center text-sm max-w-[60px]"></td>
                            <td className="border border-gray-200 text-center text-sm max-w-[60px]">
                                <IconButton disabled>
                                    <PlusIcon className='h-4 w-4 text-gray-200' />
                                </IconButton>
                            </td>
                        </tr>
                    ))}

                </tbody>
            </table>
        </div>
    );
};


const NewConsignee = (props) => {
    const { parties, toast, reload, locations } = props;
    const [openDialog, setOpenDialog] = useState(false);


    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const formData = new FormData(e.target);
        const name = formData.get("name");
        const location_id = formData.get("location_id");
        const address = formData.get("address");
        const phone = formData.get("phone");
        const email = formData.get("email");
        const pin = formData.get("pin");
        const cin = formData.get("cin");
        const gstin = formData.get("gstin");

        let exists = parties.some(pr => pr.name === name);

        if (exists) {
            toast.current.show({ label: 'Error', severity: 'error', detail: 'Lorry number already added !' })
            return;
        } else {
            axios.post("/master/data/new/party", {
                name, location_id, address, phone, email, pin, cin, gstin,
            })
                .then(res => {
                    toast.current.show({ label: 'Success', severity: 'success', detail: res.data.message });
                    reload();
                    setOpenDialog(false);
                })
                .catch(err => toast.current.show({ label: 'Error', severity: 'error', detail: err.message }));
        }
    }

    return (
        <>
            <span onClick={() => setOpenDialog(true)} className='text-xs font-bold underline cursor-pointer '>Add new</span>
            <Dialog visible={openDialog} modal onHide={() => setOpenDialog(false)} className="rounded-md m-4 w-full md:w-1/2 p-4 bg-white">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">

                        <div className="flex flex-col">
                            <label htmlFor="name" className="mb-2 text-xs font-medium text-gray-700">Name</label>
                            <input type="text" name="name" id="name" className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4" />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="location_name" className="mb-2 text-xs font-medium text-gray-700">Location</label>
                            <select
                                name="location_id"
                                id="location_name"
                                defaultValue={''}
                                className='border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4'>
                                <option value="" disabled>Select location</option>
                                {locations && locations.length && locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="phone" className="mb-2 text-xs font-medium text-gray-700">Phone No</label>
                            <input type="text" name="phone" id="phone" className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4" />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="email" className="mb-2 text-xs font-medium text-gray-700">Email</label>
                            <input type="email" name="email" id="email" className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4" />
                        </div>

                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="address" className="mb-2 text-xs font-medium text-gray-700">Address</label>
                        <textarea name="address" id="address" rows={2} className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4"></textarea>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <label htmlFor="pin" className="mb-2 text-xs font-medium text-gray-700">Pin</label>
                            <input type="number" name="pin" id="pin" required className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4" />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="cin" className="mb-2 text-xs font-medium text-gray-700">CIN</label>
                            <input type="text" name="cin" id="cin" className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4" />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="gstin" className="mb-2 text-xs font-medium text-gray-700">GSTIN</label>
                            <input type="text" name="gstin" id="gstin" className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4" />
                        </div>
                    </div>

                    <button type="submit" className="px-4 py-2 font-semibold text-white bg-teal-500 rounded-md shadow-sm hover:bg-teal-600">
                        Submit
                    </button>
                </form>
            </Dialog>
        </>
    )
}

const NewBookingItems = (props) => {
    const { items, setProcessedData, itemList, setItemList } = props;
    const [formItem, setFormItem] = useState({
        invoice_no: '',
        invoice_date: new Date(),
        amount: 0,
        itemsInfo: [],
        weight: 0
    });


    return (
        <div className="p-2">
            <table className="w-full mt-4 border-collapse border border-gray-200">
                <thead>
                    <tr>
                        <th className="border border-gray-200 p-2 text-sm max-w-[100px]">Invoice No</th>
                        <th className="border border-gray-200 p-2 text-sm max-w-[60px]">Invoice Date</th>
                        <th className="border border-gray-200 p-2 text-sm max-w-[60px]">Amount</th>
                        {items.map((itm, i) => (
                            <th key={i} className="border border-gray-200 p-2 text-sm max-w-[40px]">{itm.name}(Qty)</th>
                        ))}
                        <th className="border border-gray-200 p-2 text-sm max-w-[60px]">Weight(KG)</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {itemList.map((itm, index) => (
                        <tr key={index}>
                            <td className="border border-gray-200 text-center p-2 text-sm max-w-[100px]">{itm.invoice_no}</td>
                            <td className="border border-gray-200 text-center p-2 text-sm max-w-[60px]">{new Date(itm.invoice_date).toLocaleDateString('en-GB')}</td>
                            <td className="border border-gray-200 text-center p-2 text-sm max-w-[60px]">{itm.amount}</td>
                            {itm.itemsInfo.map((itemInfo, i) => (
                                <td key={i} className="border border-gray-200 text-center p-2 text-sm max-w-[40px]">{itemInfo.qty}</td>
                            ))}
                            <td className="border border-gray-200 text-center p-2 text-sm max-w-[60px]">{itm.weight}</td>
                            <td className="border border-gray-200 text-center p-2 text-sm max-w-[60px]">
                                <IconButton onClick={() => removeItem(index)}>
                                    <XIcon className='text-orange-600' />
                                </IconButton>
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td className="border border-gray-200 text-center text-sm max-w-[100px]">
                            <input type="text"
                                name="invoice_no"
                                id="inv_no"
                                value={formItem.invoice_no}
                                onChange={e => setFormItem({ ...formItem, invoice_no: e.target.value })}
                                className="w-full text-xs border-gray-200 focus:border-gray-500 focus:ring-0 rounded-sm shadow-xs px-2"
                            />
                        </td>
                        <td className="border border-gray-200 text-center text-sm max-w-[60px]">
                            <input className='w-full border-none outline-none' type="date" name="" id="" />
                        </td>
                        <td className="border border-gray-200 text-center text-sm max-w-[60px]">
                            <input className='w-full border-none outline-none' type="text" />
                        </td>
                        {items.map((itm, i) => (
                            <td key={i} className="border border-gray-200 text-center text-sm max-w-[40px]">
                                <input className='w-full border-none outline-none' type="text" />
                            </td>
                        ))}
                        <td className="border border-gray-200 text-center text-sm max-w-[60px]">
                            <input className='w-full border-none outline-none' type="text" />
                        </td>
                        <td className="border border-gray-200 text-center text-sm max-w-[60px]">
                            <IconButton>
                                <PlusIcon className='text-green-600' />
                            </IconButton>
                        </td>
                    </tr>
                </tbody>

            </table>
        </div>
    );
}
