import {
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  User,
  BadgeCheck,
} from "lucide-react";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Sheet,
} from "@/components/ui/sheet";

import {
  Button,
} from "@/components/ui/button";

import UserRoleEditor
  from "@/components/admin/users/UserRoleEditor";

import UserActivityTimeline
  from "@/components/admin/users/UserActivityTimeline";

export default function UserDetailsDrawer({
  open,
  onClose,
  user,
  onRoleUpdate,
  roleLoading,
}) {

  if (!open || !user)
    return null;

  return (

    <Sheet
      open={open}
      onOpenChange={() => onClose()}
    >

      <div className="
        flex items-start
        justify-between
        mb-6
      ">

        <div>

          <h2 className="
            text-2xl
            font-black
          ">

            User Details

          </h2>

          <p className="
            text-muted-foreground
            mt-1
          ">

            Identity &
            access overview

          </p>

        </div>

        <Button
          variant="outline"
          onClick={onClose}
        >

          Close

        </Button>

      </div>

      {/* PROFILE */}
      <div className="
        flex items-center
        gap-4
        mb-8
      ">

        <div className="
          h-16
          w-16
          rounded-2xl
          bg-primary/10
          flex
          items-center
          justify-center
          text-2xl
          font-black
        ">

          {user.fullName?.charAt(0) || "U"}

        </div>

        <div>

          <h3 className="
            text-xl
            font-bold
          ">

            {user.fullName}

          </h3>

          <p className="
            text-muted-foreground
          ">

            {user.email}

          </p>

        </div>

      </div>

      {/* INFO CARDS */}
      <div className="
        space-y-4
      ">

        <InfoCard
          icon={User}
          label="User Type"
          value={user.userType || "N/A"}
        />

        <InfoCard
          icon={ShieldCheck}
          label="Platform Role"
          value={user.platformRole || "user"}
        />

        <InfoCard
          icon={BadgeCheck}
          label="Organization Role"
          value={
            user.organizationRole ||
            "viewer"
          }
        />

        <InfoCard
          icon={Building2}
          label="Organization ID"
          value={
            user.organizationId ||
            "No Organization"
          }
        />

        <InfoCard
          icon={Mail}
          label="Email"
          value={user.email}
        />

        <InfoCard
          icon={Phone}
          label="Phone"
          value={
            user.phoneNumber ||
            "N/A"
          }
        />

      </div>

      {/* STATUS */}
      <div className="
        mt-8
      ">

        <h3 className="
          font-bold
          mb-3
        ">

          Account Status

        </h3>


        <div className="
          flex gap-2 flex-wrap
        ">

          <Badge>

            {user.status || "active"}

          </Badge>

          <Badge
            variant="secondary"
          >

            {user.complianceStatus ||
              "pending"}

          </Badge>

          {user.emailVerified && (

            <Badge
              className="
                bg-emerald-500
              "
            >

              Verified

            </Badge>
          )}

        </div>

      </div>

      <UserRoleEditor
        user={user}
        onSave={onRoleUpdate}
        loading={roleLoading}
      />

      <UserActivityTimeline
        userId={user.id}
      />

    </Sheet>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  icon: Icon,
  label,
  value,
}) {

  return (

    <div className="
      border
      rounded-2xl
      p-4
      flex items-start
      gap-4
    ">

      <div className="
        h-10
        w-10
        rounded-xl
        bg-primary/10
        flex
        items-center
        justify-center
      ">

        <Icon size={18} />

      </div>

      <div>

        <div className="
          text-sm
          text-muted-foreground
        ">

          {label}

        </div>

        <div className="
          font-semibold
          mt-1
        ">

          {value}

        </div>

      </div>

    </div>
  );
}