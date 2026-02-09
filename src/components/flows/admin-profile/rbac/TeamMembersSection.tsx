/**
 * Team Members Section - Manage team members (drawer-based)
 * Flow 1 v4 - Fronted Admin Dashboard
 */

import { useState } from "react";
import {
  Check,
  Clock,
  Loader2,
  Mail,
  MoreHorizontal,
  RefreshCw,
  Trash2,
  UserPlus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useRBAC } from "@/hooks/useRBAC";
import type { RBACTeamMember } from "@/types/rbac";
import { InviteMemberDrawer } from "./InviteMemberDrawer";

interface TeamMembersSectionProps {
  onBack: () => void;
}

export function TeamMembersSection({ onBack }: TeamMembersSectionProps) {
  const {
    roles,
    teamMembers,
    currentUserRole,
    loading,
    canManageRoles,
    canInviteUsers,
    inviteMember,
    updateMemberRole,
    removeMember,
    resendInvite,
    getPermissionSummary,
  } = useRBAC();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<RBACTeamMember | null>(null);
  const [processing, setProcessing] = useState(false);

  const currentUserPrivilege = currentUserRole?.privilege_level || 0;
  const assignableRoles = roles.filter((r) => r.privilege_level <= currentUserPrivilege);

  const handleRoleChange = async (memberId: string, roleId: string) => {
    setProcessing(true);
    await updateMemberRole(memberId, roleId);
    setProcessing(false);
  };

  const handleRemove = async () => {
    if (!memberToRemove) return;
    setProcessing(true);
    await removeMember(memberToRemove.id);
    setMemberToRemove(null);
    setProcessing(false);
  };

  const handleResend = async (memberId: string) => {
    setProcessing(true);
    await resendInvite(memberId);
    setProcessing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-card/40 border border-border/40 rounded-lg p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Team members</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""} in your workspace
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" onClick={onBack} size="sm">
              Back
            </Button>
            {canInviteUsers && (
              <Button onClick={() => setInviteOpen(true)} className="gap-1.5" size="sm">
                <UserPlus className="h-4 w-4" />
                Invite
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {teamMembers.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -60 }}
                className="bg-card/60 border border-border/30 rounded-lg p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="font-medium text-foreground truncate">
                        {member.name || "Unnamed"}
                      </span>
                      {member.status === "active" ? (
                        <Badge
                          variant="secondary"
                          className="gap-1 bg-primary/10 text-primary border-primary/20"
                        >
                          <Check className="h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="gap-1 bg-muted/30 text-muted-foreground border-border/40"
                        >
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{member.email}</span>
                      {member.status === "pending" && (
                        <span className="text-xs ml-2 shrink-0">
                          · Invited{" "}
                          {formatDistanceToNow(new Date(member.invited_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {canManageRoles ? (
                      <Select
                        value={member.role_id}
                        onValueChange={(value) => handleRoleChange(member.id, value)}
                        disabled={processing}
                      >
                        <SelectTrigger className="w-44 h-9 text-sm">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {assignableRoles.map((role) => (
                            <SelectItem key={role.id} value={role.id} className="text-sm">
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="secondary" className="h-8 px-3 text-sm">
                        {member.role?.name || "No role"}
                      </Badge>
                    )}

                    {(canManageRoles || (canInviteUsers && member.status === "pending")) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {member.status === "pending" && (
                            <DropdownMenuItem onClick={() => handleResend(member.id)}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Resend invite
                            </DropdownMenuItem>
                          )}
                          {canManageRoles && (
                            <>
                              {member.status === "pending" && <DropdownMenuSeparator />}
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setMemberToRemove(member)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {teamMembers.length === 0 && (
            <div className="py-10 text-center">
              <UserPlus className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-base font-medium text-foreground mb-1">No team members yet</p>
              <p className="text-sm text-muted-foreground">
                Invite someone to start assigning roles and permissions.
              </p>
            </div>
          )}
        </div>
      </div>

      <InviteMemberDrawer
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        roles={roles}
        currentUserPrivilege={currentUserPrivilege}
        onInvite={inviteMember}
        getPermissionSummary={getPermissionSummary}
      />

      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.name || memberToRemove?.email}?
              They’ll lose access to this workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
