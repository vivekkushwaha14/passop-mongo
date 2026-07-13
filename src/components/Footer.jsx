import React from 'react'

const Footer = () => {
  return (
    <div className='bg-blue-300 flex justify-center items-center px-4 h-18 mt-2 gap-2  bottom-0 w-full md:flex-row flex-col sticky'>
       <div className='logo font-bold text-white text-2xl  '>
        <span className='text-blue-800'>  &lt;</span>
        Pass
        <span className='text-blue-800'>Op/ &gt;</span>
      </div>
      <div>
        <p className='text-white '>&copy; 2026 PassOp. All rights reserved.</p>
 
      </div>
    </div>
  )
}

export default Footer
