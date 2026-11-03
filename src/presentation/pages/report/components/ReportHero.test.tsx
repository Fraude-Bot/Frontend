import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ReportHero from "@/presentation/pages/report/components/ReportHero";
import { DependencyProvider } from "@/presentation/providers/DependencyProvider";
import { createDependencies } from "@/infrastructure/di/container";

function renderHero(
  overrides: Partial<
    Parameters<typeof DependencyProvider>[0]["overrides"]
  > = {},
) {
  const onProfilePictureChange = vi.fn();

  render(
    <MemoryRouter>
      <DependencyProvider
        dependencies={createDependencies()}
        overrides={overrides}
      >
        <ReportHero
          id="1"
          name="Ruja Ignatova"
          type="Estafador"
          partyType="scammer"
          reportDate={new Date("2026-01-01")}
          status="Activo"
          reports={2}
          categories={["Crypto"]}
          profilePicture={null}
          onProfilePictureChange={onProfilePictureChange}
        />
      </DependencyProvider>
    </MemoryRouter>,
  );

  return { onProfilePictureChange };
}

describe("ReportHero profile picture", () => {
  it("uploads a selected image through the temporary profile picture use case", async () => {
    const execute = vi.fn().mockResolvedValue({
      path: "profiles/new-photo.jpg",
      displayUrl: "http://localhost:9000/storage/profiles/new-photo.jpg",
    });
    const user = userEvent.setup();
    const { onProfilePictureChange } = renderHero({
      storeTemporaryProfilePictureUseCase: { execute, cancel: vi.fn() },
    });

    const file = new File(["photo"], "ruja.png", { type: "image/png" });
    const input = document.querySelector('input[type="file"]');
    expect(input).toBeTruthy();

    await user.click(
      screen.getByRole("button", { name: "Cambiar foto de perfil" }),
    );
    await user.upload(input as HTMLInputElement, file);

    await waitFor(() => {
      expect(execute).toHaveBeenCalledWith(file);
    });

    expect(onProfilePictureChange).toHaveBeenCalledWith({
      path: "profiles/new-photo.jpg",
      displayUrl: "http://localhost:9000/storage/profiles/new-photo.jpg",
    });
  });
});
