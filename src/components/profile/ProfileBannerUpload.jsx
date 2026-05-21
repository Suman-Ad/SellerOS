import { useRef, useState } from "react";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import {
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  db,
  storage,
} from "@/firebase/config";

import {
  Upload,
  Trash2,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

import { toast } from "sonner";

export default function ProfileBannerUpload({
  user,
  userData,
}) {

  const fileInputRef =
    useRef(null);

  const [uploading,
    setUploading] =
    useState(false);

  const [preview,
    setPreview] =
    useState(
      userData?.bannerURL || ""
    );

  // ========================================
  // Select File
  // ========================================

  const handleSelectFile =
    () => {

      fileInputRef.current?.click();
    };

  // ========================================
  // Upload Banner
  // ========================================

  const handleUpload =
    async (e) => {

      try {

        const file =
          e.target.files?.[0];

        if (!file) return;

        // ========================================
        // Validation
        // ========================================

        if (
          !file.type.startsWith(
            "image/"
          )
        ) {

          return toast.error(
            "Only image files allowed"
          );
        }

        // 10MB Limit
        if (
          file.size >
          10 * 1024 * 1024
        ) {

          return toast.error(
            "Banner size limit is 10MB"
          );
        }

        setUploading(true);

        // ========================================
        // Local Preview
        // ========================================

        const localPreview =
          URL.createObjectURL(
            file
          );

        setPreview(localPreview);

        // ========================================
        // Upload
        // ========================================

        const storageRef =
          ref(
            storage,
            `banners/${user.uid}/${Date.now()}-${file.name}`
          );

        await uploadBytes(
          storageRef,
          file
        );

        // ========================================
        // Download URL
        // ========================================

        const bannerURL =
          await getDownloadURL(
            storageRef
          );

        // ========================================
        // Update Firestore
        // ========================================

        await updateDoc(
          doc(
            db,
            "users",
            user.uid
          ),
          {

            bannerURL,

            updatedAt:
              serverTimestamp(),
          }
        );

        setPreview(
          bannerURL
        );

        toast.success(
          "Profile banner updated"
        );

      } catch (error) {

        console.error(error);

        toast.error(
          error.message
        );

      } finally {

        setUploading(false);
      }
    };

  // ========================================
  // Remove Banner
  // ========================================

  const handleRemoveBanner =
    async () => {

      try {

        setUploading(true);

        await updateDoc(
          doc(
            db,
            "users",
            user.uid
          ),
          {

            bannerURL: "",

            updatedAt:
              serverTimestamp(),
          }
        );

        setPreview("");

        toast.success(
          "Banner removed"
        );

      } catch (error) {

        console.error(error);

        toast.error(
          error.message
        );

      } finally {

        setUploading(false);
      }
    };

  return (

    <div className="
      relative
      w-full
      h-72
      rounded-3xl
      overflow-hidden
      border
      border-zinc-800
      bg-zinc-900
      group
    ">

      {/* Banner */}
      {preview ? (

        <img
          src={preview}
          alt="Banner"
          className="
            w-full
            h-full
            object-cover
          "
        />

      ) : (

        <div className="
          w-full
          h-full
          bg-gradient-to-r
          from-violet-700
          via-fuchsia-700
          to-indigo-700
          flex flex-col
          items-center
          justify-center
          text-center
          p-8
        ">

          <div className="
            w-20 h-20
            rounded-3xl
            bg-white/10
            backdrop-blur-xl
            flex items-center
            justify-center
            text-white
          ">

            <ImageIcon size={38} />

          </div>

          <h2 className="
            text-3xl
            font-black
            text-white
            mt-6
          ">

            Profile Banner

          </h2>

          <p className="
            text-white/70
            mt-3
            max-w-md
          ">

            Customize your SellerOS
            account with a personalized
            business banner.

          </p>

        </div>

      )}

      {/* Overlay */}
      <div className="
        absolute
        inset-0
        bg-black/50
        opacity-0
        group-hover:opacity-100
        transition-all
        duration-300
        flex items-center
        justify-center
        gap-5
      ">

        {/* Upload */}
        <button
          onClick={
            handleSelectFile
          }
          disabled={uploading}
          className="
            w-16 h-16
            rounded-3xl
            bg-violet-600
            hover:bg-violet-700
            flex items-center
            justify-center
            transition
            shadow-2xl
          "
        >

          {uploading ? (

            <Loader2
              size={28}
              className="
                animate-spin
              "
            />

          ) : (

            <Upload size={28} />

          )}

        </button>

        {/* Remove */}
        {preview && (

          <button
            onClick={
              handleRemoveBanner
            }
            disabled={uploading}
            className="
              w-16 h-16
              rounded-3xl
              bg-red-600
              hover:bg-red-700
              flex items-center
              justify-center
              transition
              shadow-2xl
            "
          >

            <Trash2 size={28} />

          </button>

        )}

      </div>

      {/* Upload Text */}
      <div className="
        absolute
        bottom-6
        left-6
        bg-black/40
        backdrop-blur-xl
        border
        border-white/10
        rounded-2xl
        px-5 py-3
      ">

        <p className="
          text-white
          font-semibold
        ">

          Banner Image

        </p>

        <p className="
          text-white/70
          text-sm
          mt-1
        ">

          Recommended: 1600×500 PNG/JPG

        </p>

      </div>

      {/* Hidden Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={
          handleUpload
        }
      />

    </div>
  );
}