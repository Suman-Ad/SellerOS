import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {

  Building2,

  Mail,

  MoreVertical,

  ShieldCheck,

  Trash2,

  UserPlus,

  Users,

} from "lucide-react";

import {

  collection,

  deleteDoc,

  doc,

  getDocs,

  query,

  where,

} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

import {
  useAuth,
} from "@/context/AuthContext";

import InviteMemberModal
  from "@/components/organization/InviteMemberModal";

import {
  ORGANIZATION_ROLES,
} from "@/services/rbac/roleServices";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  toast,
} from "sonner";

import { useOrganizationDetails } from "@/utils/firebaseDB/OrganizationDetails";

import logActivity from "@/utils/activity/logActivity";

/* =========================================================
   COMPONENT
========================================================= */

export default function TeamManagement() {

  const {

    user,
    userData,

  } = useAuth();

  const organization = useOrganizationDetails(
    user?.uid
  );
  /* =====================================================
     STATE
  ===================================================== */

  const [loading,
    setLoading] =
    useState(true);

  const [members,
    setMembers] =
    useState([]);

  const [invitations,
    setInvitations] =
    useState([]);

  const [search,
    setSearch] =
    useState("");

  const [inviteOpen,
    setInviteOpen] =
    useState(false);

  /* =====================================================
     LOAD DATA
  ===================================================== */

  const fetchData =
    async () => {

      try {

        setLoading(true);

        /* =============================================
           MEMBERS
        ============================================= */

        const membersQuery =
          query(

            collection(
              db,
              "organization_members"
            ),

            where(
              "organizationId",
              "==",
              userData?.organization?.organizationId
            )
          );

        const membersSnapshot =
          await getDocs(
            membersQuery
          );

        const membersData =
          membersSnapshot.docs.map(
            (doc) => ({

              id:
                doc.id,

              ...doc.data(),
            })
          );

        setMembers(
          membersData
        );

        /* =============================================
           INVITATIONS
        ============================================= */

        const invitationQuery =
          query(

            collection(
              db,
              "organization_invitations"
            ),

            where(
              "organizationId",
              "==",
              userData?.organization?.organizationId
            )
          );

        const invitationSnapshot =
          await getDocs(
            invitationQuery
          );

        const invitationData =
          invitationSnapshot.docs.map(
            (doc) => ({

              id:
                doc.id,

              ...doc.data(),
            })
          );

        setInvitations(
          invitationData
        );

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed to load team workspace"
        );

      } finally {

        setLoading(false);
      }
    };

  /* =====================================================
     INIT
  ===================================================== */

  useEffect(() => {

    if (
      userData?.organization?.organizationId
    ) {

      fetchData();
    }

  }, [
    userData?.organization?.organizationId,
  ]);

  /* =====================================================
     FILTERED MEMBERS
  ===================================================== */

  const filteredMembers =
    useMemo(() => {

      return members.filter(
        (member) => {

          const value = `
            ${member.fullName}
            ${member.email}
            ${member.organizationRole}
          `
            .toLowerCase();

          return value.includes(
            search.toLowerCase()
          );
        }
      );

    }, [
      members,
      search,
    ]);

  /* =====================================================
     REMOVE MEMBER
  ===================================================== */

  const removeMember =
    async (memberId) => {

      try {

        await deleteDoc(
          doc(
            db,
            "organization_members",
            memberId
          )
        );

        toast.success(
          "Team member removed"
        );

        fetchData();

      } catch (error) {

        console.error(error);

        toast.error(
          "Failed to remove member"
        );
      }
    };

  /* =====================================================
     STATS
  ===================================================== */

  const stats = {

    totalMembers:
      members.length,

    pendingInvites:
      invitations.filter(
        (item) =>
          item.status ===
          "pending"
      ).length,

    admins:
      members.filter(
        (item) => [

          ORGANIZATION_ROLES.OWNER,

          ORGANIZATION_ROLES.SELLER_ADMIN,

        ].includes(
          item.organizationRole
        )
      ).length,
  };

  /* =====================================================
     UI
  ===================================================== */

  return (

    <div className="
      min-h-screen
      bg-black
      text-white
      p-6
    ">

      {/* HEADER */}
      <div className="
        flex flex-col
        xl:flex-row
        xl:items-center
        justify-between
        gap-6
        mb-10
      ">

        <div>

          <h1 className="
            text-4xl
            font-black
          ">

            Team Management

          </h1>

          <p className="
            text-zinc-400
            mt-3
          ">

            Enterprise workforce &
            organization access center

          </p>

        </div>

        <Button
          onClick={() =>
            setInviteOpen(
              true
            )
          }
          className="
            bg-violet-600
            hover:bg-violet-700
          "
        >

          <UserPlus
            size={18}
          />

          Invite Member

        </Button>

      </div>

      {/* ORGANIZATION */}
      <Card className="
        bg-zinc-950
        border-zinc-800
        mb-10
      ">

        <CardContent className="
          p-6
        ">

          <div className="
            flex items-center
            gap-5
          ">

            <div className="
              w-20 h-20
              rounded-3xl
              bg-violet-500/20
              text-violet-300
              flex items-center
              justify-center
            ">

              <Building2
                size={36}
              />

            </div>

            <div>

              <h2 className="
                text-3xl
                font-black
              ">

                {organization?.name ||
                  "Organization"}

              </h2>

              <p className="
                text-zinc-400
                mt-2
              ">

                Enterprise collaborative workspace

              </p>

            </div>

          </div>

        </CardContent>

      </Card>

      {/* STATS */}
      <div className="
        grid md:grid-cols-3
        gap-5
        mb-10
      ">

        <StatCard
          icon={Users}
          title="Members"
          value={
            stats.totalMembers
          }
        />

        <StatCard
          icon={Mail}
          title="Pending Invites"
          value={
            stats.pendingInvites
          }
        />

        <StatCard
          icon={ShieldCheck}
          title="Workspace Admins"
          value={
            stats.admins
          }
        />

      </div>

      {/* SEARCH */}
      <div className="
        mb-8
      ">

        <Input
          placeholder="Search members..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="
            h-14
            bg-zinc-900
            border-zinc-800
            text-white
          "
        />

      </div>

      {/* MEMBERS */}
      <Card className="
        bg-zinc-950
        border-zinc-800
        mb-10
      ">

        <CardContent className="
          p-6
        ">

          <div className="
            flex items-center
            justify-between
            mb-8
          ">

            <h2 className="
              text-2xl
              font-bold
            ">

              Organization Members

            </h2>

          </div>

          {loading ? (

            <div className="
              text-zinc-400
            ">

              Loading members...

            </div>

          ) : (

            <div className="
              space-y-4
            ">

              {filteredMembers.map(
                (member) => (

                  <motion.div
                    key={member.id}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="
                      rounded-2xl
                      border border-zinc-800
                      bg-zinc-900
                      p-5
                    "
                  >

                    <div className="
                      flex flex-col
                      lg:flex-row
                      lg:items-center
                      justify-between
                      gap-5
                    ">

                      <div className="
                        flex items-center
                        gap-5
                      ">

                        <div className="
                          w-16 h-16
                          rounded-2xl
                          bg-violet-500/20
                          text-violet-300
                          flex items-center
                          justify-center
                          text-xl
                          font-bold
                        ">

                          {member.fullName
                            ?.charAt(0)}

                        </div>

                        <div>

                          <h3 className="
                            text-xl
                            font-bold
                          ">

                            {member.fullName}

                          </h3>

                          <p className="
                            text-zinc-400
                            mt-1
                          ">

                            {member.email}

                          </p>

                          <div className="
                            mt-3
                          ">

                            <RoleBadge
                              role={
                                member.organizationRole
                              }
                            />

                          </div>

                        </div>

                      </div>

                      <div className="
                        flex items-center
                        gap-3
                      ">

                        <Button
                          variant="outline"
                          className="
                            border-zinc-700
                          "
                        >

                          <MoreVertical
                            size={18}
                          />

                          Manage

                        </Button>

                        {member.organizationRole !==
                          ORGANIZATION_ROLES.OWNER && (

                          <Button
                            className="
                              bg-red-600
                              hover:bg-red-700
                            "
                            onClick={() =>
                              removeMember(
                                member.id
                              )
                            }
                          >

                            <Trash2
                              size={18}
                            />

                            Remove

                          </Button>
                        )}

                      </div>

                    </div>

                  </motion.div>
                )
              )}

            </div>
          )}

        </CardContent>

      </Card>

      {/* INVITATIONS */}
      <Card className="
        bg-zinc-950
        border-zinc-800
      ">

        <CardContent className="
          p-6
        ">

          <div className="
            flex items-center
            justify-between
            mb-8
          ">

            <h2 className="
              text-2xl
              font-bold
            ">

              Pending Invitations

            </h2>

          </div>

          <div className="
            space-y-4
          ">

            {invitations.map(
              (invite) => (

                <div
                  key={invite.id}
                  className="
                    rounded-2xl
                    border border-zinc-800
                    bg-zinc-900
                    p-5
                  "
                >

                  <div className="
                    flex flex-col
                    lg:flex-row
                    lg:items-center
                    justify-between
                    gap-5
                  ">

                    <div>

                      <h3 className="
                        text-lg
                        font-bold
                      ">

                        {invite.invitedEmail}

                      </h3>

                      <p className="
                        text-zinc-400
                        mt-2
                      ">

                        Invited as:
                        {" "}
                        {invite.organizationRole}

                      </p>

                    </div>

                    <div className="
                      flex items-center
                      gap-3
                    ">

                      <StatusBadge
                        label={
                          invite.status
                        }
                      />

                    </div>

                  </div>

                </div>
              )
            )}

          </div>

        </CardContent>

      </Card>

      {/* INVITE MODAL */}
      <InviteMemberModal
        open={inviteOpen}
        onClose={() =>
          setInviteOpen(
            false
          )
        }
        onSuccess={fetchData}
        logActivity={logActivity}
      />

    </div>
  );
}

