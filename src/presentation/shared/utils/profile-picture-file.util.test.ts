import {
  MAX_PROFILE_PICTURE_BYTES,
  validateProfilePicture,
} from "@/presentation/shared/utils/profile-picture-file.util";

describe("validateProfilePicture", () => {
  it("accepts jpeg, png, and webp files within the size limit", () => {
    const jpeg = new File(["x"], "photo.jpg", { type: "image/jpeg" });
    const webp = new File(["x"], "photo.webp", { type: "image/webp" });

    expect(validateProfilePicture(jpeg)).toBeNull();
    expect(validateProfilePicture(webp)).toBeNull();
  });

  it("rejects unsupported formats", () => {
    const file = new File(["x"], "photo.gif", { type: "image/gif" });

    expect(validateProfilePicture(file)).toBe("Usa una imagen JPG, PNG o WEBP.");
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
