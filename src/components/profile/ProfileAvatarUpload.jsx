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
  updateProfile,
} from "firebase/auth";

import {
  storage,
  db,
  auth,
} from "@/firebase/config";

import {
  Camera,
  Upload,
  Loader2,
  Trash2,
} from "lucide-react";

import { toast } from "sonner";

export default function ProfileAvatarUpload({
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
      userData?.photoURL || ""
    );

  // ========================================
  // Open File Picker
  // ========================================

  const handleSelectFile =
    () => {

      fileInputRef.current?.click();
    };

  // ========================================
  // Upload Avatar
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

        // 5MB limit
        if (
          file.size >
          5 * 1024 * 1024
        ) {

          return toast.error(
            "Max file size is 5MB"
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
        // Storage Path
        // ========================================

        const storageRef =
          ref(
            storage,
            `avatars/${user.uid}/${Date.now()}-${file.name}`
          );

        // ========================================
        // Upload
        // ========================================

        await uploadBytes(
          storageRef,
          file
        );

        // ========================================
        // Download URL
        // ========================================

        const photoURL =
          await getDownloadURL(
            storageRef
          );

        // ========================================
        // Update Auth
        // ========================================

        await updateProfile(
          auth.currentUser,
          {
            photoURL,
          }
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

            photoURL,

            updatedAt:
              serverTimestamp(),
          }
        );

        setPreview(photoURL);

        toast.success(
          "Avatar updated successfully"
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
  // Remove Avatar
  // ========================================

  const handleRemoveAvatar =
    async () => {

      try {

        setUploading(true);

        // ========================================
        // Remove From Auth
        // ========================================

        await updateProfile(
          auth.currentUser,
          {
            photoURL: "",
          }
        );

        // ========================================
        // Remove From Firestore
        // ========================================

        await updateDoc(
          doc(
            db,
            "users",
            user.uid
          ),
          {

            photoURL: "",

            updatedAt:
              serverTimestamp(),
          }
        );

        setPreview("");

        toast.success(
          "Avatar removed"
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
      flex flex-col
      items-center
    ">

      {/* Avatar */}
      <div className="
        relative
        group
      ">

        <div className="
          w-40 h-40
          rounded-3xl
          overflow-hidden
          border-4
          border-zinc-800
          bg-zinc-900
          flex items-center
          justify-center
        ">

          {preview ? (

            <img
              src={preview}
              alt="Avatar"
              className="
                w-full h-full
                object-cover
              "
            />

          ) : (

            <div className="
              text-6xl
              font-black
              text-zinc-600
            ">

              {userData?.fullName
                ?.charAt(0) || "U"}

            </div>

          )}

        </div>

        {/* Overlay */}
        <div className="
          absolute inset-0
          bg-black/50
          opacity-0
          group-hover:opacity-100
          transition
          rounded-3xl
          flex items-center
          justify-center
          gap-3
        ">

          {/* Upload */}
          <button
            onClick={
              handleSelectFile
            }
            disabled={uploading}
            className="
              w-12 h-12
              rounded-2xl
              bg-violet-600
              hover:bg-violet-700
              flex items-center
              justify-center
              transition
            "
          >

            {uploading ? (

              <Loader2
                className="
                  animate-spin
                "
                size={20}
              />

            ) : (

              <Upload size={20} />

            )}

          </button>

          {/* Remove */}
          {preview && (

            <button
              onClick={
                handleRemoveAvatar
              }
              disabled={uploading}
              className="
                w-12 h-12
                rounded-2xl
                bg-red-600
                hover:bg-red-700
                flex items-center
                justify-center
                transition
              "
            >

              <Trash2 size={20} />

            </button>

          )}

        </div>

        {/* Camera Badge */}
        <button
          onClick={
            handleSelectFile
          }
          disabled={uploading}
          className="
            absolute
            bottom-3
            right-3
            w-12 h-12
            rounded-2xl
            bg-violet-600
            hover:bg-violet-700
            border-4
            border-zinc-900
            flex items-center
            justify-center
            transition
          "
        >

          <Camera size={20} />

        </button>

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

      {/* Text */}
      <div className="
        text-center mt-6
      ">

        <h3 className="
          text-xl font-bold
        ">

          Profile Avatar

        </h3>

        <p className="
          text-zinc-400
          mt-2 text-sm
        ">

          Upload JPG, PNG or WEBP.
          Max size 5MB.

        </p>

      </div>

    </div>
  );
}