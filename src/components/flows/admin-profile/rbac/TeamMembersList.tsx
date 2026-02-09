/**
 * Team Members List Component
 * RBAC - Flow 1 v4 - Dense unified style matching Roles list
 */

import { useState } from "react";
import { Mail, MoreHorizontal, UserPlus, RefreshCw, Trash2, Shield, Clock, Check, Pencil } from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import type { RBACTeamMember, RoleWithPermissions } from "@/types/rbac";
import { formatDistanceToNow } from "date-fns";

interface TeamMembersListProps {
  members: RBACTeamMember[];
  roles: RoleWithPermissions[];
  canManageRoles: boolean;
  canInviteUsers: boolean;
  currentUserPrivilege: number;
  onInvite: () => void;
  onUpdateRole: (memberId: string, roleId: string) => Promise<boolean>;
  onRemove: (memberId: string) => Promise<boolean>;
  onResendInvite: (memberId: string) => Promise<boolean>;
  onEditRole?: (member: RBACTeamMember) => void;
}

export function TeamMembersList({
  members,
  roles,
  canManageRoles,
  canInviteUsers,
  currentUserPrivilege,
  onInvite,
  onUpdateRole,
  onRemove,
  onResendInvite,
  onEditRole,
}: TeamMembersListProps) {
  const [memberToRemove, setMemberToRemove] = useState<RBACTeamMember | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleRemove = async () => {
    if (!memberToRemove) return;
    setProcessing(true);
    await onRemove(memberToRemove.id);
    setMemberToRemove(null);
    setProcessing(false);
  };

  const handleResend = async (memberId: string) => {
    setProcessing(true);
    await onResendInvite(memberId);
    setProcessing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="gap-1 bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0.5">
            <Check className="h-3 w-3" />
            Active
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs px-2 py-0.5">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1 text-xs px-2 py-0.5">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-3">
      {/* Members List - Dense card style */}
      <div className="space-y-1.5">
        <AnimatePresence mode="popLayout">
          {members.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="group flex items-center justify-between gap-3 bg-card border border-border/40 rounded-lg px-4 py-3 hover:bg-muted/30 transition-colors"
            >
              {/* Member Info - Left side */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-foreground truncate">
                    {member.name || "Unnamed"}
                  </span>
                  {getStatusBadge(member.status)}
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

              {/* Role Badge & Actions - Right side */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Role display as badge */}
                <Badge variant="outline" className="gap-1 text-xs px-2 py-1">
                  <Shield className="h-3 w-3 text-muted-foreground" />
                  {member.role?.name || "Unknown Role"}
                </Badge>

                {/* Actions Menu */}
                {(canManageRoles || (canInviteUsers && member.status === "pending")) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      {canManageRoles && (
                        <DropdownMenuItem onClick={() => onEditRole?.(member)}>
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
          ))}
        </AnimatePresence>

        {members.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No team members yet</p>
            {canInviteUsers && (
              <Button variant="link" size="sm" onClick={onInvite} className="mt-1">
                Invite your first team member
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.name || memberToRemove?.email} from the team?
              They will lose access to all Fronted features.
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
