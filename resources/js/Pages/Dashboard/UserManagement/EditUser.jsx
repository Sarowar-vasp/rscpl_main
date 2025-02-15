import axios from 'axios';
import { PencilIcon } from 'lucide-react';
import { Dialog } from 'primereact/dialog';
import { TabPanel, TabView } from 'primereact/tabview';
import React, { useState, useEffect } from 'react';

const EditUser = (props) => {
    const { user, reload, branches, roles, privilege } = props;
    const [openDialog, setOpenDialog] = useState(false);
    const [formInfo, setFormInfo] = useState({
        name: '',
        email: '',
        user_role_id: '',
        old_password: '',
        password: '',
        confirm_password: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
            setFormInfo({
                name: user.name,
                email: user.email,
                user_role_id: user.user_role_id,
                old_password: '',
                password: '',
                confirm_password: ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormInfo(prevState => ({ ...prevState, [name]: value }));
    };

    // Handle user details update
    const handleUpdateSubmit = (e) => {
        e.preventDefault();

        let formErrors = {};
        if (!formInfo.name) formErrors.name = 'Name is required';
        if (!formInfo.email) formErrors.email = 'Email is required';
        if (!formInfo.user_role_id) formErrors.user_role_id = 'Role is required';

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        axios.put(`/data/update/user/${user.id}`, {
            name: formInfo.name,
            email: formInfo.email,
            user_role_id: formInfo.user_role_id,
        }).then(res => {
            console.log(res.data);
            reload();
            setOpenDialog(false);
        }).catch(err => {
            console.log(err.message);
        });
    };

    // Handle password change
    const handlePasswordSubmit = (e) => {
        e.preventDefault();

        let formErrors = {};
        if (!formInfo.old_password) formErrors.old_password = 'Old password is required';
        if (!formInfo.password) formErrors.password = 'New password is required';
        if (!formInfo.confirm_password) formErrors.confirm_password = 'Confirm password is required';
        if (formInfo.password !== formInfo.confirm_password) formErrors.confirm_password = 'Confirmation did not match !';

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        axios.put(`/data/change/password/${user.id}`, {
            old_password: formInfo.old_password,
            password: formInfo.password,
            confirm_password: formInfo.confirm_password,
        }).then(res => {
            console.log(res.data);
            reload();
            setOpenDialog(false);
        }).catch(err => {
            console.log(err.message);
        });
    };

    if(privilege < 5) return null;

    return (
        <>
            <button
                onClick={() => setOpenDialog(true)}
                className="hover:bg-blue-300 p-2 shadow-sm my-2 rounded-lg text-blue-700 bg-blue-200"
            >
                <PencilIcon className='w-6 h-6' />
            </button>
            <Dialog
                visible={openDialog}
                modal
                onHide={() => setOpenDialog(false)}
                className="m-4 w-full md:w-1/2 rounded-md p-4 bg-white"
            >
                <TabView>
                    <TabPanel header="Edit User">
                        <div className="px-4">
                            <h2 className="text-xl font-semibold mb-4">Edit User</h2>
                            <form onSubmit={handleUpdateSubmit} className="space-y-4">
                                <div className="">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={formInfo.name}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                        />
                                        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formInfo.email}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                        />
                                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="user_role_id" className="block text-sm font-medium text-gray-700">Role</label>
                                        <select
                                            id="user_role_id"
                                            name="user_role_id"
                                            value={formInfo.user_role_id}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                        >
                                            <option value="">Select a role</option>
                                            {roles.filter(role => role.privilege_index < privilege).map(role => (
                                                <option key={role.id} value={role.id}>{role.name}</option>
                                            ))}
                                        </select>
                                        {errors.user_role_id && <p className="text-red-500 text-sm">{errors.user_role_id}</p>}
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setOpenDialog(false)}
                                        className="p-button-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md"
                                    >
                                        Update
                                    </button>
                                </div>
                            </form>
                        </div>
                    </TabPanel>
                    <TabPanel header="Change Password">
                        <div className="px-4">
                            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="old_password" className="block text-sm font-medium text-gray-700">Old Password</label>
                                    <input
                                        id="old_password"
                                        name="old_password"
                                        type="password"
                                        value={formInfo.old_password}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                    />
                                    {errors.old_password && <p className="text-red-500 text-sm">{errors.old_password}</p>}
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formInfo.password}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                    />
                                    {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                                </div>

                                <div>
                                    <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                    <input
                                        id="confirm_password"
                                        name="confirm_password"
                                        type="password"
                                        value={formInfo.confirm_password}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                    />
                                    {errors.confirm_password && <p className="text-red-500 text-sm">{errors.confirm_password}</p>}
                                </div>

                                <div className="flex justify-end space-x-2 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setOpenDialog(false)}
                                        className="p-button-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md"
                                    >
                                        Change Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    </TabPanel>
                </TabView>

            </Dialog>
        </>
    );
};

export default EditUser;
