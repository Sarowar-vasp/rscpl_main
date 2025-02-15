import { Head } from '@inertiajs/react'
import React, { useEffect, useRef, useState } from 'react'
import { BreadCrumb } from "primereact/breadcrumb";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { FaRegEdit, FaRegTrashAlt } from "react-icons/fa";
import AdminLayout from '@/Layouts/AdminLayout';
import { InputSwitch } from 'primereact/inputswitch';

const index = (props) => {
  const toast = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const bcitems = [{ label: "Master", url: '/' }, { label: "Items" }];

  const [units, setUnits] = useState([]);

  const loadUnits = () => {
    axios.get('/master/data/itemunits')
      .then(res => {
        setUnits(res.data);
      }).catch(er => {
        toast.current.show({ label: 'Error', severity: 'error', detail: er.message })
      });
  }
  useEffect(() => {
    loadUnits();
  }, []);

  const loadData = (params) => {
    axios.get('/master/data/items', { params })
      .then(res => {
        setItems(res.data);
        setIsLoading(false);
      }).catch(er => {
        toast.current.show({ label: 'Error', severity: 'error', detail: er.message })
        setIsLoading(false);
      });
  }

  useEffect(() => {
    loadData({ page: 1, per_page: 10, order_by: 'name', order: 'asc', search: '' });
  }, []);
  const privilege = props.auth.user.role.privilege_index;

  return (
    <AdminLayout
      user={props.auth?.user}
      page="Master"
    >
      <Head title='item-master' />
      <div className="w-full flex flex-col gap-4 items-start">
        <BreadCrumb model={bcitems} />
        {isLoading ? 'Loading' : (
          <div className="shadow w-full h-full flex flex-col">
            <div className="flex justify-between my-3 mx-5">
              <h3 className="text-3xl text-slate-600">Items</h3>
              {privilege > 5 && <AddNewItem reload={loadData} toast={toast} units={units} />}
            </div>
            <hr />
            <div className="flex flex-col gap-4">
              <ItemsList items={items} reload={loadData} toast={toast} units={units} privilege={privilege} />
            </div>
          </div>
        )}
      </div>
      <Toast ref={toast} />
    </AdminLayout>
  )
}

export default index


