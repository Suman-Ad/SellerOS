import {
  Crown,
  ShieldCheck,
  User,
  Building2,
} from "lucide-react";

import ProfileAvatarUpload
from "@/components/profile/ProfileAvatarUpload";

import ProfileBannerUpload
from "@/components/profile/ProfileBannerUpload";

export default function ProfileHero({
  user,
  userData,
}) {

  const governance =
    userData?.governance || {};

  const access =
    userData?.access || {};

  const organization =
    userData?.organization || {};

  const subscription =
    userData?.subscription || {};

  return (

    <div className="
      relative
      mb-8
    ">

      {/* Banner */}

      <ProfileBannerUpload
        user={user}
        userData={userData}
      />

      <div className="
        max-w-7xl
        mx-auto
        px-4
        md:px-6
      ">

        <div className="
          relative
          -mt-20
          z-10
          flex
          flex-col
          lg:flex-row
          lg:items-end
          justify-between
          gap-6
        ">

          {/* LEFT */}

          <div className="
            flex
            flex-col
            lg:flex-row
            lg:items-end
            gap-6
          ">

            <ProfileAvatarUpload
              user={user}
              userData={userData}
            />

            <div className="
              pb-2
            ">

              <h1 className="
                text-4xl
                font-black
              ">

                {userData?.fullName ||
                  "Unknown User"}

              </h1>

              <p className="
                text-zinc-400
                mt-2
                text-lg
              ">

                @{userData?.username}

              </p>

              {/* Badges */}

              <div className="
                flex
                flex-wrap
                gap-3
                mt-5
              ">

                <Badge
                  icon={<User size={14} />}
                  label={
                    access?.role ||
                    "user"
                  }
                />

                <Badge
                  icon={<Building2 size={14} />}
                  label={
                    organization?.organizationRole ||
                    "member"
                  }
                />

                <Badge
                  icon={<ShieldCheck size={14} />}
                  label={
                    governance?.sellerStatus ||
                    "pending"
                  }
                />

                <Badge
                  icon={<Crown size={14} />}
                  label={
                    subscription?.plan ||
                    "free"
                  }
                />

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

function Badge({
  icon,
  label,
}) {

  return (

    <div className="
      px-4
      py-2
      rounded-full
      bg-zinc-900/90
      border
      border-zinc-800
      flex
      items-center
      gap-2
      text-sm
      font-medium
      capitalize
      backdrop-blur-xl
    ">

      {icon}

      {label}

    </div>
  );
}