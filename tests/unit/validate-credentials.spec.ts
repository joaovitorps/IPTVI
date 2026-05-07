import { InMemoryCredentialRepository } from "@/core/domain/repositories/in-memory/in-memory-credential-repository";
import { ValidateCredentialsUseCase } from "@/core/domain/use-cases/validate-credentials";

describe("Validate playlist use case", () => {
  let repository: InMemoryCredentialRepository;
  let sut: ValidateCredentialsUseCase;

  beforeEach(() => {
    repository = new InMemoryCredentialRepository();
    sut = new ValidateCredentialsUseCase(repository);
  });

  it("should return isValid true if credentials are valid", async () => {
    const result = await sut.execute();

    expect(result.isValid).toBe(true);
  });

  it("should return isValid false with error message if credentials are invalid", async () => {
    repository.isValid = false;
    repository.validationError = "Invalid Credentials.";

    const result = await sut.execute();

    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Invalid Credentials.");
  });
});
