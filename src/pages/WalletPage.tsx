import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowUpRight, ArrowDownLeft, Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PortalLayout from "@/components/portal/PortalLayout";
import { mockStore } from "@/lib/mockData";
import { toast } from "sonner";

const WalletPage = () => {
  const [search, setSearch] = useState("");
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  const balance = mockStore.getBalance();
  const transactions = mockStore.getTransactions(search);

  const [transferForm, setTransferForm] = useState({ recipient_email: "", amount: "", description: "" });
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const handleTransfer = () => {
    try {
      mockStore.transfer(transferForm.recipient_email, Number(transferForm.amount), transferForm.description);
      toast.success("Transfer successful!");
      setOpenDialog(null);
      setTransferForm({ recipient_email: "", amount: "", description: "" });
      refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeposit = () => {
    mockStore.deposit(Number(depositAmount));
    toast.success("Deposit successful!");
    setOpenDialog(null);
    setDepositAmount("");
    refresh();
  };

  const handleWithdraw = () => {
    try {
      mockStore.withdraw(Number(withdrawAmount));
      toast.success("Withdrawal successful!");
      setOpenDialog(null);
      setWithdrawAmount("");
      refresh();
    } catch (err: any) {
      toast.error(err.message);
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg">Transaction History</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search transactions..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                        <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
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
