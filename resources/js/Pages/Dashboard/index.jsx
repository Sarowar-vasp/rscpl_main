import AdminLayout from '@/Layouts/AdminLayout';
import MasterLayout from '@/Layouts/MasterLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard(props) {
    return (
        <AdminLayout
            user={props.auth?.user}
            page="Home"
        >
            <Head title="Home" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white flex justify-center items-center min-h-[60vh]">
                        {props.auth.user ? props.auth.user.branch ? (
                            <div className='text-center'>
                                <h1 className='text-4xl text-slate-400 font-bold uppercase'>WELCOME TO {props.auth.user.branch.name}</h1>
                                <p className="text-lg text-gray-300 mt-4">
                                    {props.auth.user.branch.location}, {props.auth.user.branch.city}, {props.auth.user.branch.state}
                                </p>
                            </div>
                        ) : (
                            <div className="">
                                <h1 className='text-4xl text-slate-400 font-bold uppercase'>WELCOME TO Transtrack</h1>
                                <p className="text-lg text-gray-300">
                                    An ERP for your logistic solution
                                </p>
                            </div>
                        ) : (
                            <div className="">
                                <h1 className='text-4xl text-slate-400 font-bold uppercase'>WELCOME TO Transtrack</h1>
                                <p className="text-lg text-gray-300">
                                    An ERP for your logistic solution
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
