import { useEffect, useState } from "react";
import { CreditCard, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PortalLayout from "@/components/portal/PortalLayout";
import api from "@/lib/api";
import { toast } from "sonner";

const AdminLoans = () => {
  const [loans, setLoans] = useState<any[]>([]);
  const [actionLoan, setActionLoan] = useState<any>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [approveForm, setApproveForm] = useState({ approved_amount: "", interest_rate: "15", term_months: "12" });
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLoans = async () => {
    try {
      const res = await api.get("/loans/pending");
      setLoans(res.data.loans || res.data || []);
    } catch {}
  };

  useEffect(() => { fetchLoans(); }, []);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await api.put(`/loans/approve/${actionLoan.id}`, {
        approved_amount: Number(approveForm.approved_amount),
        interest_rate: Number(approveForm.interest_rate),
        term_months: Number(approveForm.term_months),
      });
      toast.success("Loan approved!");
      setActionType(null);
      fetchLoans();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await api.put(`/loans/reject/${actionLoan.id}`, { reason: rejectReason });
      toast.success("Loan rejected");
      setActionType(null);
      fetchLoans();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const statusColor: Record<string, string> = {
    pending: "bg-gold/10 text-gold",
    approved: "bg-accent/10 text-accent",
    rejected: "bg-destructive/10 text-destructive",
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Loan Administration</h1>
          <p className="text-muted-foreground">Review and manage loan applications</p>
        </div>

        <Card className="shadow-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No pending loans</TableCell></TableRow>
                ) : loans.map((loan, i) => (
                  <TableRow key={loan.id || i}>
                    <TableCell className="font-medium">{loan.user_name || loan.email || "—"}</TableCell>
                    <TableCell>{Number(loan.amount).toLocaleString()} RWF</TableCell>
                    <TableCell>{loan.purpose || "—"}</TableCell>
                    <TableCell>{loan.term_months}mo</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColor[loan.status] || ""}>{loan.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {loan.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-accent" onClick={() => { setActionLoan(loan); setActionType("approve"); setApproveForm({ approved_amount: String(loan.amount), interest_rate: "15", term_months: String(loan.term_months) }); }}>
                            <CheckCircle className="h-3 w-3 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive" onClick={() => { setActionLoan(loan); setActionType("reject"); setRejectReason(""); }}>
                            <XCircle className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Approve Dialog */}
        <Dialog open={actionType === "approve"} onOpenChange={(o) => !o && setActionType(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Approve Loan</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2"><Label>Approved Amount</Label><Input type="number" value={approveForm.approved_amount} onChange={(e) => setApproveForm(p => ({...p, approved_amount: e.target.value}))} /></div>
              <div className="space-y-2"><Label>Interest Rate (%)</Label><Input type="number" value={approveForm.interest_rate} onChange={(e) => setApproveForm(p => ({...p, interest_rate: e.target.value}))} /></div>
              <div className="space-y-2"><Label>Term (months)</Label><Input type="number" value={approveForm.term_months} onChange={(e) => setApproveForm(p => ({...p, term_months: e.target.value}))} /></div>
              <Button onClick={handleApprove} disabled={loading} className="w-full bg-gradient-accent text-primary-foreground">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Approve Loan
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={actionType === "reject"} onOpenChange={(o) => !o && setActionType(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Reject Loan</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2"><Label>Reason</Label><Input placeholder="Insufficient credit history" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} /></div>
              <Button onClick={handleReject} disabled={loading} variant="destructive" className="w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Reject Loan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PortalLayout>
  );
};

export default AdminLoans;
