import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowUpRight, ArrowDownLeft, Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PortalLayout from "@/components/portal/PortalLayout";
import api from "@/lib/api";
import { toast } from "sonner";

const WalletPage = () => {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Transfer form
  const [transferForm, setTransferForm] = useState({ recipient_email: "", amount: "", description: "" });
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [bRes, tRes] = await Promise.allSettled([
        api.get("/wallet/balance"),
        api.get(`/wallet/transactions?search=${search}`),
      ]);
      if (bRes.status === "fulfilled") setBalance(bRes.value.data.balance || bRes.value.data.amount || 0);
      if (tRes.status === "fulfilled") setTransactions(tRes.value.data.transactions || tRes.value.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleTransfer = async () => {
    setActionLoading(true);
    try {
      await api.post("/wallet/transfer", {
        recipient_email: transferForm.recipient_email,
        amount: Number(transferForm.amount),
        description: transferForm.description,
      });
      toast.success("Transfer successful!");
      setOpenDialog(null);
      setTransferForm({ recipient_email: "", amount: "", description: "" });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Transfer failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeposit = async () => {
    setActionLoading(true);
    try {
      await api.post("/wallet/deposit", { amount: Number(depositAmount), method: "bank_transfer" });
      toast.success("Deposit successful!");
      setOpenDialog(null);
      setDepositAmount("");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Deposit failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setActionLoading(true);
    try {
      await api.post("/wallet/withdraw", { amount: Number(withdrawAmount), method: "bank_transfer" });
      toast.success("Withdrawal successful!");
      setOpenDialog(null);
      setWithdrawAmount("");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Withdrawal failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Wallet</h1>
            <p className="text-muted-foreground">Manage your funds</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={openDialog === "transfer"} onOpenChange={(o) => setOpenDialog(o ? "transfer" : null)}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-accent text-primary-foreground hover:opacity-90">
                  <ArrowUpRight className="h-4 w-4 mr-1" /> Send
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Send Money</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2"><Label>Recipient Email</Label><Input placeholder="recipient@example.com" value={transferForm.recipient_email} onChange={(e) => setTransferForm(p => ({...p, recipient_email: e.target.value}))} /></div>
                  <div className="space-y-2"><Label>Amount (RWF)</Label><Input type="number" placeholder="10000" value={transferForm.amount} onChange={(e) => setTransferForm(p => ({...p, amount: e.target.value}))} /></div>
                  <div className="space-y-2"><Label>Description</Label><Input placeholder="Payment for..." value={transferForm.description} onChange={(e) => setTransferForm(p => ({...p, description: e.target.value}))} /></div>
                  <Button onClick={handleTransfer} disabled={actionLoading} className="w-full bg-gradient-accent text-primary-foreground">
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Send Money
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={openDialog === "deposit"} onOpenChange={(o) => setOpenDialog(o ? "deposit" : null)}>
              <DialogTrigger asChild>
                <Button variant="outline"><ArrowDownLeft className="h-4 w-4 mr-1" /> Deposit</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Deposit Funds</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2"><Label>Amount (RWF)</Label><Input type="number" placeholder="50000" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} /></div>
                  <Button onClick={handleDeposit} disabled={actionLoading} className="w-full bg-gradient-accent text-primary-foreground">
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Deposit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={openDialog === "withdraw"} onOpenChange={(o) => setOpenDialog(o ? "withdraw" : null)}>
              <DialogTrigger asChild>
                <Button variant="outline">Withdraw</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Withdraw Funds</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2"><Label>Amount (RWF)</Label><Input type="number" placeholder="10000" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} /></div>
                  <Button onClick={handleWithdraw} disabled={actionLoading} className="w-full bg-gradient-accent text-primary-foreground">
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Withdraw
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Balance Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-hero text-primary-foreground shadow-hero">
            <CardContent className="pt-6">
              <p className="text-primary-foreground/60 text-sm">Available Balance</p>
              <p className="font-display text-4xl font-bold mt-1">{Number(balance).toLocaleString()} RWF</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transaction History */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg">Transaction History</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search transactions..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchData()} />
            </div>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No transactions found</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3 hover:shadow-card transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        tx.type === "credit" || tx.type === "deposit" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
                      }`}>
                        {tx.type === "credit" || tx.type === "deposit" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{tx.description || tx.type}</p>
                        <p className="text-xs text-muted-foreground">{new Date(tx.created_at || tx.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${tx.type === "credit" || tx.type === "deposit" ? "text-accent" : "text-destructive"}`}>
                      {tx.type === "credit" || tx.type === "deposit" ? "+" : "-"}{Number(tx.amount).toLocaleString()} RWF
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default WalletPage;
