import { LuLayoutDashboard } from "react-icons/lu";
import { LiaToolsSolid } from "react-icons/lia";
import { FaHome } from "react-icons/fa";
import { MdOutlineAdminPanelSettings } from "react-icons/md";


const MenuItems = [
  {
    name: 'Dashboard',
    link: 'dashboard',
    icon: LuLayoutDashboard,
    items: []
  },
  {
    name: 'Master',
    link: '#',
    icon: FaHome,
    items: [
      {
        name: 'Location',
        link: 'master/locations'
      },
      {
        name: 'Branch',
        link: 'master/branches'
      },
      {
        name: 'Party',
        link: 'master/parties'
      },
      {
        name: 'Item Unit',
        link: 'master/item-units'
      },
      {
        name: 'Item',
        link: 'master/items'
      },
    ]
  },
  {
    name: 'Booking',
    link: 'consignment/booking',
    icon: LiaToolsSolid,
    items: []
  },
  {
    name: 'administration',
    link: 'administration',
    icon: MdOutlineAdminPanelSettings,
    items: [
      {
        name: 'manage-user',
        link: 'administration/manage-user'
      }
    ]
  }
];

export default MenuItems;
