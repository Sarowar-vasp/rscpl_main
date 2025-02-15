import AdminLayout from '@/Layouts/AdminLayout'
import { Head } from '@inertiajs/react'
import axios from 'axios'
import { BreadCrumb } from 'primereact/breadcrumb'
import { Toast } from 'primereact/toast'
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useRef } from 'react'
import { Dialog } from 'primereact/dialog'
import { FaEdit, FaTrash } from 'react-icons/fa'

const RateItems = (props) => {
  const toast = useRef(null);
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const items = [{ label: "Master", url: '/' }, { label: "Rates" }];
  const [searchTxt, setSearchTxt] = useState('');
  const [perPage, setPerPage] = useState(10);

  const loadData = (params) => {
    setLoading(true);
    axios.get('/master/data/rates', { params })
      .then((response) => {
        setRates(response.data);
      })
      .catch((error) => {
        toast.current.show({ severity: 'error', summary: 'Error', detail: error.response?.data?.message, life: 3000 });
      }).finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData({ page: 1, per_page: perPage, order_by: 'beat_no', order: 'asc', search: searchTxt });
  }, [perPage, searchTxt]);

  const privilege = props.auth.user.role.privilege_index;

  return (
    <AdminLayout user={props.auth?.user} page="Master">
      <Head title='rate-master' />
      <div className="w-full flex flex-col gap-4 items-start">
        <BreadCrumb model={items} />
        {loading ? 'Loading' : (
          <div className="shadow w-full h-full flex flex-col bg-white rounded-lg">
            <div className="flex justify-between my-3 mx-5">
              <h3 className="text-3xl text-slate-600">Rates</h3>
              {privilege > 5 && <AddNewRate reload={loadData} toast={toast} />}
            </div>
            <hr />
            <div className="flex flex-col gap-4">
              <RateList rates={rates} reload={loadData} toast={toast} privilege={privilege} perPage={perPage} setPerPage={setPerPage} searchTxt={searchTxt} setSearchTxt={setSearchTxt} />
            </div>
          </div>
        )}
      </div>
      <Toast ref={toast} />
    </AdminLayout>
  )
}

export default RateItems

const RateList = (props) => {
  const { rates, reload, privilege, perPage, setPerPage, searchTxt, setSearchTxt } = props;
  const handleLimitChange = (e) => setPerPage(e.target.value);
  const handleSearch = (e) => setSearchTxt(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''));

  return (
    <div className="p-3 md:px-4 md:py-6 flex flex-col gap-2 rounded-md shadow-sm">
      <div className="flex justify-between px-2">
        <div className="min-w-[200px]">
          <select value={perPage} onChange={handleLimitChange} className="border rounded px-2 py-1 w-full">
            {[5, 10, 20, 50, 100].map(num => <option key={num} value={num}>{num}</option>)}
          </select>
        </div>
        <input
          type="text"
          defaultValue={searchTxt}
          placeholder="Search..."
          onBlur={handleSearch}
          className="border rounded px-2 py-1"
        />
      </div>
      <div className="content px-2">
        {rates && rates.total > 0 ? (
          <>
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-center p-2">Sl.</th>
                  <th className="text-left p-2">Beat No</th>
                  <th className="text-left p-2">Rate</th>
                  <th className="text-center p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rates.data.map((rate, i) => (
                  <tr key={i} className="border-b">
                    <td className="text-center py-2">{i + (rates.per_page * (rates.current_page - 1)) + 1}</td>
                    <td className="capitalize py-2">{rate.beat_no}</td>
                    <td className="py-2">{rate.rate}</td>
                    <td className="flex gap-4 justify-center items-center py-2">
                      {privilege > 5 && <EditRate {...props} rate={rate} />}
                      {privilege > 10 && <DeleteRate {...props} rate={rate} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination rates={rates} reload={reload} perPage={perPage} searchTxt={searchTxt} />
          </>
        ) : <span className="text-gray-500 italic">No rate found!</span>}
      </div>
    </div>
  );
}

