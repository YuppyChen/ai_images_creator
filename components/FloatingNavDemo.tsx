"use client"

import React from "react"
import { Navbar1 } from "@/components/shadcnblocks-com-navbar1"
import { Home, User, LifeBuoy } from "lucide-react"

export function FloatingNavDemo() {
  const logo = {
    url: "/",
    src: "https://www.shadcnblocks.com/images/block/block-1.svg",
    alt: "logo",
    title: "AI 图像创建器"
  }

  const menu = [
    { title: "首页", url: "/" },
    { title: "关于", url: "/about" },
    { title: "支持", url: "/support" }
  ]

  const auth = {
    signup: { text: "注册", url: "/sign-up" },
    login: { text: "登录", url: "/sign-in" }
  }

  return (
    <div className="relative w-full">
      <Navbar1 
        logo={logo} 
        menu={menu} 
        auth={auth}
      />
      {/* <DummyContent /> */}
    </div>
  )
}

const DummyContent = () => {
  return (
    <div className="grid grid-cols-1 h-[80rem] w-full bg-white dark:bg-black relative border border-neutral-200 dark:border-white/[0.2] rounded-md">
      <p className="dark:text-white text-neutral-600 text-center text-4xl font-bold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        导航栏常驻显示
      </p>
      <div className="inset-0 absolute bg-grid-black/[0.1] dark:bg-grid-white/[0.2]" />
    </div>
  )
} 