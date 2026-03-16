
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Phone, Mail, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { INSTITUTIONAL_DOMAIN } from "@/lib/constants";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth, useFirestore } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import Image from "next/image";

export default function LoginPage() {
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  
  const heroImage = PlaceHolderImages.find(img => img.id === 'library-hero');
  const logoImage = PlaceHolderImages.find(img => img.id === 'neu-logo');

  const handleLogin = async () => {
    if (!auth || !firestore) return;
    setIsAuthenticating(true);
    
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email || "";

      // Strict Institutional check
      if (!email.endsWith(INSTITUTIONAL_DOMAIN) && email !== 'jcesperanza@neu.edu.ph' && role === 'student') {
        await signOut(auth);
        toast({
          variant: "destructive",
          title: "Institutional Access Only",
          description: `Students must use their ${INSTITUTIONAL_DOMAIN} account.`,
        });
        setIsAuthenticating(false);
        return;
      }

      // Check if user is blocked
      const userRef = doc(firestore, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists() && userSnap.data().isBlocked === true) {
        await signOut(auth);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Your account has been blocked from the library facility.",
        });
        setIsAuthenticating(false);
        return;
      }

      // Special Admin check for jcesperanza@neu.edu.ph
      const isSuperAdmin = email === 'jcesperanza@neu.edu.ph';

      // Sync user profile
      setDocumentNonBlocking(userRef, {
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: isSuperAdmin ? 'admin' : (userSnap.exists() ? userSnap.data().role : 'user'),
        isBlocked: false,
        collegeId: userSnap.exists() ? userSnap.data().collegeId : 'Unassigned'
      }, { merge: true });

      toast({
        title: "Authenticated Successfully",
        description: `Welcome, ${user.displayName || 'User'}.`,
      });

      if (role === 'student' && !isSuperAdmin) {
        router.push("/check-in");
      } else {
        router.push("/admin");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "An error occurred during sign-in.",
      });
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage?.imageUrl || ""}
          alt="NEU Library Building"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className={cn(
          "absolute inset-0 transition-all duration-700 ease-in-out backdrop-blur-[2px]", 
          role === 'student' ? "bg-[#2258C3]/60" : "bg-[#FFD700]/40"
        )} />
      </div>

      <Card className="relative z-10 w-full max-w-2xl bg-[#001F3F]/85 backdrop-blur-md border-none shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] rounded-[3.5rem] overflow-hidden">
        <CardContent className="flex flex-col items-center p-14 pt-16 space-y-12">
          <div className="bg-white rounded-full shadow-2xl ring-4 ring-[#FFD700] w-40 h-40 flex items-center justify-center overflow-hidden">
            <div className="relative w-32 h-32">
              <Image 
                src={logoImage?.imageUrl || ""} 
                alt="NEU Logo" 
                fill 
                sizes="128px"
                className="object-contain" 
                priority 
              />
            </div>
          </div>

          <div className="text-center space-y-3">
            <h1 className="text-6xl tracking-tight" style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold', color: '#FFD700' }}>
              NEU Library
            </h1>
            <p className="text-white/50 text-sm font-black uppercase tracking-[0.5em]">PORTAL</p>
          </div>

          <RadioGroup 
            defaultValue="student" 
            className="flex items-center gap-16" 
            onValueChange={(v) => setRole(v as 'student' | 'admin')}
          >
            <div className="flex items-center space-x-4 group cursor-pointer">
              <RadioGroupItem value="student" id="student" className="border-white text-[#FFD700] scale-150" />
              <Label htmlFor="student" className="text-white font-black uppercase text-sm tracking-[0.2em] cursor-pointer group-hover:text-[#FFD700] transition-colors">Student</Label>
            </div>
            <div className="flex items-center space-x-4 group cursor-pointer">
              <RadioGroupItem value="admin" id="admin" className="border-white text-[#FFD700] scale-150" />
              <Label htmlFor="admin" className="text-white font-black uppercase text-sm tracking-[0.2em] cursor-pointer group-hover:text-[#FFD700] transition-colors">Admin</Label>
            </div>
          </RadioGroup>

          <Button 
            onClick={handleLogin}
            disabled={isAuthenticating}
            className="w-full h-24 bg-[#FFD700] hover:bg-[#FFD700]/90 text-black font-black text-xl rounded-[2rem] transition-all shadow-2xl group uppercase tracking-[0.3em] active:scale-95"
          >
            {isAuthenticating ? <Loader2 className="h-8 w-8 animate-spin mr-3" /> : "Sign in with Institutional ID"}
          </Button>

          <div className="bg-white/5 p-8 rounded-[2rem] text-center w-full border border-white/10">
            <p className="text-[#FFD700] font-bold text-sm leading-relaxed uppercase tracking-widest">
              Authorized NEU Account Only<br />(@neu.edu.ph)
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="relative z-10 mt-16 flex flex-col items-center gap-10 w-full max-w-3xl">
        <div className="flex flex-wrap justify-center items-center gap-x-20 gap-y-6 px-12 py-7 bg-black/60 backdrop-blur-2xl rounded-full border border-white/10 shadow-2xl">
          <div className="flex items-center gap-4 text-[#669900] font-black uppercase text-xs tracking-[0.15em]">
            <Phone className="h-5 w-5" />
            <span>+63 272736345</span>
          </div>
          <div className="flex items-center gap-4 text-[#FFD700] font-black uppercase text-xs tracking-[0.15em]">
            <Mail className="h-5 w-5" />
            <span>library@neu.edu.ph</span>
          </div>
          <div className="flex items-center gap-4 text-red-500 font-black uppercase text-xs tracking-[0.15em]">
            <MapPin className="h-5 w-5" />
            <span>Quezon City, PH</span>
          </div>
        </div>
        <div className="text-[12px] font-black text-white/40 uppercase tracking-[0.6em] drop-shadow-md">
          © {new Date().getFullYear()} New Era University
        </div>
      </div>
    </div>
  );
}
