import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link } from '@inertiajs/react';
import React, { useEffect, useState } from 'react'
import { HiOutlineUser, HiOutlineBars3 } from 'react-icons/hi2';

const Header = (props) => {
	const { sidebarOpen, setSidebarOpen, auth } = props;
	
	const greetText = () => {
		const currentHour = new Date().getHours();
		if (currentHour < 12) {
			return 'Good Morning';
		} else if (currentHour < 18) {
			return 'Good Afternoon';
		} else {
			return 'Good Evening';
		}
	}

	return (
		<header className="sticky top-0 z-40 flex min-h-14 w-full bg-white shadow-md">
			<div className="flex flex-grow items-center justify-between py-2 px-4 shadow-2 md:px-6 2xl:px-11">
				<div className="flex items-center gap-2 sm:gap-4">
					<button
						aria-controls="sidebar"
						onClick={(e) => {
							e.stopPropagation();
							setSidebarOpen(!sidebarOpen);
						}}
						className="bg-white p-1.5 shadow-sm lg:hidden"
					>
						<HiOutlineBars3 className='w-6 h-6' />
					</button>
					<Link className="block flex-shrink-0 lg:hidden" href="/dashboard">
						<ApplicationLogo className="block h-12 fill-current" />
					</Link>
				</div>
				<div className="flex items-center gap-3 2xsm:gap-7">
					{props.auth ? (
						<div className="ms-3 relative">
							<Dropdown>
								<Dropdown.Trigger>
									<span className="inline-flex rounded-md">
										<button
											type="button"
											className="inline-flex items-center shadow-sm hover:shadow-md px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-full text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
										>
											<div className="hidden sm:inline mr-1 md:mr-4 text-left">
												<h6 className='text-gray-300 text-xs'>
													{greetText() + ', '}
												</h6>
												<h5 className="text-sm font-bold">
													{auth.user.name}
												</h5>
											</div>
											<HiOutlineUser className='w-8 h-8' />
										</button>
									</span>
								</Dropdown.Trigger>

								<Dropdown.Content>
									<Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
									<Dropdown.Link href={route('logout')} method="post" as="button">
										Log Out
									</Dropdown.Link>
								</Dropdown.Content>
							</Dropdown>
						</div>
					) : (
						<div className="ms-3 relative">
							<span className="inline-flex rounded-md">
								<Link
									href='/login'
									className="inline-flex items-center shadow-sm hover:shadow-md px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-full text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
								>
									<HiOutlineUser className='w-8 h-8' />
								</Link>
							</span>
						</div>
					)}
				</div>
			</div>
		</header>
	)
}

export default Header