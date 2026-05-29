// src/utils/firebaseDB/OrganizationDetails.js

import {
    collection,
    getDocs,
    query,
    where
} from "firebase/firestore";

import {
    useEffect,
    useState
} from "react";

import {
    db
} from "@/firebase/config";

import {
    toast
} from "sonner";

export const useOrganizationDetails = (sellerId) => {
    const [organization, setOrganization] = useState(null);

    useEffect(() => {
        const fetchOrganizationDetails = async () => {
            const organizationRef = query(
                collection(
                    db,
                    "organizations"
                ),
                where(
                    "ownerId",
                    "==",
                    sellerId
                )
            );

            const orgSnapshot =
                await getDocs(
                    organizationRef
                );

            if (!orgSnapshot.empty
            ) {

                setOrganization({

                    id:
                        orgSnapshot.docs[0].id,

                    ...orgSnapshot.docs[0].data(),
                });
            } else {
                toast.error(
                    "Organization details not found."
                );
            }
        };

        if (sellerId) {
            fetchOrganizationDetails();
        }

    }, [sellerId]);

    return organization;
};
