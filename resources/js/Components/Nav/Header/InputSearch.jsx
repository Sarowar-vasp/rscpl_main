import React, { useState } from 'react'
import { FaTimes } from 'react-icons/fa';

const InputSearch = () => {
    const [searchText, setSearchText] = useState('');

  const handleClear = () => {
    setSearchText('');
  };
  return (
    <form className="hidden md:inline relative">
      <input
        type="search"
        name="s"
        id="search"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className='border-gray-200 focus:border-white focus:ring-red-500 rounded-full shadow-xs pl-6 pr-10' // Added pr-10 to make space for the icon
        placeholder='Search'
      />
      {searchText && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500"
        >
          <FaTimes className=''/>
        </button>
      )}
    </form>
  )
}

export default InputSearch