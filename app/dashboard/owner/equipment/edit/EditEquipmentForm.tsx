
"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Category = {
  id: number;
  name: string;
};

type ExistingImage = {
  id: string;
  image_url: string;
  is_primary: boolean | null;
};

type Equipment = {
  id: string;
  name: string;
  category_id: number;
  brand: string | null;
  model: string | null;
  horsepower: number | null;
  capacity: string | null;
  supported_activity: string[];
  supported_crop: string[];
  rental_price: number;
  location: string;
  equipment_condition: string | null;
  description: string | null;
};

type Props = {
  equipment: Equipment;
  categories: Category[];
  existingImages: ExistingImage[];
  imageUrls: Record<string, string>;
};

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

const input =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20";

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function EditEquipmentForm({
  equipment,
  categories,
  existingImages,
  imageUrls,
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(equipment.name);
  const [categoryId, setCategoryId] = useState(String(equipment.category_id));
  const [brand, setBrand] = useState(equipment.brand ?? "");
  const [model, setModel] = useState(equipment.model ?? "");
  const [horsepower, setHorsepower] = useState(
    equipment.horsepower?.toString() ?? ""
  );
  const [capacity, setCapacity] = useState(equipment.capacity ?? "");
  const [activities, setActivities] = useState(
    equipment.supported_activity.join(", ")
  );
  const [crops, setCrops] = useState(equipment.supported_crop.join(", "));
  const [price, setPrice] = useState(String(equipment.rental_price));
  const [location, setLocation] = useState(equipment.location);
  const [condition, setCondition] = useState(
    equipment.equipment_condition ?? ""
  );
  const [description, setDescription] = useState(
    equipment.description ?? ""
  );

  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const remainingImages =
    MAX_IMAGES -
    (existingImages.length - removedImageIds.length);

  useEffect(() => {
    const urls = newImages.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImages]);

  function handleImageSelection(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setError("");
    setWarning("");

    const files = Array.from(event.target.files ?? []);

    const invalidFile = files.find(
      (file) =>
        !ALLOWED_TYPES.includes(file.type) ||
        file.size > MAX_FILE_SIZE
    );

    if (invalidFile) {
      setError(
        "Only JPEG and PNG images are allowed. Each image must be 5 MB or smaller."
      );
      event.target.value = "";
      return;
    }

    const uniqueFiles = files.filter(
      (file) =>
        !newImages.some(
          (existing) =>
            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified === file.lastModified
        )
    );

    if (newImages.length + uniqueFiles.length > remainingImages) {
      setError(`You can have a maximum of ${MAX_IMAGES} images.`);
      event.target.value = "";
      return;
    }

    setNewImages((previous) => [...previous, ...uniqueFiles]);
    event.target.value = "";
  }

  function removeExistingImage(id: string) {
    setRemovedImageIds((previous) => [...previous, id]);
  }

  function removeNewImage(index: number) {
    setNewImages((previous) =>
      previous.filter((_, currentIndex) => currentIndex !== index)
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setWarning("");

    const finalImageCount =
      existingImages.length -
      removedImageIds.length +
      newImages.length;

    if (finalImageCount === 0) {
      setError("Please keep or upload at least one equipment image.");
      return;
    }

    if (finalImageCount > MAX_IMAGES) {
      setError(`You can have a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    const parsedPrice = Number(price);
    const parsedHorsepower = horsepower ? Number(horsepower) : null;

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("Please enter a valid rental price.");
      return;
    }

    if (
      parsedHorsepower !== null &&
      (!Number.isInteger(parsedHorsepower) || parsedHorsepower < 0)
    ) {
      setError("Horsepower must be a non-negative whole number.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("You must be logged in to edit equipment.");
      }

      // Verify ownership and status again before saving.
      const { data: currentEquipment, error: fetchError } =
        await supabase
          .from("equipment")
          .select("id, status")
          .eq("id", equipment.id)
          .eq("owner_id", user.id)
          .single();

      if (
        fetchError ||
        !currentEquipment ||
        currentEquipment.status !== "rejected"
      ) {
        throw new Error(
          "This listing is no longer available for editing. Please refresh the page."
        );
      }

      const activityList = activities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const cropList = crops
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      // Update the equipment details and resubmit it.
      const { error: updateError } = await supabase
        .from("equipment")
        .update({
          category_id: Number(categoryId),
          name: name.trim(),
          brand: brand.trim() || null,
          model: model.trim() || null,
          horsepower: parsedHorsepower,
          capacity: capacity.trim() || null,
          supported_activity: activityList,
          supported_crop: cropList,
          rental_price: parsedPrice,
          location: location.trim(),
          equipment_condition: condition || null,
          description: description.trim() || null,
          rejection_reason: null,
          status: "pending",
        })
        .eq("id", equipment.id)
        .eq("owner_id", user.id)
        .eq("status", "rejected");

      if (updateError) {
        throw updateError;
      }

      // Remove images the owner chose to delete.
      const imagesToRemove = existingImages.filter((image) =>
        removedImageIds.includes(image.id)
      );

      for (const image of imagesToRemove) {
        const { error: deleteRecordError } = await supabase
          .from("equipment_images")
          .delete()
          .eq("id", image.id)
          .eq("equipment_id", equipment.id);

        if (deleteRecordError) {
          throw new Error(
            `Could not remove an old image: ${deleteRecordError.message}`
          );
        }

        const { error: deleteFileError } = await supabase.storage
          .from("equipment-images")
          .remove([image.image_url]);

        if (deleteFileError) {
          console.error("Image file cleanup error:", deleteFileError.message);
        }
      }

      // Upload new images.
      let uploadFailed = false;

      for (let index = 0; index < newImages.length; index++) {
        const file = newImages[index];

        const safeFileName = file.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        );

        const filePath =
          `${user.id}/${equipment.id}/${crypto.randomUUID()}-${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("equipment-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) {
          uploadFailed = true;
          console.error("Image upload error:", uploadError.message);
          continue;
        }

        const { error: recordError } = await supabase
          .from("equipment_images")
          .insert({
            equipment_id: equipment.id,
            image_url: filePath,
            is_primary:
              existingImages.length - removedImageIds.length === 0 &&
              index === 0,
          });

        if (recordError) {
          uploadFailed = true;
          console.error("Image record error:", recordError.message);

          await supabase.storage
            .from("equipment-images")
            .remove([filePath]);
        }
      }

      if (uploadFailed) {
        setWarning(
          "Your listing was resubmitted, but some new images could not be saved. Please contact an administrator."
        );
      }

      router.push("/dashboard/owner/equipment");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while updating equipment."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
      <section className="h-fit rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 font-semibold text-gray-900">
          Equipment Images *
        </h2>

        <div className="space-y-3">
          {existingImages.map((image) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-lg border border-gray-200"
            >
              <div className="aspect-square bg-gray-100">
                {imageUrls[image.id] && (
                  <img
                    src={imageUrls[image.id]}
                    alt="Existing equipment"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="p-2">
                <p className="text-xs text-gray-500">
                  {image.is_primary ? "Primary image" : "Equipment image"}
                </p>

                {removedImageIds.includes(image.id) ? (
                  <button
                    type="button"
                    onClick={() =>
                      setRemovedImageIds((previous) =>
                        previous.filter((id) => id !== image.id)
                      )
                    }
                    className="mt-2 text-xs font-medium text-green-700"
                  >
                    Keep image
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => removeExistingImage(image.id)}
                    className="mt-2 text-xs font-medium text-red-600"
                  >
                    Remove image
                  </button>
                )}
              </div>
            </div>
          ))}

          {newImages.map((file, index) => (
            <div
              key={`${file.name}-${file.lastModified}-${index}`}
              className="overflow-hidden rounded-lg border border-gray-200"
            >
              <div className="aspect-square bg-gray-100">
                {previewUrls[index] && (
                  <img
                    src={previewUrls[index]}
                    alt={`New equipment image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="p-2">
                <p className="truncate text-xs text-gray-700">
                  {file.name}
                </p>
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="mt-2 text-xs font-medium text-red-600"
                >
                  Remove image
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg border-2 border-dashed border-gray-300 p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={handleImageSelection}
            disabled={remainingImages - newImages.length <= 0}
            className="block w-full text-sm text-gray-600"
          />
          <p className="mt-2 text-xs text-gray-500">
            Up to {MAX_IMAGES} total images. JPEG or PNG, maximum 5 MB each.
            {` ${Math.max(0, remainingImages - newImages.length)} more can be added.`}
          </p>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-900">
          Equipment Information
        </h2>

        <p className="text-xs text-gray-500">
          Update the details based on the administrator's feedback.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name *">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={input}
            />
          </Field>

          <Field label="Category *">
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={input}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Brand">
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className={input}
            />
          </Field>

          <Field label="Model">
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className={input}
            />
          </Field>

          <Field label="Horsepower">
            <input
              type="number"
              min="0"
              step="1"
              value={horsepower}
              onChange={(e) => setHorsepower(e.target.value)}
              className={input}
            />
          </Field>

          <Field label="Capacity">
            <input
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className={input}
            />
          </Field>

          <Field label="Rental Price (₱ per day) *">
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={input}
            />
          </Field>

          <Field label="Equipment Condition *">
            <select
              required
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className={input}
            >
              <option value="">Select condition</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </Field>
        </div>

        <Field label="Supported Activities">
          <input
            value={activities}
            onChange={(e) => setActivities(e.target.value)}
            className={input}
            placeholder="Land Preparation, Planting, Harvesting"
          />
          <p className="mt-1 text-xs text-gray-500">
            Separate multiple activities with commas.
          </p>
        </Field>

        <Field label="Supported Crops">
          <input
            value={crops}
            onChange={(e) => setCrops(e.target.value)}
            className={input}
            placeholder="Rice, Corn, Vegetables"
          />
          <p className="mt-1 text-xs text-gray-500">
            Separate multiple crops with commas.
          </p>
        </Field>

        <Field label="Location *">
          <input
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={input}
          />
        </Field>

        <Field label="Description *">
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={input}
          />
        </Field>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        {warning && (
          <p role="alert" className="text-sm text-amber-700">
            {warning}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving || categories.length === 0}
            className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
          >
            {saving ? "Resubmitting..." : "Resubmit for Approval"}
          </button>
        </div>
      </section>
    </form>
  );
}
