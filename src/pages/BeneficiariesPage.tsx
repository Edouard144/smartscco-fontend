import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PortalLayout from "@/components/portal/PortalLayout";
import api from "@/lib/api";
import { toast } from "sonner";

const BeneficiariesPage = () => {
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState({ email: "", full_name: "", phone: "" });

  const fetchBeneficiaries = async () => {
    try {
      const res = await api.get("/beneficiaries");
      setBeneficiaries(res.data.beneficiaries || res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBeneficiaries(); }, []);

  const handleAdd = async () => {
    setActionLoading(true);
    try {
      await api.post("/beneficiaries", form);
      toast.success("Beneficiary added!");
      setAddOpen(false);
      setForm({ email: "", full_name: "", phone: "" });
      fetchBeneficiaries();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add beneficiary");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await api.delete(`/beneficiaries/${id}`);
      toast.success("Beneficiary removed");
      fetchBeneficiaries();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to remove");
    }
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Beneficiaries</h1>
            <p className="text-muted-foreground">Manage your saved recipients</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-accent text-primary-foreground hover:opacity-90">
                <Plus className="h-4 w-4 mr-1" /> Add Beneficiary
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Beneficiary</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2"><Label>Full Name</Label><Input placeholder="John Doe" value={form.full_name} onChange={(e) => setForm(p => ({...p, full_name: e.target.value}))} /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="john@example.com" value={form.email} onChange={(e) => setForm(p => ({...p, email: e.target.value}))} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input placeholder="+250788123456" value={form.phone} onChange={(e) => setForm(p => ({...p, phone: e.target.value}))} /></div>
                <Button onClick={handleAdd} disabled={actionLoading} className="w-full bg-gradient-accent text-primary-foreground">
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Add
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {beneficiaries.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No beneficiaries yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {beneficiaries.map((b, i) => (
              <motion.div key={b.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="shadow-card hover:shadow-card-hover transition-shadow">
                  <CardContent className="flex items-center justify-between pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                        {b.full_name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{b.full_name}</p>
                        <p className="text-xs text-muted-foreground">{b.email}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemove(b.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default BeneficiariesPage;
