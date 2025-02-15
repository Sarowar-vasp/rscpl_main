import FinancialYearComponent from "@/Components/Nav/Header/FinancialYearComponent";

const NewMenuItems = [
	{
		name: 'Home',
		url: '/dashboard',
		children: []
	},
	{
		name: 'Master',
		url: '#',
		children: [
			{
				name: 'Location',
				url: '/master/locations',
				children: []
			},
			{
				name: 'Rates',
				url: '/master/rates',
				children: []
			},
			{
				name: 'Branch',
				url: '/master/branches',
				children: [],
				rank:200
			},
			{
				name: 'Party',
				url: '/master/parties',
				children: []
			},
			{
				name: 'Unit',
				url: '/master/item-units',
				children: []
			},
			{
				name: 'Item',
				url: '/master/items',
				children: []
			},
			{
				name: 'Lorry',
				url: '/master/lorries',
				children: []
			},
		]
	},
	{
		name: 'Transactions',
		url: '/transaction/booking',
		children: []
	},
	{
		name: 'Track',
		url: '/booking/track',
		children: []
	},
	{
		name: 'Reports',
		url: '/transaction/booking/report',
		children: []
	},
	{
		name: 'administration',
		url: '#',
		children: [
			{
				name: 'Manage Users',
				url: '/administration/manage-user',
				children: []
			},
			{
				name: 'Activity Log',
				url: '/administration/activity-log',
				children: [],
				rank:10
			}
		]
	}
];

export default NewMenuItems;
