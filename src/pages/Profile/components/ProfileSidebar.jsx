import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Progress,
} from "@/components/ui/progress";

import {
  CheckCircle2,
  ShieldCheck,
  Activity,
  Sparkles,
} from "lucide-react";

export default function ProfileSidebar({
  userData,
}) {

  const onboarding =
    userData?.onboarding || {};

  const authStatus =
    userData?.authStatus || {};

  const organization =
    userData?.organization || {};

  // ========================================
  // PROFILE COMPLETION
  // ========================================

  let completed = 0;

  const total = 5;

  if (userData?.avatar)
    completed++;

  if (
    authStatus?.emailVerified
  )
    completed++;

  if (
    userData?.phoneNumber
  )
    completed++;

  if (
    organization?.organizationId
  )
    completed++;

  if (
    onboarding?.complianceSubmitted
  )
    completed++;

  const percent =
    Math.round(
      (completed / total) * 100
    );

  return (

    <div className="
      space-y-6
      sticky
      top-6
    ">

      {/* Completion */}

      <Card className="
        bg-zinc-900
        border-zinc-800
      ">

        <CardContent className="
          p-6
        ">

          <div className="
            flex items-center
            gap-3
            mb-5
          ">

            <Sparkles className="
              text-violet-400
            " />

            <h2 className="
              text-xl
              font-bold
            ">

              Profile Completion

            </h2>

          </div>

          <div className="
            text-4xl
            font-black
            mb-4
          ">

            {percent}%

          </div>

          <Progress
            value={percent}
          />

          <div className="
            mt-6
            space-y-4
          ">

            <ChecklistItem
              label="Avatar Uploaded"
              checked={
                !!userData?.avatar
              }
            />

            <ChecklistItem
              label="Email Verified"
              checked={
                authStatus?.emailVerified
              }
            />

            <ChecklistItem
              label="Phone Added"
              checked={
                !!userData?.phoneNumber
              }
            />

            <ChecklistItem
              label="Organization Setup"
              checked={
                !!organization?.organizationId
              }
            />

            <ChecklistItem
              label="Compliance Submitted"
              checked={
                onboarding?.complianceSubmitted
              }
            />

          </div>

        </CardContent>

      </Card>

      {/* Account Intelligence */}

      <Card className="
        bg-zinc-900
        border-zinc-800
      ">

        <CardContent className="
          p-6
        ">

          <div className="
            flex items-center
            gap-3
            mb-6
          ">

            <Activity className="
              text-violet-400
            " />

            <h2 className="
              text-xl
              font-bold
            ">

              Account Intelligence

            </h2>

          </div>

          <div className="
            space-y-5
          ">

            <InfoRow
              label="Platform Role"
              value={
                userData?.access?.role
              }
            />

            <InfoRow
              label="Organization Role"
              value={
                userData?.organization
                  ?.organizationRole
              }
            />

            <InfoRow
              label="Subscription"
              value={
                userData?.subscription
                  ?.plan
              }
            />

            <InfoRow
              label="Seller Status"
              value={
                userData?.governance
                  ?.sellerStatus
              }
            />

          </div>

        </CardContent>

      </Card>

    </div>
  );
}

function ChecklistItem({
  label,
  checked,
}) {

  return (

    <div className="
      flex items-center
      justify-between
      text-sm
    ">

      <span className="
        text-zinc-300
      ">

        {label}

      </span>

      <CheckCircle2
        size={18}
        className={
          checked
            ? "text-green-400"
            : "text-zinc-600"
        }
      />

    </div>
  );
}

function InfoRow({
  label,
  value,
}) {

  return (

    <div className="
      flex items-center
      justify-between
      gap-3
    ">

      <p className="
        text-zinc-400
      ">

        {label}

      </p>

      <p className="
        font-semibold
        capitalize
      ">

        {value || "N/A"}

      </p>

    </div>
  );
}