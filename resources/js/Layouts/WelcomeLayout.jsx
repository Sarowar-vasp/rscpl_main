import React from 'react'

const WelcomeLayout = (props) => {
    const {children}=props;
    return (
        <>
            <div className={`px-2 md:px-16`}>
                {children}
            </div>
        </>
    )
}
export default WelcomeLayout