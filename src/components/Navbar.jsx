import React from 'react'

const Navbar = ({ isLoggedIn, username, onLogout }) => {
  return (
    <nav className='bg-blue-300 flex justify-between items-center px-4 h-14 mb-2 text-white shadow-md'>
      <div className='logo font-bold text-white text-2xl select-none'>
        <span className='text-blue-800'>  &lt;</span>
        Pass
        <span className='text-blue-800'>Op/ &gt;</span>
      </div>
    
      <div className="flex items-center gap-4">
        {isLoggedIn && (
          <div className="flex items-center gap-2">
            <span className="text-blue-900 font-semibold text-xs md:text-sm bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
              Hi, {username}
            </span>
            <button
              onClick={onLogout}
              className="text-white text-xs md:text-sm font-semibold cursor-pointer bg-red-500 hover:bg-red-600 active:scale-[0.97] transition-all px-3 py-1.5 rounded-full ring-white/30 ring-1"
            >
              Logout
            </button>
          </div>
        )}

        
      </div>
    </nav>
  )
}

export default Navbar