/* =========================================================
   ROLE BADGE
========================================================= */

function RoleBadge({
  role,
}) {

  return (

    <div className="
      inline-flex
      items-center
      px-4 py-2
      rounded-full
      bg-violet-500/20
      text-violet-300
      text-sm
      font-semibold
    ">

      {role}

    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  label,
}) {

  const colors = {

    pending:
      "bg-yellow-500/20 text-yellow-300",

    accepted:
      "bg-green-500/20 text-green-300",

    rejected:
      "bg-red-500/20 text-red-300",
  };

  return (

    <div className={`
      px-4 py-2
      rounded-full
      text-sm
      font-semibold
      ${colors[label]}
    `}>

      {label}

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  title,
  value,
}) {

  return (

    <Card className="
      bg-zinc-950
      border-zinc-800
    ">

      <CardContent className="
        p-6
      ">

        <div className="
          flex items-center
          justify-between
          mb-5
        ">

          <div className="
            w-14 h-14
            rounded-2xl
            bg-violet-500/20
            text-violet-300
            flex items-center
            justify-center
          ">

            <Icon
              size={24}
            />

          </div>

        </div>

        <div className="
          text-4xl
          font-black
          text-white
        ">

          {value}

        </div>

        <p className="
          text-zinc-400
          mt-2
        ">

          {title}

        </p>

      </CardContent>

    </Card>
  );
}