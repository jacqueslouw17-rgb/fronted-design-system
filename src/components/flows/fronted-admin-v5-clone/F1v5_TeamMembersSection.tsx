/**
 * Team Members Section — Flow 1 v5
 * Clean v7-style: flat rows, no header card, centered back button
 */

import { useState } from "react";
import {
  Check, Clock, Loader2, Mail, MoreHorizontal, Pencil, RefreshCw, Shield, Trash2, UserPlus, X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRBACContext } from "@/contexts/RBACContext";
import type { RBACTeamMember } from "@/types/rbac";
import { InviteMemberDrawer } from "@/components/flows/admin-profile/rbac/InviteMemberDrawer";

interface Props {
  onBack: () => void;
  onNavigateToRoles?: () => void;
}

export function F1v5_TeamMembersSection({ onBack, onNavigateToRoles }: Props) {
  const {
    roles, teamMembers, currentUserRole, loading,
    canManageRoles, canInviteUsers,
    inviteMember, updateMemberRole, removeMember, resendInvite, getPermissionSummary,
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
    <div>
      {/* Invite button row */}
      {canInviteUsers && (
        <div className="flex justify-end mb-3">
          <Button onClick={() => setInviteOpen(true)} size="sm" className="gap-1.5 text-xs">
            <UserPlus className="h-3.5 w-3.5" />
            Invite
          </Button>
        </div>
      )}

      {/* Member rows */}
      <div className="space-y-1.5">
        <AnimatePresence mode="popLayout">
          {teamMembers.map((member) => {
            const isCurrentUser = member.id === 'demo-member-owner';
            const canModifyMember = !isCurrentUser && (canManageRoles || (canInviteUsers && member.status === "pending"));

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -60 }}
                className="group flex items-center justify-between gap-3 rounded-xl border border-border/30 bg-card/20 px-4 py-3 hover:bg-card/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground truncate">
                      {member.name || "Unnamed"}
                    </span>
                    {isCurrentUser && (
                      <span className="text-xs text-muted-foreground">(you)</span>
                    )}
                    {member.status === "active" ? (
                      <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0.5">
                        <Check className="h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs px-2 py-0.5">
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
                        · Invited {formatDistanceToNow(new Date(member.invited_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="outline" className="gap-1 text-xs px-2 py-1 pointer-events-none">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                    {member.role?.name || "No role"}
                  </Badge>

                  {canModifyMember && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
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
          <div className="py-10 text-center rounded-xl border border-border/30 bg-card/20">
            <p className="text-sm font-medium text-foreground mb-1">No team members yet</p>
            <p className="text-xs text-muted-foreground">
              Invite someone to start assigning roles and permissions.
            </p>
          </div>
        )}
      </div>

      {/* Centered back button */}
      <div className="flex justify-center mt-4">
        <Button variant="outline" size="sm" onClick={onBack} className="text-xs">
          Back
        </Button>
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
        <AlertDialogContent onOverlayClick={() => setMemberToRemove(null)}>
          <AlertDialogHeader className="pr-8">
            <button
              onClick={() => setMemberToRemove(null)}
              className="absolute right-4 top-4 p-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
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
