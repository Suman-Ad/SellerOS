import { useState } from "react";

import {
    Mail,
    Phone,
    MapPin,
    Send,
    MessageSquare,
    Clock,
    Globe,
} from "lucide-react";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { toast } from "sonner";

export default function ContactUs() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {

            await addDoc(collection(db, "contactMessages"), {
                ...formData,
                isRead: false,
                createdAt: serverTimestamp(),
            });

            toast.success("Message sent successfully!");

            setFormData({
                name: "",
                email: "",
                subject: "",
                message: "",
            });

        } catch (error) {

            toast.error("Failed to send message");

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white">

            {/* Hero */}
            <section className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950">

                <div className="max-w-7xl mx-auto px-6 py-20">

                    <div className="max-w-3xl">

                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">

                            <MessageSquare size={16} />

                            Contact SellerOS

                        </div>

                        <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">

                            Need Help With Your
                            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
                                {" "}
                                Business?
                            </span>

                        </h1>

                        <p className="mt-6 text-zinc-400 text-lg leading-relaxed max-w-2xl">

                            Our support team is ready to help you with inventory,
                            orders, marketplaces, subscriptions, or technical issues.

                        </p>

                    </div>

                </div>

            </section>

            {/* Main Content */}
            <section className="max-w-7xl mx-auto px-6 py-16">

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Contact Cards */}
                    <div className="space-y-6">

                        {/* Email */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

                            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-5">

                                <Mail size={26} />

                            </div>

                            <h3 className="text-xl font-semibold mb-2">
                                Email Support
                            </h3>

                            <p className="text-zinc-400 mb-4">
                                Reach out anytime for help and support.
                            </p>

                            <p>
                                <a
                                    href="mailto:support@selleros.com"
                                    className="text-violet-400 hover:text-violet-300 transition"
                                >
                                    support@selleros.com
                                </a>
                            </p>

                            <p>
                                <a
                                    href="mailto:sumanadhikari@zohomail.in"
                                    className="text-violet-400 hover:text-violet-300 transition"
                                >
                                    sumanadhikari@zohomail.in
                                </a>
                            </p>


                        </div>

                        {/* Phone */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

                            <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/10 text-fuchsia-400 flex items-center justify-center mb-5">

                                <Phone size={26} />

                            </div>

                            <h3 className="text-xl font-semibold mb-2">
                                Phone Support
                            </h3>

                            <p className="text-zinc-400 mb-4">
                                Talk with our business support experts.
                            </p>

                            <p className="text-fuchsia-400">
                                Hasibul Rahaman:- +91 9239146595
                            </p>
                            <p className="text-fuchsia-400">
                                Sourav Adhikari:- +91 8910672774
                            </p>
                            <p className="text-fuchsia-400">
                                Suman Adhikari:- +91 9647255367
                            </p>

                        </div>

                        {/* Office */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

                            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-5">

                                <MapPin size={26} />

                            </div>

                            <h3 className="text-xl font-semibold mb-2">
                                Office
                            </h3>

                            <p className="text-zinc-400 leading-relaxed">
                                SellerOS Technologies
                                <br />
                                Rajhati, West Bengal
                                <br />
                                India-712417
                            </p>

                        </div>

                        {/* Working Hours */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5">

                                <Clock size={26} />

                            </div>

                            <h3 className="text-xl font-semibold mb-2">
                                Working Hours
                            </h3>

                            <div className="space-y-2 text-zinc-400">

                                <div className="flex justify-between">
                                    <span>Monday - Friday</span>
                                    <span>9 AM - 7 PM</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Saturday</span>
                                    <span>10 AM - 4 PM</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Sunday</span>
                                    <span>Closed</span>
                                </div>

                            </div>

                        </div>

                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">

                        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 md:p-10">

                            <div className="flex items-center gap-3 mb-8">

                                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center">

                                    <Globe size={24} />

                                </div>

                                <div>

                                    <h2 className="text-2xl font-bold">
                                        Send Us a Message
                                    </h2>

                                    <p className="text-zinc-400 text-sm mt-1">
                                        We usually respond within 24 hours.
                                    </p>

                                </div>

                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >

                                <div className="grid md:grid-cols-2 gap-6">

                                    {/* Name */}
                                    <div>

                                        <label className="block text-sm font-medium mb-2 text-zinc-300">
                                            Full Name
                                        </label>

                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter your name"
                                            className="w-full h-14 rounded-2xl bg-zinc-950 border border-zinc-800 px-5 outline-none focus:border-violet-500 transition"
                                            required
                                        />

                                    </div>

                                    {/* Email */}
                                    <div>

                                        <label className="block text-sm font-medium mb-2 text-zinc-300">
                                            Email Address
                                        </label>

                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email"
                                            className="w-full h-14 rounded-2xl bg-zinc-950 border border-zinc-800 px-5 outline-none focus:border-violet-500 transition"
                                            required
                                        />

                                    </div>

                                </div>

                                {/* Subject */}
                                <div>

                                    <label className="block text-sm font-medium mb-2 text-zinc-300">
                                        Subject
                                    </label>

                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="How can we help?"
                                        className="w-full h-14 rounded-2xl bg-zinc-950 border border-zinc-800 px-5 outline-none focus:border-violet-500 transition"
                                        required
                                    />

                                </div>

                                {/* Message */}
                                <div>

                                    <label className="block text-sm font-medium mb-2 text-zinc-300">
                                        Message
                                    </label>

                                    <textarea
                                        rows={7}
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Write your message here..."
                                        className="w-full rounded-2xl bg-zinc-950 border border-zinc-800 px-5 py-4 outline-none focus:border-violet-500 transition resize-none"
                                        required
                                    />

                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="h-14 px-8 rounded-2xl bg-violet-600 hover:bg-violet-700 transition font-semibold flex items-center gap-3"
                                >

                                    <Send size={18} />

                                    {loading
                                        ? "Sending..."
                                        : "Send Message"}

                                </button>

                            </form>

                        </div>

                    </div>



                </div>

            </section>

            {/* Founder Section */}
            <section className="max-w-7xl mx-auto px-6 pb-20">

                <div className="mb-10">

                    <h2 className="text-4xl font-black tracking-tight">
                        Meet The
                        <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
                            {" "}
                            Leadership
                        </span>
                    </h2>

                    <p className="text-zinc-400 mt-3 text-lg">
                        The people building SellerOS for modern commerce businesses.
                    </p>

                </div>

                <div className="grid md:grid-cols-2 gap-8">

                    {/* Founder */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-violet-500/30 transition">

                        <div className="flex items-center gap-5">

                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-3xl font-black">
                                S
                            </div>

                            <div>

                                <h3 className="text-2xl font-bold">
                                    Sourav Adhikari & Sk Hasibur Rahaman
                                </h3>

                                <p className="text-violet-400 font-medium mt-1">
                                    Founder & CEO
                                </p>

                            </div>

                        </div>

                        <p className="mt-6 text-zinc-400 leading-relaxed">
                            Visionary entrepreneur and technology builder focused on creating
                            scalable commerce ERP solutions for modern online sellers and
                            businesses.
                        </p>

                    </div>

                    {/* Co-Founder */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-fuchsia-500/30 transition">

                        <div className="flex items-center gap-5">

                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center text-3xl font-black">
                                C
                            </div>

                            <div>

                                <h3 className="text-2xl font-bold">
                                    Suman Adhikari
                                </h3>

                                <p className="text-fuchsia-400 font-medium mt-1">
                                    Co-Founder & CTO
                                </p>

                            </div>

                        </div>

                        <p className="mt-6 text-zinc-400 leading-relaxed">
                            Leading platform engineering, product innovation, innovative technologist and software architect with a passion for building scalable solutions. Specializing in cloud-native applications, microservices, and modern infrastructure development practices for SellerOS ERP ecosystem.
                        </p>

                    </div>

                </div>

            </section>
            {/* FAQ Section */}
            <section className="max-w-7xl mx-auto px-6 pb-24">

                <div className="text-center mb-14">

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">

                        Frequently Asked Questions

                    </div>

                    <h2 className="text-4xl md:text-5xl font-black tracking-tight">

                        Got Questions?
                        <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
                            {" "}
                            We Have Answers
                        </span>

                    </h2>

                    <p className="text-zinc-400 mt-5 text-lg max-w-2xl mx-auto">

                        Everything you need to know about SellerOS ERP platform,
                        subscriptions, marketplaces, inventory, and support.

                    </p>

                </div>

                <div className="space-y-5">

                    {/* FAQ Item */}
                    {[
                        {
                            question:
                                "What is SellerOS ERP?",
                            answer:
                                "SellerOS is a modern commerce ERP platform that helps sellers manage inventory, orders, marketplaces, analytics, staff, and business operations from one dashboard.",
                        },

                        {
                            question:
                                "Which marketplaces are supported?",
                            answer:
                                "SellerOS supports integration with major marketplaces including Amazon, Flipkart, Meesho, Shopify, WooCommerce, and custom marketplace APIs.",
                        },

                        {
                            question:
                                "Can I manage multiple stores?",
                            answer:
                                "Yes. SellerOS allows you to manage multiple stores, warehouses, and marketplaces from a single unified dashboard.",
                        },

                        {
                            question:
                                "Does SellerOS support bulk product uploads?",
                            answer:
                                "Yes. You can upload inventory and products in bulk using CSV or Excel templates for both internal inventory and marketplace-specific formats.",
                        },

                        {
                            question:
                                "Is there role-based staff management?",
                            answer:
                                "Absolutely. SellerOS includes Admin, Seller, Staff, and custom role management with permission controls.",
                        },

                        {
                            question:
                                "How secure is my business data?",
                            answer:
                                "Your data is protected with Firebase authentication, secure cloud storage, encrypted APIs, and role-based access controls.",
                        },

                        {
                            question:
                                "Can I upgrade or change my subscription plan?",
                            answer:
                                "Yes. You can upgrade, downgrade, or manage your subscription anytime from your account settings.",
                        },

                        {
                            question:
                                "How can I contact support?",
                            answer:
                                "You can contact our support team using the Contact Us page, email support, or live business support channels.",
                        },
                    ].map((faq, index) => (

                        <div
                            key={index}
                            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-violet-500/30 transition-all duration-300"
                        >

                            <h3 className="text-lg md:text-xl font-semibold mb-3">
                                {faq.question}
                            </h3>

                            <p className="text-zinc-400 leading-relaxed">
                                {faq.answer}
                            </p>

                        </div>

                    ))}

                </div>

            </section>

        </div>
    );
}