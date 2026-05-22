import { useEffect, useState } from "react";
import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    updateDoc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import {
    Trash2,
    Mail,
    MailOpen,
} from "lucide-react";

export default function AdminContactMessages() {

    const [messages, setMessages] = useState([]);

    useEffect(() => {

        const q = query(
            collection(db, "contactMessages"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {

            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setMessages(data);

        });

        return () => unsubscribe();

    }, []);

    const markAsRead = async (id) => {

        await updateDoc(
            doc(db, "contactMessages", id),
            {
                isRead: true,
            }
        );

    };

    const deleteMessage = async (id) => {

        const confirmDelete = window.confirm(
            "Delete this message?"
        );

        if (!confirmDelete) return;

        await deleteDoc(
            doc(db, "contactMessages", id)
        );

    };

    return (
        <div className="p-6">

            <h1 className="text-3xl font-bold mb-6">
                Contact Messages
            </h1>

            <div className="space-y-4">

                {messages.map((msg) => (

                    <div
                        key={msg.id}
                        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
                    >

                        <div className="flex items-start justify-between gap-4">

                            <div className="flex-1">

                                <div className="flex items-center gap-3 mb-2">

                                    <h2 className="font-semibold text-lg">
                                        {msg.subject}
                                    </h2>

                                    {msg.isRead ? (
                                        <span className="text-green-400 text-sm">
                                            Read
                                        </span>
                                    ) : (
                                        <span className="text-yellow-400 text-sm">
                                            Unread
                                        </span>
                                    )}

                                </div>

                                <p className="text-zinc-300">
                                    {msg.name}
                                </p>

                                <p className="text-zinc-500 text-sm">
                                    {msg.email}
                                </p>

                                <p className="mt-4 text-zinc-400 whitespace-pre-wrap">
                                    {msg.message}
                                </p>

                            </div>

                            <div className="flex gap-2">

                                {!msg.isRead && (
                                    <button
                                        onClick={() =>
                                            markAsRead(msg.id)
                                        }
                                        className="p-2 rounded-xl bg-blue-500/10 text-blue-400"
                                    >
                                        <MailOpen size={18} />
                                    </button>
                                )}

                                <button
                                    onClick={() =>
                                        deleteMessage(msg.id)
                                    }
                                    className="p-2 rounded-xl bg-red-500/10 text-red-400"
                                >
                                    <Trash2 size={18} />
                                </button>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}