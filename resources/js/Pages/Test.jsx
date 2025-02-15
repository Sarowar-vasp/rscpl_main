import AdminLayout from '@/Layouts/AdminLayout'
import { Head } from '@inertiajs/react';

const Test = (props) => {
    const { auth } = props;
    return (
        <AdminLayout
            user={auth?.user}
            page="Master"
        >
            <Head title="Master" />
            <div className="flex gap-2 m-4 flex-col md:flex-row md:items-start">
                <div className="container p-6 w-full">
                    <div className="min-h-[60vh] flex flex-col justify-center items-center">
                        <span className="text-2xl py-2 text-center font-bold uppercase">
                            Test Item
                        </span>
                        
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default Test
