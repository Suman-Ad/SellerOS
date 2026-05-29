import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function SecurityTab() {

  return (

    <Card className="
      bg-zinc-900
      border-zinc-800
    ">

      <CardContent className="
        p-8
      ">

        <h2 className="
          text-2xl
          font-bold
          mb-4
        ">

          Security

        </h2>

        <p className="
          text-zinc-400
        ">

          Security management and sessions.

        </p>

      </CardContent>

    </Card>
  );
}