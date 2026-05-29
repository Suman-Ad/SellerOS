import {
  useEffect,
  useState,
} from "react";

import {
  ShieldCheck,
  Building2,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Badge,
} from "@/components/ui/badge";

const PLATFORM_ROLES = [
  "user",
  "admin",
  "super_admin",
];

const ORG_ROLES = [
  "owner",
  "manager",
  "staff",
  "viewer",
];

export default function UserRoleEditor({
  user,
  onSave,
  loading,
}) {

  const [platformRole,
    setPlatformRole] =
    useState(
      user?.platformRole ||
      "user"
    );

  const [organizationRole,
    setOrganizationRole] =
    useState(
      user?.organizationRole ||
      "viewer"
    );

  useEffect(() => {

    setPlatformRole(
      user?.platformRole ||
      "user"
    );

    setOrganizationRole(
      user?.organizationRole ||
      "viewer"
    );

  }, [user]);

  return (

    <div className="
      border
      rounded-2xl
      p-5
      mt-6
      space-y-6
    ">

      <div>

        <h3 className="
          text-lg
          font-bold
        ">

          Role Management

        </h3>

        <p className="
          text-sm
          text-muted-foreground
          mt-1
        ">

          Manage platform and
          organization permissions

        </p>

      </div>

      {/* PLATFORM ROLE */}
      <div>

        <div className="
          flex items-center
          gap-2
          mb-3
        ">

          <ShieldCheck
            size={18}
          />

          <span className="
            font-semibold
          ">

            Platform Role

          </span>

        </div>

        <div className="
          flex flex-wrap
          gap-2
        ">

          {PLATFORM_ROLES.map(
            (role) => (

              <Badge
                key={role}
                onClick={() =>
                  setPlatformRole(
                    role
                  )
                }
                className={`
                  cursor-pointer
                  capitalize

                  ${platformRole === role
                    ? "ring-2 ring-primary"
                    : ""
                  }
                `}
              >

                {role}

              </Badge>
            )
          )}

        </div>

      </div>

      {/* ORG ROLE */}
      <div>

        <div className="
          flex items-center
          gap-2
          mb-3
        ">

          <Building2
            size={18}
          />

          <span className="
            font-semibold
          ">

            Organization Role

          </span>

        </div>

        <div className="
          flex flex-wrap
          gap-2
        ">

          {ORG_ROLES.map(
            (role) => (

              <Badge
                key={role}
                variant="secondary"
                onClick={() =>
                  setOrganizationRole(
                    role
                  )
                }
                className={`
                  cursor-pointer
                  capitalize

                  ${organizationRole === role
                    ? "ring-2 ring-primary"
                    : ""
                  }
                `}
              >

                {role}

              </Badge>
            )
          )}

        </div>

      </div>

      {/* SAVE */}
      <Button
        onClick={() =>
          onSave({
            platformRole,
            organizationRole,
          })
        }
        disabled={loading}
        className="
          w-full
        "
      >

        {loading
          ? "Updating..."
          : "Update Roles"}

      </Button>

    </div>
  );
}