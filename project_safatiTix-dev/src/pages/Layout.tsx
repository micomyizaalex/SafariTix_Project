import React, { useEffect } from 'react'
import TopBar from '../components/TopBar'
import { Outlet, useLocation } from 'react-router-dom'

const Layout = () => {
 const {hash} = useLocation()
  
 const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };


  useEffect(() => {
    if(hash){
      if(hash.startsWith("#")){
           scrollToSection(hash.substring(1));
      }
    }
  },[hash])

  return (
    <div className="min-h-screen bg-background">
       <TopBar/>
       <main>
            <Outlet/>
       </main>
    </div>
  )
}

export default Layout