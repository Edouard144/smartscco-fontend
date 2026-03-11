import { motion } from "framer-motion";
import { TrendingUp, AlertCircle, CheckCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import PortalLayout from "@/components/portal/PortalLayout";

const SCORE = 72;
const getScoreLabel = (s: number) => s >= 80 ? "Excellent" : s >= 60 ? "Good" : s >= 40 ? "Fair" : "Poor";
const getScoreColor = (s: number) => s >= 80 ? "text-accent" : s >= 60 ? "text-primary" : s >= 40 ? "text-yellow-500" : "text-destructive";

const factors = [
  { label: "On-time Loan Repayments", score: 85, impact: "positive" as const, detail: "All 3 loan repayments made on time" },
  { label: "Account Age", score: 65, impact: "positive" as const, detail: "Account active for 8 months" },
  { label: "Savings Consistency", score: 78, impact: "positive" as const, detail: "Regular monthly deposits detected" },
  { label: "Debt-to-Income Ratio", score: 55, impact: "negative" as const, detail: "Current ratio: 35% — aim for below 30%" },
  { label: "Transaction Diversity", score: 60, impact: "neutral" as const, detail: "Moderate variety in transaction types" },
];

const tips = [
  "Make all loan repayments on or before the due date",
  "Maintain consistent monthly savings deposits",
  "Reduce outstanding debt to improve debt-to-income ratio",
  "Diversify transactions (bills, transfers, savings)",
  "Keep your account active with regular activity",
];

const CreditScorePage = () => {
  const label = getScoreLabel(SCORE);
  const color = getScoreColor(SCORE);

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Credit Score</h1>
          <p className="text-muted-foreground">Your financial health overview</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Score Gauge */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="md:col-span-1">
            <Card className="shadow-card text-center h-full">
              <CardContent className="pt-8 pb-6 flex flex-col items-center justify-center h-full">
                <div className="relative w-40 h-40 mx-auto">
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--primary))" strokeWidth="10"
                      strokeDasharray={`${SCORE * 3.14} ${314 - SCORE * 3.14}`}
                      strokeLinecap="round" className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`font-display text-4xl font-bold ${color}`}>{SCORE}</span>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                  </div>
                </div>
                <Badge className={`mt-4 ${SCORE >= 60 ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>
                  {label}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>

          {/* Score Breakdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2">
            <Card className="shadow-card h-full">
              <CardHeader><CardTitle className="font-display text-lg">Score Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {factors.map((f, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {f.impact === "positive" ? <CheckCircle className="h-3.5 w-3.5 text-accent" /> :
                         f.impact === "negative" ? <AlertCircle className="h-3.5 w-3.5 text-destructive" /> :
                         <Info className="h-3.5 w-3.5 text-muted-foreground" />}
                        <span className="text-sm font-medium text-foreground">{f.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">{f.score}/100</span>
                    </div>
                    <Progress value={f.score} className="h-2" />
                    <p className="text-xs text-muted-foreground">{f.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tips */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              <CardTitle className="font-display text-lg">Tips to Improve Your Score</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PortalLayout>
  );
};

export default CreditScorePage;
