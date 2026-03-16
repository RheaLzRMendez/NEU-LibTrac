"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { adminTrendSummary } from "@/ai/flows/admin-trend-summary";
import { Sparkles, Loader2, BarChart3, TrendingUp, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const MOCK_VISIT_LOGS = [
  { timestamp: new Date(Date.now() - 3600000).toISOString(), purposeOfVisit: "Study", college: "Engineering" },
  { timestamp: new Date(Date.now() - 7200000).toISOString(), purposeOfVisit: "Research", college: "Nursing" },
  { timestamp: new Date(Date.now() - 10800000).toISOString(), purposeOfVisit: "Borrowing", college: "Computer Studies" },
  { timestamp: new Date(Date.now() - 14400000).toISOString(), purposeOfVisit: "Study", college: "Computer Studies" },
  { timestamp: new Date(Date.now() - 18000000).toISOString(), purposeOfVisit: "Study", college: "Nursing" },
];

export default function TrendSummaryPage() {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateSummary = async () => {
    setIsLoading(true);
    try {
      const response = await adminTrendSummary({ visitLogs: MOCK_VISIT_LOGS });
      setSummary(response.summary);
    } catch (error) {
      console.error("AI Analysis failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const georgiaGoldTitle = { fontFamily: 'Georgia, serif', fontWeight: 'bold', color: '#FFD700' };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-[#FFD700] drop-shadow-sm" style={{ fontFamily: 'Georgia, serif' }}>AI Insights</h1>
          <p className="text-white/70 font-medium">Actionable intelligence based on recent visitor patterns.</p>
        </div>
        <Button 
          onClick={generateSummary} 
          disabled={isLoading}
          className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#336600] font-black shadow-lg"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {summary ? "Refresh Analysis" : "Generate Analysis"}
        </Button>
      </div>

      {!summary && !isLoading ? (
        <Card className="border-dashed border-2 border-white/20 bg-white/5 backdrop-blur-sm">
          <CardContent className="py-20 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-[#FFD700]" />
            </div>
            <div className="max-w-sm">
              <h3 className="text-lg font-semibold text-white">No active analysis</h3>
              <p className="text-sm text-white/60">
                Run the AI engine to analyze current visitor logs and generate insights for library management.
              </p>
            </div>
            <Button variant="outline" onClick={generateSummary} className="border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#336600]">
              Start Analysis Engine
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {isLoading ? (
            <Card className="bg-white animate-pulse">
              <CardHeader>
                <div className="h-6 w-1/3 bg-slate-100 rounded" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-4 w-full bg-slate-50 rounded" />
                <div className="h-4 w-5/6 bg-slate-50 rounded" />
              </CardContent>
            </Card>
          ) : (
            <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-[2.5rem]">
              <div className="h-1.5 w-full bg-[#FFD700]" />
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="h-10 w-10 bg-[#336600]/10 rounded-lg flex items-center justify-center text-[#336600]">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle style={georgiaGoldTitle}>Usage Patterns & Trends</CardTitle>
                  <CardDescription className="text-slate-500">Generated just now from {MOCK_VISIT_LOGS.length} recent logs</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {summary}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-none shadow-sm bg-white rounded-3xl">
              <CardContent className="pt-6 flex items-start gap-4">
                <BarChart3 className="h-8 w-8 text-[#336600] shrink-0" />
                <div>
                  <h4 className="font-bold text-[#336600]">Data Accuracy</h4>
                  <p className="text-xs text-slate-500">
                    Analysis is based on verified institutional logins and self-reported purposes of visit.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white rounded-3xl">
              <CardContent className="pt-6 flex items-start gap-4">
                <Info className="h-8 w-8 text-[#336600] shrink-0" />
                <div>
                  <h4 className="font-bold text-[#336600]">Decision Support</h4>
                  <p className="text-xs text-slate-500">
                    Use these insights to optimize staff schedules and resource allocation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
