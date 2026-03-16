
"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Ban, UserCheck, MoreVertical, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const firestore = useFirestore();
  const { toast } = useToast();

  const usersQuery = useMemoFirebase(() => collection(firestore, "users"), [firestore]);
  const { data: users, isLoading } = useCollection(usersQuery);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(user => 
      (user.displayName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const toggleBlockStatus = (user: any) => {
    const userRef = doc(firestore, "users", user.id);
    const newBlockedStatus = !user.isBlocked;
    
    updateDocumentNonBlocking(userRef, { isBlocked: newBlockedStatus });
    
    toast({
      title: newBlockedStatus ? "User Blocked" : "User Restored",
      description: `${user.displayName}'s library privileges have been ${newBlockedStatus ? 'revoked' : 'restored'}.`,
      variant: newBlockedStatus ? "destructive" : "default"
    });
  };

  const georgiaGoldTitle = { fontFamily: 'Georgia, serif', fontWeight: 'bold', color: '#FFD700' };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-[#FFD700] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom duration-700">
      <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] p-8 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-6 px-0 pt-0">
          <div>
            <CardTitle className="text-3xl tracking-tight" style={georgiaGoldTitle}>
              Institutional User Management
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">Control library facility access for verified @neu.edu.ph accounts.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-0 pt-8">
          <div className="relative mb-10 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 transition-colors group-focus-within:text-[#336600]" />
            <Input 
              placeholder="Query institutional user base by name or email..." 
              className="pl-16 h-16 bg-slate-50 border-slate-200 rounded-2xl text-lg font-medium text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#336600] transition-all focus:bg-white focus:shadow-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="rounded-3xl border border-slate-100 overflow-hidden shadow-sm bg-slate-50">
            <Table>
              <TableHeader className="bg-slate-100">
                <TableRow className="hover:bg-transparent border-slate-200">
                  <TableHead className="font-black text-[#336600] h-16 px-8 uppercase text-xs tracking-widest">Full Name</TableHead>
                  <TableHead className="font-black text-[#336600] h-16 uppercase text-xs tracking-widest">Email Address</TableHead>
                  <TableHead className="font-black text-[#336600] h-16 uppercase text-xs tracking-widest">Institutional Role</TableHead>
                  <TableHead className="font-black text-[#336600] h-16 uppercase text-xs tracking-widest">Facility Access</TableHead>
                  <TableHead className="font-black text-[#336600] h-16 text-right px-8 uppercase text-xs tracking-widest">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="group hover:bg-white transition-colors border-slate-100">
                      <TableCell className="font-bold text-slate-900 px-8 py-6">{user.displayName}</TableCell>
                      <TableCell className="text-slate-500 font-medium">{user.email}</TableCell>
                      <TableCell className="text-slate-700 font-bold uppercase text-[10px] tracking-widest">{user.role}</TableCell>
                      <TableCell>
                        <Badge 
                          className={`rounded-lg px-4 py-1.5 font-black tracking-tight shadow-sm ${
                            !user.isBlocked 
                            ? "bg-[#669900] text-white" 
                            : "bg-destructive text-white"
                          }`}
                        >
                          {!user.isBlocked ? "AUTHORIZED" : "REVOKED"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-12 w-12 hover:bg-slate-100 rounded-2xl">
                              <MoreVertical className="h-6 w-6 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-64 p-3 rounded-3xl bg-white border-slate-200 shadow-2xl">
                            <DropdownMenuLabel className="font-black text-[#336600] px-3 py-4 uppercase text-[10px] tracking-widest">System Controls</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem 
                              className={`rounded-2xl px-4 py-4 font-black cursor-pointer mb-2 transition-all ${
                                !user.isBlocked 
                                ? "text-red-500 focus:bg-red-50 focus:text-red-600" 
                                : "text-[#336600] focus:bg-slate-50"
                              }`}
                              onClick={() => toggleBlockStatus(user)}
                            >
                              {!user.isBlocked ? (
                                <>
                                  <Ban className="h-5 w-5 mr-4" />
                                  Block Access
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-5 w-5 mr-4" />
                                  Restore Access
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Search className="h-12 w-12 text-slate-200" />
                        <p className="font-bold text-slate-400 text-lg">No institutional users match your search.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
