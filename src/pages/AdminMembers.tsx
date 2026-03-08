import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PortalLayout from "@/components/portal/PortalLayout";
import { MOCK_MEMBERS } from "@/lib/mockData";

const AdminMembers = () => {
  const [search, setSearch] = useState("");

  const filtered = search
    ? MOCK_MEMBERS.filter(m =>
        m.full_name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase())
      )
    : MOCK_MEMBERS;

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Member Management</h1>
            <p className="text-muted-foreground">View and manage all members</p>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search members..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <Card className="shadow-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No members found</TableCell></TableRow>
                ) : filtered.map((m, i) => (
                  <TableRow key={m.id || i}>
                    <TableCell className="font-medium">{m.full_name}</TableCell>
                    <TableCell>{m.email}</TableCell>
                    <TableCell>{m.phone || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={m.status === "active" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}>
                        {m.status || "active"}
                      </Badge>
                    </TableCell>
                    <TableCell>{m.created_at ? new Date(m.created_at).toLocaleDateString() : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
};

export default AdminMembers;
