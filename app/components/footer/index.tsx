import { Divider } from '@nextui-org/react'
import React from 'react'

function Footer() {
    return (
        <div style={{bottom: 0, width:"100%" }} >
          {/* <Divider className='mt-10'/> */}
          <div className="container w-full flex flex-wrap items-start justify-center mx-auto px-6 pt-10 pb-6 h-10">
             {/* Test footer */}
             <p className='text-gray-600'>This is a fan made site and is not affiliated with Arrowhead Game Studios</p>
             
          </div>
        </div>
      )
}

export default Footer