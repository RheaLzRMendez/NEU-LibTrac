"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { LayoutDashboard, Users, TrendingUp, LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { Separator } from "@/components/ui/separator";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  const menuItems = [
    { title: "DASHBOARD", icon: LayoutDashboard, path: "/admin" },
    { title: "USER MANAGEMENT", icon: Users, path: "/admin/users" },
    { title: "AI TRENDS", icon: TrendingUp, path: "/admin/trends" },
  ];

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push("/");
  };

  return (
    <SidebarProvider>
      <Sidebar className="border-r-0 bg-white shadow-xl">
        <SidebarHeader className="p-8 pb-4">
          <div className="flex flex-col items-center gap-6">
            <div className="bg-white rounded-full flex items-center justify-center overflow-hidden w-32 h-32 border-4 border-[#FFD700] shadow-md">
              <div className="relative w-24 h-24">
                <Image 
                  src={logoImage?.imageUrl || ""} 
                  alt="Logo" 
                  fill
                  sizes="96px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div className="text-center">
              <p 
                className="text-2xl leading-tight"
                style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: '#336600' }}
              >
                NEU<br />Library
              </p>
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent className="px-4 py-8">
          <SidebarMenu className="gap-4">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.path}
                  className={`h-14 rounded-2xl transition-all duration-300 ${
                    pathname === item.path 
                    ? "bg-white text-[#336600] shadow-lg border border-slate-100" 
                    : "bg-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Link href={item.path} className="flex items-center gap-4 px-6">
                    <item.icon className={`h-5 w-5 ${pathname === item.path ? "text-[#336600]" : "text-slate-300"}`} />
                    <span className="font-black text-[10px] tracking-[0.2em]">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-4 mt-auto">
          <div className="mb-8 text-center px-4">
             <p className="text-[9px] font-black text-[#FFD700] uppercase tracking-[0.3em]">Active Session</p>
          </div>
          <Button 
            className="w-full justify-start bg-[#FFD700] hover:bg-[#FFD700]/90 text-black rounded-2xl h-14 shadow-lg group active:scale-95 transition-all"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">Logout System</span>
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset style={{ backgroundColor: '#336600' }}>
        <header className="flex h-24 shrink-0 items-center gap-2 px-10">
          <div className="flex items-center gap-6">
            <SidebarTrigger className="text-[#FFD700] hover:bg-white/10" />
            <Separator orientation="vertical" className="h-8 bg-white/20" />
            <h2 
              className="text-4xl"
              style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: '#669900' }}
            >
              {menuItems.find(i => i.path === pathname)?.title === "DASHBOARD" ? "Dashboard" : (menuItems.find(i => i.path === pathname)?.title || "Dashboard")}
            </h2>
          </div>
        </header>
        <div className="p-10 pt-0 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
