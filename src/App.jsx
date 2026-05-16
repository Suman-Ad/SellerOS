import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

function App() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      
      <Card className="w-[400px] bg-zinc-900 border-zinc-800 text-white">
        <CardContent className="p-8 flex flex-col gap-6">
          
          <div>
            <h1 className="text-3xl font-bold">
              SellerOS
            </h1>

            <p className="text-zinc-400 mt-2">
              Multi Marketplace Seller ERP
            </p>
          </div>

          <Button className="w-full">
            Launch Dashboard
          </Button>

        </CardContent>
      </Card>

    </div>
  )
}

export default App