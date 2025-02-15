import GuestLayout from '@/Layouts/GuestLayout';
import { Link, Head } from '@inertiajs/react';

export default function Welcome(props) {
    return (
        <GuestLayout>
            <Head title="Welcome" />
            <div className="flex min-h-[50%] md:min-h-screen w-full items-center justify-center">
                <div className="flex flex-col gap-4 my-32 md:my-auto">

                    {(props.auth.user && props.auth.user.branch) ? (
                        <div className="w-full md:min-w-[400px] text-center">
                            <h4 className="text-xl text-slate-300 uppercase">
                                welcome to
                            </h4>
                            <h3 className="text-4xl capitalize">
                                {props.auth.user.branch.name}
                            </h3>
                        </div>
                    ) : (
                        <div className="w-full md:min-w-[400px] text-center">
                            <h4 className="text-xl text-slate-300 uppercase">
                                welcome to
                            </h4>
                            <h3 className="text-5xl font-bold mt-6 capitalize">
                                Transtrack
                            </h3>
                            <p className="text-gray-500 font-semibold">
                                An ERP for your logistic solution
                            </p>
                        </div>
                    )}
                    <div className="flex items-center justify-center mt-16 md:min-w-[400px]">
                        {props.auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded px-4 py-1 text-2xl font-semibold bg-red-500 hover:bg-red-600 text-white hover:text-gray-100"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <div>
                                <Link
                                    href={route('login')}
                                    className="rounded px-4 py-1 text-2xl font-semibold bg-red-500 hover:bg-red-600 text-white hover:text-gray-100"
                                >
                                    Log in
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
