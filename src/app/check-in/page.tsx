"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CheckCircle2, LogOut, User, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { COLLEGES, VISIT_PURPOSES } from "@/lib/constants";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useUser, useAuth, useFirestore, useMemoFirebase } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "firebase/auth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { collection, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function CheckInPage() {
  const [purpose, setPurpose] = useState<string>("");
  const [college, setCollege] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  
  const heroImage = PlaceHolderImages.find(img => img.id === 'student-dashboard-hero');
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  const visitLogsRef = useMemoFirebase(() => collection(firestore, "visitLogs"), [firestore]);

  const handleCheckIn = () => {
    if (!purpose || !college || !user) return;
    setIsLoading(true);
    
    const logData = {
      userId: user.uid,
      displayName: user.displayName || "Anonymous",
      email: user.email || "",
      timestamp: serverTimestamp(),
      purposeOfVisitId: purpose,
      collegeId: college,
      // Defaulting to Student as the UI selector was removed. 
      // In a real scenario, this could be derived from the user's institutional profile.
      visitorType: "Student",
    };

    addDocumentNonBlocking(visitLogsRef, logData);
    
    // Transition to large green success card
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
    }, 600);
  };

  const handleNewEntry = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push("/");
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage?.imageUrl || ""}
            alt="Background"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[#001F3F]/80 backdrop-blur-sm" />
        </div>

        <Card className="relative z-10 max-w-xl w-full border-none shadow-[0_0_100px_rgba(34,197,94,0.3)] animate-in zoom-in-95 duration-500 overflow-hidden bg-[#336600] rounded-[3rem]">
          <CardContent className="py-20 text-center space-y-10 px-12">
            <div className="mx-auto w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-white ring-8 ring-white/10 animate-pulse">
              <CheckCircle2 className="h-20 w-20 stroke-[2.5px]" />
            </div>

            <div className="space-y-4">
              <h2 className="text-5xl font-black text-white tracking-tighter">Success!</h2>
              <p className="text-white/90 font-bold text-2xl leading-tight">
                Welcome to NEU Library!
              </p>
              <p className="text-white/60 text-sm uppercase tracking-[0.2em] font-black">
                Enjoy your session.
              </p>
            </div>

            <div className="pt-6">
              <Button 
                onClick={handleNewEntry}
                className="w-full h-16 text-lg font-black bg-white hover:bg-white/90 text-[#336600] rounded-2xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
              >
                <RefreshCw className="h-5 w-5" />
                Done / New Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage?.imageUrl || ""}
          alt="Library Background"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[#2258C3]/75 backdrop-blur-[2px]" />
      </div>

      <header className="relative z-20 flex justify-between items-center p-8">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-xl shadow-xl w-12 h-12 flex items-center justify-center overflow-hidden border border-white/20">
            <div className="relative w-10 h-10">
              <Image 
                src={logoImage?.imageUrl || ""} 
                alt="Logo" 
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
          </div>
          <span className="font-black text-white text-xl tracking-tight hidden sm:block">NEU Library</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Avatar className="h-12 w-12 border-2 border-white/50 shadow-xl cursor-pointer hover:scale-105 transition-transform">
                <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "User"} />
                <AvatarFallback className="bg-white/20 text-white"><User className="h-6 w-6" /></AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-0 border-none shadow-2xl rounded-2xl overflow-hidden mt-2">
              <div className="p-4 bg-white space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/10">
                    <AvatarImage src={user?.photoURL || undefined} />
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-sm text-foreground truncate">{user?.displayName || "User"}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <Separator />
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm font-semibold hover:bg-muted/50 h-11 px-2 text-red-600"
                  onClick={handleNewEntry}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign out
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center px-8 lg:px-24 gap-12 lg:gap-24">
        <div className="flex-1 w-full text-center lg:text-left animate-in slide-in-from-left duration-700">
          <h1 className="text-white text-6xl sm:text-7xl font-black tracking-tighter drop-shadow-lg mb-2">
            Hello!
          </h1>
          <h2 
            className="text-[#FFD700] text-7xl sm:text-8xl drop-shadow-2xl"
            style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold' }}
          >
            {user?.displayName?.split(' ')[0] || "Guest"}
          </h2>
        </div>

        <div className="flex-1 w-full max-w-md animate-in slide-in-from-right duration-700">
          <Card className="bg-[#1a2e2a]/90 backdrop-blur-xl border-none shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-10 flex flex-col items-center space-y-8">
              <div className="bg-white rounded-full shadow-2xl w-24 h-24 flex items-center justify-center overflow-hidden border-4 border-white/10">
                <div className="relative w-20 h-20">
                  <Image 
                    src={logoImage?.imageUrl || ""} 
                    alt="NEU Logo" 
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-3xl font-black text-white tracking-tight">Library Check-in</h3>
                <p className="text-white/60 text-sm font-medium">Please provide your visit details.</p>
              </div>

              <div className="w-full space-y-6">
                <div className="space-y-2.5">
                  <Label htmlFor="purpose" className="text-white/80 font-bold text-xs uppercase tracking-widest ml-1">Purpose of Visit</Label>
                  <Select onValueChange={setPurpose} value={purpose}>
                    <SelectTrigger id="purpose" className="h-14 bg-white/5 border-white/10 text-white text-base rounded-xl focus:ring-[#FFD700] transition-all hover:bg-white/10">
                      <SelectValue placeholder="Select a purpose" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2e2a] border-white/10 text-white">
                      {VISIT_PURPOSES.map((p) => (
                        <SelectItem key={p} value={p} className="focus:bg-white/10 focus:text-[#FFD700]">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="college" className="text-white/80 font-bold text-xs uppercase tracking-widest ml-1">Department / College</Label>
                  <Select onValueChange={setCollege} value={college}>
                    <SelectTrigger id="college" className="h-14 bg-white/5 border-white/10 text-white text-base rounded-xl focus:ring-[#FFD700] transition-all hover:bg-white/10">
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2e2a] border-white/10 text-white">
                      {COLLEGES.map((c) => (
                        <SelectItem key={c} value={c} className="focus:bg-white/10 focus:text-[#FFD700]">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full h-14 text-lg font-black bg-white hover:bg-white/90 text-[#1a2e2a] rounded-xl shadow-xl active:scale-95 transition-all mt-4 group" 
                  onClick={handleCheckIn}
                  disabled={!purpose || !college || isLoading}
                >
                  {isLoading ? "Recording..." : "Check In"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="relative z-10 p-8 flex justify-center lg:justify-start">
        <div className="bg-black/20 backdrop-blur-md p-3 px-5 rounded-full border border-white/10">
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Terminal Monitoring • NEU Library
          </p>
        </div>
      </footer>
    </div>
  );
}
