import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { useEffect } from "react";
import { toast } from "sonner";

const BeneficiariesPage = () => {
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ email: "", full_name: "", phone: "" });

  const { user } = useAuth();
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBeneficiaries = async () => {
    try {
      const res = await api.get("/beneficiaries");
      setBeneficiaries(res.data.beneficiaries || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchBeneficiaries();
  }, [user, forceUpdate]);

  const handleAdd = async () => {
    try {
      await api.post("/beneficiaries", { 
        beneficiary_user_id: Number(form.email), // Repurposing email field as user_id for now
        nickname: form.full_name 
      });
      toast.success("Beneficiary added!");
      setAddOpen(false);
      setForm({ email: "", full_name: "", phone: "" });
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await api.delete(`/beneficiaries/${id}`);
      toast.success("Beneficiary removed");
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
                <div className="space-y-2"><Label>Nickname / Full Name</Label><Input placeholder="John Doe" value={form.full_name} onChange={(e) => setForm(p => ({...p, full_name: e.target.value}))} /></div>
                <div className="space-y-2"><Label>User ID</Label><Input type="number" placeholder="Enter recipient's User ID (e.g., 2)" value={form.email} onChange={(e) => setForm(p => ({...p, email: e.target.value}))} /></div>
                {/* Phone removed as backend doesn't take it directly during add */}
                <Button onClick={handleAdd} className="w-full bg-gradient-accent text-primary-foreground">Add</Button>
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
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold uppercase">
                        {(b.nickname || b.full_name)?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{b.nickname || b.full_name}</p>
                        <p className="text-xs text-muted-foreground">{b.email || b.phone || "No contact info"}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemove(b.beneficiary_id)} className="text-destructive hover:text-destructive">
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
