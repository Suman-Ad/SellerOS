import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  motion,
} from "framer-motion";

import {
  Building2,
  CreditCard,
  FileCheck,
  Landmark,
  ShieldCheck,
  Upload,
} from "lucide-react";

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
  useAuth,
} from "@/context/AuthContext";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  toast,
} from "sonner";

import logo
  from "@/assets/image.png";

/* =========================================================
   COMPONENT
========================================================= */

export default function ComplianceUpload() {

  const navigate =
    useNavigate();

  const {
    user,
    userData,
    refreshUser,
  } = useAuth();

  /* =====================================================
     STATE
  ===================================================== */

  const [loading,
    setLoading] =
    useState(false);

  const [formData,
    setFormData] =
    useState({

      gstNo: "",

      panNo: "",

      governmentIdNo: "",

      bankAccountNo: "",
    });

  const [files,
    setFiles] =
    useState({

      gst: null,

      pan: null,

      governmentId: null,

      bank: null,
    });

  /* =====================================================
     HELPERS
  ===================================================== */

  const updateField =
    (field, value) => {

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const updateFile =
    (field, file) => {

      setFiles((prev) => ({
        ...prev,
        [field]: file,
      }));
    };

  /* =====================================================
     FILE UPLOAD
  ===================================================== */

  const uploadDocument =
    async ({
      file,
      folder,
    }) => {

      if (!file)
        return null;

      const fileRef =
        ref(
          storage,
          `compliance/users/${user.uid}/${folder}/${Date.now()}_${file.name}`
        );

      await uploadBytes(
        fileRef,
        file
      );

      const url =
        await getDownloadURL(
          fileRef
        );

      return url;
    };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit =
    async () => {

      try {

        if (!user) {

          toast.error(
            "Authentication required"
          );

          return;
        }

        setLoading(true);

        /* =====================
           UPLOAD FILES
        ===================== */

        const gstUrl =
          await uploadDocument({
            file: files.gst,
            folder: "gst",
          });

        const panUrl =
          await uploadDocument({
            file: files.pan,
            folder: "pan",
          });

        const governmentUrl =
          await uploadDocument({
            file:
              files.governmentId,
            folder:
              "government",
          });

        const bankUrl =
          await uploadDocument({
            file: files.bank,
            folder: "bank",
          });

        /* =====================
           UPDATE USER
        ===================== */

        const userRef = doc(
          db,
          "users",
          user.uid
        );

        await updateDoc(
          userRef,
          {

            gstNo:
              formData.gstNo,

            panNo:
              formData.panNo,

            governmentIdNo:
              formData.governmentIdNo,

            bankAccountNo:
              formData.bankAccountNo,

            complianceDocuments:
            {

              gst: {

                number:
                  formData.gstNo,

                url:
                  gstUrl,

                uploadedAt:
                  serverTimestamp(),

                status:
                  "pending",
              },

              pan: {

                number:
                  formData.panNo,

                url:
                  panUrl,

                uploadedAt:
                  serverTimestamp(),

                status:
                  "pending",
              },

              governmentId:
              {

                number:
                  formData.governmentIdNo,

                url:
                  governmentUrl,

                uploadedAt:
                  serverTimestamp(),

                status:
                  "pending",
              },

              bank: {

                number:
                  formData.bankAccountNo,

                url:
                  bankUrl,

                uploadedAt:
                  serverTimestamp(),

                status:
                  "pending",
              },
            },

            complianceStatus:
            {

              gst:
                "pending",

              pan:
                "pending",

              bankVerification:
                "pending",

              addressVerification:
                "pending",
            },

            onboarding: {
              ...userData.onboarding,
              documentsUploaded: true,
              complianceSubmitted: true,
            },

            updatedAt:
              serverTimestamp(),
          }
        );

        await refreshUser();

        toast.success(
          "Compliance documents submitted successfully"
        );

        navigate(
          "/pending-approval"
        );

      } catch (error) {

        console.error(error);

        toast.error(
          "Compliance upload failed"
        );

      } finally {

        setLoading(false);
      }
    };

  /* =====================================================
     UI
  ===================================================== */

  return (

    <div
      className="
        min-h-screen
        relative
        overflow-hidden
        flex
        items-center
        justify-center
        p-6
      "
      style={{

        backgroundImage:
          `url(${logo})`,

        backgroundSize:
          "cover",

        backgroundPosition:
          "center",

        backgroundRepeat:
          "no-repeat",
      }}
    >

      {/* Overlay */}
      <div className="
        absolute inset-0
        bg-black/70
        backdrop-blur-sm
      " />

      {/* Content */}
      <motion.div
        initial={{
          opacity: 0,
          y: 40,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          relative z-10
          w-full
          max-w-5xl
        "
      >

        <Card className="
          border border-white/10
          bg-white/10
          backdrop-blur-2xl
          rounded-3xl
          overflow-hidden
          shadow-2xl
        ">

          <CardContent className="
            p-8 md:p-10
          ">

            {/* Header */}
            <div className="
              mb-10
            ">

              <div className="
                w-20 h-20
                rounded-3xl
                bg-violet-500/20
                border border-violet-500/20
                flex items-center
                justify-center
                text-violet-300
                mb-6
              ">

                <ShieldCheck
                  size={38}
                />

              </div>

              <h1 className="
                text-4xl
                font-black
                text-white
              ">

                Compliance Verification

              </h1>

              <p className="
                text-zinc-300
                mt-3
              ">

                Upload business verification documents for enterprise activation

              </p>

            </div>

            {/* Form */}
            <div className="
              grid md:grid-cols-2
              gap-5
            ">

              <DocumentUploadCard
                icon={Building2}
                title="GST Verification"
                numberPlaceholder="GST Number"
                numberValue={
                  formData.gstNo
                }
                fileName={files.gst?.name}
                onNumberChange={(e) =>
                  updateField(
                    "gstNo",
                    e.target.value
                  )
                }
                onFileChange={(e) =>
                  updateFile(
                    "gst",
                    e.target.files[0]
                  )
                }
              />

              <DocumentUploadCard
                icon={CreditCard}
                title="PAN Verification"
                numberPlaceholder="PAN Number"
                numberValue={
                  formData.panNo
                }
                fileName={files.pan?.name}
                onNumberChange={(e) =>
                  updateField(
                    "panNo",
                    e.target.value
                  )
                }
                onFileChange={(e) =>
                  updateFile(
                    "pan",
                    e.target.files[0]
                  )
                }
              />

              <DocumentUploadCard
                icon={FileCheck}
                title="Government ID"
                numberPlaceholder="Government ID Number"
                numberValue={
                  formData.governmentIdNo
                }
                fileName={files.governmentId?.name}
                onNumberChange={(e) =>
                  updateField(
                    "governmentIdNo",
                    e.target.value
                  )
                }
                onFileChange={(e) =>
                  updateFile(
                    "governmentId",
                    e.target.files[0]
                  )
                }
              />

              <DocumentUploadCard
                icon={Landmark}
                title="Bank Verification"
                numberPlaceholder="Bank Account Number"
                numberValue={
                  formData.bankAccountNo
                }
                fileName={files.bank?.name}
                onNumberChange={(e) =>
                  updateField(
                    "bankAccountNo",
                    e.target.value
                  )
                }
                onFileChange={(e) =>
                  updateFile(
                    "bank",
                    e.target.files[0]
                  )
                }
              />

            </div>

            {/* Security Info */}
            <div className="
              mt-8
              rounded-3xl
              border border-violet-500/20
              bg-violet-500/10
              p-6
            ">

              <h3 className="
                text-white
                text-xl
                font-bold
                mb-3
              ">

                Enterprise Security & Compliance

              </h3>

              <div className="
                grid md:grid-cols-3
                gap-4
              ">

                {[
                  "Encrypted document storage",
                  "Admin review workflow",
                  "Enterprise fraud prevention",
                ].map((item) => (

                  <div
                    key={item}
                    className="
                      rounded-2xl
                      bg-black/20
                      border border-white/10
                      p-4
                      text-zinc-200
                    "
                  >

                    {item}

                  </div>
                ))}

              </div>

            </div>

            {/* Footer */}
            <div className="
              mt-10
              flex justify-end
            ">

              <Button
                onClick={
                  handleSubmit
                }
                disabled={loading}
                className="
                  h-14
                  px-8
                  rounded-2xl
                  bg-violet-600
                  hover:bg-violet-700
                  text-lg
                  font-semibold
                "
              >

                <Upload
                  size={18}
                />

                {loading
                  ? "Uploading..."
                  : "Submit Compliance"}

              </Button>

            </div>

          </CardContent>

        </Card>

      </motion.div>

    </div>
  );
}

/* =========================================================
   DOCUMENT CARD
========================================================= */

function DocumentUploadCard({
  icon: Icon,

  title,

  numberPlaceholder,

  numberValue,

  onNumberChange,

  onFileChange,

  fileName,
}) {

  return (

    <div className="
      rounded-3xl
      border border-white/10
      bg-black/20
      p-5
    ">

      <div className="
        flex items-center
        gap-4
        mb-5
      ">

        <div className="
          w-14 h-14
          rounded-2xl
          bg-violet-500/20
          text-violet-300
          flex items-center
          justify-center
        ">

          <Icon
            size={24}
          />

        </div>

        <div>

          <h3 className="
            text-white
            font-bold
            text-lg
          ">

            {title}

          </h3>

        </div>

      </div>

      <Input
        placeholder={
          numberPlaceholder
        }
        value={numberValue}
        onChange={onNumberChange}
        className="
          mb-4
          border-white/10
          bg-black/20
          text-white
          placeholder:text-zinc-500
        "
      />

      <label
        className="
          flex items-center
          justify-center
          gap-3
          h-32
          rounded-2xl
          border-2
          border-dashed
          border-white/10
          bg-black/20
          cursor-pointer
          text-zinc-300
          hover:border-violet-500/40
          transition-all
        "
      >

        <Upload
          size={20}
        />

        Upload Document

        <input
          type="file"
          className="hidden"
          onChange={onFileChange}
        />
        {fileName && (
          <p className="
    text-xs
    text-green-400
    mt-3
    text-center
    break-all
  ">
            {fileName}
          </p>
        )}

      </label>

    </div>
  );
}