const AddNewRate = ({ reload, toast }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    beat_no: '',
    rate: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("/master/data/new/rate", formData)
      .then(res => {
        toast.current.show({ severity: 'success', summary: 'Success', detail: res.data.message, life: 3000 });
        reload();
        setOpenDialog(false);
      })
      .catch(err => toast.current.show({ severity: 'error', summary: 'Error', detail: err.response?.data?.message, life: 3000 }));
  };

  return (
    <>
      <button onClick={() => setOpenDialog(true)} className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semi-bold py-2 px-3 rounded">
        Create New Rate
      </button>
      <Dialog visible={openDialog} modal onHide={() => setOpenDialog(false)} className="rounded-md m-4 w-full md:w-1/2 p-4 bg-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="beat_no" className="mb-1">Beat No</label>
            <input
              type="text"
              id="beat_no"
              name="beat_no"
              value={formData.beat_no}
              onChange={handleChange}
              className="border rounded px-2 py-1"
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="rate" className="mb-1">Rate</label>
            <input
              type="number"
              id="rate"
              name="rate"
              value={formData.rate}
              onChange={handleChange}
              className="border rounded px-2 py-1"
              required
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Submit
          </button>
        </form>
      </Dialog>
    </>
  );
}

const EditRate = ({ reload, toast, rate }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    beat_no: rate.beat_no,
    rate: rate.rate,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`/master/data/rate/${rate.id}`, formData)
      .then(res => {
        toast.current.show({ severity: 'success', summary: 'Success', detail: res.data.message, life: 3000 });
        reload();
        setOpenDialog(false);
      })
      .catch(err => toast.current.show({ severity: 'error', summary: 'Error', detail: err.response?.data?.message, life: 3000 }));
  };

  return (
    <>
      <button onClick={() => setOpenDialog(true)} className="text-sm font-semi-bold p-1 rounded">
        <FaEdit className="w-5 h-5 text-blue-500 hover:text-blue-700" />
      </button>
      <Dialog visible={openDialog} onHide={() => setOpenDialog(false)} header="Edit Rate" className="w-1/2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="beat_no" className="mb-1">Beat No</label>
            <input
              type="text"
              id="beat_no"
              name="beat_no"
              value={formData.beat_no}
              onChange={handleChange}
              className="border rounded px-2 py-1"
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="rate" className="mb-1">Rate</label>
            <input
              type="number"
              id="rate"
              name="rate"
              value={formData.rate}
              onChange={handleChange}
              className="border rounded px-2 py-1"
              required
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Update
          </button>
        </form>
      </Dialog>
    </>
  );
}

const DeleteRate = ({ reload, toast, rate }) => {
  const [openDialog, setOpenDialog] = useState(false);

  const handleDelete = () => {
    axios.delete(`/master/data/rate/${rate.id}`)
      .then(res => {
        toast.current.show({ severity: 'success', summary: 'Success', detail: res.data.message, life: 3000 });
        reload();
        setOpenDialog(false);
      })
      .catch(err => toast.current.show({ severity: 'error', summary: 'Error', detail: err.response?.data?.message, life: 3000 }));
  };

  return (
    <>
      <button onClick={() => setOpenDialog(true)} className="text-sm font-semi-bold p-1 rounded">
        <FaTrash className="w-5 h-5 text-red-500 hover:text-red-700" />
      </button>
      <Dialog visible={openDialog} onHide={() => setOpenDialog(false)} header="Delete Rate" className="w-1/3">
        <p>Are you sure you want to delete this rate?</p>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setOpenDialog(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Cancel
          </button>
          <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Delete
          </button>
        </div>
      </Dialog>
    </>
  );
}


const Pagination = ({ rates, reload, perPage, searchTxt }) => (
	<div className="flex justify-between p-4">
		<span>Showing {rates.from} to {rates.to} of {rates.total} items</span>
		<ul className="flex gap-3">
			{rates.links.map((link, index) => {
				let page = 1;
				if (link.url) {
					const urlParams = new URLSearchParams(new URL(link.url).search);
					page = urlParams.get('page');
				}
				return (
					<li key={index} className={`text-md font-semibold ${link.active ? 'underline' : ''}`}>
						<button
							onClick={() => reload({ page, per_page: perPage, search: searchTxt })}
							dangerouslySetInnerHTML={{ __html: link.label }}
							className={`px-2 py-1 rounded ${link.active ? 'bg-blue-500 text-white' : 'text-blue-500'}`}
						/>
					</li>
				);
			})}
		</ul>
	</div>
);