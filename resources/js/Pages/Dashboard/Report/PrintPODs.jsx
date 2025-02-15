import { Dialog } from "primereact/dialog";
import { useState, useRef } from "react";
import { Toast } from "primereact/toast";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

const PrintPODs = ({ bookings }) => {
    const [show, setShow] = useState(false);
    const [limits, setLimits] = useState({
        max: 20, // Default value
        from: 1,
        to: 20,
        applied: false
    });
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);

    const maxOptions = [10, 20, 30, 50];
    
    const handlePrintMultiple = (from = 1, to) => {
        to = to || from;
        if (to - from + 1 > limits.max || to > bookings.length || from < 1) {
            toast.current.show({
                severity: 'error',
                summary: 'Invalid Range',
                detail: `Please select a range within 1 to ${bookings.length} and a maximum of ${limits.max} documents.`,
                life: 3000
            });
            return;
        }

        setLoading(true);

        const printWindow = window.open('', '_blank');
        let htmlContent = `
            <html>
                <head>
                    <title>Print POD</title>
                    <style>
                        @media print{
                            -webkit-print-color-adjust:exact;
                        }
                        body {
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            margin: 0;
                        }
                        .page {
                            display: flex;
                            flex-direction: column;
                            justify-content: flex-start;
                            align-items: center;
                            width: 100%;
                            height: 100vh;
                            page-break-after: always;
                        }
                        .section {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            margin: 20px 0;
                        }
                        img {
                            max-width: 90%;
                            max-height: 45vh;
                        }
                        span {
                            font-size: 14px;
                            font-weight: bold;
                            margin-bottom: 10px;
                        }
                    </style>
                </head>
                <body>
        `;
        for (let i = from - 1; i < to; i++) {
            if (i % 2 === 0) {
                htmlContent += `<div class="page">`;
            }

            htmlContent += `<div class="section">`;
            htmlContent += `<span>Consignment: ${bookings[i].cn_no}</span>`;
            htmlContent += `<img src="/storage/${bookings[i].document.file_location}" alt="Print Image ${i + 1}" />`;
            htmlContent += `</div>`;

            if (i % 2 === 1 || i === bookings.length - 1) {
                htmlContent += `</div>`;
            }
        }

        htmlContent += `</body></html>`;
        printWindow.document.write(htmlContent);
        setLoading(false);
    };

    const confirmPrint = () => {
        if (limits.from > limits.to || limits.to > bookings.length) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Invalid range selected.',
                life: 3000
            });
            return;
        }
        handlePrintMultiple(limits.from, limits.to);
    };


    const applyInputs = () => {
        setLimits(prev => {
            const difference = prev.to - prev.from + 1;
    
            return {
                ...prev,
                to: difference > prev.max ? Math.min(prev.from + prev.max - 1, bookings.length) : prev.to,
                applied: true
            };
        });
    };
    

    if (!bookings || bookings.length < 1) return null;

    const isRangeInputVisible = bookings.length > limits.max;
    const buttonLabel = isRangeInputVisible ? `Print ${limits.from === limits.to ? limits.from : `${limits.from}-${limits.to}`}` : 'Print All Documents';

    return (
        <>
            <Toast ref={toast} />
            <Button
                label="Print PODs"
                icon="pi pi-print"
                className="bg-purple-800 text-white px-2"
                onClick={() => setShow(true)}
                raised
            />
            <Dialog
                header="Print Documents"
                visible={show}
                style={{ width: '50vw' }}
                onHide={() => setShow(false)}
                dismissableMask
            >
                <div className="p-4">

                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <div className="mb-4">
                                <p className="text-lg font-semibold">Total Documents: {bookings.length}</p>
                                {!isRangeInputVisible && (
                                    <p className="text-sm text-gray-600">All documents will be printed.</p>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <label className="text-xs font-medium mb-2">Per Print:</label>
                                <Dropdown
                                    value={limits.max}
                                    className="border border-gray-300 text-xs w-[100px]"
                                    options={maxOptions.map((value) => ({
                                        label: value.toString(),
                                        value
                                    }))}
                                    onChange={(e) => {
                                        const newMax = e.value;
                                        setLimits(prev=>({
                                            ...prev,
                                            max: newMax,
                                            applied: false
                                        }));                                        
                                    }}
                                    placeholder="Select Max Documents"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                            {isRangeInputVisible ? (
                                <div className="flex justify-start gap-2 items-end">
                                    <div className="flex flex-col">
                                        <label className="text-xs font-medium mb-2">From:</label>
                                        <InputNumber
                                            value={limits.from}
                                            className=""
                                            size={4}
                                            onChange={(e) => {
                                                const newFrom = e.value;
                                                setLimits((prev) => ({
                                                    ...prev,
                                                    from: newFrom,
                                                    applied: false
                                                }));
                                            }}
                                            min={1}
                                            max={bookings.length}
                                            showButtons={false}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-xs font-medium mb-2">To:</label>
                                        <InputNumber
                                            value={limits.to}
                                            className=""
                                            size={4}
                                            onChange={(e) => {
                                                const newTo = e.value;
                                                setLimits((prev) => ({
                                                    ...prev,
                                                    to: newTo,
                                                    applied: false
                                                }));
                                            }}
                                            min={1}
                                            max={bookings.length}
                                            showButtons={false}
                                        />
                                    </div>
                                    {!limits.applied &&
                                        <div className="">
                                            <Button
                                                label={'Apply'}
                                                className="bg-green-800 text-white px-3 py-2"
                                                onClick={applyInputs}
                                                disabled={!limits.from || !limits.to}
                                            />
                                        </div>
                                    }
                                </div>
                            ) : <span></span>}


                            <div className="">
                                {limits.applied &&
                                    <Button
                                        label={loading ? 'Printing...' : buttonLabel}
                                        icon={loading ? 'pi pi-spinner pi-spin' : 'pi pi-print'}
                                        className="bg-purple-800 text-white px-3 py-2"
                                        onClick={confirmPrint}
                                        disabled={loading || !limits.from || !limits.to}
                                    />
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default PrintPODs;