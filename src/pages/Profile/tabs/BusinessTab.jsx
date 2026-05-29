import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function BusinessTab() {

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

          Business

        </h2>

        <p className="
          text-zinc-400
        ">

          Organization and business intelligence.

        </p>

      </CardContent>

    </Card>
  );
}