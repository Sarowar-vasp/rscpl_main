import React, { useEffect, useRef, useState } from 'react'
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { HiArrowLongLeft } from "react-icons/hi2";
import { IoArrowForwardCircleOutline } from "react-icons/io5";
import SidebarLinkGroup from './SidebarLinkGroup';
import MenuItems from '@/Data/MenuItems';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';


const Sidebar = (props) => {
	const { sidebarOpen, setSidebarOpen } = props;
	const pathname = window.location.pathname;

	const trigger = useRef();
	const sidebar = useRef();

	const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
	const [sidebarExpanded, setSidebarExpanded] = useState(
		storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
	);

	useEffect(() => {
		const clickHandler = ({ target }) => {
			if (!sidebar.current || !trigger.current) return;
			if (
				!sidebarOpen ||
				sidebar.current.contains(target) ||
				trigger.current.contains(target)
			)
				return;
			setSidebarOpen(false);
		};
		document.addEventListener('click', clickHandler);
		return () => document.removeEventListener('click', clickHandler);
	});

	useEffect(() => {
		const keyHandler = ({ keyCode }) => {
			if (!sidebarOpen || keyCode !== 27) return;
			setSidebarOpen(false);
		};
		document.addEventListener('keydown', keyHandler);
		return () => document.removeEventListener('keydown', keyHandler);
	});

	useEffect(() => {
		localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
		if (sidebarExpanded) {
			document.querySelector('body')?.classList.add('sidebar-expanded');
		} else {
			document.querySelector('body')?.classList.remove('sidebar-expanded');
		}
	}, [sidebarExpanded]);

	const renderMenuItems = (items) => {
		return items.map((item) => {
			const IconComponent = item.icon || IoArrowForwardCircleOutline;
			if (item.items && item.items.length > 0) {
				return (
					<SidebarLinkGroup key={item.name} activeCondition={pathname.includes(item.link)}>
						{(handleClick, open) => (
							<div className={`${open ? 'border shadow-sm bg-white' : ''}`}>
								<button
									className={` ${open && 'border-b border-black/20'} w-full relative flex items-center gap-2.5 rounded-sm py-2 px-4 text-sm capitalize font-semibold text-gray-800 duration-300 ease-in-out hover:bg-red-200 ${pathname.includes(item.link) && 'text-red-800 hover:bg-red-200'}`}
									onClick={(e) => {
										e.preventDefault();
										sidebarExpanded
											? handleClick()
											: setSidebarExpanded(true);
									}}
								>
									<IconComponent className='w-7 h-7' />
									<span className="w-full flex justify-between items-center">
										{item.name}
										<span>
											{open ?
												<FaChevronUp className='w-3 h-3' />
												:
												<FaChevronDown className='w-3 h-3' />
											}
										</span>
									</span>
								</button>
								<div className={`translate transform overflow-hidden ${!open && 'hidden'}`}>
									<ul className="pb-5 flex flex-col gap-2">
										{renderMenuItems(item.items)}
									</ul>
								</div>
							</div>
						)}
					</SidebarLinkGroup>
				);
			} else {
				return (
					<li key={item.name}>
						<Link
							href={`/${item.link}`}
							className={`flex items-center gap-2.5 rounded-sm py-2 px-4 text-sm font-medium capitalize text-gray-800 duration-300 ease-in-out hover:bg-red-200 ${pathname.includes(item.link) && 'text-red-800 hover:bg-red-200'}`}
						>
							{item.icon ?
								<IconComponent className='w-7 h-7' />
								:
								<IconComponent className='w-6 h-6' />
							}
							{item.name}
						</Link>
					</li>
				);
			}
		});
	};

	return (
		<aside
			ref={sidebar}
			className={`absolute left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-y-hidden shadow-md bg-[#fffefd] text-gray-800 duration-300 ease-linear lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
		>
			<div className="flex items-center justify-between gap-2 px-8 pt-5 pb-2 lg:pt-6">
				<Link href='/'>
					<ApplicationLogo className="block w-16 fill-current text-red-200" />
				</Link>
				<button
					ref={trigger}
					onClick={() => setSidebarOpen(!sidebarOpen)}
					aria-controls="sidebar"
					aria-expanded={sidebarOpen}
					className="block lg:hidden"
				>
					<HiArrowLongLeft className='h-8 w-8' />
				</button>
			</div>
			<hr className='my-4' />
			<div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
				<nav className="p-4 lg:px-6">
					<ul className="mb-6 flex flex-col gap-1.5">
						{renderMenuItems(MenuItems)}
					</ul>
				</nav>
			</div>
			<div className="fixed left-0 bottom-0 right-0 bg-black/30 px-4 py-2">
				dashboard
			</div>
		</aside>
	)
}

export default Sidebar