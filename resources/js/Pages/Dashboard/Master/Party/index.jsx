import { Head } from '@inertiajs/react'
import React, { useEffect, useRef, useState } from 'react'
import { BreadCrumb } from "primereact/breadcrumb";
import { Toast } from "primereact/toast";
import AdminLayout from '@/Layouts/AdminLayout';
import AddNewItem from './AddNewItem';
import ItemsList from './ItemsList';

const index = (props) => {
  const toast = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [parties, setParties] = useState([]);
  const items = [{ label: "Master", url: '/' }, { label: "Parties" }];
  const [locations, setLocations] = useState([]);

  const loadLocations = () => {
    axios.get('/master/data/locations?paginate=no')
      .then(res => {
        setLocations(res.data);
      }).catch(er => {
        toast.current.show({ label: 'Error', severity: 'error', detail: er.message })
      });
  }
  useEffect(() => {
    loadLocations();
  }, []);


  const loadData = (params) => {
    axios.get('/master/data/parties', { params })
      .then(res => {
        setParties(res.data);
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
      <Head title='party-master' />
      <div className="w-full flex flex-col gap-4 items-start ">
        <BreadCrumb model={items} />
        {isLoading ? 'Loading' : (
          <div className="shadow w-full h-full flex flex-col bg-white rounded-lg">
            <div className="flex justify-between my-3 mx-5">
              <h3 className="text-3xl text-slate-600">Parties</h3>
              {privilege > 5 && <AddNewItem reload={loadData} toast={toast} locations={locations} />}
            </div>
            <hr />
            <div className="flex flex-col gap-4">
              <ItemsList parties={parties} reload={loadData} toast={toast} locations={locations} privilege={privilege} />
            </div>
          </div>
        )}
      </div>
      <Toast ref={toast} />
    </AdminLayout>
  )
}

export default index
