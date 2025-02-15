import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import React, { useEffect, useState } from 'react'
import { FaRegTrashAlt } from 'react-icons/fa';
import EditItem from './EditItem';

const ItemsList = (props) => {
    const { parties, reload, privilege } = props;
    const [searchTxt, setSearchTxt] = useState('');
    const [perPage, setPerPage] = useState(10);

    const handleLimitChange = (e) => setPerPage(e.target.value);
    const handleSearch = (e) => setSearchTxt(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''));

    useEffect(() => {
        reload({ per_page: perPage, search: searchTxt });
    }, [perPage, searchTxt]);

    return (
        <div className="p-3 md:px-4 md:py-6 flex flex-col gap-2 rounded-md shadow-sm">
            <div className="flex justify-between px-2">
                <select value={perPage} onChange={handleLimitChange}>
                    {[5, 10, 20, 50, 100].map(num => <option key={num} value={num}>{num}</option>)}
                </select>
                <input type="text" placeholder="Search..." onChange={handleSearch} />
            </div>
            <div className="content px-2">
                {parties && parties.total > 0 ? (
                    <>
                        <table className="w-full border">
                            <thead>
                                <tr>
                                    <th className="text-center">Sl.</th>
                                    <th className="text-left">Name</th>
                                    <th className="text-left">Location</th>
                                    <th className="text-left">Address</th>
                                    <th className="text-left">Phone No</th>
                                    <th className="text-left">Email</th>
                                    <th className="text-left">Pin</th>
                                    <th className="text-left">CIN</th>
                                    <th className="text-left">GSTIN</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {parties.data.map((party, i) => (
                                    <tr key={i} className="border">
                                        <td className="text-center py-2">{i + (parties.per_page * (parties.current_page - 1)) + 1}</td>
                                        <td className="capitalize">
                                            <div className="">
                                                <span>{party.name}</span>
                                                {party.is_consignor ? <span className='text-xs mx-1 px-1 bg-black text-white rounded-full'>Consignor</span> : null}
                                            </div>
                                        </td>
                                        <td className="capitalize">{party.location?.name}</td>
                                        <td className="capitalize">{party.address}</td>
                                        <td className="capitalize">{party.phone}</td>
                                        <td className="capitalize">{party.email}</td>
                                        <td className="capitalize">{party.pin}</td>
                                        <td className="capitalize">{party.cin}</td>
                                        <td className="capitalize">{party.gstin}</td>
                                        <td className="flex gap-4 justify-start items-center">
                                            {privilege > 5 && <EditItem {...props} party={party} />}
                                            {privilege > 10 && !party.is_consignor && <DeleteItem {...props} party={party} />}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Pagination parties={parties} reload={reload} perPage={perPage} searchTxt={searchTxt} />
                    </>
                ) : <span>No party found!</span>}
            </div>
            <ConfirmDialog className="rounded-md bg-white p-4" />
        </div>
    );
}

export default ItemsList



const Pagination = ({ parties, reload, perPage, searchTxt }) => (
    <div className="flex justify-between p-4">
        <span>Showing {parties.from} to {parties.to} of {parties.total} items</span>
        <ul className="flex gap-3">
            {parties.links.map((link, index) => {
                let page = 1;
                if (link.url) {
                    const urlParams = new URLSearchParams(new URL(link.url).search);
                    page = urlParams.get('page');
                }
                return (
                    <li key={index} className={`text-md font-semibold ${link.active ? 'underline' : ''}`}>
                        <button onClick={() => reload({ page, per_page: perPage, search: searchTxt })} dangerouslySetInnerHTML={{ __html: link.label }} />
                    </li>
                );
            })}
        </ul>
    </div>
);

const DeleteItem = ({ reload, toast, party }) => {
    const accept = () => {
        axios.delete(`/master/data/party/${party.id}`)
            .then(res => {
                toast.current.show({ label: 'Success', severity: 'success', detail: res.data.message });
                reload();
            })
            .catch(err => toast.current.show({ label: 'Error', severity: 'error', detail: err.message }));
    };

    const handleConfirm = () => {
        confirmDialog({
            message: 'Do you want to delete this record?',
            header: 'Delete Confirmation',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept
        });
    };

    return (
        <button onClick={handleConfirm} className="text-sm font-semi-bold p-1 rounded">
            <FaRegTrashAlt className="w-6 h-6 text-red-500 hover:text-red-700" />
        </button>
    );
};