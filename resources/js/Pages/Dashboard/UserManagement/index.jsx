import AdminLayout from '@/Layouts/AdminLayout'
import { Head, useForm } from '@inertiajs/react'
import { BreadCrumb } from 'primereact/breadcrumb'
import React, { useEffect, useState } from 'react'
import UsersList from './UsersList'
import { Dialog } from 'primereact/dialog'
import AddNewUser from './AddNewUser'

const index = (props) => {
    const [users, setUsers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [roles, setRoles] = useState([]);

    const privilege = props.auth.user.role.privilege_index;

    const items = [
        { label: "Administration", url: '#' },
        { label: "User Management" }
    ];

    const loadData = () => {
        axios.get('/data/users').then(res => {
            setUsers(res.data);
        }).catch(err => {
            console.log(err.message);
        });
    }
    const loadBranches = () => {
        axios.get('/master/data/branches/all').then(res => {
            setBranches(res.data);
        }).catch(err => {
            console.log(err.message);
        });
    }
    const loadRoles = () => {
        axios.get('/master/data/roles/all').then(res => {
            setRoles(res.data);
        }).catch(err => {
            console.log(err.message);
        });
    }

    useEffect(() => {
        loadData();
        loadBranches();
        loadRoles();
    }, [])

    return (
        <AdminLayout
            user={props.auth?.user}
            page="User"
        >
            <Head title="User Management" />
            <div className="w-full flex flex-col gap-4 items-start relative">
                <BreadCrumb model={items} className='py-2 text-gray-500' />
                <div className="shadow w-full h-full flex flex-col bg-white rounded-lg my-4 p-6">
                    <div className="flex justify-between items-end">
                        <h3 className="text-3xl text-slate-600">Users</h3>
                        <AddNewUser
                            reload={loadData}
                            privilege={privilege}
                            branches={branches}
                            roles={roles}
                        />
                    </div>
                    <hr className='my-4' />
                    <UsersList
                        users={users}
                        reload={loadData}
                        privilege={privilege}
                        branches={branches}
                        roles={roles}
                        {...props}
                    />
                </div>
            </div>
        </AdminLayout>
    )
}

export default index
