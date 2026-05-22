import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function PublicLayout() {
    const navigate = useNavigate();

    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [installable, setInstallable] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();

            setDeferredPrompt(e);
            setInstallable(true);
        };

        window.addEventListener(
            "beforeinstallprompt",
            handler
        );

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handler
            );
        };
    }, []);

    const installApp = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        const { outcome } =
            await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            toast.success("SellerOS installed");
        }

        setDeferredPrompt(null);
        setInstallable(false);
    };


    return (
        <div className="min-h-screen bg-zinc-950 text-white">

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">

                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                    {/* Logo */}
                    <div
                        className="cursor-pointer"
                        onClick={() => navigate("/")}
                    >
                        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
                            SellerOS
                        </h1>

                        <p className="text-xs text-zinc-500">
                            Commerce ERP Platform
                        </p>
                    </div>

                    {/* Navigation */}
                    <div className="hidden md:flex items-center gap-8 text-sm text-zinc-300">

                        <button className="hover:text-white transition">
                            Features
                        </button>

                        <button className="hover:text-white transition">
                            Integrations
                        </button>

                        <button className="hover:text-white transition"
                        onClick={() => navigate("/upgrade-plan")}
                        >
                            Explore Plans
                        </button>

                        <button className="hover:text-white transition"
                        onClick={() => navigate("/contact-us")}
                        >
                            Contact Us
                        </button>

                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {installable && (
                            <button
                                onClick={installApp}
                                className="
      w-full
      bg-violet-600
      hover:bg-violet-700
      text-white
      py-3
      rounded-xl
      font-medium
      transition
    "
                            >
                                Install SellerOS
                            </button>
                        )}

                        <Button
                            variant="outline"
                            className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </Button>

                        <Button
                            className="bg-violet-600 hover:bg-violet-700"
                            onClick={() => navigate("/register")}
                        >
                            Get Started
                        </Button>

                    </div>

                </div>

            </header>

            {/* Page Content */}
            <main>
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="border-t border-zinc-800 bg-zinc-900 mt-20">

                <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">

                    <div>

                        <h2 className="text-2xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
                            SellerOS
                        </h2>

                        <p className="text-sm text-zinc-400 mt-4 leading-relaxed">
                            Modern ERP platform for ecommerce sellers,
                            inventory management, orders, analytics,
                            and marketplace automation.
                        </p>

                    </div>

                    <div>

                        <h3 className="font-semibold mb-4">
                            Platform
                        </h3>

                        <div className="space-y-3 text-sm text-zinc-400">

                            <p>Seller ERP</p>
                            <p>Inventory</p>
                            <p>Orders</p>
                            <p>Analytics</p>

                        </div>

                    </div>

                    <div>

                        <h3 className="font-semibold mb-4">
                            Company
                        </h3>

                        <div className="space-y-3 text-sm text-zinc-400">

                            <p>About</p>
                            <p>Contact</p>
                            <p>Privacy Policy</p>
                            <p>Terms</p>

                        </div>

                    </div>

                    <div>

                        <h3 className="font-semibold mb-4">
                            Support
                        </h3>

                        <div className="space-y-3 text-sm text-zinc-400">

                            <p>Help Center</p>
                            <p>FAQ</p>
                            <p>Email Support</p>
                            <p>Install App</p>

                        </div>

                    </div>

                </div>

                <div className="border-t border-zinc-800 py-4 text-center text-sm text-zinc-500">
                    © 2026 SellerOS ERP Platform
                </div>

            </footer>

        </div>
    );
}