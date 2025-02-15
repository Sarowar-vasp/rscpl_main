import axios from 'axios';
import { Dialog } from 'primereact/dialog';
import React, { useState } from 'react'

const AddNewUser = (props) => {
    const { reload, branches, roles, privilege } = props;
    const [openDialog, setOpenDialog] = useState(false);

    const [formInfo, setFormInfo] = useState({
        name: '',
        email: '',
        password: '',
        confirm_password: '',
        role_id: '',
        branch_id: ''
    });
    const [errors, setErrors] = useState({});

    // Filter roles based on logged-in user's privilege
    const selectableRoles = roles.filter(role => role.privilege_index < privilege);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormInfo(prevState => ({ ...prevState, [name]: value }));
    };
    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Simple validation
        let formErrors = {};
        if (!formInfo.name) formErrors.name = 'Name is required';
        if (!formInfo.email) formErrors.email = 'Email is required';
        if (!formInfo.password) formErrors.password = 'Password is required';
        if (!formInfo.confirm_password) formErrors.confirm_password = 'Password confirmation is required';
        if (formInfo.password != formInfo.confirm_password) formErrors.confirm_password = 'Confirmation did not match !';
        if (!formInfo.role_id) formErrors.role_id = 'Role is required';
        if (privilege > 999 && !formInfo.branch_id) formErrors.branch_id = 'Branch is required';

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        axios.post('/data/store/user', formInfo).then(res => {
            console.log(res.data);
            reload();
            setOpenDialog(false);
        }).catch(err => {
            console.log(err.message);
        })
    };
    if(privilege <=5) return null;
    return (
        <>
            <button
                onClick={() => setOpenDialog(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold py-2 px-3 rounded"
            >
                Create New
            </button>
            <Dialog
                visible={openDialog}
                modal
                onHide={() => setOpenDialog(false)}
                className="rounded-md m-4 w-full md:w-1/2 p-4 bg-white"
            >
                <h2 className="text-xl font-semibold mb-4">Create New User</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
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
                            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
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
                    </div>

                    <div>
                        <label htmlFor="role_id" className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                            id="role_id"
                            name="role_id"
                            value={formInfo.role_id}
                            onChange={handleChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="">Select a role</option>
                            {selectableRoles.map(role => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                        {errors.role_id && <p className="text-red-500 text-sm">{errors.role_id}</p>}
                    </div>

                    {privilege > 999 && (
                        <div>
                            <label htmlFor="branch_id" className="block text-sm font-medium text-gray-700">Branch</label>
                            <select
                                id="branch_id"
                                name="branch_id"
                                value={formInfo.branch_id}
                                onChange={handleChange}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            >
                                <option value="">Select a branch</option>
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </select>
                            {errors.branch_id && <p className="text-red-500 text-sm">{errors.branch_id}</p>}
                        </div>
                    )}

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
                            Create
                        </button>
                    </div>
                </form>
            </Dialog>
        </>
    );
}

export default AddNewUser