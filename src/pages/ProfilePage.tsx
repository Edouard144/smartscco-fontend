import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserCircle, Loader2, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";

const ProfilePage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ full_name: "", phone: "", national_id: "" });
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ full_name: user.full_name || "", phone: user.phone || "", national_id: user.national_id || "" });
    }
    api.get("/users/my-devices").then(res => setDevices(res.data.devices || res.data || [])).catch(() => {});
  }, [user]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await api.put("/users/profile", form);
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Profile</h1>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-accent text-primary-foreground text-xl font-bold">
                  {user?.full_name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="text-foreground">{user?.full_name}</p>
                  <p className="text-sm text-muted-foreground font-normal">{user?.email}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Full Name</Label><Input value={form.full_name} onChange={(e) => setForm(p => ({...p, full_name: e.target.value}))} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm(p => ({...p, phone: e.target.value}))} /></div>
              <div className="space-y-2"><Label>National ID</Label><Input value={form.national_id} onChange={(e) => setForm(p => ({...p, national_id: e.target.value}))} /></div>
              <Button onClick={handleUpdate} disabled={loading} className="bg-gradient-accent text-primary-foreground hover:opacity-90">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save Changes
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {devices.length > 0 && (
          <Card className="shadow-card">
            <CardHeader><CardTitle className="font-display text-lg">Your Devices</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {devices.map((d, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{d.device_name || d.user_agent || "Unknown Device"}</p>
                    <p className="text-xs text-muted-foreground">{d.last_login ? new Date(d.last_login).toLocaleDateString() : "—"}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
};

export default ProfilePage;
