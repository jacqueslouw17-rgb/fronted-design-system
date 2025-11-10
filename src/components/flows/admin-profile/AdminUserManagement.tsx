import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Mail, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "pending";
}

interface AdminUserManagementProps {
  formData: Record<string, any>;
  onComplete: (stepId: string, data?: Record<string, any>) => void;
  isProcessing?: boolean;
}

const AdminUserManagement = ({ 
  formData, 
  onComplete, 
  isProcessing 
}: AdminUserManagementProps) => {
  const [users, setUsers] = useState<AdminUser[]>(formData.users || [
    {
      id: "1",
      name: "Joe User",
      email: "joe@fronted.com",
      role: "admin",
      status: "active"
    }
  ]);

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "admin"
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error("Please fill in all fields");
      return;
    }

    const user: AdminUser = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: "pending"
    };

    setUsers(prev => [...prev, user]);
    setNewUser({ name: "", email: "", role: "admin" });
    setShowAddUser(false);
    
    toast.success(`Invitation sent to ${newUser.email}`);
  };

  const handleRemoveUser = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user?.role === "admin" && users.filter(u => u.role === "admin").length === 1) {
      toast.error("Cannot remove the last admin user");
      return;
    }

    setUsers(prev => prev.filter(u => u.id !== id));
    toast.success("User removed successfully");
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "hr-partner":
        return "secondary";
      case "viewer":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === "active" ? "default" : "secondary";
  };

  return (
    <div className="space-y-5 max-w-xl mx-auto">
      {/* Current Users */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
              Team Members
            </h3>
          </div>
          {!showAddUser && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddUser(true)}
              className="h-8 text-xs"
            >
              <UserPlus className="h-3 w-3 mr-1" />
              Add User
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {users.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-card/40 border border-border/40 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{user.name}</span>
                      <Badge variant={getStatusBadgeVariant(user.status)} className="text-xs">
                        {user.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </div>
                  </div>
                  {user.status !== "active" || users.filter(u => u.role === "admin").length > 1 || user.role !== "admin" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveUser(user.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  ) : null}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Add New User Form */}
      <AnimatePresence>
        {showAddUser && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
                Invite New User
              </h3>
            </div>
            
            <div className="bg-card/40 border border-border/40 rounded-lg p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userName" className="text-sm">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="userName"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Jane Smith"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userEmail" className="text-sm">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="jane@fronted.com"
                  className="text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleAddUser} 
                  size="sm" 
                  className="flex-1"
                >
                  <Mail className="h-3 w-3 mr-1" />
                  Send Invitation
                </Button>
                <Button 
                  onClick={() => {
                    setShowAddUser(false);
                    setNewUser({ name: "", email: "", role: "admin" });
                  }}
                  size="sm" 
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUserManagement;
