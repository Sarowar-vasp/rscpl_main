import { useEffect, useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login(props) {
    const { branches, status, canResetPassword } = props;
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        branch_id: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'));
    };

    return (
        <GuestLayout>
            <>
                <Head title='Login' />

                {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}
                <div className="flex w-full justify-center items-center">

                    <div className="min-w-[350px]">
                        <div className="my-4">
                            <div className="w-full md:min-w-[400px] text-left">
                                <h3 className="text-5xl font-bold mt-6 capitalize">
                                    Transtrack
                                </h3>
                                <p className="text-gray-500 font-semibold">
                                    An ERP for your logistic solution
                                </p>
                            </div>
                            <div className="py-4">
                                <h2 className="text-2xl font-bold">
                                    Login
                                </h2>
                            </div>
                        </div>
                        <form onSubmit={submit}>
                            <div>
                                <InputLabel htmlFor="branch" value="Select Branch" />
                                <select
                                    id='branch'
                                    name='branch_id'
                                    value={data.branch_id}
                                    className="mt-1 block w-full uppercase border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    isFocused={true}
                                    onChange={(e) => setData('branch_id', e.target.value)}
                                >
                                    <option value="">Select Branch</option>
                                    {branches && branches.map(brn => {
                                        let city = brn.city ? brn.city : brn.district ? brn.district : '';
                                        return (
                                            <option key={brn.id} value={brn.id}>
                                                {brn.name} - ({city})
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div className="mt-4">
                                <InputLabel htmlFor="email" value="Email" />

                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full"
                                    autoComplete="username"
                                    isFocused={true}
                                    onChange={(e) => setData('email', e.target.value)}
                                />

                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div className="mt-4">
                                <InputLabel htmlFor="password" value="Password" />

                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                />

                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div className="block mt-4">
                                <label className="flex items-center">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                    />
                                    <span className="ms-2 text-sm text-gray-600">Remember me</span>
                                </label>
                            </div>

                            <div className="flex flex-col mt-4">


                                <button
                                    disabled={processing}
                                    className={`text-center px-4 py-2 bg-orange-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-orange-700 focus:bg-orange-700 active:bg-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition ease-in-out duration-150 `}>
                                    Log in
                                </button>

                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="underline my-4 text-sm text-center text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Forgot your password?
                                    </Link>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </>
        </GuestLayout>
    );
}
