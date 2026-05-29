import { useAuth }
from "@/context/AuthContext";

import ProfileHero
from "./components/ProfileHero";

import ProfileSidebar
from "./components/ProfileSidebar";

import ProfileTabs
from "./components/ProfileTabs";

export default function UserProfile() {

  const {
    user,
    userData,
  } = useAuth();

  // ========================================
  // LOADING
  // ========================================

  if (!userData) {

    return (

      <div className="
        min-h-screen
        bg-zinc-950
        flex
        items-center
        justify-center
        text-zinc-400
      ">

        Loading profile...

      </div>
    );
  }

  return (

    <div className="
      min-h-screen
      bg-zinc-950
      text-white
    ">

      {/* HERO */}

      <ProfileHero
        user={user}
        userData={userData}
      />

      {/* MAIN */}

      <div className="
        max-w-7xl
        mx-auto
        px-4
        md:px-6
        pb-10
      ">

        <div className="
          grid
          grid-cols-1
          xl:grid-cols-4
          gap-6
        ">

          {/* SIDEBAR */}

          <div className="
            xl:col-span-1
          ">

            <ProfileSidebar
              userData={userData}
            />

          </div>

          {/* CONTENT */}

          <div className="
            xl:col-span-3
          ">

            <ProfileTabs
              user={user}
              userData={userData}
            />

          </div>

        </div>

      </div>

    </div>
  );
}