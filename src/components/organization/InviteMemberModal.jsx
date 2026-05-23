import {
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {

  Mail,

  ShieldCheck,

  UserPlus,

  X,

} from "lucide-react";

import {
  toast,
} from "sonner";

import {

  ORGANIZATION_ROLES,

} from "@/services/rbac/roleServices";

import {

  createOrganizationInvitation,

} from "@/services/organization/inviteService";

import {
  useAuth,
} from "@/context/AuthContext";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

/* =========================================================
   COMPONENT
========================================================= */

export default function InviteMemberModal({

  open,

  onClose,

  onSuccess,
}) {

  const {

    user,

    userData,

    organization,
  } = useAuth();

  /* =====================================================
     STATE
  ===================================================== */

  const [loading,
    setLoading] =
    useState(false);

  const [email,
    setEmail] =
    useState("");

  const [organizationRole,
    setOrganizationRole] =
    useState(
      ORGANIZATION_ROLES.STAFF
    );

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleInvite =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        if (!email) {

          toast.error(
            "Email is required"
          );

          return;
        }

        await createOrganizationInvitation({

          organizationId:
            userData?.organizationId,

          organizationName:
            organization?.name ||
            "SellerOS Organization",

          invitedBy:
            user.uid,

          invitedByName:
            userData?.fullName,

          invitedEmail:
            email,

          organizationRole,
        });

        toast.success(
          "Invitation sent successfully"
        );

        setEmail("");

        setOrganizationRole(
          ORGANIZATION_ROLES.STAFF
        );

        onSuccess?.();

        onClose?.();

      } catch (error) {

        console.error(error);

        toast.error(
          error.message ||
          "Failed to send invitation"
        );

      } finally {

        setLoading(false);
      }
    };

  /* =====================================================
     CLOSED
  ===================================================== */

  if (!open) {

    return null;
  }

  /* =====================================================
     UI
  ===================================================== */

  return (

    <div className="
      fixed inset-0
      z-50
      bg-black/80
      backdrop-blur-sm
      flex items-center
      justify-center
      p-6
    ">

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className="
          w-full
          max-w-2xl
        "
      >

        <Card className="
          bg-zinc-950
          border-zinc-800
        ">

          <CardContent className="
            p-8
          ">

            {/* HEADER */}
            <div className="
              flex items-center
              justify-between
              mb-8
            ">

              <div>

                <h2 className="
                  text-3xl
                  font-black
                  text-white
                ">

                  Invite Team Member

                </h2>

                <p className="
                  text-zinc-400
                  mt-2
                ">

                  Enterprise organization access invitation

                </p>

              </div>

              <Button
                variant="ghost"
                onClick={onClose}
              >

                <X size={20} />

              </Button>

            </div>

            {/* FORM */}
            <form
              onSubmit={
                handleInvite
              }
              className="
                space-y-6
              "
            >

              {/* EMAIL */}
              <div>

                <label className="
                  text-sm
                  text-zinc-400
                  mb-3
                  block
                ">

                  Team Member Email

                </label>

                <div className="
                  relative
                ">

                  <Mail
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-zinc-500
                    "
                    size={18}
                  />

                  <Input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    placeholder="team@selleros.com"
                    className="
                      h-14
                      pl-12
                      bg-zinc-900
                      border-zinc-800
                      text-white
                    "
                  />

                </div>

              </div>

              {/* ROLE */}
              <div>

                <label className="
                  text-sm
                  text-zinc-400
                  mb-3
                  block
                ">

                  Organization Role

                </label>

                <div className="
                  relative
                ">

                  <ShieldCheck
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-zinc-500
                    "
                    size={18}
                  />

                  <select
                    value={
                      organizationRole
                    }
                    onChange={(e) =>
                      setOrganizationRole(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      h-14
                      rounded-xl
                      bg-zinc-900
                      border border-zinc-800
                      text-white
                      px-12
                    "
                  >

                    <option
                      value={
                        ORGANIZATION_ROLES.STAFF
                      }
                    >

                      Staff

                    </option>

                    <option
                      value={
                        ORGANIZATION_ROLES.VIEWER
                      }
                    >

                      Viewer

                    </option>

                    <option
                      value={
                        ORGANIZATION_ROLES.INVENTORY_MANAGER
                      }
                    >

                      Inventory Manager

                    </option>

                    <option
                      value={
                        ORGANIZATION_ROLES.ORDER_MANAGER
                      }
                    >

                      Order Manager

                    </option>

                    <option
                      value={
                        ORGANIZATION_ROLES.WAREHOUSE_MANAGER
                      }
                    >

                      Warehouse Manager

                    </option>

                    <option
                      value={
                        ORGANIZATION_ROLES.FINANCE_MANAGER
                      }
                    >

                      Finance Manager

                    </option>

                    <option
                      value={
                        ORGANIZATION_ROLES.SELLER_ADMIN
                      }
                    >

                      Seller Admin

                    </option>

                  </select>

                </div>

              </div>

              {/* SECURITY NOTICE */}
              <div className="
                rounded-2xl
                border border-violet-500/20
                bg-violet-500/10
                p-5
              ">

                <div className="
                  flex items-start
                  gap-4
                ">

                  <UserPlus
                    className="
                      text-violet-400
                      mt-1
                    "
                    size={22}
                  />

                  <div>

                    <h4 className="
                      text-white
                      font-bold
                      mb-2
                    ">

                      Enterprise Workspace Access

                    </h4>

                    <p className="
                      text-zinc-300
                      text-sm
                      leading-relaxed
                    ">

                      Invited users will receive organization-level
                      access based on assigned RBAC permissions
                      and enterprise governance policies.

                    </p>

                  </div>

                </div>

              </div>

              {/* ACTIONS */}
              <div className="
                flex items-center
                justify-end
                gap-4
                pt-4
              ">

                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="
                    border-zinc-700
                  "
                >

                  Cancel

                </Button>

                <Button
                  type="submit"
                  disabled={loading}
                  className="
                    bg-violet-600
                    hover:bg-violet-700
                  "
                >

                  {loading
                    ? "Sending..."
                    : "Send Invitation"}

                </Button>

              </div>

            </form>

          </CardContent>

        </Card>

      </motion.div>

    </div>
  );
}