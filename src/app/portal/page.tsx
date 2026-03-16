"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Activity, Fingerprint, ChevronRight, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { format } from "date-fns";

export default function StudentDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();

  // Fetch recent visits for "Live Traffic"
  const userLogsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, "visitLogs"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(5)
    );
  }, [firestore, user]);

  const { data: recentLogs, isLoading } = useCollection(userLogsQuery);

  // Summarize stats
  const totalVisits = recentLogs?.length || 0;
  
  // Analytics for the purpose pie chart
  const purposeData = useMemo(() => {
    if (!recentLogs) return [];
    const counts: Record<string, number> = {};
    recentLogs.forEach(log => {
      counts[log.purposeOfVisitId] = (counts[log.purposeOfVisitId] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [recentLogs]);

  const COLORS = ['#0a1e3b', '#2258C3', '#FFD700', '#669900'];

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-[#0a1e3b] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#0a1e3b]/10 flex items-center justify-center text-[#0a1e3b]">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Study Time</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">1</span>
                <span className="text-xs font-bold text-slate-400">hrs</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
              <p className="text-2xl font-black text-emerald-600">Active</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <Fingerprint className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student ID</p>
              <p className="text-lg font-black text-slate-900 leading-none mt-1">
                {user?.uid.slice(0, 10).toUpperCase() || "PENDING"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Traffic Section */}
      <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between px-8 py-6 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <CardTitle className="text-base font-black text-[#0a1e3b]">Live Traffic</CardTitle>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Your latest library visits</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs h-9 px-4">
            View All
          </Button>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-50 hover:bg-transparent">
                <TableHead className="text-[10px] font-black text-slate-300 uppercase px-0">Date</TableHead>
                <TableHead className="text-[10px] font-black text-slate-300 uppercase text-center">Time In</TableHead>
                <TableHead className="text-[10px] font-black text-slate-300 uppercase text-center">Time Out</TableHead>
                <TableHead className="text-[10px] font-black text-slate-300 uppercase">Purpose</TableHead>
                <TableHead className="text-[10px] font-black text-slate-300 uppercase text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLogs && recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <TableRow key={log.id} className="group hover:bg-slate-50 border-slate-50 transition-colors">
                    <TableCell className="px-0 py-4 font-bold text-slate-600 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center">
                          <ChevronRight className="h-3 w-3 text-slate-300" />
                        </div>
                        {log.timestamp ? format(log.timestamp.toDate(), "MMM dd, yyyy") : "Just now"}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-xs font-semibold text-slate-400">
                       {log.timestamp ? format(log.timestamp.toDate(), "h:mm a") : "---"}
                    </TableCell>
                    <TableCell className="text-center text-xs font-semibold text-slate-400">
                       {log.timestamp ? format(log.timestamp.toDate(), "h:mm a") : "---"}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-[#0a1e3b] text-white rounded-lg px-3 py-1 text-[10px] font-bold">
                        {log.purposeOfVisitId}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-[10px] font-black text-slate-300 uppercase">Done</span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-400 font-bold">
                    No recent visits found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Visits by Purpose Analytics */}
      <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="px-8 py-6 pb-0">
          <CardTitle className="text-base font-black text-[#0a1e3b]">Visits by Purpose</CardTitle>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Breakdown of your library session types</p>
        </CardHeader>
        <CardContent className="px-8 py-8 flex flex-col md:flex-row items-center gap-12">
          <div className="h-[180px] w-[180px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={purposeData.length > 0 ? purposeData : [{ name: 'Empty', value: 1 }]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(purposeData.length > 0 ? purposeData : [{ name: 'Empty', value: 1 }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={purposeData.length > 0 ? COLORS[index % COLORS.length] : '#f1f5f9'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex-1 w-full space-y-6">
            {purposeData.map((item, i) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wider">
                  <span className="text-[#0a1e3b]">{item.name}</span>
                  <span className="text-[#0a1e3b]">{item.value} ({Math.round((item.value / totalVisits) * 100)}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ 
                      backgroundColor: COLORS[i % COLORS.length], 
                      width: `${(item.value / totalVisits) * 100}%` 
                    }} 
                  />
                </div>
              </div>
            ))}
            {purposeData.length === 0 && (
              <p className="text-xs font-bold text-slate-300 italic">No data to display</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
