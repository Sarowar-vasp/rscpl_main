import Header from '@/Components/Nav/Header';
import Sidebar from '@/Components/Nav/Sidebar';
import React, { useState } from 'react'

const MasterLayout = (props) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div>
            <div className="flex h-screen overflow-hidden">
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                    <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} {...props}/>
                    <main>
                        <div className="mx-auto max-w-screen-2xl p-2 md:p-3">
                            {props.children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}

export default MasterLayout