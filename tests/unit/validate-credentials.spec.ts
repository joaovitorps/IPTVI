import { ValidateCredentialsUseCase } from "@/core/domain/use-cases/validate-credentials";
import { makePlaylist } from "@tests/factories/make-playlist";
import { InMemoryAPIRepository } from "@tests/repositories/in-memory-credential-repository";

describe("Validate playlist use case", () => {
  let repository: InMemoryAPIRepository;
  let sut: ValidateCredentialsUseCase;

  beforeEach(() => {
    repository = new InMemoryAPIRepository();
    sut = new ValidateCredentialsUseCase(repository);
  });

  it("should return isValid true if credentials are valid", async () => {
    const { playlist } = makePlaylist();

    const result = await sut.execute({
      server: playlist.server,
      username: playlist.username,
      password: playlist.password,
    });

    expect(result.isValid).toBe(true);
  });

  it("should return isValid false with error message if credentials are invalid", async () => {
    repository.isValid = false;
    repository.validationError = "Invalid Credentials.";

    const { playlist } = makePlaylist();

    const result = await sut.execute({
      server: playlist.server,
      username: playlist.username,
      password: playlist.password,
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Invalid Credentials.");
  });
});
