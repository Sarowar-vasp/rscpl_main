import AdminLayout from '@/Layouts/AdminLayout'
import { Head } from '@inertiajs/react'
import React, { useEffect, useState } from 'react'


const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(); // Formats the date as 'MM/DD/YYYY, HH:MM:SS AM/PM'
};

const index = (props) => {

    const [alogs, setALogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = () => {
        setLoading(true);
        axios.get('/data/activities')
            .then(res => {
                setALogs(res.data);
                setLoading(false);
            })
            .catch(er => console.log(er.message));
    }

    useEffect(() => {
        loadData()
    }, [])

    return (
        <AdminLayout
            user={props.auth?.user}
            page="User"
        >
            <Head title="Activity log" />
            <div className="w-full flex flex-col gap-4 items-start relative">
                <div className="shadow w-full h-full flex flex-col bg-white rounded-lg my-4 p-6">

                    <div className="flex justify-between items-end">
                        <h3 className="text-3xl text-slate-600">Activities</h3>
                    </div>
                    <hr className='my-4' />
                    {alogs.length ? (
                        <div className="w-full overflow-x-auto">
                            <table className="w-full border">
                                <thead>
                                    <tr className='border-b'>
                                        <th className="text-center py-3 px-2">Date Time</th>
                                        <th className="text-left min-w-[180px]">Title</th>
                                        <th className="text-left min-w-[180px]">Activity</th>
                                        <th className="text-left min-w-[100px]">By user</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alogs.map((lg, i) => (
                                        <tr key={i} className='border-b'>
                                            <td className='text-center py-2'>{formatDate(lg.created_at)}</td>
                                            <td className='text-left py-2'>{lg.title}</td>
                                            <td className='text-left py-2'>{lg.activity}</td>
                                            <td className='text-left py-2'>{lg.user?.name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="w-full min-h-96 flex justify-center items-center">
                            <span className="text-2xl font-bold text-slate-400">
                                {loading ? 'Loading...' : 'No activities in the record !'}
                            </span>
                        </div>
                    )}

                </div>
            </div>
        </AdminLayout>
    )
}

export default index