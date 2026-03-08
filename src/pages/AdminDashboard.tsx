import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Wallet, CreditCard, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PortalLayout from "@/components/portal/PortalLayout";
import api from "@/lib/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get("/admin/dashboard").then(res => setStats(res.data)).catch(() => {});
  }, []);

  const cards = [
    { label: "Total Members", value: stats?.totalMembers || stats?.total_members || 0, icon: Users, color: "bg-primary/10 text-primary" },
    { label: "Total Deposits", value: `${Number(stats?.totalDeposits || stats?.total_deposits || 0).toLocaleString()} RWF`, icon: Wallet, color: "bg-accent/10 text-accent" },
    { label: "Active Loans", value: stats?.activeLoans || stats?.active_loans || 0, icon: CreditCard, color: "bg-gold/10 text-gold" },
    { label: "Total Transactions", value: stats?.totalTransactions || stats?.total_transactions || 0, icon: Activity, color: "bg-navy-light/10 text-navy-light" },
  ];

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and analytics</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-card">
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="font-display text-2xl font-bold text-foreground">{card.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
};

export default AdminDashboard;
