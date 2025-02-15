import { Link } from '@inertiajs/react';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import React from 'react'
import EditUser from './EditUser';

const UsersList = (props) => {
  const { auth, users, reload, privilege } = props;
  return (
    <div className='w-full p-6 m-4'>
      {users && users.length ? (
        <div className="w-full overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr>
                <th className="text-center py-3 px-2">Sl.</th>
                <th className="text-left min-w-[180px]">Name</th>
                <th className="text-left min-w-[180px]">Email (username)</th>
                <th className="text-left min-w-[180px]">Role</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((member, i) => (
                <tr key={member.id} className="border">
                  <td className='text-center py-2'>{i + 1}</td>
                  <td>
                    <div className="">
                      <span>{member.name}</span>
                      {auth.user.id == member.id ?
                        <span className='rounded-full px-1.5 bg-gray-500 text-gray-100 py-0 text-xs mx-2'>You</span>
                        : ''}
                    </div>
                  </td>
                  <td>{member.email}</td>
                  <td>{member.role?.name}</td>
                  <td>
                    <div className="flex gap-2 justify-end pr-6 items-center">
                      {auth.user.id == member.id &&
                        <Link href={route('profile.edit')} className='hover:bg-red-300 px-3 py-1 shadow-sm my-2 rounded-lg text-red-700 bg-red-200'>Profile</Link>
                      }
                      {privilege > member.role?.privilege_index && (
                        <>
                          <EditUser user={member} {...props} />
                          <DeleteUser item={member.id} reload={reload} />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <span>No Item found!</span>
      )}
      <ConfirmDialog className="rounded-md bg-white p-4" />
    </div>
  )
}

export default UsersList


const DeleteUser = ({ item, reload }) => {


  const accept = () => {
    axios.delete(`/data/delete/user/${item}`)
      .then(res => {
        reload();
      })
      .catch(err => console.log(err.message));
  };

  const handleConfirm = () => {
    confirmDialog({
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptClassName: 'p-button-danger',
      accept
    });
  };

  return (
    <>
      <button onClick={handleConfirm} className='hover:bg-orange-300 p-2 shadow-sm my-2 rounded-lg text-orange-700 bg-orange-200'>
        <Trash2Icon className='w-6 h-6' />
      </button>
    </>
  );
}