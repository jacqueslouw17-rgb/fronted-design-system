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
  Pencil,
  RefreshCw,
  Shield,
  Trash2,
  UserPlus,
  X,
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

import { useRBACContext } from "@/contexts/RBACContext";
import type { RBACTeamMember } from "@/types/rbac";
import { InviteMemberDrawer } from "./InviteMemberDrawer";

interface TeamMembersSectionProps {
  onBack: () => void;
  onNavigateToRoles?: () => void;
}

export function TeamMembersSection({ onBack, onNavigateToRoles }: TeamMembersSectionProps) {
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
  } = useRBACContext();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<RBACTeamMember | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<RBACTeamMember | null>(null);
  const [processing, setProcessing] = useState(false);

  const currentUserPrivilege = currentUserRole?.privilege_level || 0;

  const handleUpdateMember = async (memberId: string, roleId: string, name: string): Promise<boolean> => {
    setProcessing(true);
    const success = await updateMemberRole(memberId, roleId, name);
    setProcessing(false);
    return success;
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

        <div className="space-y-1.5">
          <AnimatePresence mode="popLayout">
            {teamMembers.map((member) => {
              // Check if this is the current user (demo owner)
              const isCurrentUser = member.id === 'demo-member-owner';
              const canModifyMember = !isCurrentUser && (canManageRoles || (canInviteUsers && member.status === "pending"));
              
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -60 }}
                  className="group flex items-center justify-between gap-3 bg-card border border-border/40 rounded-lg px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  {/* Member Info - Left side */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground truncate">
                        {member.name || "Unnamed"}
                      </span>
                      {isCurrentUser && (
                        <span className="text-xs text-muted-foreground">(you)</span>
                      )}
                      {member.status === "active" ? (
                        <Badge
                          variant="secondary"
                          className="gap-1 bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0.5"
                        >
                          <Check className="h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs px-2 py-0.5"
                        >
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-0.5">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      {member.status === "pending" && (
                        <span className="text-xs text-muted-foreground">
                          · Invited{" "}
                          {formatDistanceToNow(new Date(member.invited_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Role Badge & Actions - Right side */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Role display as badge - no hover state */}
                    <Badge variant="outline" className="gap-1 text-xs px-2 py-1 pointer-events-none">
                      <Shield className="h-3 w-3 text-muted-foreground" />
                      {member.role?.name || "No role"}
                    </Badge>

                    {/* Actions Menu - hidden for current user */}
                    {canModifyMember && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          {canManageRoles && (
                            <DropdownMenuItem onClick={() => setMemberToEdit(member)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit Role
                            </DropdownMenuItem>
                          )}
                          {member.status === "pending" && (
                            <DropdownMenuItem onClick={() => handleResend(member.id)}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Resend Invite
                            </DropdownMenuItem>
                          )}
                          {canManageRoles && (
                            <>
                              <DropdownMenuSeparator />
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
                </motion.div>
              );
            })}
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

      {/* Invite / Edit Member Drawer */}
      <InviteMemberDrawer
        open={inviteOpen || !!memberToEdit}
        onOpenChange={(open) => {
          if (!open) {
            setInviteOpen(false);
            setMemberToEdit(null);
          }
        }}
        roles={roles}
        currentUserPrivilege={currentUserPrivilege}
        onInvite={inviteMember}
        getPermissionSummary={getPermissionSummary}
        onNavigateToRoles={onNavigateToRoles}
        editMember={memberToEdit}
        onUpdateMember={handleUpdateMember}
      />

      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent className="relative">
          <button
            onClick={() => setMemberToRemove(null)}
            className="absolute right-4 top-4 p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.name || memberToRemove?.email}?
              They'll lose access to this workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={processing}
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
