import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog } from 'primereact/dialog';

const FinancialYearComponent = (props) => {
    const { classNames = '' } = props;
    const [openDialog, setOpenDialog] = useState(false);
    const [items, setItems] = useState([]);
    const [activeSession, setActiveSession] = useState(null);

    const loadItems = async () => {
        try {
            const res = await axios.get('/data/sessions');
            setItems(res.data);
        } catch (err) {
            console.log(err.message);
        }
    };

    useEffect(() => {
        if (items.length > 0) {
            const act = items.find(itm => itm.active === 1);
            setActiveSession(act);
        }
    }, [items]);

    useEffect(() => {
        loadItems();
    }, []);

    return (
        <div>
            <button
                onClick={() => setOpenDialog(true)}
                className={props.classNames}
            >
                {activeSession ?
                    <span>{new Date(activeSession.start_date).getFullYear() + ' - ' + new Date(activeSession.end_date).getFullYear()}</span>
                    : 'Set Session'}
            </button>
            <Dialog visible={openDialog} modal onHide={() => setOpenDialog(false)} className="rounded-md m-4 w-full md:w-1/2 p-4 bg-white">
                <div className="flex justify-between items-center">
                    <div className="flex items-end gap-2 text-2xl text-slate-400">
                        <h2 className=''>Financial Session</h2>
                        {activeSession ? <span className='text-xl'>({new Date(activeSession.start_date).getFullYear() + ' - ' + new Date(activeSession.end_date).getFullYear()})</span> : ''}
                    </div>
                    <AddNewItem items={items} reload={loadItems} />
                </div>
                <hr className='my-2' />
                <div className="flex flex-col min-h-16 justify-center items-center">
                    {items.length ? (
                        <div className="flex flex-col gap-2 w-full">
                            {items.map(sess => (
                                <div
                                    key={sess.id}
                                    className={`flex justify-between items-center shadow-sm rounded-md p-4 ${sess.active ? 'bg-teal-100' : 'bg-slate-50'}`}>
                                    <span className='text-xl'>{new Date(sess.start_date).getFullYear() + ' - ' + new Date(sess.end_date).getFullYear()}</span>
                                    {!sess.active ?
                                        <div className="flex items-center gap-2">
                                            <ActivateSession session={sess} reload={loadItems} />
                                        </div>
                                        : 'Active'}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <span className="text-xl text-slate-400">No Session is found!</span>
                    )}
                </div>
            </Dialog>
        </div>
    );
};

export default FinancialYearComponent;

const AddNewItem = ({ items, reload }) => {
    const [openDialogx, setOpenDialogx] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        validateYear();
    }, [startDate, endDate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/data/session/store', {
                start_date: startDate,
                end_date: endDate,
            });
            reload();
            setStartDate('');
            setEndDate('');
            setOpenDialogx(false);
        } catch (err) {
            console.log(err.message);
        }
    };

    const validateYear = () => {
        const startYear = new Date(startDate).getFullYear();
        const endYear = new Date(endDate).getFullYear();

        const isStartYearUsed = items.some(item => new Date(item.start_date).getFullYear() === startYear);
        const isEndYearUsed = items.some(item => new Date(item.end_date).getFullYear() === endYear);

        if (isStartYearUsed) {
            setStartDate('');
            console.log('Already Assingned this year');
        }
        if (isEndYearUsed) {
            setEndDate('');
            console.log('Already Assingned this year');
        }

        setIsValid(startDate && endDate && !isStartYearUsed && !isEndYearUsed);
    };
    return (
        <div>
            <button onClick={() => setOpenDialogx(true)} className='underline'>Add Session</button>
            <Dialog visible={openDialogx} modal onHide={() => setOpenDialogx(false)} className="rounded-md m-4 w-1/3 p-4 bg-white">
                <div className="flex justify-between items-center">
                    <h2 className='text-2xl text-slate-400'>Create</h2>
                </div>
                <hr className='my-2' />
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="startDate" className="block text-gray-700 text-sm font-bold mb-2">Start Date</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="endDate" className="block text-gray-700 text-sm font-bold mb-2">End Date</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        {isValid ?
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                disabled={!isValid}
                            >
                                Add Financial Session
                            </button>
                            : ''}
                    </div>
                </form>
            </Dialog>
        </div>

    );
};


const ActivateSession = ({ session, reload }) => {
    const activate = async () => {
        try {
            await axios.post(`/data/session/${session.id}/activate`);
            window.location.reload();
        } catch (err) {
            console.log(err.message);
        }
    }

    return (
        <button onClick={activate} className='bg-teal-700 hover:bg-teal-900 text-white px-3 py-1 rounded-md'>Set active</button>
    );
}