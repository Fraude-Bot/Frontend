import {
  MAX_PROFILE_PICTURE_BYTES,
  validateProfilePicture,
} from "@/presentation/shared/utils/profile-picture-file.util";

describe("validateProfilePicture", () => {
  it("accepts jpeg and png files within the size limit", () => {
    const file = new File(["x"], "photo.jpg", { type: "image/jpeg" });

    expect(validateProfilePicture(file)).toBeNull();
  });

  it("rejects unsupported formats", () => {
    const file = new File(["x"], "photo.gif", { type: "image/gif" });

    expect(validateProfilePicture(file)).toBe("Usa una imagen JPG o PNG.");
  });

  it("rejects files larger than 5 MB", () => {
    const file = new File(
      [new Uint8Array(MAX_PROFILE_PICTURE_BYTES + 1)],
      "photo.png",
      { type: "image/png" },
    );

    expect(validateProfilePicture(file)).toBe(
      "La imagen no puede superar 5 MB.",
    );
  });
});
