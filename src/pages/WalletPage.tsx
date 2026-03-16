import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowUpRight, ArrowDownLeft, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PortalLayout from "@/components/portal/PortalLayout";
import TransactionDetailsDialog from "@/components/portal/TransactionDetailsDialog";
import { toast } from "sonner";
import api from "@/lib/api";
import { useEffect } from "react";

const WalletPage = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  const [balance, setBalance] = useState(0);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWalletData = async () => {
    try {
      const [balRes, txRes] = await Promise.all([
        api.get("/wallet/balance"),
        api.get("/wallet/transactions")
      ]);
      setBalance(Number(balRes.data.wallet?.balance) || Number(balRes.data.balance) || 0);
      setAllTransactions(txRes.data.transactions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [forceUpdate]);

  let transactions = allTransactions.filter((t: any) =>
    (t.description || t.type).toLowerCase().includes(search.toLowerCase())
  );
  if (categoryFilter !== "all") {
    transactions = transactions.filter((t: any) => t.category === categoryFilter);
  }

  const [transferForm, setTransferForm] = useState({ recipient_email: "", amount: "", description: "" });
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  const handleTransfer = async () => {
    try {
      // NOTE: The real endpoint requires receiver_id and pin. Until the UI is updated, this might fail unless adapted.
      await api.post("/wallet/transfer", { 
        receiver_id: transferForm.recipient_email, // Temporary workaround/placeholder
        amount: Number(transferForm.amount), 
        pin: "1234" // Mock pin for now as there's no UI input for it
      });
      toast.success("Transfer successful!");
      setOpenDialog(null);
      setTransferForm({ recipient_email: "", amount: "", description: "" });
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message);
    }
  };

  const handleDeposit = async () => {
    try {
      await api.post("/wallet/deposit", { amount: Number(depositAmount) });
      toast.success("Deposit successful!");
      setOpenDialog(null);
      setDepositAmount("");
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message);
    }
  };

  const handleWithdraw = async () => {
    try {
      await api.post("/wallet/withdraw", { 
        amount: Number(withdrawAmount),
        pin: "1234" // Mock pin for now
      });
      toast.success("Withdrawal successful!");
      setOpenDialog(null);
      setWithdrawAmount("");
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message);
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
                  <Button onClick={handleTransfer} className="w-full bg-gradient-accent text-primary-foreground">Send Money</Button>
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
                  <Button onClick={handleDeposit} className="w-full bg-gradient-accent text-primary-foreground">Deposit</Button>
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
                  <Button onClick={handleWithdraw} className="w-full bg-gradient-accent text-primary-foreground">Withdraw</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-hero text-primary-foreground shadow-hero">
            <CardContent className="pt-6">
              <p className="text-primary-foreground/60 text-sm">Available Balance</p>
              <p className="font-display text-4xl font-bold mt-1">{balance.toLocaleString()} RWF</p>
            </CardContent>
          </Card>
        </motion.div>

        <Card className="shadow-card">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="font-display text-lg">Transaction History</CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-36">
                  <Filter className="h-3.5 w-3.5 mr-1.5" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {/* Since TRANSACTION_CATEGORIES was static, we just list a few or remove category filtering for now */}
                  <SelectItem value="deposit">Deposits</SelectItem>
                  <SelectItem value="withdraw">Withdrawals</SelectItem>
                  <SelectItem value="transfer">Transfers</SelectItem>
                  <SelectItem value="loan_disbursement">Loans</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No transactions found</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx: any, i: number) => {
                  const isCredit = tx.type === "credit" || tx.type === "deposit";
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedTx(tx)}
                      className="flex items-center justify-between rounded-lg border border-border p-3 hover:shadow-card transition-shadow cursor-pointer hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isCredit ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>
                          {isCredit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{tx.description || tx.type}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-border">
                              {tx.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold ${isCredit ? "text-accent" : "text-destructive"}`}>
                        {isCredit ? "+" : "-"}{Number(tx.amount).toLocaleString()} RWF
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <TransactionDetailsDialog
          transaction={selectedTx}
          open={!!selectedTx}
          onOpenChange={(o) => !o && setSelectedTx(null)}
        />
      </div>
    </PortalLayout>
  );
};

export default WalletPage;
