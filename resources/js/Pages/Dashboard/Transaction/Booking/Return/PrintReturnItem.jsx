import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

const PrintReturnItem = ({ item }) => {
    const contentRef = useRef(null);
    const handlePrint = useReactToPrint({
        content: () => contentRef.current,
        onAfterPrint: () => console.log('Print successful!'),
    });
    return (
        <div>
            <button onClick={handlePrint}>Print</button>
            <div className='hidden' ref={contentRef}>
                <div className="">Content to Print</div>
            </div>
        </div>
    )
}

export default PrintReturnItem