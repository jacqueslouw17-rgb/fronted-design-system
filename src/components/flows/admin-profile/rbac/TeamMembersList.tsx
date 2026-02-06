/**
 * Team Members List Component
 * RBAC - Flow 1 v4
 */

import { useState } from "react";
import { Mail, MoreHorizontal, UserPlus, RefreshCw, Trash2, Shield, Clock, Check } from "lucide-react";
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
}: TeamMembersListProps) {
  const [changingRoleFor, setChangingRoleFor] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<RBACTeamMember | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleRoleChange = async (memberId: string, roleId: string) => {
    setProcessing(true);
    await onUpdateRole(memberId, roleId);
    setChangingRoleFor(null);
    setProcessing(false);
  };

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
          <Badge variant="default" className="gap-1 bg-primary/10 text-primary border-primary/20">
            <Check className="h-3 w-3" />
            Active
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1 bg-secondary/50 text-secondary-foreground border-secondary/30">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            {status}
          </Badge>
        );
    }
  };

  // Filter roles user can assign (can't assign higher privilege than own)
  const assignableRoles = roles.filter(r => r.privilege_level <= currentUserPrivilege);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Team Members</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {members.length} member{members.length !== 1 ? "s" : ""} in your team
          </p>
        </div>
        {canInviteUsers && (
          <Button size="sm" onClick={onInvite} className="gap-1.5">
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Members List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {members.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-card/30 border border-border/40 rounded-lg p-4 hover:bg-card/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Member Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">
                      {member.name || "Unnamed"}
                    </span>
                    {getStatusBadge(member.status)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  {member.status === "pending" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Invited {formatDistanceToNow(new Date(member.invited_at), { addSuffix: true })}
                    </p>
                  )}
                  {member.last_active_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Last active {formatDistanceToNow(new Date(member.last_active_at), { addSuffix: true })}
                    </p>
                  )}
                </div>

                {/* Role & Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Role Selector or Display */}
                  {changingRoleFor === member.id && canManageRoles ? (
                    <Select
                      defaultValue={member.role_id}
                      onValueChange={(value) => handleRoleChange(member.id, value)}
                      disabled={processing}
                    >
                      <SelectTrigger className="w-40 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {assignableRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id} className="text-xs">
                            <div className="flex items-center gap-2">
                              <Shield className="h-3 w-3 text-muted-foreground" />
                              {role.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge 
                      variant="outline" 
                      className="gap-1 cursor-pointer hover:bg-muted/50"
                      onClick={() => canManageRoles && setChangingRoleFor(member.id)}
                    >
                      <Shield className="h-3 w-3" />
                      {member.role?.name || "Unknown Role"}
                    </Badge>
                  )}

                  {/* Actions Menu */}
                  {(canManageRoles || (canInviteUsers && member.status === "pending")) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canManageRoles && (
                          <DropdownMenuItem onClick={() => setChangingRoleFor(member.id)}>
                            <Shield className="h-4 w-4 mr-2" />
                            Change Role
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