const ItemsList = (props) => {
  const { items, reload, privilege } = props;
  const [searchTxt, setSearchTxt] = useState('');
  const [perPage, setPerPage] = useState(10);

  const handleLimitChange = (e) => setPerPage(e.target.value);
  const handleSearch = (e) => setSearchTxt(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''));

  useEffect(() => {
    reload({ per_page: perPage, search: searchTxt });
  }, [perPage, searchTxt]);


  return (
    <div className="p-3 md:px-4 md:py-6 flex flex-col gap-2 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between px-2">
        <select value={perPage} onChange={handleLimitChange}>
          {[5, 10, 20, 50, 100].map(num => <option key={num} value={num}>{num}</option>)}
        </select>
        <input type="text" placeholder="Search..." onChange={handleSearch} />
      </div>
      <div className="content px-2">
        {items && items.total > 0 ? (
          <>
            <table className="w-full border">
              <thead>
                <tr>
                  <th className="text-center">Sl.</th>
                  <th className="text-left">Name</th>
                  <th className="text-left">Unit</th>
                  <th className="text-left">Description</th>
                  <th className="text-left">Has Remark</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.data.map((item, i) => {
                  return (
                    <tr key={i} className="border">
                      <td className="text-center py-2">{i + (items.per_page * (items.current_page - 1)) + 1}</td>
                      <td className="capitalize">{item.name}</td>
                      <td className="capitalize">{item.unit?.name}</td>
                      <td className="capitalize">{item.description}</td>
                      <td className="capitalize">{item.has_remark ? 'Yes': 'No'}</td>
                      <td className="flex gap-4 justify-center items-center">
                        {privilege > 5 && <EditItem {...props} item={item} />}
                        {privilege > 10 && <DeleteItem {...props} item={item} />}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <Pagination items={items} reload={reload} perPage={perPage} searchTxt={searchTxt} />
          </>
        ) : <span>No item found!</span>}
      </div>
      <ConfirmDialog className="rounded-md bg-white p-4" />
    </div>
  );
}

const Pagination = ({ items, reload, perPage, searchTxt }) => (
  <div className="flex justify-between p-4">
    <span>Showing {items.from} to {items.to} of {items.total} items</span>
    <ul className="flex gap-3">
      {items.links.map((link, index) => {
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

// operation
const AddNewItem = ({ reload, toast, units }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [hasRemark, setHasRemark] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const unit_id = formData.get("unit_id");
    const description = formData.get("description");

    axios.post("/master/data/new/item", {
      name,
      unit_id,
      description,
      has_remark: hasRemark
    })
      .then(res => {
        toast.current.show({ label: 'Success', severity: 'success', detail: res.data.message });
        reload();
        setOpenDialog(false);
      })
      .catch(err => toast.current.show({ label: 'Error', severity: 'error', detail: err.message }));
  };


  return (
    <>
      <button onClick={() => setOpenDialog(true)} className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semi-bold py-2 px-3 rounded">
        Create New
      </button>
      <Dialog visible={openDialog} modal onHide={() => setOpenDialog(false)} className="rounded-md m-4 w-full md:w-1/2 p-4 bg-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="name" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Name</label>
            <input type="text" name="name" id="name" className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4" />
          </div>

          <div className="flex flex-col">
            <label htmlFor="unit_name" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Unit</label>
            <select
              name="unit_id"
              id="unit_name"
              defaultValue={''}
              className='border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4'>
              <option value="" disabled>Select Unit</option>
              {units && units.total > 0 && units.data.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="description" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" id="description" rows={2} className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4"></textarea>
          </div>

          <div className="flex flex-col cursor-pointer" onClick={() =>setHasRemark(!hasRemark)}>
            <label htmlFor="has_remark" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Has Remark</label>
            <InputSwitch checked={hasRemark} name="has_remark" id="has_remark" />
          </div>

          <button type="submit" className="px-4 py-2 font-semibold text-white bg-teal-500 rounded-md shadow-sm hover:bg-teal-600">
            Submit
          </button>
        </form>
      </Dialog>
    </>
  );
}

const EditItem = ({ reload, toast, item, units }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [hasRemark, setHasRemark] = useState(item.has_remark);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const unit_id = formData.get("unit_id");
    const description = formData.get("description");

    axios.put(`/master/data/item/${item.id}`, {
      name,
      unit_id,
      description,
      has_remark: hasRemark
    })
      .then(res => {
        toast.current.show({ label: 'Success', severity: 'success', detail: res.data.message });
        reload();
        setOpenDialog(false);
      })
      .catch(err => toast.current.show({ label: 'Error', severity: 'error', detail: err.message }));
  };

  return (
    <>
      <button onClick={() => setOpenDialog(true)} className="text-sm font-semi-bold p-1 rounded">
        <FaRegEdit className="w-6 h-6 text-teal-500 hover:text-teal-600" />
      </button>
      <Dialog visible={openDialog} modal onHide={() => setOpenDialog(false)} className="rounded-md m-4 w-full md:w-1/2 p-4 bg-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="name" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Name</label>
            <input type="text" name="name" id="name" required defaultValue={item.name} className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4" />
          </div>

          <div className="flex flex-col">
            <label htmlFor="unit_name" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Unit</label>
            <select
              name="unit_id"
              id="unit_name"
              defaultValue={item.unit_id}
              className='border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4'>
              <option value="" disabled>Select Unit</option>
              {units && units.total > 0 && units.data.map(unit => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="description" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" id="description" defaultValue={item.description} rows={2} className="border-teal-100 focus:border-teal-500 focus:ring-0 rounded-sm shadow-xs px-4"></textarea>
          </div>

          <div className="flex flex-col cursor-pointer" onClick={() =>setHasRemark(!hasRemark)}>
            <label htmlFor="has_remark" className="mb-2 text-xs md:text-sm font-medium text-gray-700">Has Remark</label>
            <InputSwitch checked={hasRemark} name="has_remark" id="has_remark" />
          </div>

          <button type="submit" className="px-4 py-2 font-semibold text-white bg-teal-500 rounded-md shadow-sm hover:bg-teal-600">
            Submit
          </button>
        </form>
      </Dialog>
    </>
  );
};

const DeleteItem = ({ reload, toast, item }) => {
  const accept = () => {
    axios.delete(`/master/data/item/${item.id}`)
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