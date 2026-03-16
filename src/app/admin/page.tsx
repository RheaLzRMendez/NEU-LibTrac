
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ResponsiveContainer, Cell, Pie, PieChart } from "recharts";
import { Users, Clock, Library, TrendingUp, Search, Loader2, UserCircle, FileDown, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { COLLEGES, VISIT_PURPOSES } from "@/lib/constants";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, isWithinInterval, startOfDay, endOfDay, subDays, startOfWeek, startOfMonth } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminDashboard() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  
  // Filters State
  const [dateRange, setDateRange] = useState<string>("all");
  const [selectedCollege, setSelectedCollege] = useState<string>("all");
  const [selectedPurpose, setSelectedPurpose] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const visitLogsQuery = useMemoFirebase(() => 
    query(collection(firestore, "visitLogs"), orderBy("timestamp", "desc")), 
    [firestore]
  );
  const { data: visitLogs, isLoading: isLogsLoading } = useCollection(visitLogsQuery);

  const usersQuery = useMemoFirebase(() => collection(firestore, "users"), [firestore]);
  const { data: users, isLoading: isUsersLoading } = useCollection(usersQuery);

  // Filtering Logic
  const filteredLogs = useMemo(() => {
    if (!visitLogs) return [];
    
    return visitLogs.filter(log => {
      const logDate = log.timestamp?.toDate ? log.timestamp.toDate() : new Date();
      let matchesDate = true;
      
      const now = new Date();
      if (dateRange === "today") {
        matchesDate = isWithinInterval(logDate, { start: startOfDay(now), end: endOfDay(now) });
      } else if (dateRange === "week") {
        matchesDate = isWithinInterval(logDate, { start: startOfWeek(now), end: endOfDay(now) });
      } else if (dateRange === "month") {
        matchesDate = isWithinInterval(logDate, { start: startOfMonth(now), end: endOfDay(now) });
      }

      const matchesCollege = selectedCollege === "all" || log.collegeId === selectedCollege;
      const matchesPurpose = selectedPurpose === "all" || log.purposeOfVisitId === selectedPurpose;
      const matchesType = selectedType === "all" || log.visitorType === selectedType;
      
      const matchesSearch = searchTerm === "" || 
        (log.displayName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.email || "").toLowerCase().includes(searchTerm.toLowerCase());

      return matchesDate && matchesCollege && matchesPurpose && matchesType && matchesSearch;
    });
  }, [visitLogs, dateRange, selectedCollege, selectedPurpose, selectedType, searchTerm]);

  const collegeData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLogs.forEach(log => {
      const cid = log.collegeId || 'Unassigned';
      counts[cid] = (counts[cid] || 0) + 1;
    });
    return COLLEGES.map((college, idx) => ({
      name: college.replace('College of ', ''),
      visitors: counts[college] || 0,
      fill: idx % 2 === 0 ? "#FFD700" : "#336600"
    })).filter(c => c.visitors > 0);
  }, [filteredLogs]);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("NEU Library Visitor Report", 14, 22);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${format(new Date(), "PPpp")}`, 14, 30);
    doc.text(`Filter Period: ${dateRange.toUpperCase()}`, 14, 35);
    doc.text(`Total Visitors: ${filteredLogs.length}`, 14, 40);

    const tableData = filteredLogs.map(log => [
      log.displayName || "Anonymous",
      log.email || "N/A",
      log.collegeId || "Unassigned",
      log.purposeOfVisitId || "N/A",
      log.visitorType || "N/A",
      log.timestamp ? format(log.timestamp.toDate(), "PPpp") : "Just now"
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Name', 'Email', 'College', 'Purpose', 'Type', 'Timestamp']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [51, 102, 0] }
    });

    doc.save(`NEU_Library_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const statTitleStyle = "text-[10px] font-black text-emerald-800 uppercase tracking-widest";
  const georgiaTitleStyle = { fontFamily: 'Georgia, serif', fontWeight: 'bold', color: '#336600' };

  if (isLogsLoading || isUsersLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-[#FFD700] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        <Card className="flex-1 border-none shadow-xl bg-[#FFD700] rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-10 flex flex-col items-start gap-6">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-full bg-black flex items-center justify-center shadow-lg">
                <UserCircle className="h-10 w-10 text-[#FFD700]" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-black uppercase tracking-[0.4em] opacity-70">Library Management</p>
                <h3 className="text-3xl font-black text-black tracking-tighter truncate max-w-[400px]">
                  {currentUser?.email || "Admin Access"}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-black text-white px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-[0.2em]">
                Verified Administrator
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:w-80 border-none shadow-xl bg-white rounded-[2.5rem] flex flex-col justify-center items-center p-8 gap-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Export Statistics</p>
          <Button 
            onClick={generatePDF}
            className="w-full h-16 bg-[#336600] hover:bg-[#336600]/90 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all"
          >
            <FileDown className="h-5 w-5 mr-3" />
            Download PDF
          </Button>
        </Card>
      </div>

      <Card className="border-none shadow-md bg-white rounded-[2rem] p-6">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="h-4 w-4 text-[#336600]" />
          <h4 className="text-xs font-black text-[#336600] uppercase tracking-widest">Statistical Filters</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Period</p>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">College</p>
            <Select value={selectedCollege} onValueChange={setSelectedCollege}>
              <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50">
                <SelectValue placeholder="Select college" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colleges</SelectItem>
                {COLLEGES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Purpose</p>
            <Select value={selectedPurpose} onValueChange={setSelectedPurpose}>
              <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50">
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Purposes</SelectItem>
                {VISIT_PURPOSES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Logs</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Name or Email..." 
                className="pl-10 rounded-xl border-slate-100 bg-slate-50 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Visitors", val: filteredLogs.length, icon: Users, sub: "Based on filters" },
          { title: "Active Users", val: users?.length || 0, icon: UserCircle, sub: "Registered in system" },
          { title: "Peak College", val: collegeData[0]?.name || "None", icon: Library, sub: "Top Attendance" },
          { title: "Data Feed", val: "Real-time", icon: TrendingUp, sub: "Active Stream" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-md bg-white rounded-3xl p-2 transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className={statTitleStyle}>{stat.title}</CardTitle>
              <div className="p-2 bg-emerald-50 rounded-xl"><stat.icon className="h-4 w-4 text-emerald-800" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900 truncate">{stat.val}</div>
              <p className="text-[10px] mt-2 font-bold text-emerald-600">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-md bg-white rounded-[2rem] p-6">
          <CardHeader className="px-0 pt-0 pb-6">
            <CardTitle className="text-2xl" style={georgiaTitleStyle}>Departmental Distribution</CardTitle>
            <CardDescription className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Attendance breakdown by college</CardDescription>
          </CardHeader>
          <CardContent className="px-0 flex flex-col md:flex-row items-center gap-8">
            <div className="h-[300px] w-full md:w-1/2">
              <ChartContainer config={{ visitors: { label: "Visitors" } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={collegeData.length > 0 ? collegeData : [{ name: "None", visitors: 1, fill: "#f1f5f9" }]} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={70} 
                      outerRadius={100} 
                      paddingAngle={5} 
                      dataKey="visitors" 
                      strokeWidth={0}
                    >
                      {collegeData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      {collegeData.length === 0 && <Cell fill="#f1f5f9" />}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent className="bg-white shadow-2xl rounded-xl border-none" />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="w-full md:w-1/2 grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2">
              {collegeData.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-slate-100">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                  <span className="text-[10px] font-black text-slate-600 uppercase truncate">{item.name}</span>
                  <span className="text-[10px] font-black text-slate-900 ml-auto">{item.visitors}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
// sdadsas
        <Card className="border-none shadow-md bg-[#336600] rounded-[2rem] p-8 text-white">
          <div className="h-full flex flex-col justify-between">
            <div className="space-y-6">
              <div className="p-4 bg-white/10 rounded-3xl inline-block"><TrendingUp className="h-8 w-8 text-[#FFD700]" /></div>
              <h4 className="text-3xl font-black tracking-tighter" style={{ fontFamily: 'Georgia, serif' }}>Log Overview</h4>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Institutional Usage Summary</p>
            </div>
            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-xs font-bold opacity-60">Today's Entries</span>
                <span className="font-black text-[#FFD700]">{filteredLogs.filter(l => isWithinInterval(l.timestamp?.toDate() || new Date(), { start: startOfDay(new Date()), end: endOfDay(new Date()) })).length}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-xs font-bold opacity-60">Status</span>
                <Badge className="bg-[#FFD700] text-black hover:bg-[#FFD700] font-black uppercase text-[8px] tracking-widest">Active Monitoring</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-none shadow-md bg-white rounded-[2rem] overflow-hidden">
        <CardHeader className="p-8">
          <CardTitle className="text-xl font-black text-[#336600]">Recent Visit Logs</CardTitle>
          <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">Detailed visitor audit history</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-black text-[10px] uppercase px-8">Visitor Name</TableHead>
                  <TableHead className="font-black text-[10px] uppercase">College</TableHead>
                  <TableHead className="font-black text-[10px] uppercase">Purpose</TableHead>
                  <TableHead className="font-black text-[10px] uppercase">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.slice(0, 10).map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50">
                    <TableCell className="px-8 font-bold text-slate-900">{log.displayName}</TableCell>
                    <TableCell className="text-xs text-slate-500">{log.collegeId}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-[#336600] border-[#336600]/20">{log.purposeOfVisitId}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">
                      {log.timestamp ? format(log.timestamp.toDate(), "PPpp") : "Just now"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
