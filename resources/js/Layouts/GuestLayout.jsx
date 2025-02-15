export default function Guest({ children }) {
    return (
        <div className="flex flex-col md:flex-row">
            <div className="flex justify-center items-center bg-blue-200 md:min-w-[42%] h-[300px] md:min-h-screen">
                <img className='md:max-w-[300px]' src="/images/transtrack-logo.png" alt="Transtrack" />
            </div>
            <div className="flex flex-col w-full justify-center items-center">
                {children}
            </div>
        </div>
    );
}
