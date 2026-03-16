"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { LayoutDashboard, History, TrendingUp, MessageSquare, User, LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function StudentPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/portal" },
    { title: "History", icon: History, path: "/portal/history" },
    { title: "Analytics", icon: TrendingUp, path: "/portal/analytics" },
    { title: "Messages", icon: MessageSquare, path: "/portal/messages" },
    { title: "Profile", icon: User, path: "/portal/profile" },
  ];

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push("/");
  };

  return (
    <SidebarProvider>
      <Sidebar className="border-none bg-[#0a1e3b] text-white">
        <SidebarHeader className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-1 w-12 h-12 flex items-center justify-center overflow-hidden shrink-0">
              <div className="relative w-10 h-10">
                <Image 
                  src={logoImage?.imageUrl || ""} 
                  alt="NEU Logo" 
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div>
              <p className="font-bold text-sm tracking-tight leading-tight">NEU Library</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Student Portal</p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 px-1">
            <Avatar className="h-10 w-10 border border-slate-700">
              <AvatarImage src={user?.photoURL || undefined} />
              <AvatarFallback className="bg-slate-800 text-xs">{user?.displayName?.[0] || 'S'}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{user?.displayName || "Student"}</p>
              <p className="text-[9px] text-slate-500 font-medium truncate">College of Computer Studies</p>
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent className="px-3 py-6">
          <SidebarMenu className="gap-1">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.path}
                  className={`h-11 rounded-lg transition-all ${
                    pathname === item.path 
                    ? "bg-[#1e3a5f] text-white" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Link href={item.path} className="flex items-center gap-3 px-4">
                    <item.icon className={`h-4 w-4 ${pathname === item.path ? "text-white" : "text-slate-500"}`} />
                    <span className="text-xs font-semibold">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <Button 
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5 h-11 px-4 text-xs font-semibold"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="relative bg-slate-50 min-h-screen overflow-hidden">
        {/* Background Overlay to match the blurred building look */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <Image 
            src={PlaceHolderImages.find(i => i.id === 'library-hero')?.imageUrl || ""}
            alt="Background"
            fill
            className="object-cover blur-sm"
          />
        </div>
        
        <header className="relative z-10 flex h-20 items-center gap-4 px-8 pt-4">
          <SidebarTrigger className="text-slate-600" />
          <div className="flex-1">
            <h1 className="text-2xl font-black text-[#0a1e3b] tracking-tight">
              Welcome, {user?.displayName || "Student"}!
            </h1>
            <p className="text-xs font-semibold text-slate-400">College of Computer Studies</p>
          </div>
        </header>

        <main className="relative z-10 p-8 pt-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
