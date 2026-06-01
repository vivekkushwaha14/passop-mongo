import React from 'react'

const Navbar = () => {
  return (
    <nav className='bg-blue-300  flex justify-between items-center px-4 h-14 mb-2 text-white'>
      <div className='logo font-bold text-white text-2xl'>
        <span className='text-blue-800'>  &lt;</span>
        Pass
        <span className='text-blue-800'>Op/ &gt;</span>
      </div>
    
      <button  className="icons text-white cursor-pointer pt-1 bg-blue-400 flex gap-2 px-3 py-1 rounded-2xl hover:bg-blue-600 items-center ring-white ring-1">
        <img src="/icons/github.svg" className='invert w-8' alt="" />
        Github
      </button>
    </nav>
  )
}

export default Navbar
