"use client"

import React, { useEffect } from "react"
import { Navbar1 } from "@/components/shadcnblocks-com-navbar1"
import { ImageIcon } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

export function ProtectedNavbar() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const logo = {
    url: "/",
    src: "https://www.shadcnblocks.com/images/block/block-1.svg",
    alt: "logo",
    title: "AI 图像创建器"
  }

  const menu = [
    { 
      title: "图像生成", 
      url: "/protected",
      icon: <ImageIcon className="size-5 shrink-0" />
    }
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push("/")
    window.location.href = "/"
  }

  useEffect(() => {
    const handleAuthClick = () => {
      handleSignOut()
    }

    window.addEventListener("auth-click", handleAuthClick)
    return () => window.removeEventListener("auth-click", handleAuthClick)
  }, [])

  const auth = {
    login: { text: "", url: "" },
    signup: { text: "退出", url: "#" }
  }

  return (
    <div className="relative w-full">
      <Navbar1 
        logo={logo} 
        menu={menu} 
        auth={auth}
        showLoginButton={false}
      />
    </div>
  )
} 