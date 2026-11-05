import UpdatePartyProfilePictureUsecase from "@/application/usecases/party/update-party-profile-picture.usecase";

describe("UpdatePartyProfilePictureUsecase", () => {
  it("delegates to the public API with the party id, type, and temporary path", async () => {
    const updatePartyProfilePicture = vi.fn().mockResolvedValue({
      path: "http://localhost:9000/storage/reports/scammers/profiles/a.jpg",
      displayUrl: "http://localhost:9000/storage/reports/scammers/profiles/a.jpg",
    });
    const useCase = new UpdatePartyProfilePictureUsecase({
      updatePartyProfilePicture,
    });

    await expect(
      useCase.execute("42", "scammer", "/storage/tmp/reports/profiles/a.jpg"),
    ).resolves.toEqual({
      path: "http://localhost:9000/storage/reports/scammers/profiles/a.jpg",
      displayUrl: "http://localhost:9000/storage/reports/scammers/profiles/a.jpg",
    });

    expect(updatePartyProfilePicture).toHaveBeenCalledWith(
      "42",
      "scammer",
      "/storage/tmp/reports/profiles/a.jpg",
      expect.any(AbortSignal),
    );
  });
});
