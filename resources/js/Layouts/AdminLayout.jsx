import ApplicationLogo from '@/Components/ApplicationLogo'
import { Link } from '@inertiajs/react'
import { AppBar, Box, Button, Container, CssBaseline, Divider, Drawer, IconButton, Menu, MenuItem, Toolbar, Tooltip } from '@mui/material'
import { ChevronDownIcon, ChevronRightIcon, MenuIcon, XIcon } from 'lucide-react'
import React, { useState } from 'react'
import NewMenuItems from '@/Data/NewMenuItems';
import FinancialYearComponent from '@/Components/Nav/Header/FinancialYearComponent'

        

const drawerWidth = 240;

const AdminLayout = (props) => {
    const { window, user, children, page = "Home" } = props;
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [anchorElUser, setAnchorElUser] = useState(null);

    const handleDrawerToggle = () => setDrawerOpen((prevState) => !prevState);
    const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
    const handleCloseUserMenu = () => setAnchorElUser(null);


    const MenuItemY = ({ item }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const toggleExpand = () => {
            setIsExpanded(!isExpanded);
        };

        if (item.rank && item.rank > user.role?.privilege_index) return;

        return (
            <div>
                {item.children.length > 0 ? (
                    <>
                        <li onClick={toggleExpand} className={`flex capitalize justify-between cursor-pointer px-4 py-2 text-sm text-orange-700 hover:bg-orange-100`}>
                            <span>
                                {item.name}
                            </span>
                            {isExpanded ?
                                <ChevronDownIcon className='w-4' />
                                :
                                <ChevronRightIcon className='w-4' />
                            }
                        </li>
                        {isExpanded && (
                            <ul className="mx-4 shadow-md rounded-md overflow-hidden">
                                {item.children.map((subChild, subIndex) => {

                                    if (subChild.rank && subChild.rank > user.role?.privilege_index) return;

                                    return (
                                        <li key={subIndex}>
                                            <a
                                                href={subChild.url}
                                                className="flex flex-start pl-4 py-2 text-sm text-left text-orange-700 hover:bg-orange-100"
                                            >
                                                {subChild.name}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </>
                ) : (
                    <li>
                        <a href={item.url} className="capitalize flex flex-start px-4 py-2 text-sm text-orange-700 hover:bg-orange-100">
                            {item.name}
                        </a>
                    </li>
                )}
            </div>
        );
    }

    const MenuItemX = ({ item }) => {
        return (
            <div className="group relative">
                <div className="flex items-center gap-1 p-4">

                    <a href={item.url} className={`block text-md capitalize ${item.name == page ? 'underline font-bold' : 'font-semibold'} hover:text-orange-900 hover:underline text-orange-700 transition-all duration-300 `}>
                        {item.name}
                    </a>
                    {item.children.length > 0 && <ChevronDownIcon className='w-4' />}
                </div>
                {item.children.length > 0 && (
                    <ul className="absolute hidden left-0 top-12 min-w-[220px] max-w-[280px] bg-[#eecdc4] shadow-lg rounded-md  overflow-hidden group-hover:block">
                        {item.children.map((chx) => (
                            <MenuItemY key={chx.name} item={chx} />
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    const drawer = (
        <Box sx={{
            textAlign: 'center',
        }}>
            <div className='my-4 flex justify-center items-center relative'>
                <Link href="/" >
                    <ApplicationLogo className="block h-12 w-auto fill-current text-gray-800" />
                </Link>
                <div className="absolute top-0 right-1">
                    <IconButton onClick={handleDrawerToggle}>
                        <XIcon className='text-gray-100' />
                    </IconButton>
                </div>
            </div>
            <Divider />
            <Box>
                {NewMenuItems.map((item) => (
                    <MenuItemY key={item.name} item={item} />
                ))}
            </Box>
        </Box>
    );

    const handleLogout = () => {
        axios.post('/logout', {}).then(res => {
            location.reload();
        }).catch(err => {
            console.log('Error logging out. Please reload page and try again.');
        });
    }

    const container = window !== undefined ? () => window().document.body : undefined;

    return (
        <div className='relative'>
            <CssBaseline />
            <AppBar position="static" sx={{ bgcolor: '#fff', color: '#a4450c' }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        zIndex: 999,
                        padding: {
                            md: '0 3rem',
                        },
                    }}>
                        {/* desktop logo */}
                        <div className="hidden md:flex mr-1">
                            <Link href="/">
                                <ApplicationLogo className="block h-12 w-auto fill-current text-gray-100" />
                            </Link>
                        </div>

                        {/* mobile Hamburger Drawer */}
                        <div className="flex md:hidden">
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleDrawerToggle}
                                color="inherit"
                            >
                                <MenuIcon />
                            </IconButton>
                        </div>
                        {/* mobile logo */}
                        <div className="flex md:hidden w-full justify-start">
                            <Link href="/">
                                <ApplicationLogo className="block h-12 w-auto fill-current text-gray-100" />
                            </Link>
                        </div>
                        {/* mobile menu */}
                        <div className="hidden md:flex md:justify-center md:items-center md:gap-1">
                            {NewMenuItems.map((page) => (
                                <MenuItemX key={page.name} item={page} />
                            ))}
                        </div>

                        {/* right nav item */}
                        <div className="flex justify-end items-center gap-4">
                            <FinancialYearComponent classNames={'px-4 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-md'}/>
                            {/* User Account */}
                            <div className="">
                                <Tooltip title="Open settings">
                                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                        <img className='w-12' src="/images/default/user.jpg" alt="user" />
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    id="menu-appbar"
                                    anchorEl={anchorElUser}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                >
                                    <MenuItem>
                                        <div className="card border-b min-w-[150px]">
                                            <div className="flex justify-between gap-4">
                                                <h3 className="text-sm font-semibold">
                                                    {user.name}
                                                </h3>
                                                {user.role &&
                                                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">{user.role.name}</span>
                                                }
                                            </div>
                                            <div className="text-xs font-semibold my-2">
                                                {user.email}
                                            </div>
                                        </div>
                                    </MenuItem>
                                    <MenuItem>
                                        <Link href={route('profile.edit')}>Profile</Link>
                                    </MenuItem>
                                   
                                    <div className="flex px-4 my-2">
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            className='w-full text-center py-1.5 bg-slate-700 text-slate-200 hover:bg-slate-900 hover:text-white rounded shadow-md'
                                        >
                                            Logout
                                        </Link>
                                    </div>
                                </Menu>
                            </div>
                        </div>
                    </Toolbar>
                </Container>
            </AppBar>
            <nav>
                <Drawer
                    container={container}
                    variant="temporary"
                    open={drawerOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            bgcolor: '#fff',
                        },

                    }}
                >
                    {drawer}
                </Drawer>
            </nav>

            <main className="min-h-[91vh] p-2 md:px-16 md:py-4 bg-slate-100">
                {children}
            </main>
        </div>
    )
}

export default AdminLayout