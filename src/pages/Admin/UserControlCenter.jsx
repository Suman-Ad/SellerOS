// src/pages/admin/UserControlCenter.jsx

import { useEffect, useMemo, useState } from "react";

import {
    Search,
    ShieldCheck,
    Users,
    UserCheck,
    UserX,
    MoreHorizontal,
} from "lucide-react";

import {
    collection,
    getDocs,
    orderBy,
    query,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {
    Button,
} from "@/components/ui/button";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    Badge,
} from "@/components/ui/badge";

import { toast } from "sonner";

import UserDetailsDrawer
    from "@/components/admin/users/UserDetailsDrawer";


import {
    suspendUser,
    reactivateUser,
} from "@/services/admin/userAdminService";

import {
    logAdminAction,
} from "@/services/admin/adminAuditService";

import {
    useAuth,
} from "@/context/AuthContext";

import {
    updateUserRoles,
} from "@/services/admin/userRoleService";

/* =========================================================
   FILTERS
========================================================= */

const FILTERS = [
    "all",
    "seller",
    "supplier",
    "admin",
    "suspended",
];

/* =========================================================
   COMPONENT
========================================================= */

export default function UserControlCenter() {

    const [users, setUsers] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");

    const [activeFilter,
        setActiveFilter] =
        useState("all");

    const [selectedUser, setSelectedUser] =
        useState(null);

    const [drawerOpen, setDrawerOpen] =
        useState(false);

    const { user: currentUser } =
        useAuth();

    const [roleLoading,
        setRoleLoading] =
        useState(false);

    /* =====================================================
       LOAD USERS
    ===================================================== */

    useEffect(() => {

        fetchUsers();

    }, []);

    const fetchUsers =
        async () => {

            try {

                setLoading(true);

                const q = query(
                    collection(db, "users"),
                    orderBy("createdAt", "desc")
                );

                const snapshot =
                    await getDocs(q);

                const data =
                    snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));

                setUsers(data);

            } catch (error) {

                console.error(error);

                toast.error(
                    "Failed to load users"
                );

            } finally {

                setLoading(false);
            }
        };

    /* =====================================================
       FILTERED USERS
    ===================================================== */

    const filteredUsers =
        useMemo(() => {

            let filtered =
                [...users];

            /* SEARCH */

            if (search) {

                const keyword =
                    search.toLowerCase();

                filtered =
                    filtered.filter((user) => {

                        const name =
                            user.fullName
                                ?.toLowerCase() || "";

                        const email =
                            user.email
                                ?.toLowerCase() || "";

                        return (
                            name.includes(keyword) ||
                            email.includes(keyword)
                        );
                    });
            }

            /* FILTERS */

            switch (activeFilter) {

                case "seller":

                    filtered =
                        filtered.filter(
                            (user) =>
                                user.userType ===
                                "seller"
                        );

                    break;

                case "supplier":

                    filtered =
                        filtered.filter(
                            (user) =>
                                user.userType ===
                                "supplier"
                        );

                    break;

                case "admin":

                    filtered =
                        filtered.filter(
                            (user) =>
                                user.platformRole ===
                                "admin" ||
                                user.platformRole ===
                                "super_admin"
                        );

                    break;

                case "suspended":

                    filtered =
                        filtered.filter(
                            (user) =>
                                user.status ===
                                "suspended"
                        );

                    break;

                default:
                    break;
            }

            return filtered;

        }, [
            users,
            search,
            activeFilter,
        ]);

    /* =====================================================
       STATS
    ===================================================== */

    const stats =
        useMemo(() => {

            return {

                total:
                    users.length,

                active:
                    users.filter(
                        (u) =>
                            u.status !==
                            "suspended"
                    ).length,

                suspended:
                    users.filter(
                        (u) =>
                            u.status ===
                            "suspended"
                    ).length,

                admins:
                    users.filter(
                        (u) =>
                            u.platformRole ===
                            "admin" ||
                            u.platformRole ===
                            "super_admin"
                    ).length,
            };

        }, [users]);

    const handleUserStatus =
        async (
            userId,
            currentStatus
        ) => {

            try {

                let response;

                if (
                    currentStatus ===
                    "suspended"
                ) {

                    response =
                        await reactivateUser(
                            userId
                        );

                } else {

                    response =
                        await suspendUser(
                            userId
                        );
                }

                if (!response.success) {

                    toast.error(
                        response.error
                    );

                    return;
                }

                /* ===================================================
                   AUDIT LOG
                =================================================== */

                const targetUser =
                    users.find(
                        (u) =>
                            u.id === userId
                    );

                await logAdminAction({

                    action:
                        currentStatus ===
                            "suspended"
                            ? "REACTIVATE_USER"
                            : "SUSPEND_USER",

                    targetUserId:
                        userId,

                    targetUserEmail:
                        targetUser?.email || "",

                    performedBy:
                        currentUser?.uid || "",

                    performedByEmail:
                        currentUser?.email || "",

                    oldData: {
                        status:
                            currentStatus,
                    },

                    newData: {
                        status:
                            currentStatus ===
                                "suspended"
                                ? "active"
                                : "suspended",
                    },
                });

                /* ===================================================
                   UPDATE LOCAL STATE
                =================================================== */

                setUsers((prev) =>
                    prev.map((user) => {

                        if (
                            user.id === userId
                        ) {

                            return {
                                ...user,

                                status:
                                    currentStatus ===
                                        "suspended"
                                        ? "active"
                                        : "suspended",
                            };
                        }

                        return user;
                    })
                );

                toast.success(
                    currentStatus ===
                        "suspended"
                        ? "User reactivated"
                        : "User suspended"
                );

            } catch (error) {

                console.error(error);

                toast.error(
                    "Action failed"
                );
            }
        };

    const handleRoleUpdate =
        async ({
            platformRole,
            organizationRole,
        }) => {

            try {

                if (!selectedUser)
                    return;

                setRoleLoading(true);

                const response =
                    await updateUserRoles({

                        userId:
                            selectedUser.id,

                        platformRole,
                        organizationRole,
                    });

                if (!response.success) {

                    toast.error(
                        response.error
                    );

                    return;
                }

                /* AUDIT LOG */

                await logAdminAction({

                    action:
                        "UPDATE_USER_ROLES",

                    targetUserId:
                        selectedUser.id,

                    targetUserEmail:
                        selectedUser.email,

                    performedBy:
                        currentUser?.uid || "",

                    performedByEmail:
                        currentUser?.email || "",

                    oldData: {
                        platformRole:
                            selectedUser.platformRole,

                        organizationRole:
                            selectedUser.organizationRole,
                    },

                    newData: {
                        platformRole,
                        organizationRole,
                    },
                });

                /* UPDATE LOCAL STATE */

                setUsers((prev) =>
                    prev.map((user) => {

                        if (
                            user.id ===
                            selectedUser.id
                        ) {

                            return {
                                ...user,
                                platformRole,
                                organizationRole,
                            };
                        }

                        return user;
                    })
                );

                setSelectedUser((prev) => {

                    if (!prev) return prev;

                    return {
                        ...prev,
                        platformRole,
                        organizationRole,
                    };
                });

                toast.success(
                    "Roles updated"
                );

            } catch (error) {

                console.error(error);

                toast.error(
                    "Failed to update roles"
                );

            } finally {

                setRoleLoading(false);
            }
        };

    /* =====================================================
       UI
    ===================================================== */

    return (

        <div className="
      p-6
      space-y-6
    ">

            {/* HEADER */}
            <div className="
        flex
        flex-col
        lg:flex-row
        lg:items-center
        lg:justify-between
        gap-4
      ">

                <div>

                    <h1 className="
            text-3xl
            font-black
          ">

                        User Control Center

                    </h1>

                    <p className="
            text-muted-foreground
            mt-1
          ">

                        Global identity &
                        access management

                    </p>

                </div>

            </div>

            {/* STATS */}
            <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-4
      ">

                <StatsCard
                    title="Total Users"
                    value={stats.total}
                    icon={Users}
                />

                <StatsCard
                    title="Active Users"
                    value={stats.active}
                    icon={UserCheck}
                />

                <StatsCard
                    title="Suspended"
                    value={stats.suspended}
                    icon={UserX}
                />

                <StatsCard
                    title="Admins"
                    value={stats.admins}
                    icon={ShieldCheck}
                />

            </div>

            {/* FILTERS */}
            <Card>

                <CardContent
                    className="
            p-4
            flex
            flex-col
            lg:flex-row
            gap-4
            lg:items-center
            lg:justify-between
          "
                >

                    {/* SEARCH */}
                    <div className="
            relative
            w-full
            lg:max-w-sm
          ">

                        <Search
                            size={18}
                            className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-muted-foreground
              "
                        />

                        <Input
                            placeholder="
                Search users...
              "
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            className="
                pl-10
              "
                        />

                    </div>

                    {/* FILTER BUTTONS */}
                    <div className="
            flex
            flex-wrap
            gap-2
          ">

                        {FILTERS.map(
                            (filter) => (

                                <Button
                                    key={filter}
                                    variant={
                                        activeFilter === filter
                                            ? "default"
                                            : "outline"
                                    }
                                    onClick={() =>
                                        setActiveFilter(
                                            filter
                                        )
                                    }
                                >

                                    {filter}

                                </Button>
                            )
                        )}

                    </div>

                </CardContent>

            </Card>

            {/* USER TABLE */}
            <Card>

                <CardHeader>

                    <CardTitle>

                        Platform Users

                    </CardTitle>

                </CardHeader>

                <CardContent>

                    {loading ? (

                        <div className="
              py-20
              text-center
              text-muted-foreground
            ">

                            Loading users...

                        </div>

                    ) : filteredUsers.length === 0 ? (

                        <div className="
              py-20
              text-center
              text-muted-foreground
            ">

                            No users found

                        </div>

                    ) : (

                        <div className="
              overflow-x-auto
            ">

                            <table className="
                w-full
              ">

                                <thead>

                                    <tr className="
                    border-b
                  ">

                                        <th className="
                      text-left
                      py-4
                    ">
                                            User
                                        </th>

                                        <th className="
                      text-left
                    ">
                                            Type
                                        </th>

                                        <th className="
                      text-left
                    ">
                                            Platform Role
                                        </th>

                                        <th className="
                      text-left
                    ">
                                            Org Role
                                        </th>

                                        <th className="
                      text-left
                    ">
                                            Status
                                        </th>

                                        <th className="
                      text-left
                    ">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredUsers.map(
                                        (user) => (

                                            <tr
                                                key={user.id}
                                                className="
                          border-b
                          hover:bg-muted/30
                          transition-colors
                        "
                                            >

                                                {/* USER */}
                                                <td className="
                          py-4
                        ">

                                                    <div>

                                                        <div className="
                              font-semibold
                            ">

                                                            {user.fullName ||
                                                                "Unnamed User"}

                                                        </div>

                                                        <div className="
                              text-sm
                              text-muted-foreground
                            ">

                                                            {user.email}

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* USER TYPE */}
                                                <td>

                                                    <Badge
                                                        variant="outline"
                                                    >

                                                        {user.userType ||
                                                            "N/A"}

                                                    </Badge>

                                                </td>

                                                {/* PLATFORM ROLE */}
                                                <td>

                                                    <Badge>

                                                        {user.platformRole ||
                                                            "user"}

                                                    </Badge>

                                                </td>

                                                {/* ORG ROLE */}
                                                <td>

                                                    <Badge
                                                        variant="secondary"
                                                    >

                                                        {user.organizationRole ||
                                                            "viewer"}

                                                    </Badge>

                                                </td>

                                                {/* STATUS */}
                                                <td>

                                                    <StatusBadge
                                                        status={
                                                            user.status
                                                        }
                                                    />

                                                </td>

                                                {/* ACTIONS */}
                                                <td>

                                                    <DropdownMenu>

                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >

                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                            >

                                                                <MoreHorizontal
                                                                    size={18}
                                                                />

                                                            </Button>

                                                        </DropdownMenuTrigger>

                                                        <DropdownMenuContent
                                                            align="end"
                                                        >

                                                            <DropdownMenuItem
                                                                onSelect={(e) => {
                                                                    e.preventDefault();

                                                                    setSelectedUser(user);

                                                                    requestAnimationFrame(() => {
                                                                        setDrawerOpen(true);
                                                                    });
                                                                }}
                                                            >

                                                                View User

                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem>

                                                                Edit User

                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleUserStatus(
                                                                        user.id,
                                                                        user.status
                                                                    )
                                                                }
                                                            >

                                                                {user.status ===
                                                                    "suspended"
                                                                    ? "Reactivate User"
                                                                    : "Suspend User"}

                                                            </DropdownMenuItem>

                                                        </DropdownMenuContent>

                                                    </DropdownMenu>

                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}


                </CardContent>

            </Card>

            <UserDetailsDrawer
                open={drawerOpen}
                onClose={() =>
                    setDrawerOpen(false)
                }
                user={selectedUser}
                onRoleUpdate={
                    handleRoleUpdate
                }
                roleLoading={
                    roleLoading
                }
            />



        </div>
    );
}

/* =========================================================
   STATS CARD
========================================================= */

function StatsCard({
    title,
    value,
    icon: Icon,
}) {

    return (

        <Card>

            <CardContent
                className="
          p-5
          flex
          items-center
          justify-between
        "
            >

                <div>

                    <div className="
            text-sm
            text-muted-foreground
          ">

                        {title}

                    </div>

                    <div className="
            text-3xl
            font-black
            mt-1
          ">

                        {value}

                    </div>

                </div>

                <div className="
          h-12
          w-12
          rounded-2xl
          bg-primary/10
          flex
          items-center
          justify-center
        ">

                    <Icon
                        size={24}
                    />

                </div>

            </CardContent>

        </Card>
    );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
    status,
}) {

    if (status === "suspended") {

        return (
            <Badge
                variant="destructive"
            >
                Suspended
            </Badge>
        );
    }

    return (
        <Badge
            className="
        bg-emerald-500
      "
        >
            Active
        </Badge>
    );
}